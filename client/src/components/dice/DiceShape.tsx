import type { DiceType } from "@/types/dice";

type Props = {
  type: DiceType;
  label?: string | number;
  size?: number;
  className?: string;
  glow?: "success" | "fail" | "none";
  active?: boolean;
  rolling?: boolean;
};

const SHAPES: Record<DiceType, React.ReactNode> = {
  d4: (
    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
      <polygon points="32,6 58,54 6,54" />
      <line x1="32" y1="6" x2="32" y2="54" />
      <line x1="6" y1="54" x2="32" y2="36" />
      <line x1="58" y1="54" x2="32" y2="36" />
    </g>
  ),
  d6: (
    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <polygon points="32,6 58,18 58,46 32,58 6,46 6,18" />
      <polyline points="6,18 32,30 58,18" />
      <line x1="32" y1="30" x2="32" y2="58" />
    </g>
  ),
  d8: (
    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <polygon points="32,4 58,32 32,60 6,32" />
      <line x1="6" y1="32" x2="58" y2="32" />
      <line x1="32" y1="4" x2="32" y2="60" />
    </g>
  ),
  d10: (
    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <polygon points="32,4 56,24 50,40 32,60 14,40 8,24" />
      <line x1="8" y1="24" x2="56" y2="24" />
      <line x1="32" y1="4" x2="14" y2="40" />
      <line x1="32" y1="4" x2="50" y2="40" />
    </g>
  ),
  d12: (
    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <polygon points="32,4 60,24 50,58 14,58 4,24" />
      <polygon points="32,18 48,30 42,50 22,50 16,30" />
      <line x1="32" y1="4" x2="32" y2="18" />
      <line x1="60" y1="24" x2="48" y2="30" />
      <line x1="50" y1="58" x2="42" y2="50" />
      <line x1="14" y1="58" x2="22" y2="50" />
      <line x1="4" y1="24" x2="16" y2="30" />
    </g>
  ),
  d20: (
    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <polygon points="32,4 58,18 58,46 32,60 6,46 6,18" />
      <polygon points="32,16 48,26 48,42 32,52 16,42 16,26" />
      <line x1="32" y1="4" x2="32" y2="16" />
      <line x1="6" y1="18" x2="16" y2="26" />
      <line x1="58" y1="18" x2="48" y2="26" />
      <line x1="6" y1="46" x2="16" y2="42" />
      <line x1="58" y1="46" x2="48" y2="42" />
      <line x1="32" y1="60" x2="32" y2="52" />
    </g>
  ),
  d100: (
    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <circle cx="32" cy="32" r="26" />
      <ellipse cx="32" cy="32" rx="26" ry="10" />
      <ellipse cx="32" cy="32" rx="10" ry="26" />
    </g>
  ),
};

export const DiceShape = ({
  type,
  label,
  size = 48,
  className = "",
  glow = "none",
  active = false,
  rolling = false,
}: Props) => {
  const colorClass = active
    ? "text-gold-bright"
    : glow === "success"
      ? "text-leaf drop-shadow-[0_0_6px_rgba(93,165,93,0.5)]"
      : glow === "fail"
        ? "text-rust drop-shadow-[0_0_6px_rgba(201,85,85,0.5)]"
        : "text-gold-dim";

  return (
    <span
      className={`relative inline-flex items-center justify-center ${colorClass} ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 64 64"
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className={`block origin-center ${rolling ? "animate-[dice-tumble_0.6s_ease-in-out_infinite]" : ""}`}
      >
        {SHAPES[type]}
      </svg>
      {label !== undefined && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center font-fantasy font-bold text-sm text-ink">
          {label}
        </span>
      )}
    </span>
  );
};

export default DiceShape;
