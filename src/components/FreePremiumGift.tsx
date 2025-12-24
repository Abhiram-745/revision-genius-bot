import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Gift, Crown, Users, Sparkles, Copy, Check, ArrowRight, ArrowLeft, TrendingUp, CheckCircle2, Youtube, Video, Instagram, Loader2, XCircle, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { toast } from "sonner";

type DialogStep = "main" | "referral" | "referralStats" | "ambassador" | "ambassadorSubmit" | "ambassadorStats";
type Platform = "youtube" | "tiktok" | "instagram";

const FreePremiumGift = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<DialogStep>("main");
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralLink, setReferralLink] = useState<string>("");
  const [referralCount, setReferralCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [approvedVideos, setApprovedVideos] = useState<number>(0);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submissionPlatform, setSubmissionPlatform] = useState<Platform>("youtube");
  const [submissionUrl, setSubmissionUrl] = useState<string>("");

  // Public pages where the gift should NOT appear
  const publicPages = ["/", "/auth"];
  const isPublicPage = publicPages.includes(location.pathname);

  const fetchReferralData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch or create referral code
      let { data: existingCode, error: fetchError } = await supabase
        .from("referral_codes")
        .select("code")
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching referral code:", fetchError);
      }

      let code = existingCode?.code;

      // If no code exists, create one
      if (!code) {
        // Try to generate code using RPC function first
        const { data: rpcCode, error: rpcError } = await supabase.rpc("generate_referral_code");
        
        if (!rpcError && rpcCode) {
          const { data: newCode, error: insertError } = await supabase
            .from("referral_codes")
            .insert({ user_id: user.id, code: rpcCode })
            .select("code")
            .single();
          
          if (!insertError && newCode) {
            code = newCode.code;
          }
        } else {
          // Fallback: generate code client-side if RPC fails
          const fallbackCode = `VIS${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
          const { data: newCode, error: insertError } = await supabase
            .from("referral_codes")
            .insert({ user_id: user.id, code: fallbackCode })
            .select("code")
            .single();
          
          if (!insertError && newCode) {
            code = newCode.code;
          }
        }
      }

      if (code) {
        setReferralCode(code);
        const link = `${window.location.origin}/auth?ref=${code}`;
        setReferralLink(link);
      }

      // Fetch referral count
      const { data: userCode } = await supabase
        .from("referral_codes")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (userCode) {
        const { count, error: countError } = await supabase
          .from("referral_uses")
          .select("id", { count: "exact", head: true })
          .eq("referral_code_id", userCode.id)
          .eq("is_valid", true);

        if (!countError) {
          setReferralCount(count || 0);
        }
      }
    } catch (err) {
      console.error("Error fetching referral data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setLinkCopied(true);
      toast.success("Referral link copied!");
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy referral link");
    }
  };

  const handleCopyCode = async () => {
    if (!referralCode) return;
    try {
      await navigator.clipboard.writeText(referralCode);
      toast.success("Referral code copied!");
    } catch (err) {
      toast.error("Failed to copy referral code");
    }
  };

  const progressToUnlimited = Math.min((referralCount / 5) * 100, 100);
  const ambassadorProgress = Math.min((approvedVideos / 5) * 100, 100);

  const fetchAmbassadorData = async () => {
    if (!user) return;
    
    try {
      // Fetch all submissions
      const { data: userSubmissions, error } = await supabase
        .from("ambassador_submissions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && userSubmissions) {
        setSubmissions(userSubmissions);
        const approved = userSubmissions.filter((s: any) => s.status === "approved").length;
        setApprovedVideos(approved);
      }
    } catch (err) {
      console.error("Error fetching ambassador data:", err);
    }
  };

  const handleSubmitVideo = async () => {
    if (!user || !submissionUrl.trim()) {
      toast.error("Please enter a video URL");
      return;
    }

    // Validate URL format
    const urlPattern = /^https?:\/\//;
    if (!urlPattern.test(submissionUrl.trim())) {
      toast.error("Please enter a valid URL starting with http:// or https://");
      return;
    }

    // Validate platform-specific URLs
    const platformPatterns = {
      youtube: /(youtube\.com|youtu\.be)/i,
      tiktok: /tiktok\.com/i,
      instagram: /instagram\.com/i,
    };

    if (!platformPatterns[submissionPlatform].test(submissionUrl)) {
      toast.error(`Please enter a valid ${submissionPlatform} URL`);
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("ambassador_submissions")
        .insert({
          user_id: user.id,
          platform: submissionPlatform,
          video_url: submissionUrl.trim(),
          status: "pending",
        });

      if (error) throw error;

      toast.success("Video submitted! Our team will review it soon.");
      setSubmissionUrl("");
      await fetchAmbassadorData();
      setStep("ambassadorStats");
    } catch (err: any) {
      console.error("Error submitting video:", err);
      toast.error(err.message || "Failed to submit video. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getPlatformIcon = (platform: Platform) => {
    switch (platform) {
      case "youtube":
        return <Youtube className="h-4 w-4" />;
      case "tiktok":
        return <Video className="h-4 w-4" />;
      case "instagram":
        return <Instagram className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-500 text-white">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  // Fetch referral code and stats - must be before early return
  useEffect(() => {
    if (open && user && isAuthenticated && !isPublicPage) {
      fetchReferralData();
      fetchAmbassadorData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user?.id, isAuthenticated, isPublicPage]);

  // Only show on authenticated pages - early return AFTER all hooks
  if (!isAuthenticated || isPublicPage || !user) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed top-4 right-4 z-50"
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            onClick={() => setOpen(true)}
            className="relative group"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse" />
              <div className="relative bg-background border-2 border-primary rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow">
                <Gift className="h-6 w-6 text-primary" />
              </div>
            </div>
            {/* Animated sparkles */}
            <motion.div
              className="absolute -top-1 -right-1"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Sparkles className="h-4 w-4 text-yellow-500" />
            </motion.div>
          </motion.button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p className="font-semibold">Free Premium</p>
        </TooltipContent>
      </Tooltip>

        <Dialog open={open} onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            setStep("main");
            setSubmissionUrl("");
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {step === "main" && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl flex items-center gap-2">
                    <Crown className="h-6 w-6 text-yellow-500" />
                    Get Free Premium
                  </DialogTitle>
                  <DialogDescription className="text-base">
                    Unlock premium features for free! Choose the option that works best for you.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                  {/* Referral Program - Easy */}
                  <Card className="border-2 hover:border-primary transition-colors cursor-pointer" onClick={() => setStep("referral")}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-blue-500" />
                          Referral Program
                        </CardTitle>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                          Easy
                        </Badge>
                      </div>
                      <CardDescription>
                        Share your referral link and earn free premium when friends sign up
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted p-4 rounded-lg mb-4">
                        <p className="text-sm font-medium mb-2">How it works:</p>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>Share your unique referral link with friends</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>When they sign up using your link, you both get <strong>1 month free premium</strong></span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span><strong>5 referrals = Unlimited Premium!</strong> Get lifetime access when 5 friends sign up</span>
                          </li>
                        </ul>
                      </div>
                      <Button className="w-full" variant="default">
                        Get Started
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Ambassador Program - Best Value */}
                  <Card className="border-2 border-yellow-500 hover:border-yellow-400 transition-colors bg-gradient-to-br from-yellow-50/50 to-orange-50/50 dark:from-yellow-950/20 dark:to-orange-950/20 cursor-pointer" onClick={() => setStep("ambassador")}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Crown className="h-5 w-5 text-yellow-500" />
                          Ambassador Program
                        </CardTitle>
                        <Badge variant="default" className="bg-yellow-500 text-yellow-950 hover:bg-yellow-400">
                          Best Value
                        </Badge>
                      </div>
                      <CardDescription>
                        Create social media content and unlock lifetime premium benefits
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted p-4 rounded-lg mb-4">
                        <p className="text-sm font-medium mb-2">How it works:</p>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <Video className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                            <span>Upload content on <strong>YouTube, TikTok, or Instagram</strong></span>
                          </li>
                          <li className="flex items-start gap-2">
                            <TrendingUp className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                            <span>Aim for <strong>500+ views</strong> and promote Vistari</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Crown className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                            <span><strong>5 approved videos = Unlimited Premium!</strong></span>
                          </li>
                        </ul>
                      </div>
                      <Button className="w-full bg-yellow-500 hover:bg-yellow-400 text-yellow-950" variant="default">
                        Get Started
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {step === "referral" && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setStep("main")}
                      className="h-8 w-8"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                      <DialogTitle className="text-2xl flex items-center gap-2">
                        <Users className="h-6 w-6 text-blue-500" />
                        Referral Program
                      </DialogTitle>
                      <DialogDescription className="text-base">
                        Share your link and earn free premium
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-sm text-muted-foreground mt-2">Loading your referral link...</p>
                    </div>
                  ) : (
                    <>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Your Referral Link</CardTitle>
                          <CardDescription>
                            Share this link with friends. When they sign up, you both get 1 month free premium!
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-background border rounded-lg p-3 font-mono text-xs break-all">
                              {referralLink || "Generating..."}
                            </div>
                            <Button
                              onClick={handleCopyLink}
                              variant="outline"
                              size="sm"
                              className="shrink-0"
                              disabled={!referralLink}
                            >
                              {linkCopied ? (
                                <>
                                  <Check className="h-4 w-4 mr-2" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copy Link
                                </>
                              )}
                            </Button>
                          </div>

                          {referralCode && (
                            <div className="bg-muted p-3 rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">Or share your code:</p>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 font-mono text-sm font-semibold">
                                  {referralCode}
                                </div>
                                <Button
                                  onClick={handleCopyCode}
                                  variant="ghost"
                                  size="sm"
                                  className="shrink-0"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => setStep("referralStats")}
                      >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        See Your Referrals
                      </Button>
                    </>
                  )}
                </div>
              </>
            )}

            {step === "referralStats" && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setStep("referral")}
                      className="h-8 w-8"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                      <DialogTitle className="text-2xl flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 text-blue-500" />
                        Your Referrals
                      </DialogTitle>
                      <DialogDescription className="text-base">
                        Track your progress to unlimited premium
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-2 border-blue-200 dark:border-blue-800">
                    <CardContent className="pt-6">
                      <div className="text-center space-y-4">
                        <div className="text-5xl font-bold text-blue-600 dark:text-blue-400">
                          {referralCount}
                        </div>
                        <div className="text-lg font-medium">
                          {referralCount === 1 ? "Referral" : "Referrals"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {referralCount >= 5 ? (
                            <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                              <CheckCircle2 className="h-5 w-5" />
                              <span className="font-semibold">You've unlocked Unlimited Premium!</span>
                            </div>
                          ) : (
                            <span>{5 - referralCount} more {referralCount === 4 ? "referral" : "referrals"} until unlimited premium</span>
                          )}
                        </div>
                        <Progress value={progressToUnlimited} className="h-3" />
                        <div className="text-xs text-muted-foreground">
                          {referralCount} / 5 referrals
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">How it works</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 text-sm">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                          <span>Each friend who signs up using your link gives you <strong>1 month free premium</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Crown className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
                          <span>When you reach <strong>5 referrals</strong>, you unlock <strong>unlimited premium</strong> - never pay again!</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Sparkles className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                          <span>Your friends also get 1 month free premium when they sign up</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Button
                    className="w-full"
                    variant="default"
                    onClick={() => setStep("referral")}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Referral Link
                  </Button>
                </div>
              </>
            )}

            {step === "ambassador" && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setStep("main")}
                      className="h-8 w-8"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                      <DialogTitle className="text-2xl flex items-center gap-2">
                        <Crown className="h-6 w-6 text-yellow-500" />
                        Ambassador Program
                      </DialogTitle>
                      <DialogDescription className="text-base">
                        Create content and unlock lifetime premium benefits
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                  <Card className="border-2 border-yellow-500 bg-gradient-to-br from-yellow-50/50 to-orange-50/50 dark:from-yellow-950/20 dark:to-orange-950/20">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Crown className="h-5 w-5 text-yellow-500" />
                        Exclusive Benefits
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 text-sm">
                        <li className="flex items-start gap-2">
                          <Crown className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
                          <span><strong>Lifetime premium access</strong> - Never pay again!</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Sparkles className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
                          <span>Early access to new features and updates</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Users className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
                          <span>Exclusive ambassador community and support</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">How to Become an Ambassador</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-lg border border-yellow-300 dark:border-yellow-700">
                        <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-3">
                          Create social media content promoting Vistari!
                        </p>
                        <ul className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
                          <li className="flex items-start gap-2">
                            <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">•</span>
                            <span>Upload content on <strong>YouTube, TikTok, or Instagram</strong></span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">•</span>
                            <span>Aim for <strong>500+ views</strong> on your video</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">•</span>
                            <span>Promote Vistari and share your experience</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">•</span>
                            <span><strong>5 approved videos = Unlimited Premium!</strong></span>
                          </li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-yellow-950"
                      variant="default"
                      onClick={() => setStep("ambassadorSubmit")}
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Submit Video
                    </Button>
                    <Button
                      className="flex-1"
                      variant="outline"
                      onClick={() => setStep("ambassadorStats")}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View Progress
                    </Button>
                  </div>
                </div>
              </>
            )}

            {step === "ambassadorSubmit" && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setStep("ambassador")}
                      className="h-8 w-8"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                      <DialogTitle className="text-2xl flex items-center gap-2">
                        <Video className="h-6 w-6 text-yellow-500" />
                        Submit Video
                      </DialogTitle>
                      <DialogDescription className="text-base">
                        Share your social media content promoting Vistari
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Video Submission</CardTitle>
                      <CardDescription>
                        Submit your YouTube, TikTok, or Instagram video promoting Vistari
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="platform">Platform</Label>
                        <Select
                          value={submissionPlatform}
                          onValueChange={(value) => setSubmissionPlatform(value as Platform)}
                        >
                          <SelectTrigger id="platform">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="youtube">
                              <div className="flex items-center gap-2">
                                <Youtube className="h-4 w-4" />
                                YouTube
                              </div>
                            </SelectItem>
                            <SelectItem value="tiktok">
                              <div className="flex items-center gap-2">
                                <Video className="h-4 w-4" />
                                TikTok
                              </div>
                            </SelectItem>
                            <SelectItem value="instagram">
                              <div className="flex items-center gap-2">
                                <Instagram className="h-4 w-4" />
                                Instagram
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="videoUrl">Video URL</Label>
                        <Input
                          id="videoUrl"
                          type="url"
                          placeholder={`Enter your ${submissionPlatform} video URL...`}
                          value={submissionUrl}
                          onChange={(e) => setSubmissionUrl(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Make sure your video has at least 500 views and promotes Vistari
                        </p>
                      </div>

                      <Button
                        className="w-full bg-yellow-500 hover:bg-yellow-400 text-yellow-950"
                        onClick={handleSubmitVideo}
                        disabled={submitting || !submissionUrl.trim()}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Submit for Review
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Requirements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          <span>Video must be on YouTube, TikTok, or Instagram</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          <span>Must have at least 500 views</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          <span>Must promote Vistari and share your experience</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          <span>Our team will review your submission within 2-3 business days</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {step === "ambassadorStats" && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setStep("ambassador")}
                      className="h-8 w-8"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                      <DialogTitle className="text-2xl flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 text-yellow-500" />
                        Your Ambassador Progress
                      </DialogTitle>
                      <DialogDescription className="text-base">
                        Track your approved videos toward unlimited premium
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                  <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-2 border-yellow-200 dark:border-yellow-800">
                    <CardContent className="pt-6">
                      <div className="text-center space-y-4">
                        <div className="text-5xl font-bold text-yellow-600 dark:text-yellow-400">
                          {approvedVideos}
                        </div>
                        <div className="text-lg font-medium">
                          {approvedVideos === 1 ? "Approved Video" : "Approved Videos"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {approvedVideos >= 5 ? (
                            <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                              <CheckCircle2 className="h-5 w-5" />
                              <span className="font-semibold">You've unlocked Unlimited Premium!</span>
                            </div>
                          ) : (
                            <span>{5 - approvedVideos} more {approvedVideos === 4 ? "video" : "videos"} until unlimited premium</span>
                          )}
                        </div>
                        <Progress value={ambassadorProgress} className="h-3" />
                        <div className="text-xs text-muted-foreground">
                          {approvedVideos} / 5 approved videos
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {submissions.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Your Submissions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {submissions.map((submission: any) => (
                            <div
                              key={submission.id}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="shrink-0">
                                  {getPlatformIcon(submission.platform)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <a
                                    href={submission.video_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-medium hover:underline truncate block"
                                  >
                                    {submission.video_url}
                                  </a>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(submission.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="shrink-0 ml-2">
                                {getStatusBadge(submission.status)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Button
                    className="w-full bg-yellow-500 hover:bg-yellow-400 text-yellow-950"
                    variant="default"
                    onClick={() => setStep("ambassadorSubmit")}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Submit Another Video
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
    </motion.div>
  );
};

export default FreePremiumGift;

