import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";

interface Props {
  code: string;
  speed?: number; // chars per second
  className?: string;
}

const KEYWORDS = ["from", "import", "class", "def", "async", "await", "return", "self"];
const TYPES = ["str", "dict", "int", "float", "bool", "list"];

function highlight(line: string) {
  // very small, deliberately fast syntax highlighter
  const parts: { t: string; cls: string }[] = [];
  let buf = "";
  let i = 0;
  const flush = (cls = "") => {
    if (buf) {
      parts.push({ t: buf, cls });
      buf = "";
    }
  };

  while (i < line.length) {
    const ch = line[i];

    if (ch === "#") {
      flush();
      const rest = line.slice(i);
      parts.push({ t: rest, cls: "text-text-dim italic" });
      i = line.length;
      continue;
    }
    if (ch === '"' || ch === "'") {
      flush();
      const quote = ch;
      let str = quote;
      i++;
      while (i < line.length && line[i] !== quote) {
        str += line[i++];
      }
      str += line[i] ?? "";
      i++;
      parts.push({ t: str, cls: "text-emerald-300" });
      continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      let word = "";
      while (i < line.length && /[A-Za-z0-9_]/.test(line[i]!)) {
        word += line[i++];
      }
      if (KEYWORDS.includes(word)) {
        parts.push({ t: word, cls: "text-[#7692FF] font-semibold" });
      } else if (TYPES.includes(word)) {
        parts.push({ t: word, cls: "text-[#6EE7B7]" });
      } else if (line[i] === "(") {
        parts.push({ t: word, cls: "text-[#ABD2FA]" });
      } else {
        parts.push({ t: word, cls: "" });
      }
      continue;
    }
    if (/[0-9]/.test(ch)) {
      let num = "";
      while (i < line.length && /[0-9.]/.test(line[i]!)) {
        num += line[i++];
      }
      parts.push({ t: num, cls: "text-[#A7F3D0]" });
      continue;
    }
    buf += ch;
    i++;
  }
  flush();
  return parts;
}

export default function CodeTyping({ code, speed = 70, className = "" }: Props) {
  const [typed, setTyped] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });

  useEffect(() => {
    if (!inView) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setTyped(code);
      return;
    }
    let i = 0;
    let raf = 0;
    const interval = 1000 / speed;
    let last = performance.now();
    const tick = (now: number) => {
      if (now - last >= interval) {
        const step = Math.max(1, Math.floor((now - last) / interval));
        i = Math.min(code.length, i + step);
        setTyped(code.slice(0, i));
        last = now;
      }
      if (i < code.length) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, code, speed]);

  const lines = typed.split("\n");

  return (
    <div ref={ref} className={`overflow-hidden rounded-2xl ${className}`}>
      {/* Window chrome */}
      <div className="glass-strong flex items-center gap-1.5 rounded-t-2xl border-b border-border px-3 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
        <span className="ml-3 font-mono text-[11px] tracking-tight text-text-dim">
          automation_agent.py
        </span>
        <span className="ml-auto font-mono text-[10px] text-text-dim/70">
          ZEUS IT · prod
        </span>
      </div>
      <pre className="glass-strong rounded-b-2xl border-t-0 px-4 py-4 font-mono text-[12.5px] leading-relaxed">
        <code>
          {lines.map((line, idx) => (
            <div key={idx} className="flex">
              <span className="mr-4 w-6 shrink-0 select-none text-right text-text-dim/60">
                {idx + 1}
              </span>
              <span className="flex-1 whitespace-pre">
                {highlight(line).map((p, j) => (
                  <span key={j} className={p.cls}>
                    {p.t}
                  </span>
                ))}
                {idx === lines.length - 1 && typed.length < code.length && (
                  <span className="ml-0.5 inline-block h-4 w-2 -mb-0.5 animate-pulse bg-accent-glow" />
                )}
              </span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
