import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Subject {
  id: string;
  name: string;
  examBoard?: string;
  examType?: string;
}

interface Topic {
  id: string;
  name: string;
  subjectId: string;
  confidence: number;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, subjects, existingTopics, conversationHistory } = await req.json() as {
      message: string;
      subjects: Subject[];
      existingTopics: Topic[];
      conversationHistory: ChatMessage[];
    };

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    // Build context about subjects
    const subjectContext = subjects.map(s => {
      let desc = s.name;
      if (s.examBoard) desc += ` (${s.examBoard})`;
      if (s.examType) desc += ` - ${s.examType}`;
      return desc;
    }).join('\n');

    // Build existing topics context
    const existingTopicsContext = existingTopics.length > 0
      ? `\n\nExisting topics already added:\n${existingTopics.map(t => {
          const subjectName = subjects.find(s => s.id === t.subjectId)?.name || 'Unknown';
          return `- ${subjectName}: ${t.name}`;
        }).join('\n')}`
      : '';

    const systemPrompt = `You are an expert educational curriculum assistant helping students organize their study topics.

The student is studying these subjects:
${subjectContext}
${existingTopicsContext}

Your role is to:
1. Generate comprehensive topic lists when asked
2. Organize topics in a logical learning sequence
3. Cover all major curriculum areas for the specified exam boards
4. Suggest appropriate confidence levels (lower for harder topics)

When generating topics, respond with:
1. A brief friendly message about what you've generated
2. A structured JSON block containing the topics

IMPORTANT: When suggesting topics, output them in this exact JSON format wrapped in triple backticks:
\`\`\`json
{
  "topics": [
    {"name": "Topic Name", "subjectId": "subject-id-here", "confidence": 50},
    ...
  ]
}
\`\`\`

Guidelines for topics:
- Be comprehensive but not overwhelming (aim for 10-20 topics per subject for GCSEs, 15-30 for A-Levels)
- Use clear, specific topic names
- Set confidence based on typical difficulty (50 = average, 30 = hard, 70 = easier)
- Order topics in a logical learning sequence
- Match the subject IDs exactly as provided

If the user asks for changes, modifications, or additions, adjust your suggestions accordingly.
If they ask questions or need clarification, respond helpfully without generating topics.`;

    // Build message history
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message }
    ];

    console.log('Sending request to AI gateway...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please wait a moment and try again.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content || '';

    console.log('AI response received:', aiContent.substring(0, 200));

    // Try to extract JSON topics from the response
    let suggestedTopics: Topic[] = [];
    const jsonMatch = aiContent.match(/```json\s*([\s\S]*?)\s*```/);
    
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed.topics && Array.isArray(parsed.topics)) {
          suggestedTopics = parsed.topics.map((t: any) => ({
            id: crypto.randomUUID(),
            name: t.name,
            subjectId: t.subjectId,
            confidence: t.confidence || 50
          }));
        }
      } catch (parseError) {
        console.error('Failed to parse topics JSON:', parseError);
      }
    }

    // Clean the message by removing the JSON block for display
    const cleanMessage = aiContent
      .replace(/```json[\s\S]*?```/g, '')
      .trim();

    return new Response(JSON.stringify({
      message: cleanMessage || 'Here are the topics I generated for you.',
      suggestedTopics
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Topic chat error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'An error occurred',
      message: "I'm sorry, I encountered an error. Please try again."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
