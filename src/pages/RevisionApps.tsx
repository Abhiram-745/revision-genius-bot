import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, ExternalLink, Calculator, Languages, BookOpen, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import PageTransition from "@/components/PageTransition";
import SaveMyExamsLogo from "@/components/SaveMyExamsLogo";

const RevisionApps = () => {
  const navigate = useNavigate();

  const apps = [
    {
      id: "blurt-ai",
      name: "BlurtAI",
      description: "AI-powered active recall practice. Write everything you know about a topic and get instant feedback.",
      icon: <Brain className="h-8 w-8 text-primary" />,
      path: "/blurt-ai",
      gradient: "from-primary/20 to-primary/5",
      recommended: "All Subjects",
      badge: "Active Recall",
      badgeColor: "bg-primary/20 text-primary"
    },
    {
      id: "savemyexams",
      name: "SaveMyExams",
      description: "Access comprehensive revision notes, past papers, and topic questions for your exams.",
      icon: <SaveMyExamsLogo className="h-8 w-8" />,
      path: "/savemyexams",
      gradient: "from-amber-500/20 to-amber-500/5",
      recommended: "Sciences, Humanities",
      badge: "Revision Notes",
      badgeColor: "bg-amber-500/20 text-amber-600"
    },
    {
      id: "pmt",
      name: "Physics & Maths Tutor",
      description: "Access past papers, mark schemes, and worked solutions for A-Level and GCSE subjects.",
      icon: <Calculator className="h-8 w-8 text-blue-500" />,
      path: "/pmt",
      gradient: "from-blue-500/20 to-blue-500/5",
      recommended: "Maths, Sciences",
      badge: "Past Papers",
      badgeColor: "bg-blue-500/20 text-blue-600"
    },
    {
      id: "quizlet",
      name: "Quizlet",
      description: "Create and study flashcards. Perfect for vocabulary, definitions, and memorization.",
      icon: <Languages className="h-8 w-8 text-indigo-500" />,
      path: "/quizlet",
      gradient: "from-indigo-500/20 to-indigo-500/5",
      recommended: "Languages, Vocabulary",
      badge: "Flashcards",
      badgeColor: "bg-indigo-500/20 text-indigo-600"
    },
    {
      id: "gradlify",
      name: "Gradlify",
      description: "AI-powered maths practice with step-by-step solutions and personalized learning paths.",
      icon: <Sparkles className="h-8 w-8 text-emerald-500" />,
      path: "/gradlify",
      gradient: "from-emerald-500/20 to-emerald-500/5",
      recommended: "Mathematics",
      badge: "AI Practice",
      badgeColor: "bg-emerald-500/20 text-emerald-600"
    }
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <Header />
        <main className="container max-w-6xl mx-auto py-8 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <BookOpen className="h-10 w-10 text-primary" />
                <h1 className="text-4xl font-bold gradient-text">Revision Apps</h1>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Access all your revision tools in one place. Each app integrates with your study data for personalized insights.
              </p>
            </div>

            {/* Apps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apps.map((app, index) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className={`h-full hover:shadow-lg transition-all duration-300 cursor-pointer group border-2 hover:border-primary/30 bg-gradient-to-br ${app.gradient}`}
                    onClick={() => navigate(app.path)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="p-3 rounded-xl bg-background/80 shadow-sm group-hover:scale-110 transition-transform">
                          {app.icon}
                        </div>
                        <Badge className={app.badgeColor}>
                          {app.badge}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl mt-4">{app.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {app.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Best for: {app.recommended}
                        </span>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="gap-1 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        >
                          Open
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Info Section */}
            <Card className="bg-muted/30 border-dashed">
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Your Practice is Tracked</h3>
                    <p className="text-sm text-muted-foreground">
                      Sessions from all apps contribute to your study insights and help the AI create better timetables.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </PageTransition>
  );
};

export default RevisionApps;
