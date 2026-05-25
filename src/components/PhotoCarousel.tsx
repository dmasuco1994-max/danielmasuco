import { useEffect, useRef, useState } from "react";

interface Props {
  images: readonly string[];
  intervalMs?: number;
  alt: string;
  className?: string;
  /** If true, pauses when not visible to save CPU/battery. */
  pauseOffScreen?: boolean;
}

/**
 * Crossfade carousel that cycles through `images` every `intervalMs`.
 *
 * - SSR-safe: renders the first image visible by default.
 * - Crossfade via opacity transition (no layout shift).
 * - Respects prefers-reduced-motion (stays on first image, no auto-advance).
 * - Pauses the timer when the element is off-screen (default on).
 */
export default function PhotoCarousel({
  images,
  intervalMs = 3000,
  alt,
  className = "",
  pauseOffScreen = true,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (images.length < 2) return;

    let timer: number | null = null;

    const tick = () => {
      setIndex((i) => (i + 1) % images.length);
    };
    const start = () => {
      if (timer != null) return;
      timer = window.setInterval(tick, intervalMs);
    };
    const stop = () => {
      if (timer != null) {
        clearInterval(timer);
        timer = null;
      }
    };

    if (visible) start();

    return () => stop();
  }, [images.length, intervalMs, visible]);

  // Pause when off-screen
  useEffect(() => {
    if (!pauseOffScreen) return;
    const el = wrapperRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(!!entry?.isIntersecting),
      { rootMargin: "100px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [pauseOffScreen]);

  // Pause when the document is hidden (tab switch)
  useEffect(() => {
    const onVis = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return (
    <div ref={wrapperRef} className={`relative aspect-[4/5] overflow-hidden ${className}`}>
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={i === index ? alt : ""}
          aria-hidden={i !== index}
          loading={i === 0 ? "eager" : "lazy"}
          fetchPriority={i === 0 ? "high" : "auto"}
          width={800}
          height={1000}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{
            opacity: i === index ? 1 : 0,
            transform: "translateZ(0)", // GPU hint
          }}
        />
      ))}
    </div>
  );
}
