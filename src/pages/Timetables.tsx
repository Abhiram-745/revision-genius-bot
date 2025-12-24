import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import TimetableList from "@/components/TimetableList";
import OnboardingWizard from "@/components/OnboardingWizard";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";
import owlStudying from "@/assets/owl-studying.png";
import owlChecklist from "@/assets/owl-checklist.png";
import owlFolder from "@/assets/owl-folder.png";

const Timetables = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setLoading(false);
      } else {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <PageTransition>
    <div className="min-h-screen bg-background relative overflow-hidden">
      
      {/* Floating background elements - hidden on mobile */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none hidden md:block">
        <div className="floating-blob top-20 -left-32 w-64 md:w-96 h-64 md:h-96 bg-primary/10 animate-float"></div>
        <div className="floating-blob top-40 right-10 w-72 md:w-[500px] h-72 md:h-[500px] bg-secondary/15 animate-float-delayed"></div>
        <div className="floating-blob bottom-20 left-1/3 w-48 md:w-80 h-48 md:h-80 bg-accent/10 animate-float-slow"></div>
        
        {/* Floating mascots */}
        <motion.img 
          src={owlStudying}
          alt=""
          className="absolute top-32 right-8 w-24 h-24 opacity-30"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.img 
          src={owlChecklist}
          alt=""
          className="absolute bottom-20 left-12 w-20 h-20 opacity-25"
          animate={{ y: [0, 8, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.img 
          src={owlFolder}
          alt=""
          className="absolute top-1/2 right-20 w-16 h-16 opacity-20"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
        />
      </div>

      <Header onNewTimetable={() => setShowOnboarding(true)} />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-8 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8" data-tour="timetables-page">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-hero rounded-lg md:rounded-xl blur-md opacity-60"></div>
              <div className="relative bg-gradient-hero p-2 sm:p-3 rounded-lg md:rounded-xl shadow-lg">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold gradient-text">
                My Timetables
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm mt-0.5 md:mt-1">
                Manage all your study schedules
              </p>
            </div>
          </div>
          
          <Button
            onClick={() => setShowOnboarding(true)}
            className="gap-2 bg-gradient-hero hover:opacity-90 shadow-lg w-full sm:w-auto"
            size="default"
            data-tour="new-timetable"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            New Timetable
          </Button>
        </div>

        {user && <TimetableList userId={user.id} />}
      </main>

      {showOnboarding && (
        <OnboardingWizard
          onComplete={() => setShowOnboarding(false)}
          onCancel={() => setShowOnboarding(false)}
        />
      )}
    </div>
    </PageTransition>
  );
};

export default Timetables;
