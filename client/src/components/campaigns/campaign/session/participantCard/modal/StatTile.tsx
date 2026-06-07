import type { ReactNode } from "react";

type StatTileProps = {
  label: string;
  focusable?: boolean;
  children: ReactNode;
};

export const StatTile = ({
  label,
  focusable = false,
  children,
}: StatTileProps) => (
  <div
    className={`flex h-16 sm:h-20 min-w-16 sm:min-w-20 grow basis-0 flex-col items-center justify-center gap-1 sm:gap-1.5 rounded-md border border-rule bg-bg/60 font-fantasy ${
      focusable ? "focus-within:border-hover" : ""
    }`}
  >
    <span className="font-fantasy text-xs sm:text-sm font-bold uppercase tracking-[0.18em] text-gold-bright">
      {label}
    </span>
    {children}
  </div>
);

export default StatTile;
