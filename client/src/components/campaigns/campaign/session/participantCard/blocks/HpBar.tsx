type HpBarProps = {
  currentHp: number;
  maxHp: number;
  tempHp: number;
  hidden: boolean;
};

const hpBarColor = (percent: number) => {
  if (percent <= 25) return "bg-rust";
  if (percent <= 60) return "bg-gold-dim";
  return "bg-leaf";
};

export const HpBar = ({ currentHp, maxHp, tempHp, hidden }: HpBarProps) => {
  const safeMax = Math.max(1, maxHp);
  const hpPercent = Math.min(100, Math.round((currentHp / safeMax) * 100));
  const tempPercent = Math.min(100, Math.round((tempHp / safeMax) * 100));

  return (
    <div className="flex flex-col gap-1">
      {tempHp > 0 && !hidden && (
        <div className="relative h-1.5 overflow-hidden rounded-full border border-[#7da7c9]/40 bg-bg/70">
          <div
            className="h-full bg-[#7da7c9] transition-[width]"
            style={{ width: `${tempPercent}%` }}
          />
        </div>
      )}
      <div className="flex items-center gap-2">
        <div className="relative h-2 flex-1 overflow-hidden rounded-full border border-rule bg-bg/70">
          {!hidden && (
            <div
              className={`h-full transition-[width] ${hpBarColor(hpPercent)}`}
              style={{ width: `${hpPercent}%` }}
            />
          )}
        </div>
        <span className="w-24 text-right font-fantasy text-xs text-ink tabular-nums">
          {hidden ? (
            "??/??"
          ) : (
            <>
              {currentHp}
              <span className="text-faint">/{maxHp}</span>
              {tempHp > 0 && (
                <span className="ml-1 text-[#9dc3e0]">+{tempHp}</span>
              )}
            </>
          )}
        </span>
      </div>
    </div>
  );
};

export default HpBar;
