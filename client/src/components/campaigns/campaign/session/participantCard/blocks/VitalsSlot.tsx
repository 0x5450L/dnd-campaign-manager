import type { ReactNode } from "react";
import HpBar from "./HpBar";
import DeathSavesTrack from "./DeathSavesTrack";

type DeathSaveVariant = "success" | "failure";

type VitalsSlotProps = {
  currentHp: number;
  maxHp: number;
  tempHp: number;
  hidden: boolean;
  showDeathSaves: boolean;
  successes: number;
  failures: number;
  canEdit: boolean;
  onRecordDeathSave: (outcome: DeathSaveVariant) => void;
  trailingSlot?: boolean;
  trailing?: ReactNode;
};

export const VitalsSlot = ({
  currentHp,
  maxHp,
  tempHp,
  hidden,
  showDeathSaves,
  successes,
  failures,
  canEdit,
  onRecordDeathSave,
  trailingSlot = false,
  trailing,
}: VitalsSlotProps) => (
  <div className="flex h-8 items-center gap-2">
    {showDeathSaves ? (
      <DeathSavesTrack
        successes={successes}
        failures={failures}
        currentHp={currentHp}
        maxHp={maxHp}
        tempHp={tempHp}
        hidden={hidden}
        canEdit={canEdit}
        onRecord={onRecordDeathSave}
      />
    ) : (
      <HpBar
        currentHp={currentHp}
        maxHp={maxHp}
        tempHp={tempHp}
        hidden={hidden}
      />
    )}
    {trailingSlot && (
      <div className="flex h-6 w-6 shrink-0 items-center justify-center">
        {trailing}
      </div>
    )}
  </div>
);

export default VitalsSlot;
