import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Reset Lenis on Astro page transitions
    const onBeforeSwap = () => lenis.scrollTo(0, { immediate: true });
    document.addEventListener("astro:before-swap", onBeforeSwap);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("astro:before-swap", onBeforeSwap);
      lenis.destroy();
    };
  }, []);

  return null;
}
