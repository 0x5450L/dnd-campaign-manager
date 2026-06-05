type ArmorClassBlockProps = {
  value: number;
  hidden: boolean;
  isDM: boolean;
};

export const ArmorClassBlock = ({
  value,
  hidden,
  isDM,
}: ArmorClassBlockProps) => {
  const display = hidden && !isDM ? "??" : value;

  return (
    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-md border border-rule bg-bg/60 font-fantasy text-ink">
      <span className="font-fantasy text-[11px] font-bold uppercase tracking-[0.22em] text-gold-bright">
        AC
      </span>
      <span
        className={`text-2xl font-bold leading-none ${
          hidden && !isDM ? "text-faint" : "text-ink"
        } ${hidden && isDM ? "text-dim" : ""}`}
      >
        {display}
      </span>
    </div>
  );
};

export default ArmorClassBlock;
