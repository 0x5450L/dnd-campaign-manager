import { useState } from "react";
import { useLiveSession } from "../../../../../context/liveSessionContext/useLiveSession";
import type { EncounterParticipantDTO } from "../../../../../types/session";
import { buildConditionBackground } from "./conditions";
import InitiativeBlock from "./blocks/InitiativeBlock";
import ArmorClassBlock from "./blocks/ArmorClassBlock";
import TypeBadge from "./blocks/TypeBadge";
import HpBar from "./blocks/HpBar";
import HpControls from "./blocks/HpControls";
import ConditionsPicker from "./blocks/ConditionsPicker";
import AbilityScoresStrip from "./blocks/AbilityScoresStrip";
import DeathSavesBlock from "./blocks/DeathSavesBlock";
import ParticipantDetailsModal from "./ParticipantDetailsModal";

type EncounterParticipantCardProps = {
  participant: EncounterParticipantDTO;
  isActive: boolean;
  isDM: boolean;
};

const InfoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-3.5 w-3.5"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-3.5 w-3.5"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-7 0-10-7-10-7a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19" />
    <path d="M14.12 14.12A3 3 0 1 1 9.88 9.88" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

export const EncounterParticipantCard = ({
  participant,
  isActive,
  isDM,
}: EncounterParticipantCardProps) => {
  const {
    adjustHp,
    grantTempHp,
    toggleCondition,
    setVisibility,
    setAcHidden,
    setTypeHidden,
    recordDeathSave,
  } = useLiveSession();
  const [detailsOpen, setDetailsOpen] = useState(false);

  const fullyHidden = !participant.isVisible && !isDM;
  if (fullyHidden) return null;

  const isDownedPc = participant.currentHp === 0 && participant.type === "pc";
  const conditionBackground = buildConditionBackground(participant.conditions);
  const hiddenForDm = !participant.isVisible && isDM;

  return (
    <>
      <li
        className={`relative flex flex-col gap-3 rounded-md border px-3 py-3 transition-colors ${
          isActive
            ? "border-gold bg-gold/5 shadow-[inset_0_0_0_1px_rgba(212,165,116,0.25)]"
            : "border-rule bg-surface/40 hover:border-hover/60"
        } ${hiddenForDm ? "opacity-70" : ""}`}
        style={conditionBackground ? { backgroundImage: conditionBackground } : undefined}
      >
        {isActive && (
          <span className="absolute -left-2 top-1/2 hidden h-6 w-1 -translate-y-1/2 rounded-full bg-gold sm:block" />
        )}

        <div className="flex items-start gap-3">
          <InitiativeBlock value={participant.sortOrder} isActive={isActive} />
          <ArmorClassBlock
            value={participant.armorClass}
            hidden={participant.acHidden}
            isDM={isDM}
            onToggleHidden={
              isDM
                ? () => setAcHidden(participant.id, !participant.acHidden)
                : undefined
            }
          />

          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate font-fantasy text-base text-ink">
                {participant.name}
              </span>
              <TypeBadge
                type={participant.type}
                hidden={participant.typeHidden}
                isDM={isDM}
                onToggleHidden={
                  isDM
                    ? () =>
                        setTypeHidden(participant.id, !participant.typeHidden)
                    : undefined
                }
              />
              {hiddenForDm && (
                <span className="inline-flex items-center gap-1 rounded border border-[#7a5aa5]/60 bg-[#7a5aa5]/15 px-1.5 py-0.5 font-fantasy text-[9px] uppercase tracking-widest text-[#c8b0e0]">
                  <EyeOffIcon /> Hidden
                </span>
              )}
            </div>

            <HpBar
              currentHp={participant.currentHp}
              maxHp={participant.maxHp}
              tempHp={participant.tempHp}
              hidden={!participant.isVisible}
            />
          </div>

          <div className="flex flex-col items-end gap-1">
            <button
              type="button"
              onClick={() => setDetailsOpen(true)}
              aria-label={`Open ${participant.name} details`}
              className="flex h-7 w-7 items-center justify-center rounded border border-rule bg-bg/40 text-faint transition-colors hover:border-hover hover:text-gold"
            >
              <InfoIcon />
            </button>
            {hiddenForDm && (
              <button
                type="button"
                onClick={() => setVisibility(participant.id, true)}
                className="rounded border border-[#7a5aa5]/60 px-1.5 py-0.5 font-fantasy text-[9px] uppercase tracking-widest text-[#c8b0e0] transition-colors hover:bg-[#7a5aa5]/15"
              >
                Reveal
              </button>
            )}
            {!hiddenForDm && isDM && (
              <button
                type="button"
                onClick={() => setVisibility(participant.id, false)}
                className="rounded border border-rule px-1.5 py-0.5 font-fantasy text-[9px] uppercase tracking-widest text-faint transition-colors hover:border-hover hover:text-ink"
              >
                Hide
              </button>
            )}
          </div>
        </div>

        {isDM && (
          <div className="flex flex-wrap items-center justify-end">
            <HpControls
              onDamage={(amount) => adjustHp(participant.id, -amount)}
              onHeal={(amount) => adjustHp(participant.id, amount)}
              onTemp={(amount) => grantTempHp(participant.id, amount)}
            />
          </div>
        )}

        {isDM && participant.abilityScores && (
          <AbilityScoresStrip scores={participant.abilityScores} />
        )}

        {isDownedPc && (
          <DeathSavesBlock
            successes={participant.deathSaveSuccesses}
            failures={participant.deathSaveFailures}
            canEdit={isDM}
            onRecord={(outcome) => recordDeathSave(participant.id, outcome)}
          />
        )}

        <ConditionsPicker
          active={participant.conditions}
          isDM={isDM}
          onToggle={(c) => toggleCondition(participant.id, c)}
        />
      </li>

      {detailsOpen && (
        <ParticipantDetailsModal
          participant={participant}
          isDM={isDM}
          onClose={() => setDetailsOpen(false)}
        />
      )}
    </>
  );
};

export default EncounterParticipantCard;
