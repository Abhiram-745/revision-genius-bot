import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  Check, 
  Sparkles, 
  Zap, 
  Brain, 
  Calendar, 
  Infinity as InfinityIcon, 
  BarChart3, 
  Users, 
  Clock, 
  Star,
  ArrowLeft,
  Rocket,
  Shield,
  Gift
} from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { toast } from "sonner";
import { PricingSEO } from "@/components/SEO";

const floatAnimation = {
  y: [0, -10, 0],
  transition: { duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }
};

const features = [
  {
    icon: InfinityIcon,
    title: "Unlimited Timetables",
    description: "Create as many study schedules as you need",
    free: "1 timetable",
    premium: "Unlimited"
  },
  {
    icon: Brain,
    title: "AI-Powered Insights",
    description: "Get personalized study recommendations",
    free: "Basic",
    premium: "Advanced AI"
  },
  {
    icon: Calendar,
    title: "Schedule Regeneration",
    description: "Regenerate your timetable anytime",
    free: "1 per week",
    premium: "Unlimited"
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track your progress with detailed stats",
    free: "Basic stats",
    premium: "Full analytics"
  },
  {
    icon: Users,
    title: "Study Groups",
    description: "Collaborate with friends and classmates",
    free: "Join groups",
    premium: "Create & manage"
  },
  {
    icon: Clock,
    title: "Daily Insights",
    description: "Get AI tips to optimize your study time",
    free: "1 per day",
    premium: "Unlimited"
  }
];

const testimonials = [
  {
    quote: "Vistara Premium helped me boost my grades from a B to an A* in just 3 months!",
    author: "Sarah M.",
    role: "A-Level Student"
  },
  {
    quote: "The AI insights are incredibly accurate. It's like having a personal tutor!",
    author: "James K.",
    role: "GCSE Student"
  },
  {
    quote: "Unlimited timetables means I can plan for all my subjects perfectly.",
    author: "Emily R.",
    role: "IB Student"
  }
];

const Pricing = () => {
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("yearly");

  const handleUpgrade = () => {
    // Placeholder for Stripe checkout - will be implemented when Stripe is enabled
    toast.info("Payment integration coming soon! You'll be able to upgrade shortly.");
  };

  const monthlyPrice = 4.99;
  const yearlyPrice = 39.99;
  const yearlyMonthlyEquivalent = (yearlyPrice / 12).toFixed(2);
  const savings = Math.round((1 - yearlyPrice / (monthlyPrice * 12)) * 100);

  return (
    <PageTransition>
      <PricingSEO />
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-violet-950/20 overflow-hidden">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-full blur-3xl"
            animate={{ 
              x: [0, 50, 0],
              y: [0, 30, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-full blur-3xl"
            animate={{ 
              x: [0, -50, 0],
              y: [0, -30, 0],
              scale: [1.1, 1, 1.1]
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 sm:py-12">
          {/* Back button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-8 gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </motion.div>

          {/* Hero Section */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/20 border border-violet-500/30 mb-6"
              animate={floatAnimation}
            >
              <Sparkles className="h-4 w-4 text-violet-400" />
              <span className="text-sm font-medium text-violet-300">Launch Special</span>
            </motion.div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                Supercharge
              </span>
              <br />
              Your Study Game
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Unlock the full power of Vistara with unlimited features, AI coaching, and advanced analytics
            </p>
          </motion.div>

          {/* Billing Toggle */}
          <motion.div 
            className="flex justify-center mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="inline-flex items-center p-1 rounded-full bg-muted/50 backdrop-blur-sm border border-border">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  billingPeriod === "monthly" 
                    ? "bg-violet-600 text-white shadow-lg" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod("yearly")}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  billingPeriod === "yearly" 
                    ? "bg-violet-600 text-white shadow-lg" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Yearly
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  Save {savings}%
                </Badge>
              </button>
            </div>
          </motion.div>

          {/* Pricing Cards */}
          <motion.div 
            className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* Free Plan */}
            <Card className="relative border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-2">Free</h3>
                <p className="text-muted-foreground mb-6">Get started with basic features</p>
                
                <div className="mb-8">
                  <span className="text-4xl font-bold">£0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-500" />
                    <span>1 Study Timetable</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-500" />
                    <span>Basic Analytics</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-500" />
                    <span>Join Study Groups</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-500" />
                    <span>1 Daily AI Insight</span>
                  </li>
                </ul>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate("/dashboard")}
                >
                  Current Plan
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="relative border-violet-500/50 bg-gradient-to-br from-violet-900/30 via-purple-900/20 to-fuchsia-900/30 backdrop-blur-sm overflow-hidden">
              {/* Popular badge */}
              <div className="absolute top-0 right-0">
                <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
                  MOST POPULAR
                </div>
              </div>

              <CardContent className="p-8">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-6 w-6 text-violet-400" />
                  <h3 className="text-2xl font-bold">Premium</h3>
                </div>
                <p className="text-muted-foreground mb-6">Unlock your full potential</p>
                
                <div className="mb-8">
                  <span className="text-4xl font-bold">
                    £{billingPeriod === "yearly" ? yearlyMonthlyEquivalent : monthlyPrice}
                  </span>
                  <span className="text-muted-foreground">/month</span>
                  {billingPeriod === "yearly" && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Billed £{yearlyPrice}/year
                    </div>
                  )}
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <InfinityIcon className="h-5 w-5 text-violet-400" />
                    <span className="font-medium">Unlimited Timetables</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Brain className="h-5 w-5 text-violet-400" />
                    <span className="font-medium">Advanced AI Insights</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-violet-400" />
                    <span className="font-medium">Full Analytics Dashboard</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-violet-400" />
                    <span className="font-medium">Create & Manage Groups</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-violet-400" />
                    <span className="font-medium">Priority Support</span>
                  </li>
                </ul>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/25 text-white py-6"
                    onClick={handleUpgrade}
                  >
                    <Rocket className="h-5 w-5 mr-2" />
                    Upgrade to Premium
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Features Comparison */}
          <motion.div 
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold text-center mb-10">
              Everything You Get with Premium
            </h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm hover:border-violet-500/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="p-3 rounded-xl bg-violet-500/20 w-fit mb-4">
                        <feature.icon className="h-6 w-6 text-violet-400" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Free: {feature.free}</span>
                        <span className="font-medium text-violet-400">Premium: {feature.premium}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Testimonials */}
          <motion.div 
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-center mb-10">
              What Students Say
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        ))}
                      </div>
                      <p className="text-muted-foreground mb-4 italic">"{testimonial.quote}"</p>
                      <div>
                        <p className="font-semibold">{testimonial.author}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Trust Badges */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex flex-wrap justify-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-500" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-violet-500" />
                <span>7-Day Money Back</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span>Cancel Anytime</span>
              </div>
            </div>
          </motion.div>

          {/* Final CTA */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="border-violet-500/30 bg-gradient-to-br from-violet-900/30 to-fuchsia-900/30 backdrop-blur-sm max-w-2xl mx-auto">
              <CardContent className="p-8 sm:p-12">
                <motion.div animate={floatAnimation}>
                  <Crown className="h-16 w-16 text-violet-400 mx-auto mb-6" />
                </motion.div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                  Ready to Ace Your Exams?
                </h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Join thousands of students who've improved their grades with Vistara Premium
                </p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/25 text-white px-12 py-6 text-lg"
                    onClick={handleUpgrade}
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    Get Premium Now
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Pricing;
