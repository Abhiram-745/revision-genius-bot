import { RefObject, useEffect, useRef, useState } from "react";
import { useMotionValue } from "framer-motion";

interface ScrollLockOptions {
  /** Intersection ratio (0-1) at which we start locking scroll */
  lockThreshold?: number;
  /** Multiplier mapping scroll delta to progress increment */
  sensitivity?: number;
}

/**
 * Locks the page scroll while the given section is in view and
 * maps wheel/touch input to a local 0-1 progress MotionValue.
 * When progress reaches 1, normal scrolling resumes and the
 * viewport is moved just past the section.
 */
export const useScrollLockSection = (
  sectionRef: RefObject<HTMLElement>,
  options: ScrollLockOptions = {}
) => {
  const { lockThreshold = 0.6, sensitivity = 0.0015 } = options;

  const progress = useMotionValue(0);
  const [isLocked, setIsLocked] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  const previousOverflowRef = useRef<string>("");
  const touchStartYRef = useRef<number | null>(null);

  // Activate scroll lock when section is sufficiently in view
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || hasCompleted) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const shouldLock =
          entry.isIntersecting &&
          entry.intersectionRatio >= lockThreshold &&
          !hasCompleted;

        if (shouldLock && !isLocked) {
          setIsLocked(true);
          previousOverflowRef.current = document.body.style.overflow;
          document.body.style.overflow = "hidden";
        }
      },
      { threshold: [lockThreshold] }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [sectionRef, lockThreshold, hasCompleted, isLocked]);

  // Map wheel / touch movement to local progress
  useEffect(() => {
    if (!isLocked) return;

    const handleDelta = (deltaY: number) => {
      const current = progress.get();

      // Allow natural scroll back above section if user scrolls up at start
      if (current <= 0 && deltaY < 0) {
        return;
      }

      const next = Math.min(1, Math.max(0, current + deltaY * sensitivity));
      progress.set(next);

      if (next >= 1 && !hasCompleted) {
        setHasCompleted(true);
        setIsLocked(false);
        document.body.style.overflow = previousOverflowRef.current;

        const section = sectionRef.current;
        if (section) {
          const rect = section.getBoundingClientRect();
          const absoluteTop = window.scrollY + rect.top;
          const bottom = absoluteTop + section.offsetHeight;
          window.scrollTo({ top: bottom + 1 });
        }
      }
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      handleDelta(event.deltaY);
    };

    const onTouchStart = (event: TouchEvent) => {
      touchStartYRef.current = event.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (touchStartYRef.current == null) return;
      const currentY = event.touches[0]?.clientY ?? touchStartYRef.current;
      const deltaY = touchStartYRef.current - currentY;
      if (deltaY === 0) return;

      event.preventDefault();
      handleDelta(deltaY);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      window.removeEventListener("wheel", onWheel as EventListener);
      window.removeEventListener("touchstart", onTouchStart as EventListener);
      window.removeEventListener("touchmove", onTouchMove as EventListener);
    };
  }, [isLocked, hasCompleted, progress, sensitivity, sectionRef]);

  // Ensure we always restore body overflow on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = previousOverflowRef.current;
    };
  }, []);

  return { progress, isLocked, hasCompleted };
};
