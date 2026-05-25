import { useEffect, useRef, useState } from "react";

/**
 * AI Core — 3D rotating particle sphere with proximity connections (pure
 * Canvas, no WebGL), mouse-reactive parallax, ambient glow, plus a live
 * agent log feed streaming below.
 *
 * This is the hero centerpiece: it visualizes "the agent thinking" in real
 * time. Performance: 110 particles, runs at 60fps, pauses off-screen and
 * on tab blur. Respects prefers-reduced-motion.
 */

interface Point {
  // Original unit-sphere position (Fibonacci distribution)
  ox: number;
  oy: number;
  oz: number;
  // Rotated position (recomputed every frame)
  x: number;
  y: number;
  z: number;
  pulse: number;
}

const PARTICLE_COUNT = 110;
const PROXIMITY = 0.42;          // 3D distance threshold for connections
const ROT_SPEED = 0.0028;        // baseline rotation
const SPHERE_SCALE = 0.42;       // how much of canvas the sphere fills

type LogTone = "info" | "ok" | "trace" | "money" | "warn";
interface LogLine {
  id: number;
  time: string;
  tone: LogTone;
  text: string;
}

const LOG_POOL: { tone: LogTone; text: string }[] = [
  { tone: "trace", text: "llm.gpt-4o → reasoning chain ▸ 8 steps" },
  { tone: "info", text: "tools.crm.lookup(\"J.Pérez\") → id 4471" },
  { tone: "ok", text: "action.api.post /invoices → 201 created" },
  { tone: "ok", text: "workflow.n8n.trigger(\"notify_customer\") ✓" },
  { tone: "trace", text: "memory.write → embedding(dim=1536)" },
  { tone: "money", text: "llm.cost.tick → $0.0024 (total $1.84)" },
  { tone: "info", text: "guardrail.input ✓ scope OK" },
  { tone: "info", text: "rag.retrieve(\"policy_v3.pdf\") → 4 chunks" },
  { tone: "ok", text: "task.complete #4823 in 1.42s" },
  { tone: "trace", text: "agent.brain → decide(send_invoice)" },
  { tone: "ok", text: "voicebot.transcribe → 184 words" },
  { tone: "info", text: "rpa.selenium → portal_login(\"AFIP\")" },
  { tone: "warn", text: "rate_limit.retry → backoff 1200ms" },
  { tone: "ok", text: "erp.sync.invoices → 47 records ✓" },
  { tone: "trace", text: "embed.openai → batch(32) → cache" },
];

function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}
function nowStamp() {
  const d = new Date();
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

function toneClass(tone: LogTone): string {
  switch (tone) {
    case "ok":
      return "text-[#00D492]";
    case "info":
      return "text-[#ABD2FA]";
    case "trace":
      return "text-[#7692FF]";
    case "money":
      return "text-[#A7F3D0]";
    case "warn":
      return "text-amber-300";
  }
}

export default function AICore({ className = "" }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [opsCount, setOpsCount] = useState(4823);
  const [visible, setVisible] = useState(true);
  const idRef = useRef(0);

  // ── Canvas animation ─────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    let w = 0;
    let h = 0;
    let raf = 0;
    let t = 0;
    let mx = 0;
    let my = 0;
    let tmx = 0;
    let tmy = 0;
    let isVisible = true;
    let isHover = false;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
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

    // Fibonacci sphere — even distribution of points on unit sphere
    const points: Point[] = [];
    const N = PARTICLE_COUNT;
    const phi = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = phi * i;
      points.push({
        ox: Math.cos(theta) * r,
        oy: y,
        oz: Math.sin(theta) * r,
        x: 0,
        y: 0,
        z: 0,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    const onMove = (e: MouseEvent) => {
      const rect = wrap.getBoundingClientRect();
      tmx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      tmy = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    const onEnter = () => {
      isHover = true;
    };
    const onLeave = () => {
      isHover = false;
      tmx = 0;
      tmy = 0;
    };
    wrap.addEventListener("mousemove", onMove);
    wrap.addEventListener("mouseenter", onEnter);
    wrap.addEventListener("mouseleave", onLeave);

    const io = new IntersectionObserver(
      ([entry]) => {
        isVisible = !!entry?.isIntersecting;
      },
      { rootMargin: "100px" },
    );
    io.observe(wrap);

    const onVis = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVis);

    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    const tick = () => {
      if (!isVisible || reduced) {
        raf = requestAnimationFrame(tick);
        return;
      }

      t += ROT_SPEED * (isHover ? 1.35 : 1);
      mx += (tmx - mx) * 0.08;
      my += (tmy - my) * 0.08;

      ctx.clearRect(0, 0, w, h);

      // Ambient background glow
      const bg = ctx.createRadialGradient(
        w / 2,
        h / 2,
        0,
        w / 2,
        h / 2,
        Math.max(w, h) * 0.55,
      );
      bg.addColorStop(0, "rgba(27,44,193,0.20)");
      bg.addColorStop(0.55, "rgba(27,44,193,0.05)");
      bg.addColorStop(1, "rgba(5,8,22,0)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Compute rotation matrices
      const rotY = t + mx * 0.35;
      const rotX = my * 0.4 + Math.sin(t * 0.7) * 0.18;
      const cy = Math.cos(rotY);
      const sy = Math.sin(rotY);
      const cx = Math.cos(rotX);
      const sx = Math.sin(rotX);

      // Rotate all points
      for (const p of points) {
        // around Y
        const x1 = p.ox * cy + p.oz * sy;
        const z1 = -p.ox * sy + p.oz * cy;
        // around X
        const y1 = p.oy * cx - z1 * sx;
        const z2 = p.oy * sx + z1 * cx;
        p.x = x1;
        p.y = y1;
        p.z = z2;
      }

      // Perspective project
      const SCALE = Math.min(w, h) * SPHERE_SCALE;
      const proj = points.map((p, i) => {
        const persp = 2 / (2.5 + p.z);
        return {
          i,
          x: w / 2 + p.x * SCALE * persp,
          y: h / 2 + p.y * SCALE * persp,
          z: p.z,
          persp,
        };
      });

      // Back-to-front (paint depth)
      proj.sort((a, b) => a.z - b.z);

      // Draw connections (proximity in 3D space, faded by depth)
      for (let i = 0; i < proj.length; i++) {
        const a = proj[i]!;
        const pa = points[a.i]!;
        for (let j = i + 1; j < proj.length; j++) {
          const b = proj[j]!;
          const pb = points[b.i]!;
          const dx = pa.x - pb.x;
          const dy = pa.y - pb.y;
          const dz = pa.z - pb.z;
          const d2 = dx * dx + dy * dy + dz * dz;
          if (d2 < PROXIMITY * PROXIMITY) {
            const d = Math.sqrt(d2);
            const lineAlpha = (1 - d / PROXIMITY) * 0.35;
            const depthFade = Math.min(1, Math.max(0.15, (2 - (a.z + b.z) / 2) / 3));
            ctx.strokeStyle = `rgba(118,146,255,${lineAlpha * depthFade})`;
            ctx.lineWidth = 0.5 * Math.max(a.persp, b.persp);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (const p of proj) {
        const src = points[p.i]!;
        const pulseT = (Math.sin(t * 2.4 + src.pulse) + 1) / 2;
        const depthFade = Math.min(1, Math.max(0.2, (2 - p.z) / 3));
        const baseSize = 1.1 + p.persp * 1.1;
        const size = baseSize + pulseT * 0.6;

        // soft halo
        const haloR = size * 6;
        const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, haloR);
        halo.addColorStop(0, `rgba(171,210,250,${0.45 * depthFade})`);
        halo.addColorStop(1, "rgba(171,210,250,0)");
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(p.x, p.y, haloR, 0, Math.PI * 2);
        ctx.fill();

        // core
        const intensity = 0.85 * depthFade + pulseT * 0.15;
        ctx.fillStyle = `rgba(${Math.round(220 + 35 * intensity)},${Math.round(
          230 + 25 * intensity,
        )},255,${intensity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Central core glow (where the "agent" sits)
      const core = ctx.createRadialGradient(
        w / 2,
        h / 2,
        0,
        w / 2,
        h / 2,
        SCALE * 1.1,
      );
      core.addColorStop(0, "rgba(0,212,146,0.22)");
      core.addColorStop(0.45, "rgba(118,146,255,0.13)");
      core.addColorStop(1, "rgba(118,146,255,0)");
      ctx.fillStyle = core;
      ctx.fillRect(0, 0, w, h);

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      wrap.removeEventListener("mousemove", onMove);
      wrap.removeEventListener("mouseenter", onEnter);
      wrap.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      io.disconnect();
    };
  }, []);

  // ── Log feed ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const pushLine = () => {
      if (document.hidden) return;
      const entry = LOG_POOL[Math.floor(Math.random() * LOG_POOL.length)]!;
      const line: LogLine = {
        id: ++idRef.current,
        time: nowStamp(),
        tone: entry.tone,
        text: entry.text,
      };
      setLogs((prev) => [...prev.slice(-3), line]);
      setOpsCount((c) => c + 1 + Math.floor(Math.random() * 3));
    };

    // Seed 3 lines so it's never empty
    pushLine();
    pushLine();
    pushLine();

    if (reduced) return;
    const id = setInterval(pushLine, 1300 + Math.random() * 600);
    return () => clearInterval(id);
  }, []);

  // ── Visibility (pause counters when off-screen) ──────────────────────────
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(!!entry?.isIntersecting),
      { rootMargin: "100px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      {/* Window chrome */}
      <div className="glass-strong flex items-center gap-1.5 rounded-t-2xl border-b border-border px-3 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
        <span className="ml-3 font-mono text-[11px] tracking-tight text-text-dim">
          ai.core / agent.live
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-[10px] text-text-dim/80">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          {visible ? "STREAMING" : "PAUSED"}
        </span>
      </div>

      {/* Canvas + HUD */}
      <div
        ref={wrapRef}
        className="glass-strong relative aspect-square rounded-b-2xl border-t-0"
      >
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="block h-full w-full rounded-b-2xl"
        />

        {/* Top-left badge */}
        <div className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-2 rounded-md glass px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00D492] shadow-[0_0_8px_#00D492]" />
          AI AGENT · ACTIVE
        </div>

        {/* Top-right metrics */}
        <div className="pointer-events-none absolute right-3 top-3 rounded-md glass px-2.5 py-1 text-right font-mono text-[10px] leading-tight">
          <div className="text-text-dim">ops · 24h</div>
          <div className="text-[#ABD2FA] font-semibold tabular-nums">
            {opsCount.toLocaleString("en-US")}
          </div>
        </div>

        {/* Bottom-right mini ROI */}
        <div className="pointer-events-none absolute bottom-3 right-3 rounded-md glass px-2.5 py-1 text-right font-mono text-[10px] leading-tight">
          <div className="text-text-dim">saved · month</div>
          <div className="text-[#00D492] font-semibold">+80h</div>
        </div>

        {/* Streaming log feed (bottom-left) */}
        <div className="pointer-events-none absolute bottom-3 left-3 max-w-[78%] space-y-0.5 font-mono text-[10px] leading-tight">
          {logs.slice(-4).map((l, i, arr) => {
            const opacity = 0.35 + (0.65 * (i + 1)) / arr.length;
            return (
              <div
                key={l.id}
                className="rounded-md glass px-2 py-1"
                style={{ opacity }}
              >
                <span className="text-text-dim">[{l.time}]</span>{" "}
                <span className={toneClass(l.tone)}>{l.text}</span>
              </div>
            );
          })}
        </div>

        {/* Scanline overlay for that holographic feel */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-b-2xl mix-blend-overlay opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(118,146,255,0.04) 0px, rgba(118,146,255,0.04) 1px, transparent 1px, transparent 3px)",
          }}
        />
      </div>
    </div>
  );
}
