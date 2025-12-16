import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Brain, Timer } from "lucide-react";

interface PracticeTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectBlurtAI: () => void;
  onSelectOther: () => void;
  subject: string;
  topic: string;
}

export const PracticeTypeDialog = ({
  open,
  onOpenChange,
  onSelectBlurtAI,
  onSelectOther,
  subject,
  topic,
}: PracticeTypeDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Practice Type</DialogTitle>
          <DialogDescription>
            How would you like to study <span className="font-semibold text-foreground">{topic}</span> in {subject}?
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <Button
            variant="outline"
            className="h-auto py-6 flex flex-col items-center gap-3 hover:bg-primary/5 hover:border-primary transition-all"
            onClick={onSelectBlurtAI}
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">Blurt AI Practice</p>
              <p className="text-sm text-muted-foreground mt-1">
                Active recall practice with AI-powered questions
              </p>
            </div>
          </Button>
          
          <Button
            variant="outline"
            className="h-auto py-6 flex flex-col items-center gap-3 hover:bg-secondary/50 transition-all"
            onClick={onSelectOther}
          >
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Timer className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">Other Practice</p>
              <p className="text-sm text-muted-foreground mt-1">
                Self-study with a simple timer
              </p>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
