type HpReadoutProps = {
  currentHp: number;
  maxHp: number;
  tempHp: number;
  hidden: boolean;
  downed?: boolean;
};

export const HpReadout = ({
  currentHp,
  maxHp,
  tempHp,
  hidden,
  downed = false,
}: HpReadoutProps) => (
  <div className="flex w-16 shrink-0 flex-col items-end font-fantasy tabular-nums leading-none">
    <span className={`text-xs ${downed ? "text-rust-soft" : "text-ink"}`}>
      {hidden ? "??/??" : `${currentHp}/${maxHp}`}
    </span>
    <span className="text-[11px] text-frost-soft">
      {hidden ? "+??" : `+${tempHp}`}
    </span>
  </div>
);

export default HpReadout;
