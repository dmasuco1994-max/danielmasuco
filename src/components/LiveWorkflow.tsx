import { useEffect, useState } from "react";
import {
  Webhook,
  Sparkles,
  ShieldCheck,
  Database,
  Send,
  MessageCircle,
  Search,
  Bot,
  FormInput,
  UserSearch,
  Target,
  GitBranch,
  CheckCircle2,
  Loader2,
  type LucideIcon,
} from "lucide-react";

/**
 * LiveWorkflow — Auto-playing n8n-style automation builder.
 *
 * Mimics a live workflow runner: nodes appear, activate one by one with
 * real log lines, complete green, then a new workflow is loaded. Loops
 * through 3 realistic automations Daniel actually ships.
 *
 * Looks and feels like a real automation platform — because that's what
 * Daniel sells.
 */

type Lang = "es" | "en";

interface Props {
  lang: Lang;
  className?: string;
}

interface WFNode {
  id: string;
  icon: LucideIcon;
  labelEs: string;
  labelEn: string;
  sub: string;
  duration: number;
  logEs: string;
  logEn: string;
}

interface Workflow {
  id: string;
  name: string;
  impactEs: string;
  impactEn: string;
  nodes: WFNode[];
}

const WORKFLOWS: Workflow[] = [
  {
    id: "invoice",
    name: "invoice_handler.flow",
    impactEs: "12 min/factura ahorrados",
    impactEn: "12 min/invoice saved",
    nodes: [
      {
        id: "trig",
        icon: Webhook,
        labelEs: "Webhook Trigger",
        labelEn: "Webhook Trigger",
        sub: "POST /invoices",
        duration: 900,
        logEs: "trigger ▸ factura entrante",
        logEn: "trigger ▸ incoming invoice",
      },
      {
        id: "ai",
        icon: Sparkles,
        labelEs: "Extraer datos · IA",
        labelEn: "Extract data · AI",
        sub: "gpt-4o · vision",
        duration: 1400,
        logEs: "gpt-4o ▸ 12 campos parseados",
        logEn: "gpt-4o ▸ 12 fields parsed",
      },
      {
        id: "val",
        icon: ShieldCheck,
        labelEs: "Validar schema",
        labelEn: "Validate schema",
        sub: "Zod · JSON",
        duration: 700,
        logEs: "schema ✓ ok",
        logEn: "schema ✓ ok",
      },
      {
        id: "save",
        icon: Database,
        labelEs: "Guardar en CRM",
        labelEn: "Save to CRM",
        sub: "PostgreSQL",
        duration: 800,
        logEs: "INSERT row #4823",
        logEn: "INSERT row #4823",
      },
      {
        id: "notify",
        icon: Send,
        labelEs: "Notificar Slack",
        labelEn: "Notify Slack",
        sub: "#ops",
        duration: 600,
        logEs: "slack #ops ✓",
        logEn: "slack #ops ✓",
      },
    ],
  },
  {
    id: "support",
    name: "customer_support.flow",
    impactEs: "ticket evitado · -8 min",
    impactEn: "ticket avoided · -8 min",
    nodes: [
      {
        id: "wa",
        icon: MessageCircle,
        labelEs: "Mensaje WhatsApp",
        labelEn: "WhatsApp Message",
        sub: "WaBiz Webhook",
        duration: 800,
        logEs: "msg @ +5491134…",
        logEn: "msg @ +5491134…",
      },
      {
        id: "intent",
        icon: Sparkles,
        labelEs: "Clasificar intent",
        labelEn: "Classify intent",
        sub: "gpt-4o-mini",
        duration: 1100,
        logEs: "intent ▸ refund_query",
        logEn: "intent ▸ refund_query",
      },
      {
        id: "rag",
        icon: Search,
        labelEs: "RAG knowledge",
        labelEn: "RAG knowledge",
        sub: "pgvector",
        duration: 1100,
        logEs: "3 chunks recuperados",
        logEn: "3 chunks retrieved",
      },
      {
        id: "reply",
        icon: Bot,
        labelEs: "Generar respuesta",
        labelEn: "Generate reply",
        sub: "gpt-4o",
        duration: 1300,
        logEs: "reply ▸ 184 tokens",
        logEn: "reply ▸ 184 tokens",
      },
      {
        id: "send",
        icon: Send,
        labelEs: "Enviar respuesta",
        labelEn: "Send reply",
        sub: "WaBiz API",
        duration: 700,
        logEs: "delivered ✓",
        logEn: "delivered ✓",
      },
    ],
  },
  {
    id: "lead",
    name: "lead_qualifier.flow",
    impactEs: "lead enrutado al AE",
    impactEn: "lead routed to AE",
    nodes: [
      {
        id: "form",
        icon: FormInput,
        labelEs: "Form recibido",
        labelEn: "Form received",
        sub: "Webhook",
        duration: 700,
        logEs: "form_id 4471",
        logEn: "form_id 4471",
      },
      {
        id: "enrich",
        icon: UserSearch,
        labelEs: "Enriquecer datos",
        labelEn: "Enrich data",
        sub: "Clearbit API",
        duration: 1100,
        logEs: "company ▸ TechCorp SA",
        logEn: "company ▸ TechCorp SA",
      },
      {
        id: "score",
        icon: Target,
        labelEs: "Score · lead",
        labelEn: "Score · lead",
        sub: "gpt-4o + rules",
        duration: 1200,
        logEs: "score ▸ 87/100 (hot)",
        logEn: "score ▸ 87/100 (hot)",
      },
      {
        id: "route",
        icon: GitBranch,
        labelEs: "Rutear vendedor",
        labelEn: "Route to seller",
        sub: "if / else · n8n",
        duration: 800,
        logEs: "→ María (AE sr.)",
        logEn: "→ María (AE sr.)",
      },
      {
        id: "update",
        icon: Database,
        labelEs: "Actualizar CRM",
        labelEn: "Update CRM",
        sub: "PostgreSQL",
        duration: 900,
        logEs: "CRM updated ✓",
        logEn: "CRM updated ✓",
      },
    ],
  },
];

const L = {
  es: {
    chrome: "automation.workspace",
    running: "EJECUTANDO",
    done: "COMPLETADO",
    log: "EXECUTION LOG",
    workflow: "flow",
    pause: "PAUSADO",
  },
  en: {
    chrome: "automation.workspace",
    running: "RUNNING",
    done: "COMPLETED",
    log: "EXECUTION LOG",
    workflow: "flow",
    pause: "PAUSED",
  },
} as const;

function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}
function stamp() {
  const d = new Date();
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

interface LogEntry {
  id: number;
  time: string;
  text: string;
  state: "active" | "done";
}

export default function LiveWorkflow({ lang, className = "" }: Props) {
  const [wfIdx, setWfIdx] = useState(0);
  const [nodeIdx, setNodeIdx] = useState(-1);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [visible, setVisible] = useState(true);
  const t = L[lang];
  const wf = WORKFLOWS[wfIdx]!;
  const totalNodes = wf.nodes.length;
  const isDone = nodeIdx >= totalNodes;
  const isRunning = nodeIdx >= 0 && !isDone;

  // Pause when off-screen or tab hidden
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const onVis = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      if (reduced) setVisible(false);
    };
  }, []);

  // State machine
  useEffect(() => {
    if (!visible) return;

    // Workflow boot: start first node
    if (nodeIdx === -1) {
      const id = window.setTimeout(() => setNodeIdx(0), 600);
      return () => window.clearTimeout(id);
    }

    // Workflow completed: pause then advance to next
    if (isDone) {
      const id = window.setTimeout(() => {
        setWfIdx((i) => (i + 1) % WORKFLOWS.length);
        setNodeIdx(-1);
        setLogs([]);
      }, 2400);
      return () => window.clearTimeout(id);
    }

    // Running a node: add active log, schedule completion
    const currentNode = wf.nodes[nodeIdx]!;
    const logId = Date.now() + nodeIdx;
    setLogs((prev) => [
      ...prev.slice(-4),
      {
        id: logId,
        time: stamp(),
        text: lang === "es" ? currentNode.logEs : currentNode.logEn,
        state: "active",
      },
    ]);

    const id = window.setTimeout(() => {
      setLogs((prev) =>
        prev.map((l) => (l.id === logId ? { ...l, state: "done" } : l)),
      );
      setNodeIdx((i) => i + 1);
    }, currentNode.duration);

    return () => window.clearTimeout(id);
  }, [wfIdx, nodeIdx, lang, visible, isDone, wf.nodes]);

  // Container intersection observer
  useEffect(() => {
    const el = document.getElementById("live-workflow-root");
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const inView = !!entry?.isIntersecting;
        if (!inView) setVisible(false);
        else if (!document.hidden) setVisible(true);
      },
      { rootMargin: "100px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      id="live-workflow-root"
      className={`relative overflow-hidden rounded-2xl ${className}`}
    >
      {/* Window chrome */}
      <div className="glass-strong flex items-center gap-1.5 rounded-t-2xl border-b border-border px-3 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
        <span className="ml-3 font-mono text-[11px] tracking-tight text-text-dim">
          {t.chrome}
        </span>
        <span
          className={`ml-auto inline-flex items-center gap-1.5 font-mono text-[10px] tracking-wider ${
            isDone ? "text-[#00D492]" : isRunning ? "text-[#ABD2FA]" : "text-text-dim"
          }`}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span
              className={`absolute inline-flex h-full w-full rounded-full opacity-70 ${
                isRunning ? "animate-ping bg-[#ABD2FA]" : isDone ? "bg-[#00D492]" : ""
              }`}
            />
            <span
              className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
                isDone
                  ? "bg-[#00D492]"
                  : isRunning
                    ? "bg-[#ABD2FA]"
                    : "bg-text-dim"
              }`}
            />
          </span>
          {visible ? (isDone ? t.done : isRunning ? t.running : t.running) : t.pause}
        </span>
      </div>

      {/* Body */}
      <div className="glass-strong relative aspect-square overflow-hidden rounded-b-2xl border-t-0 px-4 pt-3 pb-3 sm:px-5 sm:pt-4">
        {/* Workflow title bar */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-dim">
              {t.workflow}:
            </span>
            <span className="font-mono text-[11px] font-semibold text-text">
              {wf.name}
            </span>
          </div>
          <span className="font-mono text-[10px] text-text-dim tabular-nums">
            {Math.min(nodeIdx + 1, totalNodes)}/{totalNodes}
          </span>
        </div>

        {/* Nodes (vertical pipeline) */}
        <div className="space-y-0.5">
          {wf.nodes.map((node, i) => {
            const state =
              i < nodeIdx ? "done" : i === nodeIdx ? "active" : "pending";
            const Icon = node.icon;
            const label = lang === "es" ? node.labelEs : node.labelEn;

            return (
              <div key={`${wf.id}-${node.id}`}>
                {/* Connector line (above node, except first) */}
                {i > 0 && (
                  <div className="ml-[15px] flex h-4 items-center">
                    <div
                      className="h-full w-px transition-all duration-500"
                      style={{
                        background:
                          state === "pending"
                            ? "rgba(118,146,255,0.18)"
                            : "linear-gradient(to bottom, #00D492, #7692FF)",
                        boxShadow:
                          state !== "pending"
                            ? "0 0 6px rgba(0,212,146,0.3)"
                            : "none",
                      }}
                    />
                  </div>
                )}

                {/* Node row */}
                <div
                  className={`flex items-center gap-2.5 rounded-lg border px-2 py-1.5 transition-all duration-300 ${
                    state === "active"
                      ? "border-[#ABD2FA]/70 bg-[#7692FF]/10"
                      : state === "done"
                        ? "border-[#00D492]/40 bg-[#00D492]/5"
                        : "border-border-subtle bg-bg-elevated/30"
                  }`}
                  style={
                    state === "active"
                      ? {
                          boxShadow: "0 0 24px -6px rgba(118,146,255,0.55)",
                        }
                      : undefined
                  }
                >
                  {/* Marker */}
                  <span
                    className={`relative grid h-7 w-7 shrink-0 place-items-center rounded-md transition-all duration-300 ${
                      state === "active"
                        ? "bg-[#7692FF] text-bg"
                        : state === "done"
                          ? "bg-[#00D492] text-bg"
                          : "bg-bg-elevated text-text-dim"
                    }`}
                    style={
                      state === "active"
                        ? {
                            boxShadow:
                              "0 0 14px rgba(118,146,255,0.7), inset 0 0 6px rgba(255,255,255,0.25)",
                          }
                        : undefined
                    }
                  >
                    {state === "done" ? (
                      <CheckCircle2 size={14} strokeWidth={2.5} />
                    ) : state === "active" ? (
                      <Loader2 size={14} className="animate-spin" strokeWidth={2.5} />
                    ) : (
                      <Icon size={14} strokeWidth={1.6} />
                    )}
                    {state === "active" && (
                      <span
                        aria-hidden
                        className="absolute -inset-1 animate-ping rounded-md bg-[#7692FF] opacity-25"
                      />
                    )}
                  </span>

                  {/* Label + sub */}
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-[11px] font-semibold leading-tight transition-colors ${
                        state === "pending" ? "text-text-muted" : "text-text"
                      }`}
                    >
                      {label}
                    </p>
                    <p className="truncate font-mono text-[9px] leading-tight text-text-dim">
                      {node.sub}
                    </p>
                  </div>

                  {/* Right state badge */}
                  <span
                    className={`shrink-0 font-mono text-[9px] uppercase tracking-wider tabular-nums ${
                      state === "done"
                        ? "text-[#00D492]"
                        : state === "active"
                          ? "text-[#ABD2FA]"
                          : "text-text-dim/60"
                    }`}
                  >
                    {state === "done"
                      ? "✓"
                      : state === "active"
                        ? "..."
                        : "·"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer / Log */}
        <div className="absolute inset-x-4 bottom-3 sm:inset-x-5">
          {isDone ? (
            <div className="rounded-lg border border-[#00D492]/40 bg-[#00D492]/8 px-3 py-2 backdrop-blur">
              <p className="flex items-center gap-2 text-[11px] font-semibold text-[#00D492]">
                <CheckCircle2 size={14} />
                {lang === "es" ? "Completado" : "Completed"} ·{" "}
                <span className="font-mono text-text">
                  {lang === "es" ? wf.impactEs : wf.impactEn}
                </span>
              </p>
            </div>
          ) : (
            <div className="space-y-0.5">
              <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-text-dim/70">
                {t.log}
              </p>
              {logs.slice(-2).map((log, i, arr) => {
                const opacity = 0.45 + (0.55 * (i + 1)) / arr.length;
                return (
                  <div
                    key={log.id}
                    className="flex items-center gap-2 rounded-md glass px-2 py-1 font-mono text-[10px]"
                    style={{ opacity }}
                  >
                    <span className="text-text-dim">[{log.time}]</span>
                    <span
                      className={
                        log.state === "done"
                          ? "text-[#00D492]"
                          : "text-[#ABD2FA]"
                      }
                    >
                      {log.text}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Subtle grid overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-25"
          style={{
            backgroundImage:
              "linear-gradient(rgba(118,146,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(118,146,255,0.06) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage:
              "radial-gradient(ellipse 80% 80% at center, black 40%, transparent 95%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 80% at center, black 40%, transparent 95%)",
          }}
        />

        {/* Ambient radial glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse at 50% 35%, rgba(118,146,255,0.10) 0%, rgba(5,8,22,0) 65%)",
          }}
        />
      </div>
    </div>
  );
}
