import { useEffect, useRef } from "react";

/**
 * Animated mesh-gradient background using soft radial blobs +
 * a faint dotted grid overlay. Purely CSS-animated, GPU-cheap.
 */
export default function MeshGradient() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Parallax mouse movement
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let tx = 0, ty = 0, cx = 0, cy = 0;
    const onMove = (e: MouseEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 24;
      ty = (e.clientY / window.innerHeight - 0.5) * 24;
    };
    const tick = () => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#050816]"
    >
      {/* Animated blobs */}
      <div
        ref={ref}
        className="absolute inset-[-10%] will-change-transform"
      >
        <div
          className="absolute -top-32 -left-24 h-[42rem] w-[42rem] rounded-full opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(circle at center, rgba(27,44,193,0.5), transparent 60%)",
            animation: "aurora 18s ease-in-out infinite alternate",
          }}
        />
        <div
          className="absolute top-40 -right-32 h-[38rem] w-[38rem] rounded-full opacity-45 blur-3xl"
          style={{
            background:
              "radial-gradient(circle at center, rgba(171,210,250,0.5), transparent 60%)",
            animation: "aurora 22s ease-in-out 1s infinite alternate-reverse",
          }}
        />
        <div
          className="absolute bottom-0 left-1/3 h-[40rem] w-[40rem] rounded-full opacity-32 blur-3xl"
          style={{
            background:
              "radial-gradient(circle at center, rgba(0,212,146,0.35), transparent 60%)",
            animation: "aurora 26s ease-in-out 2s infinite alternate",
          }}
        />
      </div>

      {/* Dotted grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.18) 1px, transparent 0)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 90%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 90%)",
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(5,8,22,0.85) 100%)",
        }}
      />

      {/* Top noise — subtle film grain */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
