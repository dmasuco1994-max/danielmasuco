import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  /** Disable the moving gradient (for headings on slower devices). */
  static?: boolean;
}

/**
 * Text painted with an animated conic gradient.
 * Inverted palette: darks at the edges, Icy highlight in the middle.
 */
export default function AuroraText({
  children,
  className = "",
  static: isStatic = false,
}: Props) {
  return (
    <span
      className={`relative inline-block bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage:
          "conic-gradient(from 90deg at 50% 50%, #ffffff 0%, #1B2CC1 15%, #3D518C 30%, #ABD2FA 50%, #7692FF 70%, #1B2CC1 85%, #ffffff 100%)",
        backgroundSize: "200% 200%",
        animation: isStatic ? undefined : "aurora-shift 9s ease-in-out infinite",
      }}
    >
      {children}
    </span>
  );
}
