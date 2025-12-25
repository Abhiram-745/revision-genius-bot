import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 1000;
const BATCH_SIZE = 10;
const MAX_TOPICS_PER_REQUEST = 150;

async function fetchWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = INITIAL_DELAY_MS * Math.pow(2, attempt - 1);
        console.log(`Retry attempt ${attempt}/${retries} - waiting ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      const response = await fetch(url, options);
      
      if (!response.ok) {
        if ((response.status === 503 || response.status === 429) && attempt < retries) {
          console.log(`Received ${response.status}, will retry...`);
          continue;
        }
        
        if (response.status === 503) {
          throw new Error("We're experiencing heavy traffic right now. Please try again in a few moments.");
        } else if (response.status === 429) {
          throw new Error("Too many requests. Please wait a moment and try again.");
        } else if (response.status === 402) {
          throw new Error("AI service credits exhausted. Please add credits to continue.");
        }
        
        throw new Error(`AI request failed with status ${response.status}`);
      }
      
      return response;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error('Unknown error');
      
      if (lastError.message.includes("heavy traffic") || 
          lastError.message.includes("Too many requests") ||
          lastError.message.includes("credits exhausted")) {
        throw lastError;
      }
      
      if (attempt >= retries) {
        throw lastError;
      }
    }
  }
  
  throw lastError || new Error("Request failed after all retries");
}

/**
 * Clean up topic text by removing numbering, bullets, and extra whitespace
 */
function cleanTopicText(text: string): string {
  return text
    // Remove leading numbering patterns: "1.", "1)", "(1)", "a.", "a)", "(a)", "i.", etc.
    .replace(/^\s*(?:\d+[.)]\s*|\(\d+\)\s*|[a-zA-Z][.)]\s*|\([a-zA-Z]\)\s*|[ivxIVX]+[.)]\s*|\([ivxIVX]+\)\s*|[-•●○▪▸▹→]\s*)/gm, '')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    // Trim
    .trim();
}

/**
 * Deduplicate topics (case-insensitive)
 */
function deduplicateTopics(topics: { name: string }[]): { name: string }[] {
  const seen = new Set<string>();
  return topics.filter(t => {
    const key = t.name.toLowerCase().trim();
    if (seen.has(key) || key === '') return false;
    seen.add(key);
    return true;
  });
}

/**
 * Batch items into groups of specified size
 */
function batchItems<T>(items: T[], batchSize: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  return batches;
}

/**
 * Call AI to extract topics from content
 */
async function extractTopicsFromContent(
  content: { text?: string; images?: string[] },
  subjectName: string,
  extractionMode: string,
  openAIApiKey: string
): Promise<{ name: string }[]> {
  
  // Different prompts based on extraction mode
  const exactModePrompt = `You are a precise OCR and text extraction assistant. Your job is to read text from documents and images EXACTLY as written.

STRICT RULES:
1. READ the actual text visible - use OCR for images, process text as given
2. Copy text EXACTLY as it appears - same spelling, same punctuation, same capitalization
3. DO NOT paraphrase, summarize, or modify the text in any way
4. DO NOT infer or add topics that are not explicitly written
5. If you see numbered items (1, 2, 3...) or bullet points, extract each one exactly
6. If you see checkboxes or tick marks, extract the text next to each one
7. Ignore headers like "Topics to revise" or "Checklist" - only extract the actual topic items
8. Extract EVERY single topic/item you can see - do not skip any
9. Clean up obvious formatting artifacts but keep the core topic text intact
10. Maximum ${MAX_TOPICS_PER_REQUEST} topics per response

OUTPUT FORMAT - Return ONLY this JSON structure:
{
  "topics": [
    {"name": "exact text from document"},
    {"name": "exact text from document"}
  ]
}

Do NOT include any explanation or commentary - ONLY the JSON.`;

  const generalModePrompt = `You are an educational content analyzer. Your job is to identify the KEY CONCEPTS and LEARNING TOPICS from educational materials.

RULES:
1. Identify the main concepts, theories, and topics being taught
2. Create clear, concise topic names (not verbatim text)
3. Group related content into single, meaningful topics
4. Focus on what students need to learn and understand
5. Ignore administrative text, dates, teacher names, etc.
6. Create topic names that would make sense as study items
7. Each topic should be a distinct concept worth studying
8. Use proper capitalization and clear wording
9. Avoid vague or generic headings like "Introduction" or "Summary"
10. Maximum ${MAX_TOPICS_PER_REQUEST} topics per response

EXAMPLES of good topic extraction:
- "Photosynthesis and Light Reactions" (not "Page 15 - photosynthesis stuff")
- "Newton's Laws of Motion" (not "slide 3")
- "World War II Causes" (not "watch video about WW2")
- "Quadratic Formula Applications" (not "Exercise 5")

OUTPUT FORMAT - Return ONLY this JSON structure:
{
  "topics": [
    {"name": "Clear Topic Name"},
    {"name": "Another Topic Name"}
  ]
}

Do NOT include any explanation or commentary - ONLY the JSON.`;

  const systemPrompt = extractionMode === "exact" ? exactModePrompt : generalModePrompt;

  // Build multimodal message content
  const messageContent: any[] = [];
  
  // Add instruction and subject context
  let textContent = `${systemPrompt}\n\nSubject: ${subjectName}\n\n`;
  
  if (content.text) {
    textContent += extractionMode === "exact" 
      ? `Extract ALL topics from this exactly as written:\n\n${content.text}`
      : `Identify the key learning topics from this content:\n\n${content.text}`;
  } else if (content.images && content.images.length > 0) {
    textContent += extractionMode === "exact"
      ? `IMPORTANT: Carefully read and extract ALL text items/topics visible in these images EXACTLY as written. Copy every single line of text that represents a topic or item to study.`
      : `IMPORTANT: Analyze this educational material and identify the key concepts and learning topics. Create clear, concise topic names based on the content.`;
  }
  
  messageContent.push({ type: "text", text: textContent });
  
  // Add images if provided
  if (content.images && Array.isArray(content.images) && content.images.length > 0) {
    for (const imageData of content.images) {
      if (typeof imageData === 'string' && imageData.startsWith('data:')) {
        messageContent.push({
          type: "image_url",
          image_url: { url: imageData }
        });
      } else if (typeof imageData === 'string' && (imageData.startsWith('http://') || imageData.startsWith('https://'))) {
        messageContent.push({
          type: "image_url",
          image_url: { url: imageData }
        });
      }
    }
  }

  console.log(`Calling OpenAI with ${messageContent.length} content parts (mode: ${extractionMode})`);

  const response = await fetchWithRetry(
    'https://api.openai.com/v1/chat/completions',
    {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAIApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "user", content: messageContent }
        ],
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("AI gateway error:", response.status, errorText);
    throw new Error(`AI gateway request failed: ${response.status}`);
  }

  const aiResult = await response.json();

  // Extract content from response
  let responseText: string | undefined;
  if (aiResult.choices?.[0]?.message?.content) {
    responseText = aiResult.choices[0].message.content;
  }

  if (!responseText || responseText.trim() === "") {
    console.error('Empty AI response');
    return [];
  }

  // Extract JSON from markdown if present
  const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
  if (jsonMatch) {
    responseText = jsonMatch[1];
  }

  try {
    const parsedTopics = JSON.parse(responseText);
    return parsedTopics.topics || [];
  } catch (e) {
    console.error('Failed to parse AI response:', e);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, subjectName, images, notes, extractionMode = "exact" } = await req.json();
    
    console.log('Received request:', {
      hasText: !!text,
      textLength: text?.length ?? 0,
      subjectName,
      imagesCount: images?.length ?? 0,
      notesCount: notes?.length ?? 0,
      extractionMode,
    });

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      console.error("OPENAI_API_KEY not configured");
      throw new Error("AI service not configured. Please contact support.");
    }

    let allTopics: { name: string }[] = [];

    // Combine text and notes
    let combinedText = text || '';
    if (notes && Array.isArray(notes) && notes.length > 0) {
      combinedText += '\n\n' + notes.join('\n\n');
    }

    // Calculate total items for batching decision
    const hasText = combinedText.trim().length > 0;
    const hasImages = images && Array.isArray(images) && images.length > 0;
    const totalItems = (hasText ? 1 : 0) + (images?.length || 0);

    if (totalItems <= BATCH_SIZE) {
      // Single batch - process everything together
      console.log('Processing as single batch');
      
      const topics = await extractTopicsFromContent(
        {
          text: hasText ? combinedText : undefined,
          images: hasImages ? images : undefined
        },
        subjectName,
        extractionMode,
        openAIApiKey
      );
      
      allTopics = topics;
    } else {
      // Multi-batch processing
      console.log(`Processing in batches (total items: ${totalItems})`);
      
      // Process text first if present
      if (hasText) {
        console.log('Processing text batch');
        const textTopics = await extractTopicsFromContent(
          { text: combinedText },
          subjectName,
          extractionMode,
          openAIApiKey
        );
        allTopics.push(...textTopics);
      }
      
      // Process images in batches
      if (hasImages) {
        const imageBatches = batchItems(images, BATCH_SIZE);
        console.log(`Processing ${imageBatches.length} image batch(es)`);
        
        for (let i = 0; i < imageBatches.length; i++) {
          console.log(`Processing image batch ${i + 1}/${imageBatches.length}`);
          const imageTopics = await extractTopicsFromContent(
            { images: imageBatches[i] },
            subjectName,
            extractionMode,
            openAIApiKey
          );
          allTopics.push(...imageTopics);
        }
      }
    }

    // Clean and deduplicate topics
    const cleanedTopics = allTopics.map(t => ({
      name: cleanTopicText(t.name)
    }));
    
    const finalTopics = deduplicateTopics(cleanedTopics);
    
    console.log(`Extracted ${allTopics.length} raw topics, cleaned to ${finalTopics.length} unique topics`);

    // Warn if no topics found
    if (finalTopics.length === 0) {
      console.warn('No topics extracted from content');
    }

    return new Response(JSON.stringify({ topics: finalTopics }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in parse-topics:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
