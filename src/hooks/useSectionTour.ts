import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSectionTour = (pageKey: string) => {
  const [viewedSections, setViewedSections] = useState<Set<string>>(new Set());
  const [permanentlyDismissed, setPermanentlyDismissed] = useState<Set<string>>(new Set());
  const [activeTourSection, setActiveTourSection] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadViewedSections = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setUserId(user.id);
      
      // Load viewed sections
      const storageKey = `section_tours_${pageKey}_${user.id}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setViewedSections(new Set(JSON.parse(stored)));
      }
      
      // Load permanently dismissed sections
      const dismissedKey = `section_tours_dismissed_${pageKey}_${user.id}`;
      const dismissed = localStorage.getItem(dismissedKey);
      if (dismissed) {
        setPermanentlyDismissed(new Set(JSON.parse(dismissed)));
      }
    };
    
    loadViewedSections();
  }, [pageKey]);

  const markSectionViewed = useCallback((sectionKey: string, permanent?: boolean) => {
    if (!userId) return;
    
    // Always mark as viewed
    setViewedSections(prev => {
      const updated = new Set(prev);
      updated.add(sectionKey);
      const storageKey = `section_tours_${pageKey}_${userId}`;
      localStorage.setItem(storageKey, JSON.stringify([...updated]));
      return updated;
    });
    
    // If permanent, also add to dismissed list
    if (permanent) {
      setPermanentlyDismissed(prev => {
        const updated = new Set(prev);
        updated.add(sectionKey);
        const dismissedKey = `section_tours_dismissed_${pageKey}_${userId}`;
        localStorage.setItem(dismissedKey, JSON.stringify([...updated]));
        return updated;
      });
    }
    
    setActiveTourSection(null);
  }, [pageKey, userId]);

  const handleSectionClick = useCallback((sectionKey: string) => {
    // Don't show if permanently dismissed
    if (permanentlyDismissed.has(sectionKey)) {
      return false;
    }
    
    if (!viewedSections.has(sectionKey)) {
      setActiveTourSection(sectionKey);
      return true;
    }
    return false;
  }, [viewedSections, permanentlyDismissed]);

  return {
    viewedSections,
    permanentlyDismissed,
    activeTourSection,
    markSectionViewed,
    handleSectionClick,
  };
};
