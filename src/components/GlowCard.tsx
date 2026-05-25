import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useMotionTemplate } from "motion/react";

interface Props {
  children: ReactNode;
  className?: string;
  glow?: string; // tailwind gradient classes for backdrop
}

/**
 * Card with mouse-tracking radial glow + glassy surface.
 * Uses useMotionTemplate so the background string reacts to motion values.
 */
export default function GlowCard({
  children,
  className = "",
  glow = "from-[#1B2CC1]/15 via-[#ABD2FA]/15 to-transparent",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(50);
  const my = useMotionValue(50);

  const background = useMotionTemplate`radial-gradient(420px circle at ${mx}% ${my}%, color-mix(in oklab, var(--color-accent) 35%, transparent), transparent 50%)`;

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mx.set(((e.clientX - rect.left) / rect.width) * 100);
    my.set(((e.clientY - rect.top) / rect.height) * 100);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      className={`group relative overflow-hidden rounded-2xl border border-border bg-surface/60 p-px backdrop-blur-xl transition-all duration-300 hover:border-accent/50 ${className}`}
    >
      {/* Mouse spotlight (reactive) */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background }}
      />
      {/* Gradient backdrop */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${glow} opacity-60`}
      />
      <div className="relative h-full rounded-[15px] bg-bg-elevated/85 p-6 backdrop-blur-md">
        {children}
      </div>
    </motion.div>
  );
}
