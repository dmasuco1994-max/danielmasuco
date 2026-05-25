import { useRef, type ReactNode, type CSSProperties } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

interface Props {
  children: ReactNode;
  href?: string;
  className?: string;
  style?: CSSProperties;
  strength?: number;
  target?: string;
  rel?: string;
  download?: boolean | string;
  onClick?: () => void;
}

export default function MagneticButton({
  children,
  href,
  className,
  style,
  strength = 0.35,
  target,
  rel,
  download,
  onClick,
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 18 });
  const sy = useSpring(y, { stiffness: 200, damping: 18 });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    x.set(dx * strength);
    y.set(dy * strength);
  };
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const motionProps = {
    style: { x: sx, y: sy, ...style },
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
    className,
  };

  if (href) {
    return (
      <motion.a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        target={target}
        rel={rel}
        download={download as any}
        {...motionProps}
      >
        {children}
      </motion.a>
    );
  }
  return (
    <motion.button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type="button"
      onClick={onClick}
      {...motionProps}
    >
      {children}
    </motion.button>
  );
}
