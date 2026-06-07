export type StatBlockSize = "md" | "lg";

export type StatBlockSizeStyles = {
  box: string;
  label: string;
  value: string;
  input: string;
};

export const STAT_BLOCK_SIZES: Record<StatBlockSize, StatBlockSizeStyles> = {
  md: {
    box: "h-14 w-14",
    label: "text-[11px]",
    value: "text-2xl",
    input: "w-11 text-2xl",
  },
  lg: {
    box: "h-16 sm:h-20 min-w-16 sm:min-w-20 grow basis-0 gap-1 sm:gap-1.5",
    label: "text-xs sm:text-sm",
    value: "text-xl sm:text-2xl",
    input: "w-12 sm:w-14 text-xl sm:text-2xl",
  },
};
