import { useEffect, useRef, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  delay?: number;
  className?: string;
}

/**
 * SSR-safe blur reveal on scroll.
 *
 * Default state (no JS): visible (opacity 1) — content always reachable.
 * On mount, JS sets initial hidden state, then IntersectionObserver triggers
 * the fade-blur-translate-in transition.
 */
export default function Reveal({ children, delay = 0, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    // Apply hidden state only after JS mounts (so SSR shows content visible).
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.filter = "blur(8px)";
    el.style.willChange = "opacity, transform, filter";

    const transition = `opacity 700ms cubic-bezier(0.16,1,0.3,1) ${delay * 1000}ms, transform 700ms cubic-bezier(0.16,1,0.3,1) ${delay * 1000}ms, filter 700ms cubic-bezier(0.16,1,0.3,1) ${delay * 1000}ms`;

    const reveal = () => {
      el.style.transition = transition;
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
      el.style.filter = "blur(0)";
      window.setTimeout(() => {
        el.style.willChange = "";
      }, 1000);
    };

    // If element is already in view on mount, animate immediately.
    const rect = el.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (inView) {
      requestAnimationFrame(reveal);
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal();
            obs.disconnect();
            break;
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
