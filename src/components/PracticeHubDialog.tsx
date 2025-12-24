import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Sparkles, GraduationCap, Layers, BookOpen, Lightbulb, Repeat, Gamepad2, FileText } from "lucide-react";
import SaveMyExamsLogo from "@/components/SaveMyExamsLogo";

interface PracticeApp {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  buildUrl: (subject: string, topic: string) => string;
  badge?: string;
  badgeColor?: string;
  appColor: string;
  recommended?: boolean;
}

interface PracticeHubDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: string;
  topic: string;
  onSelectApp: (app: PracticeApp) => void;
  onSelectBlurtAI: () => void;
}

const practiceApps: PracticeApp[] = [
  {
    id: "blurt-ai",
    name: "BlurtAI",
    description: "Active recall with AI feedback",
    icon: <Brain className="w-6 h-6 text-secondary" />,
    gradient: "from-secondary/20 via-secondary/10 to-accent/10",
    buildUrl: () => "/blurt-ai",
    badge: "AI-Powered",
    badgeColor: "bg-secondary/20 text-secondary border-secondary/30",
    appColor: "bg-secondary/20",
    recommended: true,
  },
  {
    id: "savemyexams",
    name: "Save My Exams",
    description: "Notes, past papers & mark schemes",
    icon: <SaveMyExamsLogo className="w-6 h-6" />,
    gradient: "from-emerald-500/20 via-emerald-500/10 to-accent/10",
    buildUrl: (subject, topic) => `https://www.savemyexams.com/search/?query=${encodeURIComponent(`${subject} ${topic}`)}`,
    badge: "Papers",
    badgeColor: "bg-emerald-500/20 text-emerald-600 border-emerald-500/30",
    appColor: "bg-emerald-500/20",
  },
  {
    id: "pmt",
    name: "Physics & Maths Tutor",
    description: "GCSE & A-Level revision resources",
    icon: <GraduationCap className="w-6 h-6 text-blue-500" />,
    gradient: "from-blue-500/20 via-blue-500/10 to-accent/10",
    buildUrl: (subject, topic) => `https://www.physicsandmathstutor.com/search/?q=${encodeURIComponent(`${subject} ${topic}`)}`,
    badge: "STEM",
    badgeColor: "bg-blue-500/20 text-blue-600 border-blue-500/30",
    appColor: "bg-blue-500/20",
  },
  {
    id: "quizlet",
    name: "Quizlet",
    description: "Flashcards & study sets",
    icon: <Layers className="w-6 h-6 text-indigo-500" />,
    gradient: "from-indigo-500/20 via-indigo-500/10 to-accent/10",
    buildUrl: (subject, topic) => `https://quizlet.com/search?query=${encodeURIComponent(`${subject} ${topic}`)}&type=sets`,
    badge: "Flashcards",
    badgeColor: "bg-indigo-500/20 text-indigo-600 border-indigo-500/30",
    appColor: "bg-indigo-500/20",
  },
  {
    id: "studyfetch",
    name: "StudyFetch",
    description: "AI-powered study materials",
    icon: <Sparkles className="w-6 h-6 text-pink-500" />,
    gradient: "from-pink-500/20 via-pink-500/10 to-accent/10",
    buildUrl: () => "https://www.studyfetch.com",
    badge: "AI",
    badgeColor: "bg-pink-500/20 text-pink-600 border-pink-500/30",
    appColor: "bg-pink-500/20",
  },
  {
    id: "turbolearn",
    name: "TurboLearn AI",
    description: "Transform content into notes",
    icon: <Lightbulb className="w-6 h-6 text-cyan-500" />,
    gradient: "from-cyan-500/20 via-cyan-500/10 to-accent/10",
    buildUrl: () => "https://www.turbolearn.ai",
    badge: "AI Tutor",
    badgeColor: "bg-cyan-500/20 text-cyan-600 border-cyan-500/30",
    appColor: "bg-cyan-500/20",
  },
  {
    id: "mindgrasp",
    name: "Mindgrasp",
    description: "AI-generated notes & summaries",
    icon: <BookOpen className="w-6 h-6 text-violet-500" />,
    gradient: "from-violet-500/20 via-violet-500/10 to-accent/10",
    buildUrl: () => "https://mindgrasp.ai",
    badge: "AI Notes",
    badgeColor: "bg-violet-500/20 text-violet-600 border-violet-500/30",
    appColor: "bg-violet-500/20",
  },
  {
    id: "ankiweb",
    name: "AnkiWeb",
    description: "Spaced repetition flashcards",
    icon: <Repeat className="w-6 h-6 text-slate-600" />,
    gradient: "from-slate-500/20 via-slate-500/10 to-accent/10",
    buildUrl: () => "https://ankiweb.net",
    badge: "Spaced Rep",
    badgeColor: "bg-slate-500/20 text-slate-600 border-slate-500/30",
    appColor: "bg-slate-500/20",
  },
  {
    id: "kahoot",
    name: "Kahoot!",
    description: "Interactive quizzes & games",
    icon: <Gamepad2 className="w-6 h-6 text-purple-500" />,
    gradient: "from-purple-500/20 via-purple-500/10 to-accent/10",
    buildUrl: () => "https://kahoot.com",
    badge: "Games",
    badgeColor: "bg-purple-500/20 text-purple-600 border-purple-500/30",
    appColor: "bg-purple-500/20",
  },
  {
    id: "remnote",
    name: "RemNote",
    description: "Notes + flashcards combined",
    icon: <FileText className="w-6 h-6 text-blue-600" />,
    gradient: "from-blue-600/20 via-blue-600/10 to-accent/10",
    buildUrl: () => "https://www.remnote.com",
    badge: "Notes",
    badgeColor: "bg-blue-600/20 text-blue-600 border-blue-600/30",
    appColor: "bg-blue-600/20",
  },
];

export const PracticeHubDialog = ({
  open,
  onOpenChange,
  subject,
  topic,
  onSelectApp,
  onSelectBlurtAI,
}: PracticeHubDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Choose Your Practice Method
          </DialogTitle>
          <DialogDescription>
            Studying: <span className="font-medium text-foreground">{subject}</span> - {topic}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {practiceApps.map((app) => (
              <Card
                key={app.id}
                onClick={() => {
                  if (app.id === "blurt-ai") {
                    onSelectBlurtAI();
                  } else {
                    onSelectApp(app);
                  }
                  onOpenChange(false);
                }}
                className={`cursor-pointer p-4 hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/30 bg-gradient-to-r ${app.gradient} ${app.recommended ? 'ring-2 ring-primary/50' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg ${app.appColor} flex items-center justify-center shrink-0`}>
                    {app.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm">{app.name}</h3>
                      {app.badge && (
                        <Badge variant="outline" className={`text-[10px] ${app.badgeColor}`}>
                          {app.badge}
                        </Badge>
                      )}
                      {app.recommended && (
                        <Badge className="text-[10px] bg-primary">
                          Recommended
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {app.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>

        <div className="pt-4 border-t mt-4">
          <p className="text-xs text-muted-foreground text-center">
            All sessions will be tracked and logged to your practice history
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { practiceApps };
export type { PracticeApp };
