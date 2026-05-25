import { useEffect, useRef } from "react";

/**
 * Canvas with a small number of floating glow orbs.
 * Designed to live behind hero / large sections.
 * Cheap: 18 orbs, 60fps capped, paused when off-screen.
 */
export default function FloatingOrbs({
  count = 18,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = Math.min(2, window.devicePixelRatio || 1);
    let running = true;

    // Inverted blue chrome — lighter dominant, dark edges, mint kicker
    const colors = ["#ABD2FA", "#7692FF", "#3D518C", "#ffffff", "#00D492"];

    interface Orb {
      x: number;
      y: number;
      r: number;
      vx: number;
      vy: number;
      color: string;
      alpha: number;
    }
    let orbs: Orb[] = [];

    const reset = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);

      orbs = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 1.4 + Math.random() * 2.6,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        color: colors[Math.floor(Math.random() * colors.length)]!,
        alpha: 0.35 + Math.random() * 0.5,
      }));
    };

    const tick = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (const o of orbs) {
        o.x += o.vx;
        o.y += o.vy;
        if (o.x < -10) o.x = w + 10;
        if (o.x > w + 10) o.x = -10;
        if (o.y < -10) o.y = h + 10;
        if (o.y > h + 10) o.y = -10;

        const grad = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r * 14);
        grad.addColorStop(0, hexToRgba(o.color, o.alpha));
        grad.addColorStop(1, hexToRgba(o.color, 0));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r * 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = hexToRgba(o.color, Math.min(1, o.alpha + 0.2));
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };

    const onResize = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      reset();
    };

    const io = new IntersectionObserver(([entry]) => {
      running = !!entry?.isIntersecting;
      if (running) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(tick);
      }
    });
    io.observe(canvas);

    reset();
    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", onResize);

    return () => {
      running = false;
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [count]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}

function hexToRgba(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${a})`;
}
