import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ProductTour from "./ProductTour";
import {
  dashboardTourSteps,
  socialTourSteps,
  groupsTourSteps,
  calendarTourSteps,
  eventsTourSteps,
  homeworkTourSteps,
  testScoresTourSteps,
  aiInsightsTourSteps,
  reflectionsTourSteps,
  timetablesTourSteps,
} from "./tourSteps";
import { timetableViewTourSteps } from "./timetableViewTourSteps";

const TourManager = () => {
  const location = useLocation();
  const [activeTour, setActiveTour] = useState<string | null>(null);

  // Check if any dialog or modal is open
  const isDialogOpen = () => {
    return document.querySelector('[role="dialog"]') !== null || 
           document.querySelector('[data-state="open"]') !== null;
  };

  useEffect(() => {
    // Don't show tours if guided onboarding is in progress
    const checkOnboardingStatus = async () => {
      // Don't show tours if a dialog is open
      if (isDialogOpen()) {
        setActiveTour(null);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Only show tours for users who have at least one timetable (not brand new users)
      const { data: timetables } = await supabase
        .from("timetables")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);

      // Don't show tours for brand new users - let them explore first
      if (!timetables || timetables.length === 0) {
        setActiveTour(null);
        return;
      }
      
      // Determine which tour to show based on the current route
      const path = location.pathname;
      
      if (path === "/dashboard" || path === "/") {
        setActiveTour("dashboard");
      } else if (path === "/social") {
        setActiveTour("social");
      } else if (path === "/groups") {
        setActiveTour("groups");
      } else if (path === "/calendar") {
        setActiveTour("calendar");
      } else if (path === "/events") {
        setActiveTour("events");
      } else if (path === "/homework") {
        setActiveTour("homework");
      } else if (path === "/test-scores") {
        setActiveTour("test-scores");
      } else if (path === "/ai-insights") {
        setActiveTour("ai-insights");
      } else if (path === "/reflections") {
        setActiveTour("reflections");
      } else if (path === "/timetables") {
        setActiveTour("timetables");
      } else if (path.startsWith("/timetable/")) {
        setActiveTour("timetable-view");
      } else {
        setActiveTour(null);
      }
    };
    
    // Longer delay to ensure DOM elements are rendered and dialogs are closed
    const timer = setTimeout(() => {
      checkOnboardingStatus();
    }, 2000);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      {activeTour === "dashboard" && (
        <ProductTour
          tourKey="dashboard"
          steps={dashboardTourSteps}
          run={true}
        />
      )}
      {activeTour === "social" && (
        <ProductTour
          tourKey="social"
          steps={socialTourSteps}
          run={true}
        />
      )}
      {activeTour === "groups" && (
        <ProductTour
          tourKey="groups"
          steps={groupsTourSteps}
          run={true}
        />
      )}
      {activeTour === "calendar" && (
        <ProductTour
          tourKey="calendar"
          steps={calendarTourSteps}
          run={true}
        />
      )}
      {activeTour === "events" && (
        <ProductTour
          tourKey="events"
          steps={eventsTourSteps}
          run={true}
        />
      )}
      {activeTour === "homework" && (
        <ProductTour
          tourKey="homework"
          steps={homeworkTourSteps}
          run={true}
        />
      )}
      {activeTour === "test-scores" && (
        <ProductTour
          tourKey="test-scores"
          steps={testScoresTourSteps}
          run={true}
        />
      )}
      {activeTour === "ai-insights" && (
        <ProductTour
          tourKey="ai-insights"
          steps={aiInsightsTourSteps}
          run={true}
        />
      )}
      {activeTour === "reflections" && (
        <ProductTour
          tourKey="reflections"
          steps={reflectionsTourSteps}
          run={true}
        />
      )}
      {activeTour === "timetables" && (
        <ProductTour
          tourKey="timetables"
          steps={timetablesTourSteps}
          run={true}
        />
      )}
      {activeTour === "timetable-view" && (
        <ProductTour
          tourKey="timetable-view"
          steps={timetableViewTourSteps}
          run={true}
        />
      )}
    </>
  );
};

export default TourManager;
