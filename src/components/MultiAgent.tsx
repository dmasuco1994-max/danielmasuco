import { useEffect, useRef, useState } from "react";

/**
 * MultiAgent — Cinematic two-robot collaboration scene.
 *
 * Uses user-provided 3D robot PNGs (/robot1.png, /robot2.png) and surrounds
 * them with the maximum visual effort: mouse-parallax stage, drifting
 * sparkles, rotating energy auras, curved data-packet path with multi-particle
 * trail, impact rings, typing-effect speech bubbles, completion confetti, and
 * smooth process transitions.
 *
 * Bilingual via `lang`. Loops infinitely. Pauses off-screen.
 */

type Lang = "es" | "en";

interface Props {
  lang: Lang;
  className?: string;
}

interface Step {
  agent: "A" | "B";
  msgEs: string;
  msgEn: string;
  duration: number;
}

interface Process {
  id: string;
  titleEs: string;
  titleEn: string;
  steps: Step[];
}

const PROCESSES: Process[] = [
  {
    id: "invoice",
    titleEs: "Procesar factura entrante",
    titleEn: "Process incoming invoice",
    steps: [
      { agent: "A", msgEs: "Leo el PDF y extraigo los campos clave", msgEn: "Reading PDF, extracting key fields", duration: 2200 },
      { agent: "B", msgEs: "Valido contra el schema fiscal AFIP", msgEn: "Validating against tax schema (AFIP)", duration: 1900 },
      { agent: "A", msgEs: "Detecto IVA y asigno centro de costo", msgEn: "Detecting VAT, assigning cost center", duration: 1900 },
      { agent: "B", msgEs: "Guardo en PostgreSQL y notifico Slack", msgEn: "Saving to PostgreSQL, notifying Slack", duration: 2100 },
    ],
  },
  {
    id: "support",
    titleEs: "Resolver consulta del cliente",
    titleEn: "Resolve customer inquiry",
    steps: [
      { agent: "A", msgEs: "Clasifico el intent del mensaje", msgEn: "Classifying the message intent", duration: 2000 },
      { agent: "A", msgEs: "Busco contexto en knowledge base", msgEn: "Searching the knowledge base (RAG)", duration: 2100 },
      { agent: "B", msgEs: "Redacto respuesta personalizada", msgEn: "Drafting personalized response", duration: 2200 },
      { agent: "B", msgEs: "Envío por WhatsApp y registro caso", msgEn: "Sending via WhatsApp, logging case", duration: 1900 },
    ],
  },
  {
    id: "lead",
    titleEs: "Calificar lead nuevo",
    titleEn: "Qualify new lead",
    steps: [
      { agent: "A", msgEs: "Enriquezco datos desde Clearbit", msgEn: "Enriching data from Clearbit", duration: 2000 },
      { agent: "A", msgEs: "Aplico scoring BANT con LLM", msgEn: "Applying BANT scoring with LLM", duration: 2100 },
      { agent: "B", msgEs: "Asigno al vendedor disponible", msgEn: "Routing to available seller", duration: 2000 },
      { agent: "B", msgEs: "Creo tarea en CRM con contexto", msgEn: "Creating CRM task with context", duration: 1900 },
    ],
  },
];

const LABEL = {
  es: {
    chrome: "agents.collaboration",
    live: "EN VIVO",
    paused: "PAUSADO",
    plannerName: "PLANNER",
    executorName: "EXECUTOR",
    plannerRole: "gpt-4o · brain",
    executorRole: "tools api · hands",
    completed: "Proceso completado",
    progress: "paso",
    booting: "Inicializando...",
  },
  en: {
    chrome: "agents.collaboration",
    live: "LIVE",
    paused: "PAUSED",
    plannerName: "PLANNER",
    executorName: "EXECUTOR",
    plannerRole: "gpt-4o · brain",
    executorRole: "tools api · hands",
    completed: "Process complete",
    progress: "step",
    booting: "Initializing...",
  },
} as const;

const PACKET_MS = 1100;
const ROBOT_A_URL = "/robot1.png";
const ROBOT_B_URL = "/robot2.png";

// Stage svg viewBox dimensions for packet math
const VB = 400;

export default function MultiAgent({ lang, className = "" }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const sparkleRef = useRef<HTMLCanvasElement>(null);

  const [procIdx, setProcIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(-1);
  const [packet, setPacket] = useState<{ dir: "AtoB" | "BtoA"; key: number } | null>(null);
  const [impact, setImpact] = useState<{ side: "A" | "B"; key: number } | null>(null);
  const [typing, setTyping] = useState("");
  const [celebrate, setCelebrate] = useState<{ key: number } | null>(null);
  const [visible, setVisible] = useState(true);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [procFade, setProcFade] = useState<"in" | "out" | "stable">("in");

  const proc = PROCESSES[procIdx]!;
  const L = LABEL[lang];
  const total = proc.steps.length;
  const isDone = stepIdx >= total;
  const currentStep = stepIdx >= 0 && stepIdx < total ? proc.steps[stepIdx]! : null;
  const aActive = currentStep?.agent === "A" || packet?.dir === "AtoB";
  const bActive = currentStep?.agent === "B" || packet?.dir === "BtoA";

  // ── Visibility ─────────────────────────────────────────────────────────
  useEffect(() => {
    const onVis = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(!!entry?.isIntersecting && !document.hidden),
      { rootMargin: "100px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // ── State machine ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!visible) return;

    if (stepIdx === -1) {
      // Boot: fade-in the process, then start step 0
      setProcFade("in");
      const id = window.setTimeout(() => setStepIdx(0), 900);
      return () => window.clearTimeout(id);
    }

    if (isDone) {
      // Celebrate, then fade out and advance
      setCelebrate({ key: Date.now() });
      const fadeId = window.setTimeout(() => setProcFade("out"), 1800);
      const advId = window.setTimeout(() => {
        setProcIdx((i) => (i + 1) % PROCESSES.length);
        setStepIdx(-1);
        setPacket(null);
        setImpact(null);
        setCelebrate(null);
        setTyping("");
      }, 2800);
      return () => {
        window.clearTimeout(fadeId);
        window.clearTimeout(advId);
      };
    }

    // Run current step: thinking → send packet → arrive → advance
    const step = proc.steps[stepIdx]!;
    const thinkId = window.setTimeout(() => {
      const dir: "AtoB" | "BtoA" = step.agent === "A" ? "AtoB" : "BtoA";
      setPacket({ dir, key: Date.now() });

      // Impact effect when packet arrives
      const impactId = window.setTimeout(() => {
        setImpact({ side: dir === "AtoB" ? "B" : "A", key: Date.now() });
        window.setTimeout(() => setImpact(null), 900);
      }, PACKET_MS);

      // Advance
      const advId = window.setTimeout(() => {
        setPacket(null);
        setStepIdx((i) => i + 1);
      }, PACKET_MS);

      return () => {
        window.clearTimeout(impactId);
        window.clearTimeout(advId);
      };
    }, step.duration);

    return () => window.clearTimeout(thinkId);
  }, [procIdx, stepIdx, isDone, visible, proc.steps]);

  // ── Typing effect for speech bubble ────────────────────────────────────
  useEffect(() => {
    if (!currentStep || packet) {
      return;
    }
    const fullText = lang === "es" ? currentStep.msgEs : currentStep.msgEn;
    setTyping("");
    let i = 0;
    const intervalMs = Math.max(18, Math.min(40, currentStep.duration / fullText.length / 1.5));
    const id = window.setInterval(() => {
      i++;
      setTyping(fullText.slice(0, i));
      if (i >= fullText.length) window.clearInterval(id);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [currentStep, packet, lang]);

  // ── Mouse parallax ─────────────────────────────────────────────────────
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setParallax({ x: x * 12, y: y * 8 });
    };
    const onLeave = () => setParallax({ x: 0, y: 0 });
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  // ── Sparkle canvas background ──────────────────────────────────────────
  useEffect(() => {
    const canvas = sparkleRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let w = 0;
    let h = 0;
    let raf = 0;
    let alive = true;

    const resize = () => {
      const rect = stage.getBoundingClientRect();
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

    interface Spark {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      phase: number;
      color: string;
    }
    const N = 28;
    const COLORS = ["#ABD2FA", "#7692FF", "#00D492", "#ffffff"];
    const sparks: Spark[] = Array.from({ length: N }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.18,
      vy: -0.05 - Math.random() * 0.15,
      r: 0.5 + Math.random() * 1.5,
      phase: Math.random() * Math.PI * 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
    }));

    let t = 0;
    const loop = () => {
      if (!alive) return;
      t += 0.016;
      ctx.clearRect(0, 0, w, h);
      for (const s of sparks) {
        s.x += s.vx;
        s.y += s.vy;
        s.phase += 0.04;
        if (s.y < -8) {
          s.y = h + 8;
          s.x = Math.random() * w;
        }
        if (s.x < -8) s.x = w + 8;
        if (s.x > w + 8) s.x = -8;
        const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(s.phase));
        ctx.fillStyle = s.color;
        ctx.globalAlpha = twinkle * 0.6;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        // soft glow
        ctx.globalAlpha = twinkle * 0.15;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
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

  // ── Packet path: quadratic bezier (arc above the line) ─────────────────
  // We compute it once for layout reference.
  const A_X = 110;
  const B_X = 290;
  const Y_LINE = 230;
  const CURVE_Y = 175;

  // For packet position interpolation we use CSS keyframes via offset-path.
  // The path is constant; only the direction reverses.
  const pathD = `M ${A_X} ${Y_LINE} Q ${VB / 2} ${CURVE_Y} ${B_X} ${Y_LINE}`;

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
        <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-[10px] tracking-wider text-text-dim/80">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          {visible ? L.live : L.paused}
        </span>
      </div>

      {/* Stage */}
      <div
        ref={stageRef}
        className="relative aspect-square overflow-hidden rounded-b-2xl"
        style={{ perspective: "1000px" }}
      >
        {/* Deep background gradient */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 85% 110% at 50% 110%, #0a0e1f 0%, #050816 60%, #030410 100%), radial-gradient(ellipse 70% 50% at 50% 0%, rgba(118,146,255,0.2) 0%, transparent 70%)",
          }}
        />

        {/* Sparkle canvas */}
        <canvas
          ref={sparkleRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
        />

        {/* Floor grid with perspective */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] opacity-35"
          style={{
            backgroundImage:
              "linear-gradient(rgba(171,210,250,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(118,146,255,0.18) 1px, transparent 1px)",
            backgroundSize: "32px 28px",
            transform: "perspective(420px) rotateX(62deg)",
            transformOrigin: "center top",
            maskImage:
              "linear-gradient(to bottom, transparent, black 25%, black 70%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent, black 25%, black 70%, transparent)",
          }}
        />

        {/* Top spotlight cones */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-12 left-[12%] h-[78%] w-[34%] opacity-55 blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse 55% 100% at 50% 0%, rgba(171,210,250,0.55) 0%, transparent 65%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-12 right-[12%] h-[78%] w-[34%] opacity-55 blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse 55% 100% at 50% 0%, rgba(0,212,146,0.45) 0%, transparent 65%)",
          }}
        />

        {/* Lens flare at top */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-4 left-1/2 h-2 w-32 -translate-x-1/2 rounded-full bg-[#ABD2FA] opacity-70 blur-md"
        />

        {/* Process title (always visible at top) */}
        <div
          className="absolute inset-x-0 top-3 z-40 px-4 sm:top-4 sm:px-5"
          style={{
            transform: `translate(${parallax.x * 0.3}px, ${parallax.y * 0.3}px)`,
            transition: "transform 200ms ease-out",
          }}
        >
          <div
            className="flex items-start justify-between gap-3 transition-opacity duration-500"
            style={{ opacity: procFade === "out" ? 0 : 1 }}
          >
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-dim/80">
                process
              </p>
              <p
                key={proc.id}
                className="truncate font-mono text-[12px] font-semibold text-text"
                style={{ animation: "slideDown 600ms cubic-bezier(0.16,1,0.3,1) both" }}
              >
                {lang === "es" ? proc.titleEs : proc.titleEn}
              </p>
            </div>
            <span className="shrink-0 rounded-md border border-border bg-bg-elevated/60 px-2 py-0.5 font-mono text-[10px] tabular-nums text-text-muted backdrop-blur">
              {L.progress} {Math.min(stepIdx + 1, total)}/{total}
            </span>
          </div>
        </div>

        {/* Parallax content wrapper */}
        <div
          className="absolute inset-0 z-10"
          style={{
            transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0)`,
            transition: "transform 220ms ease-out",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Robots row */}
          <div
            className="absolute inset-0 flex items-end justify-around px-3 pb-[22%] sm:px-6"
            style={{
              opacity: procFade === "out" ? 0 : 1,
              transition: "opacity 500ms ease",
            }}
          >
            {/* ── Robot A ── */}
            <RobotSlot
              src={ROBOT_A_URL}
              alt="Planner agent"
              active={!!aActive}
              impact={impact?.side === "A"}
              roleName={L.plannerName}
              roleSub={L.plannerRole}
              parallaxBoost={parallax.x * 0.4}
            />

            {/* ── Robot B ── */}
            <RobotSlot
              src={ROBOT_B_URL}
              alt="Executor agent"
              active={!!bActive}
              impact={impact?.side === "B"}
              roleName={L.executorName}
              roleSub={L.executorRole}
              flip
              parallaxBoost={parallax.x * 0.4}
            />
          </div>

          {/* Beam + packet SVG */}
          <svg
            viewBox={`0 0 ${VB} ${VB}`}
            className="pointer-events-none absolute inset-0 z-20 h-full w-full"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="beam-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#7692FF" stopOpacity="0.05" />
                <stop offset="50%" stopColor="#7692FF" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#7692FF" stopOpacity="0.05" />
              </linearGradient>
              <filter id="packet-glow-strong" x="-200%" y="-200%" width="500%" height="500%">
                <feGaussianBlur stdDeviation="5" />
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <radialGradient id="impact-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#00D492" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#00D492" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Curved beam */}
            <path
              d={pathD}
              fill="none"
              stroke="url(#beam-grad)"
              strokeWidth="1.6"
              strokeDasharray="6 6"
              opacity={packet || currentStep ? 0.95 : 0.4}
              style={{ transition: "opacity 400ms" }}
            />

            {/* Packet (5-particle trail along the curve) */}
            {packet && (
              <g key={packet.key}>
                {[0, 90, 170, 240, 300].map((delay, i) => {
                  const sizes = [7, 5, 4, 3, 2];
                  const opacities = [1, 0.85, 0.7, 0.55, 0.4];
                  const fills = ["#00D492", "#ABD2FA", "#ABD2FA", "#7692FF", "#ffffff"];
                  return (
                    <circle
                      key={i}
                      cx="0"
                      cy="0"
                      r={sizes[i]}
                      fill={fills[i]}
                      opacity={opacities[i]}
                      filter="url(#packet-glow-strong)"
                      style={{
                        offsetPath: `path("${pathD}")`,
                        offsetRotate: "0deg",
                        animation: `packetFlow-${packet.dir} ${PACKET_MS}ms cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms forwards`,
                      }}
                    />
                  );
                })}
              </g>
            )}

            {/* Impact ring at destination */}
            {impact && (
              <g key={impact.key}>
                <circle
                  cx={impact.side === "B" ? B_X : A_X}
                  cy={Y_LINE}
                  r="5"
                  fill="none"
                  stroke="#00D492"
                  strokeWidth="2"
                  opacity="0.9"
                  style={{ animation: "impactRing 900ms ease-out forwards" }}
                />
                <circle
                  cx={impact.side === "B" ? B_X : A_X}
                  cy={Y_LINE}
                  r="3"
                  fill="url(#impact-grad)"
                  style={{ animation: "impactCore 900ms ease-out forwards" }}
                />
              </g>
            )}
          </svg>
        </div>

        {/* Speech bubble with typing effect */}
        {currentStep && !packet && (
          <div
            className="absolute z-30 transition-all duration-300"
            style={{
              top: "16%",
              left: currentStep.agent === "A" ? "4%" : "auto",
              right: currentStep.agent === "B" ? "4%" : "auto",
              maxWidth: "50%",
              animation: "bubbleIn 320ms cubic-bezier(0.16, 1, 0.3, 1) both",
              transform: `translate(${parallax.x * 0.5}px, ${parallax.y * 0.5}px)`,
            }}
          >
            <div className="rounded-xl border border-[#7692FF]/50 bg-[#1B2CC1]/25 px-3 py-2 shadow-[0_10px_30px_-6px_rgba(27,44,193,0.55)] backdrop-blur-md">
              <p className="flex items-start gap-1.5 text-[11px] leading-snug text-text">
                <span className="mt-0.5 shrink-0 text-[#00D492]">▸</span>
                <span>
                  {typing}
                  {typing.length <
                    (lang === "es" ? currentStep.msgEs : currentStep.msgEn).length && (
                    <span className="inline-block h-3 w-1 -mb-0.5 ml-0.5 animate-pulse bg-[#ABD2FA]" />
                  )}
                </span>
              </p>
            </div>
            <div
              aria-hidden
              className="absolute h-3 w-3 rotate-45 border border-[#7692FF]/50 bg-[#1B2CC1]/25"
              style={{
                bottom: -6,
                left: currentStep.agent === "A" ? "22%" : "auto",
                right: currentStep.agent === "B" ? "22%" : "auto",
                borderTop: 0,
                borderLeft: 0,
              }}
            />
          </div>
        )}

        {/* Booting overlay (between processes) */}
        {stepIdx === -1 && procFade === "in" && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-bg/40 backdrop-blur-sm" style={{ animation: "fadeOut 900ms ease-out forwards" }}>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-bg-elevated/80 px-4 py-2 font-mono text-[11px] text-text-muted">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#00D492] animate-pulse" />
              {L.booting}
            </div>
          </div>
        )}

        {/* Confetti celebration */}
        {celebrate && (
          <div key={celebrate.key} className="pointer-events-none absolute inset-0 z-40">
            {Array.from({ length: 28 }).map((_, i) => {
              const angle = (i / 28) * Math.PI * 2;
              const dist = 100 + Math.random() * 120;
              const dx = Math.cos(angle) * dist;
              const dy = Math.sin(angle) * dist - 30;
              const colors = ["#ABD2FA", "#7692FF", "#00D492", "#ffffff", "#A7F3D0"];
              const color = colors[i % colors.length];
              const size = 4 + Math.random() * 4;
              return (
                <span
                  key={i}
                  className="absolute left-1/2 top-1/2 rounded-sm"
                  style={{
                    width: size,
                    height: size,
                    background: color,
                    boxShadow: `0 0 8px ${color}`,
                    transform: "translate(-50%, -50%)",
                    animation: `confetti 2400ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                    ["--dx" as string]: `${dx}px`,
                    ["--dy" as string]: `${dy}px`,
                  } as React.CSSProperties}
                />
              );
            })}
          </div>
        )}

        {/* Bottom: progress / completion banner */}
        <div className="absolute inset-x-4 bottom-3 z-30 sm:inset-x-5 sm:bottom-4">
          {isDone ? (
            <div
              className="flex items-center justify-center gap-2 rounded-lg border border-[#00D492]/50 bg-[#00D492]/15 px-3 py-2 backdrop-blur"
              style={{
                animation: "completeBanner 600ms cubic-bezier(0.16,1,0.3,1) both",
                boxShadow: "0 0 30px -4px rgba(0,212,146,0.45)",
              }}
            >
              <span
                className="h-2 w-2 rounded-full bg-[#00D492]"
                style={{ boxShadow: "0 0 12px #00D492" }}
              />
              <p className="font-mono text-[11px] font-semibold text-[#00D492]">
                ✓ {L.completed}
              </p>
            </div>
          ) : (
            <div>
              <div className="mb-1 flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-text-dim">
                <span>progress</span>
                <span>{Math.round((Math.max(0, stepIdx + 1) / total) * 100)}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-border-subtle">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#ABD2FA] via-[#7692FF] to-[#00D492]"
                  style={{
                    width: `${Math.max(0, Math.min(100, ((stepIdx + 1) / total) * 100))}%`,
                    transition: "width 500ms cubic-bezier(0.16, 1, 0.3, 1)",
                    boxShadow: "0 0 12px rgba(118,146,255,0.5)",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Holographic scanlines */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-50 opacity-15 mix-blend-overlay"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(171,210,250,0.6) 0px, rgba(171,210,250,0.6) 1px, transparent 1px, transparent 3px)",
          }}
        />

        <style>{`
          @keyframes robotFloat {
            0%, 100% { transform: translateY(0); }
            50%      { transform: translateY(-7px); }
          }
          @keyframes auraSpin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
          @keyframes pulseRing {
            0%   { transform: scale(0.95); opacity: 0.85; }
            100% { transform: scale(1.35); opacity: 0; }
          }
          @keyframes packetFlow-AtoB {
            from { offset-distance: 0%;   opacity: 0; }
            8%   { opacity: 1; }
            92%  { opacity: 1; }
            to   { offset-distance: 100%; opacity: 0; }
          }
          @keyframes packetFlow-BtoA {
            from { offset-distance: 100%; opacity: 0; }
            8%   { opacity: 1; }
            92%  { opacity: 1; }
            to   { offset-distance: 0%;   opacity: 0; }
          }
          @keyframes impactRing {
            from { r: 4;  opacity: 0.95; stroke-width: 2.5; }
            to   { r: 28; opacity: 0;    stroke-width: 0.4; }
          }
          @keyframes impactCore {
            from { r: 3;  opacity: 0.95; }
            to   { r: 18; opacity: 0; }
          }
          @keyframes bubbleIn {
            from { transform: translateY(-6px) scale(0.96); opacity: 0; }
            to   { transform: translateY(0)     scale(1);    opacity: 1; }
          }
          @keyframes completeBanner {
            from { transform: scale(0.92); opacity: 0; }
            to   { transform: scale(1);    opacity: 1; }
          }
          @keyframes confetti {
            0%   { transform: translate(-50%, -50%) rotate(0deg); opacity: 1; }
            100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) rotate(720deg); opacity: 0; }
          }
          @keyframes slideDown {
            from { transform: translateY(-12px); opacity: 0; }
            to   { transform: translateY(0);     opacity: 1; }
          }
          @keyframes fadeOut {
            from { opacity: 1; }
            to   { opacity: 0; }
          }
        `}</style>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Robot character slot (with float, scale, glow, aura, impact)
// ─────────────────────────────────────────────────────────────────────────────

interface RobotSlotProps {
  src: string;
  alt: string;
  active: boolean;
  impact: boolean;
  roleName: string;
  roleSub: string;
  flip?: boolean;
  parallaxBoost?: number;
}

function RobotSlot({
  src,
  alt,
  active,
  impact,
  roleName,
  roleSub,
  flip,
  parallaxBoost = 0,
}: RobotSlotProps) {
  return (
    <div
      className="relative flex flex-col items-center"
      style={{
        transform: `translateX(${parallaxBoost}px)`,
        transition: "transform 200ms ease-out",
      }}
    >
      {/* Floor spotlight pool */}
      <div
        aria-hidden
        className="absolute -bottom-1 h-3 w-[120%] rounded-full blur-md transition-all duration-500"
        style={{
          background: active
            ? "radial-gradient(ellipse, rgba(0,212,146,0.75) 0%, transparent 70%)"
            : "radial-gradient(ellipse, rgba(118,146,255,0.45) 0%, transparent 70%)",
          width: active ? "140%" : "110%",
        }}
      />

      {/* Robot wrapper */}
      <div
        className="relative transition-all duration-500 ease-out"
        style={{
          animation: "robotFloat 4.4s ease-in-out infinite",
          transform: active ? "scale(1.1) translateY(-6px)" : "scale(1)",
          filter: active
            ? "drop-shadow(0 0 22px rgba(0,212,146,0.7)) drop-shadow(0 16px 22px rgba(0,0,0,0.6))"
            : "drop-shadow(0 0 12px rgba(118,146,255,0.4)) drop-shadow(0 12px 16px rgba(0,0,0,0.5))",
        }}
      >
        {/* Rotating aura ring */}
        {active && (
          <span
            aria-hidden
            className="absolute inset-0 -m-3 rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0deg, #00D492 90deg, transparent 180deg, #7692FF 270deg, transparent 360deg)",
              animation: "auraSpin 4s linear infinite",
              opacity: 0.35,
              filter: "blur(8px)",
              zIndex: -1,
            }}
          />
        )}

        {/* Pulse ring on active */}
        {active && (
          <span
            aria-hidden
            className="absolute inset-0 -m-2 rounded-full border-2 border-[#00D492]/55"
            style={{ animation: "pulseRing 1.6s ease-out infinite" }}
          />
        )}

        {/* Impact shake when receiving */}
        <div
          style={{
            animation: impact ? "robotShake 320ms ease-in-out" : undefined,
          }}
        >
          <img
            src={src}
            alt={alt}
            loading="lazy"
            width={160}
            height={200}
            className="block h-[140px] w-auto select-none object-contain sm:h-[160px] md:h-[180px]"
            style={{
              transform: flip ? "scaleX(-1)" : undefined,
              imageRendering: "auto",
            }}
            draggable={false}
          />
        </div>

        {/* Activity LED */}
        <span
          aria-hidden
          className={`absolute h-2.5 w-2.5 rounded-full transition-all ${
            flip ? "left-2 top-3" : "right-2 top-3"
          }`}
          style={{
            background: active ? "#00D492" : "#7692FF",
            boxShadow: `0 0 14px ${active ? "#00D492" : "#7692FF"}`,
          }}
        />
      </div>

      {/* Role badge */}
      <div
        className={`mt-2 rounded-md border px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest backdrop-blur transition-all duration-300 ${
          active
            ? "border-[#00D492]/60 bg-[#00D492]/15 text-[#00D492]"
            : "border-border bg-bg-elevated/60 text-text-muted"
        }`}
      >
        {roleName}
      </div>
      <p className="mt-0.5 font-mono text-[9px] text-text-dim">{roleSub}</p>

      <style>{`
        @keyframes robotShake {
          0%, 100% { transform: translateX(0); }
          25%      { transform: translateX(-3px); }
          75%      { transform: translateX(3px); }
        }
      `}</style>
    </div>
  );
}
