import { useEffect, useState } from "react";

/**
 * SkillRadar — interactive expertise profile.
 * A clean hexagonal radar chart with 6 competency areas, animated entry,
 * hover details, and a bilingual headline.
 *
 * Communicates Daniel's profile at a glance: balanced, senior, AI-focused.
 */

type Lang = "es" | "en";

interface Props {
  lang: Lang;
  className?: string;
}

interface Skill {
  id: string;
  labelEs: string;
  labelEn: string;
  level: number; // 0–1
  hintEs: string;
  hintEn: string;
}

const SKILLS: Skill[] = [
  {
    id: "ai",
    labelEs: "IA Generativa",
    labelEn: "Generative AI",
    level: 0.95,
    hintEs: "LLMs · Agentes · RAG",
    hintEn: "LLMs · Agents · RAG",
  },
  {
    id: "auto",
    labelEs: "Automatización",
    labelEn: "Automation",
    level: 0.92,
    hintEs: "n8n · RPA · IDP · Voicebots",
    hintEn: "n8n · RPA · IDP · Voicebots",
  },
  {
    id: "cloud",
    labelEs: "Cloud & DevOps",
    labelEn: "Cloud & DevOps",
    level: 0.82,
    hintEs: "AWS · Azure · Docker · K8s",
    hintEn: "AWS · Azure · Docker · K8s",
  },
  {
    id: "integ",
    labelEs: "Integraciones",
    labelEn: "Integrations",
    level: 0.9,
    hintEs: "ERP · CRM · APIs · Low-code",
    hintEn: "ERP · CRM · APIs · Low-code",
  },
  {
    id: "strat",
    labelEs: "Estrategia",
    labelEn: "Strategy",
    level: 0.85,
    hintEs: "Roadmap · ROI · C-Level",
    hintEn: "Roadmap · ROI · C-Level",
  },
  {
    id: "lead",
    labelEs: "Liderazgo",
    labelEn: "Leadership",
    level: 0.88,
    hintEs: "Equipos técnicos · P&L · GRC",
    hintEn: "Tech teams · P&L · GRC",
  },
];

const LABELS = {
  es: {
    chrome: "profile.radar",
    title: "PERFIL DE COMPETENCIAS",
    subtitle: "10+ años · CTO · AI Consultant",
    cta: "Pasá el mouse sobre un punto",
  },
  en: {
    chrome: "profile.radar",
    title: "EXPERTISE PROFILE",
    subtitle: "10+ years · CTO · AI Consultant",
    cta: "Hover any point for detail",
  },
} as const;

const VIEW = 400;
const CX = VIEW / 2;
const CY = VIEW / 2 + 8; // slight nudge down to balance with top title
const R = 122;
const RING_LEVELS = [0.25, 0.5, 0.75, 1];

export default function SkillRadar({ lang, className = "" }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const L = LABELS[lang];

  // Mount animation trigger
  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 120);
    return () => window.clearTimeout(t);
  }, []);

  // Compute geometry
  const vertices = SKILLS.map((s, i) => {
    const angle = -Math.PI / 2 + (i / SKILLS.length) * Math.PI * 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const r = R * s.level;
    return {
      x: CX + cos * r,
      y: CY + sin * r,
      axisX: CX + cos * R,
      axisY: CY + sin * R,
      labelX: CX + cos * (R + 30),
      labelY: CY + sin * (R + 30),
      cos,
      sin,
      skill: s,
    };
  });

  const polygonPoints = vertices.map((v) => `${v.x.toFixed(1)},${v.y.toFixed(1)}`).join(" ");

  const rings = RING_LEVELS.map((scale) =>
    SKILLS.map((_, i) => {
      const angle = -Math.PI / 2 + (i / SKILLS.length) * Math.PI * 2;
      return `${(CX + Math.cos(angle) * R * scale).toFixed(1)},${(CY + Math.sin(angle) * R * scale).toFixed(1)}`;
    }).join(" "),
  );

  const hoveredSkill = hovered !== null ? SKILLS[hovered]! : null;

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
        <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-text-dim/70">
          v2026
        </span>
      </div>

      {/* Body */}
      <div className="glass-strong relative aspect-square overflow-hidden rounded-b-2xl border-t-0">
        {/* Ambient glow */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 55%, rgba(118,146,255,0.18) 0%, rgba(27,44,193,0.08) 45%, rgba(5,8,22,0) 75%)",
          }}
        />

        {/* Header strip */}
        <div className="relative z-10 flex items-start justify-between px-4 pt-3 sm:px-5 sm:pt-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-dim">
              {L.title}
            </p>
            <p className="mt-0.5 font-mono text-[10px] text-[#7692FF]">
              {L.subtitle}
            </p>
          </div>
          <span className="rounded-md border border-[#00D492]/40 bg-[#00D492]/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-[#00D492]">
            senior
          </span>
        </div>

        {/* Radar SVG */}
        <svg
          viewBox={`0 0 ${VIEW} ${VIEW}`}
          className="absolute inset-0 h-full w-full"
          role="img"
          aria-label={L.title}
        >
          <defs>
            <linearGradient id="radar-fill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ABD2FA" stopOpacity="0.55" />
              <stop offset="55%" stopColor="#7692FF" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#00D492" stopOpacity="0.55" />
            </linearGradient>
            <linearGradient id="radar-stroke" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ABD2FA" />
              <stop offset="50%" stopColor="#7692FF" />
              <stop offset="100%" stopColor="#00D492" />
            </linearGradient>
            <filter id="vertex-glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Concentric rings */}
          {rings.map((points, idx) => (
            <polygon
              key={idx}
              points={points}
              fill="none"
              stroke="rgba(118,146,255,0.10)"
              strokeWidth="1"
              strokeDasharray={idx === RING_LEVELS.length - 1 ? "0" : "2 4"}
            />
          ))}

          {/* Axes */}
          {vertices.map((v, i) => (
            <line
              key={`axis-${i}`}
              x1={CX}
              y1={CY}
              x2={v.axisX}
              y2={v.axisY}
              stroke="rgba(118,146,255,0.14)"
              strokeWidth="1"
            />
          ))}

          {/* Skill polygon */}
          <polygon
            points={polygonPoints}
            fill="url(#radar-fill)"
            stroke="url(#radar-stroke)"
            strokeWidth="2"
            strokeLinejoin="round"
            style={{
              transformOrigin: `${CX}px ${CY}px`,
              transform: mounted ? "scale(1)" : "scale(0)",
              opacity: mounted ? 1 : 0,
              transition:
                "transform 1.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease",
              filter: "drop-shadow(0 0 16px rgba(118,146,255,0.35))",
            }}
          />

          {/* Vertices */}
          {vertices.map((v, i) => {
            const isHover = hovered === i;
            return (
              <g key={`v-${v.skill.id}`}>
                {/* Glow halo when hovered */}
                {isHover && (
                  <circle
                    cx={v.x}
                    cy={v.y}
                    r="14"
                    fill="rgba(0,212,146,0.25)"
                    filter="url(#vertex-glow)"
                  />
                )}
                {/* Outer ring */}
                <circle
                  cx={v.x}
                  cy={v.y}
                  r={isHover ? 7 : 5}
                  fill="none"
                  stroke="#ABD2FA"
                  strokeWidth="1.5"
                  style={{ transition: "r 220ms ease" }}
                />
                {/* Inner dot */}
                <circle
                  cx={v.x}
                  cy={v.y}
                  r={isHover ? 4 : 2.8}
                  fill={isHover ? "#00D492" : "#7692FF"}
                  style={{ transition: "r 220ms ease, fill 220ms ease" }}
                />
                {/* Hit area */}
                <circle
                  cx={v.x}
                  cy={v.y}
                  r="22"
                  fill="transparent"
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: "pointer" }}
                />
              </g>
            );
          })}

          {/* Labels */}
          {vertices.map((v, i) => {
            const isHover = hovered === i;
            const label = lang === "es" ? v.skill.labelEs : v.skill.labelEn;
            const ta =
              v.labelX < CX - 6 ? "end" : v.labelX > CX + 6 ? "start" : "middle";
            return (
              <text
                key={`l-${v.skill.id}`}
                x={v.labelX}
                y={v.labelY}
                textAnchor={ta}
                dominantBaseline="middle"
                fontSize="11"
                fontWeight={isHover ? 700 : 500}
                fill={isHover ? "#ffffff" : "#9ca3af"}
                fontFamily="ui-sans-serif, system-ui"
                style={{
                  transition: "fill 220ms, font-weight 220ms",
                  pointerEvents: "none",
                }}
              >
                {label}
              </text>
            );
          })}

          {/* Center marker */}
          <circle
            cx={CX}
            cy={CY}
            r="2.5"
            fill="rgba(171,210,250,0.7)"
          />
        </svg>

        {/* Hover tooltip / default legend */}
        <div className="absolute inset-x-3 bottom-3 z-10 sm:inset-x-4 sm:bottom-4">
          {hoveredSkill ? (
            <div className="glass-strong overflow-hidden rounded-xl border border-border p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-text">
                  {lang === "es" ? hoveredSkill.labelEs : hoveredSkill.labelEn}
                </p>
                <span className="font-mono text-[11px] tabular-nums text-[#00D492]">
                  {Math.round(hoveredSkill.level * 100)}%
                </span>
              </div>
              <p className="mt-0.5 font-mono text-[10px] text-text-muted">
                {lang === "es" ? hoveredSkill.hintEs : hoveredSkill.hintEn}
              </p>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-border-subtle">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#ABD2FA] via-[#7692FF] to-[#00D492]"
                  style={{ width: `${hoveredSkill.level * 100}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="text-center font-mono text-[10px] uppercase tracking-[0.18em] text-text-dim/70">
              {L.cta}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
