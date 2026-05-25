import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Animated AI Agent Network — radial graph of an AI agent (center hub)
 * connected to 6 services. Data packets flow continuously along the spokes.
 *
 * Visualizes Daniel's stack: GPT-4o · n8n · CRM · ERP · API · PostgreSQL.
 */

interface Node {
  id: string;
  label: string;
  sub?: string;
  x: number;
  y: number;
}

interface Packet {
  id: number;
  satIdx: number;
  /** Direction: -1 sat → hub, +1 hub → sat */
  dir: 1 | -1;
  start: number;
  duration: number;
  color: string;
}

const VIEW = 420;
const CENTER = { x: VIEW / 2, y: VIEW / 2 };
const RADIUS = 150;

const SATELLITES_BASE = [
  { id: "gpt", label: "GPT-4o", sub: "LLM" },
  { id: "n8n", label: "n8n", sub: "workflow" },
  { id: "pg", label: "Postgres", sub: "data" },
  { id: "api", label: "API", sub: "REST" },
  { id: "erp", label: "ERP", sub: "system" },
  { id: "crm", label: "CRM", sub: "leads" },
] as const;

const SATELLITES: Node[] = SATELLITES_BASE.map((s, i) => {
  // 6 nodes spaced 60° apart, starting at top (-90°)
  const angle = (-Math.PI / 2) + (i / SATELLITES_BASE.length) * Math.PI * 2;
  return {
    ...s,
    x: CENTER.x + Math.cos(angle) * RADIUS,
    y: CENTER.y + Math.sin(angle) * RADIUS,
  };
});

const PACKET_COLORS = ["#ABD2FA", "#7692FF", "#00D492", "#ffffff"];

export default function AgentNetwork({ className = "" }: { className?: string }) {
  const [packets, setPackets] = useState<Packet[]>([]);
  const [activeNodes, setActiveNodes] = useState<Set<number>>(new Set());
  const [, force] = useState(0);
  const idRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  // Render loop (drives the packet positions every frame)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let lastSpawn = 0;
    const SPAWN_INTERVAL = 650;

    const tick = (now: number) => {
      // Spawn a packet periodically
      if (now - lastSpawn > SPAWN_INTERVAL) {
        lastSpawn = now;
        const satIdx = Math.floor(Math.random() * SATELLITES.length);
        const dir: 1 | -1 = Math.random() > 0.45 ? 1 : -1;
        const newPacket: Packet = {
          id: ++idRef.current,
          satIdx,
          dir,
          start: now,
          duration: 1400 + Math.random() * 900,
          color: PACKET_COLORS[Math.floor(Math.random() * PACKET_COLORS.length)]!,
        };
        setPackets((p) => [...p.slice(-12), newPacket]);
      }
      force((v) => (v + 1) % 1_000_000);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Cleanup expired packets + flag arrival pulses
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = performance.now();
      setPackets((list) => {
        const stillAlive: Packet[] = [];
        const arrived = new Set<number>();
        for (const p of list) {
          if (now - p.start < p.duration) {
            stillAlive.push(p);
          } else {
            arrived.add(p.satIdx);
          }
        }
        if (arrived.size > 0) {
          setActiveNodes(arrived);
          setTimeout(() => setActiveNodes(new Set()), 350);
        }
        return stillAlive;
      });
    }, 200);
    return () => clearInterval(cleanup);
  }, []);

  const now = typeof performance !== "undefined" ? performance.now() : 0;
  const activePackets = useMemo(() => {
    return packets.map((p) => {
      const t = Math.min(1, (now - p.start) / p.duration);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out
      const sat = SATELLITES[p.satIdx]!;
      const from = p.dir === 1 ? CENTER : sat;
      const to = p.dir === 1 ? sat : CENTER;
      return {
        ...p,
        x: from.x + (to.x - from.x) * eased,
        y: from.y + (to.y - from.y) * eased,
        opacity: t < 0.1 ? t * 10 : t > 0.9 ? (1 - t) * 10 : 1,
      };
    });
  }, [packets, now]);

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      {/* Window chrome */}
      <div className="glass-strong flex items-center gap-1.5 rounded-t-2xl border-b border-border px-3 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
        <span className="ml-3 font-mono text-[11px] tracking-tight text-text-dim">
          agent_network.live
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-[10px] text-text-dim/80">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          streaming
        </span>
      </div>

      {/* Graph canvas */}
      <div className="glass-strong relative rounded-b-2xl border-t-0 p-2 sm:p-3">
        <div
          className="relative aspect-square w-full overflow-hidden rounded-xl"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(27,44,193,0.15) 0%, rgba(5,8,22,0.6) 65%, rgba(5,8,22,1) 100%)",
          }}
        >
          {/* Subtle grid */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(rgba(118,146,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(118,146,255,0.07) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
              maskImage:
                "radial-gradient(ellipse 70% 70% at center, black 40%, transparent 90%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 70% 70% at center, black 40%, transparent 90%)",
            }}
          />

          <svg
            viewBox={`0 0 ${VIEW} ${VIEW}`}
            className="absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            <defs>
              <radialGradient id="hubGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ABD2FA" stopOpacity="0.95" />
                <stop offset="55%" stopColor="#7692FF" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#1B2CC1" stopOpacity="1" />
              </radialGradient>
              <radialGradient id="satGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0a0e1f" stopOpacity="1" />
                <stop offset="100%" stopColor="#0a0e1f" stopOpacity="0.85" />
              </radialGradient>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="strongGlow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Outer dashed boundary */}
            <circle
              cx={CENTER.x}
              cy={CENTER.y}
              r={RADIUS + 28}
              fill="none"
              stroke="rgba(118,146,255,0.18)"
              strokeWidth="1"
              strokeDasharray="2 6"
            />
            <circle
              cx={CENTER.x}
              cy={CENTER.y}
              r={RADIUS - 4}
              fill="none"
              stroke="rgba(171,210,250,0.08)"
              strokeWidth="1"
            />

            {/* Connection lines (spokes) */}
            {SATELLITES.map((s, i) => (
              <line
                key={s.id}
                x1={CENTER.x}
                y1={CENTER.y}
                x2={s.x}
                y2={s.y}
                stroke={
                  activeNodes.has(i)
                    ? "rgba(0,212,146,0.55)"
                    : "rgba(118,146,255,0.22)"
                }
                strokeWidth={activeNodes.has(i) ? "1.6" : "1"}
                style={{ transition: "stroke 250ms ease, stroke-width 250ms ease" }}
              />
            ))}

            {/* Center hub */}
            <g>
              <circle
                cx={CENTER.x}
                cy={CENTER.y}
                r="46"
                fill="url(#hubGrad)"
                filter="url(#strongGlow)"
              />
              <circle
                cx={CENTER.x}
                cy={CENTER.y}
                r="46"
                fill="none"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="1.5"
              />
              <text
                x={CENTER.x}
                y={CENTER.y - 4}
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fill="#050816"
                fontFamily="ui-sans-serif, system-ui"
                letterSpacing="0.6"
              >
                AI AGENT
              </text>
              <text
                x={CENTER.x}
                y={CENTER.y + 10}
                textAnchor="middle"
                fontSize="8"
                fill="rgba(5,8,22,0.75)"
                fontFamily="ui-monospace, monospace"
                letterSpacing="1.5"
              >
                ZEUS·IT
              </text>
            </g>

            {/* Satellite nodes */}
            {SATELLITES.map((s, i) => {
              const isActive = activeNodes.has(i);
              return (
                <g key={s.id}>
                  <circle
                    cx={s.x}
                    cy={s.y}
                    r="26"
                    fill="url(#satGrad)"
                    stroke={isActive ? "#00D492" : "rgba(118,146,255,0.6)"}
                    strokeWidth={isActive ? "1.8" : "1.2"}
                    style={{
                      transition:
                        "stroke 250ms ease, stroke-width 250ms ease, filter 250ms ease",
                      filter: isActive
                        ? "drop-shadow(0 0 8px rgba(0,212,146,0.7))"
                        : "drop-shadow(0 0 4px rgba(118,146,255,0.25))",
                    }}
                  />
                  <text
                    x={s.x}
                    y={s.y - 2}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="600"
                    fill="#ABD2FA"
                    fontFamily="ui-sans-serif, system-ui"
                  >
                    {s.label}
                  </text>
                  <text
                    x={s.x}
                    y={s.y + 10}
                    textAnchor="middle"
                    fontSize="7"
                    fill="rgba(140,147,179,0.85)"
                    fontFamily="ui-monospace, monospace"
                    letterSpacing="0.5"
                  >
                    {s.sub?.toUpperCase()}
                  </text>
                </g>
              );
            })}

            {/* Animated packets */}
            {activePackets.map((p) => (
              <circle
                key={p.id}
                cx={p.x}
                cy={p.y}
                r="3.5"
                fill={p.color}
                opacity={p.opacity}
                filter="url(#glow)"
              />
            ))}
          </svg>

          {/* Live HUD overlay */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 font-mono text-[10px]">
            <div className="rounded-md glass px-2 py-1 text-text-muted">
              <span className="text-[#00D492]">●</span>{" "}
              <span className="text-text">+80h</span>
              <span className="text-text-dim"> /month</span>
            </div>
            <div className="rounded-md glass px-2 py-1 text-text-muted">
              <span className="text-[#7692FF]">⏵</span>{" "}
              <span className="text-text">{activePackets.length}</span>
              <span className="text-text-dim"> in transit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
