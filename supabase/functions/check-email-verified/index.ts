import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("[check-email-verified] Checking verification status for:", email);

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if there's a verified record in email_verifications
    const { data: verification, error: fetchError } = await supabase
      .from("email_verifications")
      .select("verified")
      .eq("email", email.toLowerCase())
      .eq("verified", true)
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error("[check-email-verified] Database fetch error:", fetchError);
      return new Response(
        JSON.stringify({ verified: false }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const isVerified = verification?.verified === true;
    console.log("[check-email-verified] Verification status for", email, ":", isVerified);

    return new Response(
      JSON.stringify({ verified: isVerified }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("[check-email-verified] Error:", error);
    return new Response(
      JSON.stringify({ verified: false }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
