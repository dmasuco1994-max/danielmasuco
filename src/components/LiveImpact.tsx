import { useEffect, useRef, useState } from "react";

/**
 * LiveImpact — replaces the generic AI demo with Daniel's actual value props:
 *   1. Hero metric: hours saved for clients (live counter + sparkline)
 *   2. "Running now" — 3 real-world processes with live metrics
 *   3. Stack in production — the tech he actually ships
 *
 * Bilingual via `lang` prop. All animations respect prefers-reduced-motion
 * and pause off-screen.
 */

type Lang = "es" | "en";

interface Props {
  lang: Lang;
  className?: string;
}

interface RunningProcess {
  id: string;
  iconColor: string;
  nameEs: string;
  nameEn: string;
  /** Render function for the live metric. Receives `tick` (increments over time). */
  metric: (tick: number, lang: Lang) => string;
}

const PROCESSES: RunningProcess[] = [
  {
    id: "backoffice",
    iconColor: "#00D492",
    nameEs: "Backoffice · Facturas",
    nameEn: "Backoffice · Invoices",
    metric: (t, lang) => {
      const done = 47 + Math.floor(t / 4);
      const total = 200;
      return lang === "es" ? `${done}/${total} procesadas` : `${done}/${total} processed`;
    },
  },
  {
    id: "voicebot",
    iconColor: "#7692FF",
    nameEs: "Voicebot · Cobranzas",
    nameEn: "Voicebot · Collections",
    metric: (t, lang) => {
      const active = 8 + ((t * 3) % 7);
      return lang === "es" ? `${active} llamadas activas` : `${active} active calls`;
    },
  },
  {
    id: "sync",
    iconColor: "#ABD2FA",
    nameEs: "ERP ↔ CRM · Sync",
    nameEn: "ERP ↔ CRM · Sync",
    metric: (t, lang) => {
      const m = (t % 60) + 1;
      return lang === "es" ? `${m} reg. hace ${(t % 5) + 1}m` : `${m} rec · ${(t % 5) + 1}m ago`;
    },
  },
  {
    id: "rag",
    iconColor: "#00D492",
    nameEs: "Asistente Interno · RAG",
    nameEn: "Internal Assistant · RAG",
    metric: (t, lang) => {
      const q = 124 + Math.floor(t / 2);
      return lang === "es" ? `${q} consultas hoy` : `${q} queries today`;
    },
  },
];

const STACK = [
  { name: "GPT-4o", color: "#7692FF" },
  { name: "LangChain", color: "#00D492" },
  { name: "n8n", color: "#ea4b71" },
  { name: "Python", color: "#ABD2FA" },
  { name: "PostgreSQL", color: "#7692FF" },
  { name: "AWS", color: "#ff9900" },
  { name: "FastAPI", color: "#00D492" },
  { name: "Docker", color: "#ABD2FA" },
];

const LABELS = {
  es: {
    chrome: "ai.core / impact",
    streaming: "EN VIVO",
    paused: "PAUSADO",
    heroLabel: "HORAS AHORRADAS · CLIENTES",
    heroSub: "acumulado en producción",
    deltaToday: "hoy",
    runningTitle: "EJECUTÁNDOSE AHORA",
    stackTitle: "STACK EN PRODUCCIÓN",
    footerHint: "datos representativos · zeusit.com.ar",
  },
  en: {
    chrome: "ai.core / impact",
    streaming: "LIVE",
    paused: "PAUSED",
    heroLabel: "HOURS SAVED · CLIENTS",
    heroSub: "in-production cumulative",
    deltaToday: "today",
    runningTitle: "RUNNING NOW",
    stackTitle: "PRODUCTION STACK",
    footerHint: "representative data · zeusit.com.ar",
  },
} as const;

// Sparkline points (24h of "hours saved" rate, with realistic shape)
const SPARK_RAW = [4, 6, 5, 9, 7, 8, 12, 11, 14, 13, 16, 18, 17, 20, 19, 22, 24, 23, 26, 28, 30, 29, 32, 35];

function sparkPath(values: number[], w: number, h: number): string {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export default function LiveImpact({ lang, className = "" }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tick, setTick] = useState(0);
  const [hours, setHours] = useState(8247);
  const [delta, setDelta] = useState(12);
  const [visible, setVisible] = useState(true);

  const L = LABELS[lang];

  // Visibility
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(!!entry?.isIntersecting),
      { rootMargin: "100px" },
    );
    io.observe(el);
    const onVis = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // Tick + counter increments
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    if (!visible) return;

    const tickId = setInterval(() => setTick((t) => t + 1), 1300);
    const hourId = setInterval(() => {
      setHours((h) => h + 1);
      setDelta((d) => d + 1);
    }, 4200);
    return () => {
      clearInterval(tickId);
      clearInterval(hourId);
    };
  }, [visible]);

  // Subtle ambient background canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let w = 0;
    let h = 0;
    let raf = 0;
    let t = 0;
    let alive = true;

    const resize = () => {
      const rect = root.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resize();

    // Drifting glow blobs
    const blobs = [
      { cx: 0.25, cy: 0.3, r: 0.5, hue: "rgba(118,146,255,0.16)" },
      { cx: 0.75, cy: 0.75, r: 0.45, hue: "rgba(0,212,146,0.12)" },
      { cx: 0.85, cy: 0.18, r: 0.35, hue: "rgba(27,44,193,0.14)" },
    ];

    const loop = () => {
      if (!alive) return;
      t += 0.005;
      ctx.clearRect(0, 0, w, h);

      for (const b of blobs) {
        const x = (b.cx + Math.sin(t + b.cx * 6) * 0.05) * w;
        const y = (b.cy + Math.cos(t + b.cy * 4) * 0.05) * h;
        const r = b.r * Math.max(w, h);
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, b.hue);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      {/* Window chrome */}
      <div className="glass-strong flex items-center gap-1.5 rounded-t-2xl border-b border-border px-3 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
        <span className="ml-3 font-mono text-[11px] tracking-tight text-text-dim">
          {L.chrome}
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-[10px] text-text-dim/80">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          {visible ? L.streaming : L.paused}
        </span>
      </div>

      {/* Body */}
      <div
        ref={rootRef}
        className="glass-strong relative aspect-square overflow-hidden rounded-b-2xl border-t-0"
      >
        {/* Ambient canvas underlay */}
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full"
        />

        {/* Subtle grid overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "linear-gradient(rgba(118,146,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(118,146,255,0.08) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage:
              "radial-gradient(ellipse 80% 80% at center, black 40%, transparent 95%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 80% at center, black 40%, transparent 95%)",
          }}
        />

        {/* Content grid */}
        <div className="relative flex h-full flex-col gap-3 p-4 sm:p-5">
          {/* Hero metric */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-dim">
              {L.heroLabel}
            </p>
            <div className="mt-1 flex items-baseline gap-3">
              <span
                className="font-display text-4xl font-bold tabular-nums tracking-tight sm:text-5xl"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #ABD2FA 0%, #7692FF 60%, #1B2CC1 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                {hours.toLocaleString("es-AR")}
              </span>
              <span className="font-mono text-[11px] text-text-dim">
                hs
              </span>
              <span className="ml-auto inline-flex items-center gap-1 rounded-md bg-[#00D492]/12 px-2 py-0.5 font-mono text-[10px] font-semibold text-[#00D492]">
                ↑ {delta} {L.deltaToday}
              </span>
            </div>
            <p className="mt-0.5 font-mono text-[9px] uppercase tracking-wider text-text-dim/80">
              {L.heroSub}
            </p>

            {/* Sparkline */}
            <svg
              viewBox="0 0 100 22"
              preserveAspectRatio="none"
              className="mt-2 h-7 w-full"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="spark-stroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ABD2FA" />
                  <stop offset="60%" stopColor="#7692FF" />
                  <stop offset="100%" stopColor="#00D492" />
                </linearGradient>
                <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7692FF" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#7692FF" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d={`${sparkPath(SPARK_RAW, 100, 22)} L100,22 L0,22 Z`}
                fill="url(#spark-fill)"
              />
              <path
                d={sparkPath(SPARK_RAW, 100, 22)}
                fill="none"
                stroke="url(#spark-stroke)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* End marker */}
              <circle
                cx="100"
                cy={
                  22 -
                  ((SPARK_RAW[SPARK_RAW.length - 1]! - Math.min(...SPARK_RAW)) /
                    (Math.max(...SPARK_RAW) - Math.min(...SPARK_RAW))) *
                    22
                }
                r="2"
                fill="#00D492"
              />
            </svg>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />

          {/* Running processes */}
          <div className="flex-1 min-h-0">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-text-dim">
              {L.runningTitle}
            </p>
            <ul className="space-y-1.5">
              {PROCESSES.slice(0, 4).map((p) => {
                const name = lang === "es" ? p.nameEs : p.nameEn;
                return (
                  <li
                    key={p.id}
                    className="group flex items-center gap-2 rounded-lg border border-border-subtle bg-bg-elevated/40 px-2.5 py-1.5 backdrop-blur transition hover:border-accent/40 hover:bg-bg-elevated/70"
                  >
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span
                        className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                        style={{ backgroundColor: p.iconColor }}
                      />
                      <span
                        className="relative inline-flex h-2 w-2 rounded-full"
                        style={{ backgroundColor: p.iconColor }}
                      />
                    </span>
                    <span className="flex-1 truncate text-[11px] font-medium text-text">
                      {name}
                    </span>
                    <span className="font-mono text-[10px] tabular-nums text-text-muted">
                      {p.metric(tick, lang)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />

          {/* Stack */}
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-text-dim">
              {L.stackTitle}
            </p>
            <ul className="flex flex-wrap gap-1.5">
              {STACK.map((s) => (
                <li
                  key={s.name}
                  className="group inline-flex items-center gap-1.5 rounded-md border border-border-subtle bg-bg-elevated/50 px-2 py-1 font-mono text-[10px] text-text-muted transition hover:border-accent/40 hover:text-text"
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full transition group-hover:scale-150"
                    style={{
                      backgroundColor: s.color,
                      boxShadow: `0 0 8px ${s.color}`,
                    }}
                  />
                  {s.name}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-center font-mono text-[9px] italic tracking-wider text-text-dim/60">
              {L.footerHint}
            </p>
          </div>
        </div>

        {/* Holographic scanlines (subtle) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-20"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(118,146,255,0.04) 0px, rgba(118,146,255,0.04) 1px, transparent 1px, transparent 3px)",
          }}
        />
      </div>
    </div>
  );
}
