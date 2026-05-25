import { useEffect, useRef, useState } from "react";

interface Props {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
}

/**
 * SSR-safe animated number counter.
 * Initially renders the final value (so no-JS fallback shows the real number).
 * On mount, animates from 0 to value once the element is in view.
 */
export default function AnimatedCounter({
  value,
  suffix = "",
  duration = 1600,
  className,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let raf = 0;
    let started = false;
    let startTime = 0;

    const ease = (t: number) => 1 - Math.pow(1 - t, 3); // ease-out cubic

    const animate = (now: number) => {
      if (!startTime) startTime = now;
      const t = Math.min(1, (now - startTime) / duration);
      const v = Math.round(ease(t) * value);
      setDisplay(v);
      if (t < 1) raf = requestAnimationFrame(animate);
    };

    const begin = () => {
      if (started) return;
      started = true;
      setDisplay(0);
      raf = requestAnimationFrame(animate);
    };

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            begin();
            obs.disconnect();
            break;
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    obs.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      obs.disconnect();
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {display.toLocaleString("es-AR")}
      {suffix}
    </span>
  );
}
