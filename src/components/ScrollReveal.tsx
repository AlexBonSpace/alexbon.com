import { useEffect, useRef, type ReactNode } from "react";
import { animate, inView } from "motion";

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function ScrollReveal({ children, delay = 0, duration = 0.6, className = "" }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      // No animation for users who prefer reduced motion
      return;
    }

    // Set initial state
    element.style.opacity = "0";
    element.style.transform = "translateY(24px)";

    // Animate when element comes into view
    const stopInView = inView(
      element,
      () => {
        animate(
          element,
          { opacity: 1, transform: "translateY(0)" },
          { duration, delay, easing: [0.22, 1, 0.36, 1] },
        );
      },
      { amount: 0.2 },
    );

    return () => {
      stopInView();
    };
  }, [delay, duration]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
