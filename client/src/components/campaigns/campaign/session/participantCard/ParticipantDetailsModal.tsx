import { useEffect } from "react";
import type { EncounterParticipantDTO } from "../../../../../types/session";
import AbilityScoresStrip from "./blocks/AbilityScoresStrip";

type ParticipantDetailsModalProps = {
  participant: EncounterParticipantDTO;
  isDM: boolean;
  onClose: () => void;
};

const typeLabel: Record<EncounterParticipantDTO["type"], string> = {
  pc: "Player Character",
  npc: "NPC",
  monster: "Monster",
};

export const ParticipantDetailsModal = ({
  participant,
  isDM,
  onClose,
}: ParticipantDetailsModalProps) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const showAc = isDM || !participant.acHidden;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="cs-section-card flex w-full max-w-md flex-col gap-3 p-5"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col">
            <span className="font-fantasy text-lg font-bold text-gold-bright">
              {participant.name}
            </span>
            <span className="text-[10px] uppercase tracking-[0.16em] text-faint">
              {typeLabel[participant.type]} · Init {participant.sortOrder}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md border border-rule px-2 py-0.5 text-sm text-faint transition-colors hover:border-hover hover:text-ink"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-widest text-faint">HP</span>
            <span className="font-fantasy text-sm text-ink">
              {participant.currentHp}/{participant.maxHp}
              {participant.tempHp > 0 && (
                <span className="ml-1 text-[#9dc3e0]">+{participant.tempHp}</span>
              )}
            </span>
          </div>
          {showAc && (
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-widest text-faint">AC</span>
              <span className="font-fantasy text-sm text-ink">
                {participant.armorClass}
              </span>
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-widest text-faint">
              Status
            </span>
            <span className="font-fantasy text-sm text-ink">
              {participant.conditions.length > 0
                ? participant.conditions.join(", ")
                : "—"}
            </span>
          </div>
        </div>

        {isDM && (
          <div className="flex flex-col gap-1">
            <span className="text-[9px] uppercase tracking-widest text-faint">
              Ability scores
            </span>
            <AbilityScoresStrip scores={participant.abilityScores} />
          </div>
        )}

        <p className="text-[11px] italic text-dim">
          Full sheet view coming soon.
        </p>
      </div>
    </div>
  );
};

export default ParticipantDetailsModal;
