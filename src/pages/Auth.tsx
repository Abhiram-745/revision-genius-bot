import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Mail, Ban } from "lucide-react";
import VistaraLogo from "@/components/VistaraLogo";
import PageTransition from "@/components/PageTransition";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const Auth = () => {
  const navigate = useNavigate();
  const { signup, login, sendVerificationCode, verifyEmailCode, user, emailVerified, banInfo, checkBanStatus, clearBanInfo } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [banReason, setBanReason] = useState<string | null>(null);
  
  // Store pending signup credentials (user not created yet)
  const [pendingSignup, setPendingSignup] = useState<{
    email: string;
    password: string;
    fullName: string;
  } | null>(null);

  useEffect(() => {
    // Show ban dialog if user was kicked out due to ban
    if (banInfo?.isBanned) {
      setBanReason(banInfo.reason);
      setShowBanDialog(true);
    }
  }, [banInfo]);

  useEffect(() => {
    if (user && !showVerification) {
      navigate("/dashboard");
    }
  }, [user, navigate, showVerification]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate email first
      const { data: validationResult, error: validationError } = await supabase.functions.invoke('validate-email', {
        body: { email }
      });
      
      if (validationError) {
        console.error("[Auth] Email validation service error:", validationError);
        toast.error("Unable to validate your email. Please try again in a moment.");
        setLoading(false);
        return;
      }
      
      if (!validationResult?.isValid) {
        const reason = validationResult?.reason || "This email is not eligible for signup.";
        
        if (validationResult?.flags?.includes('disposable')) {
          toast.error("Disposable or temporary emails are not allowed. Please use a permanent email address.");
        } else if (validationResult?.flags?.includes('suspicious_pattern')) {
          toast.error("This email address appears suspicious. Please use a valid email address.");
        } else if (validationResult?.flags?.includes('invalid_format')) {
          toast.error("Please enter a valid email address format.");
        } else {
          toast.error(reason);
        }
        
        setLoading(false);
        return;
      }
      
      console.log("Email validated successfully:", email, "Confidence:", validationResult?.confidence);
      
    } catch (err: any) {
      console.error("[Auth] Email validation exception:", err);
      toast.error("Email validation service is temporarily unavailable. Please try again.");
      setLoading(false);
      return;
    }

    // Check if email is banned before allowing signup
    try {
      const banStatus = await checkBanStatus(email);
      if (banStatus.isBanned) {
        setBanReason(banStatus.reason);
        setShowBanDialog(true);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error("[Auth] Ban check error:", err);
    }

    // Store credentials but DON'T create user yet
    setPendingSignup({
      email: email.toLowerCase(),
      password,
      fullName
    });
    setVerificationEmail(email.toLowerCase());

    try {
      // Send verification code BEFORE creating the account
      await sendVerificationCode(email);
      setShowVerification(true);
      toast.success("Verification code sent! Check your email.");
    } catch (error: any) {
      setPendingSignup(null);
      setVerificationEmail("");
      toast.error(error.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (error: any) {
      if (error.message === 'ACCOUNT_BANNED') {
        // Ban dialog will be shown via useEffect watching banInfo
        return;
      }
      toast.error(error.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    if (!pendingSignup) {
      toast.error("Session expired. Please try signing up again.");
      setShowVerification(false);
      return;
    }

    setLoading(true);
    try {
      // First verify the code
      const isValid = await verifyEmailCode(verificationEmail, verificationCode);
      if (!isValid) {
        toast.error("Invalid verification code");
        setLoading(false);
        return;
      }

      // Code is valid - NOW create the account
      await signup(pendingSignup.email, pendingSignup.password, pendingSignup.fullName);
      
      toast.success("Account created successfully!");
      setPendingSignup(null);
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      await sendVerificationCode(verificationEmail);
      toast.success("Verification code resent!");
    } catch (error: any) {
      toast.error(error.message || "Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSignup = () => {
    setShowVerification(false);
    setVerificationCode("");
    setPendingSignup(null);
    setVerificationEmail("");
  };

  if (showVerification) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted to-background p-4">
          <div className="absolute top-4 left-4">
            <Button
              variant="ghost"
              onClick={handleBackToSignup}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sign Up
            </Button>
          </div>
          
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-6">
                <VistaraLogo size="xl" animate />
              </div>
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
              <CardDescription>
                We've sent a 6-digit code to<br />
                <strong className="text-foreground">{verificationEmail}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerifyCode} className="space-y-6">
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={verificationCode}
                    onChange={setVerificationCode}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-gradient-primary hover:opacity-90"
                  disabled={loading || verificationCode.length !== 6}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify & Create Account
                </Button>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleResendCode}
                    disabled={loading}
                    className="text-sm"
                  >
                    Didn't receive the code? Resend
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted to-background p-4">
        <div className="absolute top-4 left-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
        
        <Card className="w-full max-w-md shadow-lg max-h-[90vh] overflow-y-auto">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-6">
              <VistaraLogo size="xl" animate />
            </div>
            <CardTitle className="text-3xl font-bold gradient-text">Vistara</CardTitle>
            <CardDescription className="text-base">
              AI-powered revision timetables for students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-primary hover:opacity-90"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                  
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-auto py-3 whitespace-normal text-left"
                    onClick={async () => {
                      setLoading(true);
                      try {
                        const { error } = await supabase.auth.signInWithOAuth({
                          provider: 'google',
                          options: {
                            redirectTo: 'https://vistara-ai.app/dashboard'
                          }
                        });
                        if (error) throw error;
                      } catch (error: any) {
                        toast.error(error.message || "Failed to sign in with Google");
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                  >
                    <svg className="mr-2 h-4 w-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 6 characters
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-primary hover:opacity-90"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                  
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-auto py-3 whitespace-normal text-left"
                    onClick={async () => {
                      setLoading(true);
                      try {
                        const { error } = await supabase.auth.signInWithOAuth({
                          provider: 'google',
                          options: {
                            redirectTo: 'https://vistara-ai.app/dashboard'
                          }
                        });
                        if (error) throw error;
                      } catch (error: any) {
                        toast.error(error.message || "Failed to sign up with Google");
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                  >
                    <svg className="mr-2 h-4 w-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Ban Dialog */}
      <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <Ban className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <DialogTitle className="text-center text-xl">Account Suspended</DialogTitle>
            <DialogDescription className="text-center">
              This account has been suspended from Vistara.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {banReason && (
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm font-medium text-muted-foreground mb-1">Reason:</p>
                <p className="text-sm">{banReason}</p>
              </div>
            )}
            
            <p className="text-sm text-muted-foreground text-center">
              If you believe this is a mistake, please contact support.
            </p>
          </div>

          <DialogFooter className="sm:justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setShowBanDialog(false);
                clearBanInfo();
                setBanReason(null);
              }}
            >
              I Understand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
};

export default Auth;
