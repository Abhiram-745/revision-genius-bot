import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch user's activity logs
    const { data: activities, error: fetchError } = await supabase
      .from("blurt_activity_logs")
      .select("*")
      .eq("user_id", userId)
      .order("session_start", { ascending: false })
      .limit(50);

    if (fetchError) throw fetchError;

    if (!activities || activities.length < 2) {
      return new Response(
        JSON.stringify({ error: "Not enough activity data to analyze" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Aggregate stats by topic
    const topicStats: Record<string, { 
      subject: string;
      sessions: number; 
      totalScore: number; 
      scoresCount: number;
      totalTime: number;
    }> = {};

    activities.forEach((a: any) => {
      const key = `${a.subject_name}:${a.topic_name}`;
      if (!topicStats[key]) {
        topicStats[key] = { 
          subject: a.subject_name,
          sessions: 0, 
          totalScore: 0, 
          scoresCount: 0,
          totalTime: 0 
        };
      }
      topicStats[key].sessions++;
      topicStats[key].totalTime += a.duration_seconds || 0;
      if (a.score_percentage !== null) {
        topicStats[key].totalScore += a.score_percentage;
        topicStats[key].scoresCount++;
      }
    });

    // Calculate averages and identify strengths/weaknesses
    const topicAnalysis = Object.entries(topicStats).map(([topic, stats]) => ({
      topic,
      subject: stats.subject,
      sessions: stats.sessions,
      avgScore: stats.scoresCount > 0 ? Math.round(stats.totalScore / stats.scoresCount) : null,
      totalTime: stats.totalTime,
    }));

    // Sort by average score
    const withScores = topicAnalysis.filter(t => t.avgScore !== null);
    withScores.sort((a, b) => (b.avgScore || 0) - (a.avgScore || 0));

    const strengths = withScores
      .filter(t => t.avgScore && t.avgScore >= 70)
      .slice(0, 3)
      .map(t => `${t.topic.split(':')[1]} (${t.avgScore}% average)`);

    const weaknesses = withScores
      .filter(t => t.avgScore && t.avgScore < 70)
      .slice(0, 3)
      .map(t => `${t.topic.split(':')[1]} needs more practice (${t.avgScore}% average)`);

    // Topics with low practice count
    const lowPractice = topicAnalysis
      .filter(t => t.sessions < 3)
      .slice(0, 3)
      .map(t => `Practice ${t.topic.split(':')[1]} more (only ${t.sessions} sessions)`);

    // Generate insights using AI
    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    let aiGeneratedInsights = null;

    if (openAIApiKey) {
      try {
        const prompt = `Analyze this student's BlurtAI practice data and provide personalized insights:

Topics practiced: ${topicAnalysis.map(t => `${t.topic} (${t.sessions} sessions, avg ${t.avgScore || 'N/A'}%)`).join(', ')}

Total sessions: ${activities.length}
Total practice time: ${Math.round(activities.reduce((sum: number, a: any) => sum + (a.duration_seconds || 0), 0) / 60)} minutes

Provide a brief, encouraging analysis with:
1. Overall progress summary (1-2 sentences)
2. Key strengths (if any topics >= 70%)
3. Areas to improve (if any topics < 70%)
4. Specific recommendations for next practice session

Keep it concise and student-friendly.`;

        const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openAIApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "You are a helpful study coach analyzing a student's practice data. Be encouraging but honest." },
              { role: "user", content: prompt },
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = aiData.choices?.[0]?.message?.content;
          if (content) {
            aiGeneratedInsights = content;
          }
        }
      } catch (aiError) {
        console.error("AI analysis error:", aiError);
      }
    }

    const insights = {
      strengths: strengths.length > 0 ? strengths : ["Keep practicing to discover your strengths!"],
      weaknesses: weaknesses.length > 0 ? weaknesses : lowPractice.length > 0 ? lowPractice : [],
      recommendations: [
        ...lowPractice,
        "Focus on topics with lower scores",
        "Aim for at least 3 practice sessions per topic",
      ].slice(0, 4),
      overallProgress: aiGeneratedInsights || `You've completed ${activities.length} practice sessions across ${topicAnalysis.length} topics. ${withScores.length > 0 ? `Your average score is ${Math.round(withScores.reduce((s, t) => s + (t.avgScore || 0), 0) / withScores.length)}%.` : 'Keep practicing to see your progress!'}`,
    };

    // Save insights to the most recent activity
    if (activities.length > 0) {
      await supabase
        .from("blurt_activity_logs")
        .update({
          ai_analysis: insights,
          analyzed_at: new Date().toISOString(),
        })
        .eq("id", activities[0].id);
    }

    console.log("Generated insights for user:", userId);

    return new Response(
      JSON.stringify({ insights }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error analyzing activity:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to analyze activity";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
