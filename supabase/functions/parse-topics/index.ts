import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 1000;

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, subjectName, images, documents, extractionMode = "exact" } = await req.json();
    
    console.log('Received request:', {
      hasText: !!text,
      textPreview: text?.substring?.(0, 100) ?? 'N/A',
      subjectName,
      imagesCount: images?.length ?? 0,
      documentsCount: documents?.length ?? 0,
      extractionMode,
      imagesType: Array.isArray(images) ? 'array' : typeof images,
      firstImagePreview: typeof images?.[0] === 'string' ? images[0].substring(0, 80) : JSON.stringify(images?.[0])?.substring(0, 80)
    });

    // Different prompts based on extraction mode
    const exactModePrompt = `You are a precise OCR and text extraction assistant. Your job is to read text from images EXACTLY as written.

STRICT RULES:
1. READ the actual text visible in the image - use OCR to extract what is written
2. Copy text EXACTLY as it appears - same spelling, same punctuation, same capitalization
3. DO NOT paraphrase, summarize, or modify the text in any way
4. DO NOT infer or add topics that are not explicitly written in the image
5. If you see numbered items (1, 2, 3...) or bullet points, extract each one exactly
6. If you see checkboxes or tick marks, extract the text next to each one
7. Ignore headers like "Topics to revise" or "Checklist" - only extract the actual topic items
8. Extract EVERY single topic/item you can see - do not skip any

OUTPUT FORMAT - Return ONLY this JSON structure:
{
  "topics": [
    {"name": "exact text from image"},
    {"name": "exact text from image"}
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

EXAMPLES of good topic extraction:
- "Photosynthesis and Light Reactions" (not "Page 15 - photosynthesis stuff")
- "Newton's Laws of Motion" (not "slide 3")
- "World War II Causes" (not "watch video about WW2")

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
    
    // Add document content if provided
    if (documents && Array.isArray(documents) && documents.length > 0) {
      console.log(`Processing ${documents.length} document(s) for topic extraction`);
      textContent += "Extract topics from these documents:\n\n";
      for (const doc of documents) {
        if (doc.name && doc.content) {
          textContent += `--- Document: ${doc.name} ---\n`;
          // The content is base64 encoded, we'll add it as an image for the AI to process
        }
      }
    }
    
    if (text) {
      textContent += extractionMode === "exact" 
        ? `Extract ALL topics from this exactly as written:\n${text}`
        : `Identify the key learning topics from this content:\n${text}`;
    } else if ((images && Array.isArray(images) && images.length > 0) || (documents && Array.isArray(documents) && documents.length > 0)) {
      textContent += extractionMode === "exact"
        ? `IMPORTANT: Carefully read and extract ALL text items/topics visible in these files EXACTLY as written. Copy every single line of text that represents a topic or item to study.`
        : `IMPORTANT: Analyze this educational material and identify the key concepts and learning topics. Create clear, concise topic names based on the content.`;
    }
    
    messageContent.push({ type: "text", text: textContent });
    
    // Add images if provided
    if (images && Array.isArray(images) && images.length > 0) {
      console.log(`Processing ${images.length} image(s) for topic extraction (mode: ${extractionMode})`);
      
      let imagesAdded = 0;
      for (const imageData of images) {
        console.log(`Image data type: ${typeof imageData}, prefix: ${typeof imageData === 'string' ? imageData.substring(0, 30) : 'N/A'}`);
        
        if (typeof imageData === 'string' && imageData.startsWith('data:')) {
          // Full data URL - use directly
          messageContent.push({
            type: "image_url",
            image_url: {
              url: imageData
            }
          });
          imagesAdded++;
        } else if (typeof imageData === 'string' && (imageData.startsWith('http://') || imageData.startsWith('https://'))) {
          // Direct URL
          messageContent.push({
            type: "image_url",
            image_url: {
              url: imageData
            }
          });
          imagesAdded++;
        } else if (typeof imageData === 'object' && imageData !== null && 'data' in imageData) {
          // Legacy format: { data: base64, type: mimeType } - convert to data URL
          const obj = imageData as { data: string; type: string };
          const dataUrl = `data:${obj.type};base64,${obj.data}`;
          messageContent.push({
            type: "image_url",
            image_url: {
              url: dataUrl
            }
          });
          imagesAdded++;
          console.log(`Converted legacy image format to data URL`);
        } else {
          console.warn(`Unsupported image format:`, typeof imageData);
        }
      }
      console.log(`Successfully added ${imagesAdded} images to message content`);
    }

    // Add documents as images (PDFs, DOCX etc are sent as base64 data URLs)
    if (documents && Array.isArray(documents) && documents.length > 0) {
      console.log(`Processing ${documents.length} document(s) for topic extraction (mode: ${extractionMode})`);
      
      let docsAdded = 0;
      for (const doc of documents) {
        if (doc.content && typeof doc.content === 'string' && doc.content.startsWith('data:')) {
          // Document as data URL - the AI will process it
          messageContent.push({
            type: "image_url",
            image_url: {
              url: doc.content
            }
          });
          docsAdded++;
          console.log(`Added document: ${doc.name}`);
        }
      }
      console.log(`Successfully added ${docsAdded} documents to message content`);
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      console.error("OPENAI_API_KEY not configured");
      throw new Error("AI service not configured. Please contact support.");
    }

    console.log(`Calling OpenAI with ${messageContent.length} content parts (${images?.length || 0} images, mode: ${extractionMode})`);

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
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI gateway request failed: ${response.status}`);
    }

    const aiResult = await response.json();
    console.log('Lovable AI response:', JSON.stringify(aiResult, null, 2));

    // Extract content from response
    let responseText: string | undefined;
    if (aiResult.choices?.[0]?.message?.content) {
      responseText = aiResult.choices[0].message.content;
    }

    if (!responseText || responseText.trim() === "") {
      console.error('Empty AI response. Raw result:', JSON.stringify(aiResult, null, 2));
      throw new Error('AI did not generate a response. Please try again.');
    }

    // Extract JSON from markdown if present
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      responseText = jsonMatch[1];
    }

    const parsedTopics = JSON.parse(responseText);

    return new Response(JSON.stringify({ topics: parsedTopics.topics }), {
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