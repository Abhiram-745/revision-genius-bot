import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendCodeRequest {
  email: string;
}

const generateCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: SendCodeRequest = await req.json();
    
    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Valid email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("[send-verification-code] Processing request for:", email);

    // Initialize Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("[send-verification-code] RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    const resend = new Resend(resendApiKey);

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check for rate limiting - max 3 codes per email in last 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: recentCodes, error: countError } = await supabase
      .from("email_verifications")
      .select("id")
      .eq("email", email.toLowerCase())
      .gte("created_at", tenMinutesAgo);

    if (countError) {
      console.error("[send-verification-code] Rate limit check error:", countError);
    }

    if (recentCodes && recentCodes.length >= 3) {
      console.log("[send-verification-code] Rate limit exceeded for:", email);
      return new Response(
        JSON.stringify({ 
          error: "Too many verification requests. Please wait a few minutes before trying again." 
        }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate 6-digit code
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log("[send-verification-code] Generated code for:", email);

    // Delete any existing unverified codes for this email
    await supabase
      .from("email_verifications")
      .delete()
      .eq("email", email.toLowerCase())
      .eq("verified", false);

    // Store the code in database
    const { error: insertError } = await supabase
      .from("email_verifications")
      .insert({
        email: email.toLowerCase(),
        code,
        expires_at: expiresAt.toISOString(),
        verified: false,
        attempts: 0
      });

    if (insertError) {
      console.error("[send-verification-code] Database insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to create verification code" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Use verified custom domain from secret, fallback to Resend's testing domain
    const customFromEmail = Deno.env.get("RESEND_FROM_EMAIL");
    let fromAddress: string;
    
    if (customFromEmail) {
      // Check if the secret already contains angle brackets (pre-formatted)
      if (customFromEmail.includes('<') && customFromEmail.includes('>')) {
        // Already formatted, use as-is
        fromAddress = customFromEmail;
      } else {
        // Raw email, wrap with name
        fromAddress = `Vistara <${customFromEmail}>`;
      }
    } else {
      fromAddress = "Vistara <onboarding@resend.dev>";
    }
    
    console.log("[send-verification-code] Using from address:", fromAddress);

    // Send email via Resend with green-orange gradient theme
    const { data, error: emailError } = await resend.emails.send({
      from: fromAddress,
      to: [email],
      subject: "Your Vistara Verification Code",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fefce8;">
          <div style="background: linear-gradient(135deg, #22c55e 0%, #f97316 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
            <img src="https://ectqhxyfuvssgyouwjnp.supabase.co/storage/v1/object/public/assets/vistara-mascot-logo.png" alt="Vistara Owl" style="width: 80px; height: 80px; margin-bottom: 12px; border-radius: 50%; background: white; padding: 8px;" />
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Vistara</h1>
            <p style="color: rgba(255,255,255,0.95); margin: 8px 0 0 0; font-size: 16px;">Email Verification</p>
          </div>
          
          <div style="background: linear-gradient(180deg, #ffffff 0%, #fef9c3 100%); padding: 35px; border-radius: 0 0 16px 16px; border: 1px solid #fde047; border-top: none;">
            <p style="margin-top: 0; font-size: 18px; color: #365314;">Hi there! 👋</p>
            <p style="color: #4d7c0f; font-size: 15px;">You're almost ready to start using <strong>Vistara</strong>. Enter this verification code to complete your sign-up:</p>
            
            <div style="background: linear-gradient(135deg, #dcfce7 0%, #fef3c7 100%); border: 3px solid #22c55e; border-radius: 12px; padding: 24px; text-align: center; margin: 28px 0; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);">
              <span style="font-size: 42px; font-weight: bold; letter-spacing: 10px; background: linear-gradient(135deg, #16a34a 0%, #ea580c 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">${code}</span>
            </div>
            
            <p style="color: #65a30d; font-size: 14px;">⏱️ This code expires in <strong>10 minutes</strong>.</p>
            <p style="color: #84cc16; font-size: 14px;">If you didn't request this code, you can safely ignore this email.</p>
            
            <hr style="border: none; border-top: 2px solid #fde047; margin: 28px 0;">
            
            <p style="color: #a3a3a3; font-size: 12px; margin-bottom: 0; text-align: center;">
              © ${new Date().getFullYear()} <span style="color: #22c55e; font-weight: 600;">Vistara</span> - AI-Powered Revision Timetables
            </p>
          </div>
        </body>
        </html>
      `,
    });

    if (emailError) {
      console.error("[send-verification-code] Email send error:", emailError);
      console.error("[send-verification-code] Response data:", data);
      
      // Delete the code if email failed
      await supabase
        .from("email_verifications")
        .delete()
        .eq("email", email.toLowerCase())
        .eq("code", code);
      
      // Check if it's a Resend testing mode limitation
      const errorObj = emailError as any;
      const errorMessage = errorObj.message || "";
      if (errorObj.statusCode === 403 || errorMessage.includes("testing emails") || errorMessage.includes("verify a domain")) {
        return new Response(
          JSON.stringify({ 
            error: "Email service is in testing mode. Please contact support or use abhiramkakarla1@gmail.com for testing." 
          }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
        
      return new Response(
        JSON.stringify({ error: "Failed to send verification email. Please try again." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("[send-verification-code] Email sent successfully. Message ID:", data?.id);

    return new Response(
      JSON.stringify({ success: true, message: "Verification code sent" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("[send-verification-code] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
