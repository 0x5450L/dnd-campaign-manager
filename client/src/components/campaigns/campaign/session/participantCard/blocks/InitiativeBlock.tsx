type InitiativeBlockProps = {
  value: number;
  isActive: boolean;
};

export const InitiativeBlock = ({ value, isActive }: InitiativeBlockProps) => {
  return (
    <div
      className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-md border bg-bg/60 font-fantasy transition-colors ${
        isActive
          ? "border-gold bg-gold/10 text-gold-bright"
          : "border-rule text-gold"
      }`}
    >
      <span className="text-[8px] uppercase tracking-[0.18em] text-faint">
        Init
      </span>
      <span className="text-xl font-bold leading-none">{value}</span>
    </div>
  );
};

export default InitiativeBlock;
