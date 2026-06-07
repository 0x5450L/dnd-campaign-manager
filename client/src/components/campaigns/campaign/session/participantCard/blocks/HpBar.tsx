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
  const totalScale = Math.max(safeMax, currentHp + tempHp);
  const hpRatio = currentHp / safeMax;
  const hpPercent = (currentHp / totalScale) * 100;
  const tempPercent = (tempHp / totalScale) * 100;
  const maxMarkerPercent = (safeMax / totalScale) * 100;
  const tempVisible = !hidden && tempHp > 0;

  return (
    <div className="flex items-center gap-2">
      <div className="relative h-3 flex-1 overflow-hidden rounded-full border border-rule bg-bg/70">
        {hidden ? (
          <div className="absolute inset-0 bg-[#9aa3b2]/30" />
        ) : (
          <div
            className={`absolute left-0 top-0 h-full transition-[width] ${hpBarColor(Math.round(hpRatio * 100))}`}
            style={{ width: `${hpPercent}%` }}
          />
        )}
        {tempVisible && (
          <div
            className="absolute top-0 h-full bg-[#7da7c9] transition-[left,width]"
            style={{ left: `${hpPercent}%`, width: `${tempPercent}%` }}
          />
        )}
        {tempVisible && currentHp + tempHp > safeMax && (
          <div
            className="absolute top-0 h-full w-px bg-ink/40"
            style={{ left: `${maxMarkerPercent}%` }}
          />
        )}
      </div>
      <div className="flex w-16 flex-col items-end font-fantasy tabular-nums leading-none">
        <span className="text-xs text-ink">
          {hidden ? "??/??" : `${currentHp}/${maxHp}`}
        </span>
        <span className="text-[11px] text-[#9dc3e0]">
          {hidden ? "+??" : `+${tempHp}`}
        </span>
      </div>
    </div>
  );
};

export default HpBar;
