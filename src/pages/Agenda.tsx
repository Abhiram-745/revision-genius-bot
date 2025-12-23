import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ClipboardList, CalendarDays, ListTodo, CalendarClock, Clock } from "lucide-react";
import Header from "@/components/Header";
import { HomeworkList } from "@/components/HomeworkList";
import { EventsWidget } from "@/components/EventsWidget";
import { SchoolSchedule } from "@/components/SchoolSchedule";
import CalendarGrid from "@/components/CalendarGrid";
import { supabase } from "@/integrations/supabase/client";
import PageTransition from "@/components/PageTransition";

const Agenda = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>("");
  const [activeTab, setActiveTab] = useState("calendar");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
    } else {
      navigate("/auth");
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background relative overflow-hidden">
        
        {/* Floating background elements - hidden on mobile */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none hidden md:block" style={{ zIndex: 1 }}>
          <div className="floating-blob top-20 -left-32 w-64 md:w-96 h-64 md:h-96 bg-primary/10 animate-float"></div>
          <div className="floating-blob top-40 right-10 w-72 md:w-[500px] h-72 md:h-[500px] bg-secondary/15 animate-float-delayed"></div>
          <div className="floating-blob bottom-20 left-1/3 w-48 md:w-80 h-48 md:h-80 bg-accent/10 animate-float-slow"></div>
        </div>

        <Header />
        
        <div className="container mx-auto px-3 sm:px-4 py-4 md:py-6 max-w-7xl relative z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="mb-3 md:mb-4 gap-2 hover-lift text-sm"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" /> Back to Dashboard
          </Button>

          {/* Header Section */}
          <div className="mb-4 md:mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/20">
                <ListTodo className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold gradient-text">Agenda</h1>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm ml-[48px] sm:ml-[52px]">
              Your calendar, homework, events, and schedule
            </p>
          </div>

          {/* Tabs Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
            <TabsList className="grid w-full grid-cols-4 h-11 sm:h-12 md:h-14 p-1 bg-muted/50 rounded-xl border border-border/50">
              <TabsTrigger 
                value="calendar" 
                className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all"
              >
                <CalendarClock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Calendar</span>
                <span className="sm:hidden">Cal</span>
              </TabsTrigger>
              <TabsTrigger 
                value="homework" 
                className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all"
              >
                <ClipboardList className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Homework</span>
                <span className="sm:hidden">Tasks</span>
              </TabsTrigger>
              <TabsTrigger 
                value="events" 
                className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all"
              >
                <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Events</span>
              </TabsTrigger>
              <TabsTrigger 
                value="schedule" 
                className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all"
              >
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Schedule</span>
                <span className="sm:hidden">School</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calendar" className="mt-4 sm:mt-6 animate-fade-in">
              <CalendarGrid userId={userId} />
            </TabsContent>

            <TabsContent value="homework" className="mt-4 sm:mt-6 animate-fade-in">
              {userId && <HomeworkList userId={userId} />}
            </TabsContent>

            <TabsContent value="events" className="mt-4 sm:mt-6 animate-fade-in">
              <EventsWidget />
            </TabsContent>

            <TabsContent value="schedule" className="mt-4 sm:mt-6 animate-fade-in">
              <SchoolSchedule />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageTransition>
  );
};

export default Agenda;
