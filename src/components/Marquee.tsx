import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  reverse?: boolean;
  pauseOnHover?: boolean;
  speed?: "slow" | "normal" | "fast";
}

const speedMap = {
  slow: "60s",
  normal: "40s",
  fast: "22s",
};

export default function Marquee({
  children,
  reverse = false,
  pauseOnHover = true,
  speed = "normal",
}: Props) {
  return (
    <div
      className="group relative flex w-full overflow-hidden"
      style={{
        maskImage:
          "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
      }}
    >
      <div
        className="flex shrink-0 items-center gap-8 pr-8"
        style={{
          animation: `${reverse ? "marquee-reverse" : "marquee"} ${speedMap[speed]} linear infinite`,
          animationPlayState: "running",
        }}
        onMouseEnter={(e) => {
          if (pauseOnHover) e.currentTarget.style.animationPlayState = "paused";
        }}
        onMouseLeave={(e) => {
          if (pauseOnHover) e.currentTarget.style.animationPlayState = "running";
        }}
      >
        {children}
        {children}
      </div>
    </div>
  );
}
