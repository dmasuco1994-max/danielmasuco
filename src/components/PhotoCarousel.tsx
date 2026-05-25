import { useEffect, useRef, useState } from "react";

interface Props {
  images: readonly string[];
  /** Default duration in ms per slide (used when `durations` is not provided). */
  intervalMs?: number;
  /**
   * Optional per-slide duration in ms (same length as `images`). When set,
   * each slide gets its own dwell time. Falls back to `intervalMs` for any
   * missing entry, letting you weight some slides heavier than others.
   */
  durations?: readonly number[];
  alt: string;
  className?: string;
  /** Pauses when scrolled out of view to save CPU/battery. */
  pauseOffScreen?: boolean;
}

/**
 * Crossfade carousel that cycles through `images` with either uniform timing
 * (`intervalMs`) or per-slide timing (`durations`).
 *
 * SSR-safe: renders the first image visible by default. Respects
 * prefers-reduced-motion (stays on first image, no auto-advance).
 */
export default function PhotoCarousel({
  images,
  intervalMs = 3000,
  durations,
  alt,
  className = "",
  pauseOffScreen = true,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  // Schedule the NEXT slide using the current slide's individual duration.
  // Effect re-runs every time `index` advances, picking up the next duration.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (images.length < 2) return;
    if (!visible) return;

    const slideMs = durations?.[index] ?? intervalMs;
    const timer = window.setTimeout(() => {
      setIndex((i) => (i + 1) % images.length);
    }, slideMs);
    return () => window.clearTimeout(timer);
  }, [index, images.length, intervalMs, durations, visible]);

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
