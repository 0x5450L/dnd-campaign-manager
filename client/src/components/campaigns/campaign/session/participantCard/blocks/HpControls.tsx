import { useState } from "react";

type HpControlsProps = {
  onDamage: (amount: number) => void;
  onHeal: (amount: number) => void;
  onTemp: (amount: number) => void;
};

export const HpControls = ({ onDamage, onHeal, onTemp }: HpControlsProps) => {
  const [value, setValue] = useState("");

  const apply = (handler: (n: number) => void) => {
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) return;
    handler(Math.floor(n));
    setValue("");
  };

  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") apply(onDamage);
        }}
        placeholder="0"
        className="h-7 w-12 rounded border border-rule bg-bg/60 px-1 text-center font-fantasy text-sm text-ink outline-none transition-colors focus:border-hover"
      />
      <button
        type="button"
        onClick={() => apply(onDamage)}
        className="h-7 rounded border border-rust/60 bg-transparent px-2 font-fantasy text-[10px] uppercase tracking-widest text-[#f1c2c2] transition-colors hover:bg-rust/15"
      >
        Damage
      </button>
      <button
        type="button"
        onClick={() => apply(onHeal)}
        className="h-7 rounded border border-leaf/60 bg-transparent px-2 font-fantasy text-[10px] uppercase tracking-widest text-[#c2e8c2] transition-colors hover:bg-leaf/15"
      >
        Heal
      </button>
      <button
        type="button"
        onClick={() => apply(onTemp)}
        className="h-7 rounded border border-[#7da7c9]/60 bg-transparent px-2 font-fantasy text-[10px] uppercase tracking-widest text-[#9dc3e0] transition-colors hover:bg-[#7da7c9]/15"
      >
        Temp
      </button>
    </div>
  );
};

export default HpControls;
