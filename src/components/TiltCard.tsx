import { useRef, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  max?: number; // max tilt degrees
  scale?: number;
  glare?: boolean;
}

/**
 * 3D tilt + mouse-following spotlight wrapper.
 * Uses CSS variables + transform; no React state to keep it snappy.
 * Disabled on coarse pointers (touch).
 */
export default function TiltCard({
  children,
  className = "",
  max = 8,
  scale = 1.02,
  glare = true,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const tiltX = (0.5 - y) * max * 2;
    const tiltY = (x - 0.5) * max * 2;
    el.style.setProperty("--tilt-x", `${tiltX}deg`);
    el.style.setProperty("--tilt-y", `${tiltY}deg`);
    el.style.setProperty("--tilt-scale", `${scale}`);
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--tilt-x", `0deg`);
    el.style.setProperty("--tilt-y", `0deg`);
    el.style.setProperty("--tilt-scale", `1`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`tilt relative ${className}`}
      style={{
        transformStyle: "preserve-3d",
        transform:
          "perspective(900px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)) scale(var(--tilt-scale, 1))",
        transition: "transform 350ms cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      {children}
      {glare && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.10), transparent 45%)",
            mixBlendMode: "screen",
          }}
        />
      )}
    </div>
  );
}
