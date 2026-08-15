import { useState } from "react";
import { CloseIcon } from "@/components/ui/icons";
import HpControls from "./HpControls";

type HpControlsPopoverProps = {
  onDamage: (amount: number) => void;
  onHeal: (amount: number) => void;
  onTemp: (amount: number) => void;
};

export const HpControlsPopover = ({
  onDamage,
  onHeal,
  onTemp,
}: HpControlsPopoverProps) => {
  const [open, setOpen] = useState(false);

  const closeAfter = (handler: (amount: number) => void) => (amount: number) => {
    handler(amount);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Adjust hit points"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-rule font-fantasy text-xs text-faint transition-colors hover:border-hover hover:text-gold"
      >
        ±
      </button>

      {open && (
        <div className="absolute inset-x-2 bottom-2 z-10 flex flex-col gap-2 rounded-md border border-rule bg-surface/95 p-2 shadow-xl backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="font-fantasy text-xs uppercase tracking-[0.18em] text-gold-bright">
              Hit points
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close hit point controls"
              className="text-faint transition-colors hover:text-ink"
            >
              <CloseIcon />
            </button>
          </div>
          <HpControls
            onDamage={closeAfter(onDamage)}
            onHeal={closeAfter(onHeal)}
            onTemp={closeAfter(onTemp)}
          />
        </div>
      )}
    </>
  );
};

export default HpControlsPopover;
