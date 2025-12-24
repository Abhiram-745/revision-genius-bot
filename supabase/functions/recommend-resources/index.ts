import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subject, topic, examBoard, sessionType } = await req.json();

    if (!subject || !topic) {
      return new Response(
        JSON.stringify({ error: "Subject and topic are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAIApiKey) {
      console.error("[recommend-resources] OPENAI_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[recommend-resources] Generating recommendations for: ${subject} - ${topic} (${examBoard})`);

    const prompt = `You are a UK GCSE study resource expert. Find the BEST, SPECIFIC revision resources for this exact topic.

Subject: ${subject}
Topic: ${topic}
Exam Board: ${examBoard || "AQA/Edexcel/OCR (general)"}
Session Type: ${sessionType || "revision"}

🎯 YOUR TASK:
Research and recommend 2-3 SPECIFIC, HIGH-QUALITY revision resources that a GCSE student should use for this EXACT topic.

📚 TRUSTED UK GCSE RESOURCES TO CONSIDER:
- Physics & Maths Tutor (PMT) - pmt.physicsandmathstutor.com
- Save My Exams - savemyexams.com
- Seneca Learning - senecalearning.com
- BBC Bitesize - bbc.co.uk/bitesize
- Dr Frost Maths - drfrostmaths.com (maths only)
- Corbett Maths - corbettmaths.com (maths only)
- Isaac Physics - isaacphysics.org (physics only)
- Revisely - revisely.co.uk
- CGP Books - cgpbooks.co.uk
- Oak National Academy - thenational.academy
- Free Science Lessons - freesciencelessons.co.uk

🔍 FOR THIS SPECIFIC TOPIC, RECOMMEND:
1. The BEST website/resource with specific page or section if known
2. What EXACTLY to do on that resource (e.g., "Complete questions 1-10 on past papers section")
3. WHY this resource is particularly good for this topic

Return a JSON object with this EXACT structure:
{
  "primaryResource": {
    "name": "Resource name (e.g., Physics & Maths Tutor)",
    "url": "https://specific-url-if-possible",
    "description": "Brief explanation of why this is perfect for this topic",
    "activity": "Specific action to take (e.g., 'Complete the topic questions and mark scheme')"
  },
  "secondaryResource": {
    "name": "Second best resource",
    "url": "https://...",
    "description": "Why this is also helpful",
    "activity": "What to do here"
  },
  "quickTip": "One sentence study tip specific to this topic"
}

Be SPECIFIC to the topic. Don't give generic advice.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a UK GCSE study expert. Always return valid JSON. Be specific to the exact topic given." },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[recommend-resources] AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to generate recommendations" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("[recommend-resources] No content in AI response");
      return new Response(
        JSON.stringify({ error: "No recommendations generated" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the JSON from the response
    let recommendations;
    try {
      // Try to extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("[recommend-resources] Failed to parse AI response:", parseError);
      console.log("[recommend-resources] Raw content:", content);
      
      // Return a default response if parsing fails
      recommendations = {
        primaryResource: {
          name: "Physics & Maths Tutor",
          url: `https://pmt.physicsandmathstutor.com/`,
          description: `Find ${topic} resources for ${subject} (${examBoard || 'your exam board'})`,
          activity: "Search for topic-specific notes and past paper questions"
        },
        secondaryResource: {
          name: "Seneca Learning",
          url: "https://senecalearning.com/",
          description: "Interactive revision with smart algorithms",
          activity: `Complete the ${subject} course sections on ${topic}`
        },
        quickTip: "Practice past paper questions after reviewing the content to reinforce learning."
      };
    }

    console.log("[recommend-resources] Successfully generated recommendations");

    return new Response(
      JSON.stringify(recommendations),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[recommend-resources] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
