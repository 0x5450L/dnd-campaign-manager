import { useState } from "react";
import { useParticipantActions } from "@/hooks/liveSession/useParticipantActions";
import type { EncounterParticipantDTO } from "@/types/encounter";
import InitiativeBlock from "./blocks/InitiativeBlock";
import ArmorClassBlock from "./blocks/ArmorClassBlock";
import TypeBadge from "./blocks/TypeBadge";
import VitalsSlot from "./blocks/VitalsSlot";
import HpControls from "./blocks/HpControls";
import HpControlsPopover from "./blocks/HpControlsPopover";
import ConditionsPicker from "./blocks/ConditionsPicker";
import AttackAbilitiesStrip from "./blocks/AttackAbilitiesStrip";
import ParticipantDetailsModal from "./modal/ParticipantDetailsModal";
import VisibilityToggle from "./blocks/VisibilityToggle";
import { InfoIcon, TrashIcon } from "./blocks/icons";

type EncounterParticipantCardProps = {
  participant: EncounterParticipantDTO;
  isActive: boolean;
  isDM: boolean;
  isOwner: boolean;
};

export const EncounterParticipantCard = ({
  participant,
  isActive,
  isDM,
  isOwner,
}: EncounterParticipantCardProps) => {
  const {
    adjustHp,
    grantTempHp,
    toggleCondition,
    setVisibility,
    setAcHidden,
    setShield,
    recordDeathSave,
    removeParticipant,
  } = useParticipantActions();
  const [detailsOpen, setDetailsOpen] = useState(false);

  const fullyHidden = !participant.isVisible && !isDM;
  if (fullyHidden) return null;

  const canEditOwn = isDM || isOwner;
  const isDownedPc = participant.currentHp === 0 && participant.type === "pc";
  const hiddenForDm = !participant.isVisible && isDM;

  return (
    <>
      <li
        className={`relative flex h-full w-[320px] shrink-0 snap-start flex-col gap-2 rounded-md border px-3 py-2.5 transition-colors ${
          isActive
            ? "border-gold bg-gold/5 shadow-[inset_0_0_0_1px_rgba(212,165,116,0.25)]"
            : isDownedPc
              ? "border-rust/45 bg-rust/5 hover:border-rust/70"
              : "border-rule bg-surface/40 hover:border-hover/60"
        } ${hiddenForDm ? "opacity-70" : ""}`}
      >
        {isActive && (
          <span className="absolute -left-2 top-1/2 hidden h-6 w-1 -translate-y-1/2 rounded-full bg-gold sm:block" />
        )}

        <div className="flex items-start gap-2">
          <InitiativeBlock value={participant.sortOrder} isActive={isActive} />
          <ArmorClassBlock
            value={participant.armorClass}
            hidden={participant.acHidden}
            isDM={isDM}
            usesShield={participant.usesShield}
            onToggleHidden={
              isDM
                ? () => setAcHidden(participant.id, !participant.acHidden)
                : undefined
            }
            onToggleShield={
              canEditOwn
                ? () => setShield(participant.id, !participant.usesShield)
                : undefined
            }
          />

          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center gap-1">
              <span
                className={`truncate font-fantasy text-base ${isDownedPc ? "text-rust-soft" : "text-ink"}`}
              >
                {participant.name}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <TypeBadge type={participant.type} />
              {isDM && (
                <VisibilityToggle
                  isVisible={participant.isVisible}
                  onToggle={() =>
                    setVisibility(participant.id, !participant.isVisible)
                  }
                />
              )}
              <button
                type="button"
                onClick={() => setDetailsOpen(true)}
                aria-label={`Open ${participant.name} details`}
                className="flex h-6 w-6 items-center justify-center rounded border border-rule text-faint transition-colors hover:border-hover hover:text-gold"
              >
                <InfoIcon />
              </button>
              {isDM && (
                <button
                  type="button"
                  onClick={() => removeParticipant(participant.id)}
                  aria-label={`Remove ${participant.name}`}
                  className="flex h-6 w-6 items-center justify-center rounded border border-rule text-faint transition-colors hover:border-rust hover:text-rust"
                >
                  <TrashIcon />
                </button>
              )}
            </div>
          </div>
        </div>

        <VitalsSlot
          currentHp={participant.currentHp}
          maxHp={participant.maxHp}
          tempHp={participant.tempHp}
          hidden={!participant.isVisible}
          showDeathSaves={isDownedPc}
          successes={participant.deathSaveSuccesses}
          failures={participant.deathSaveFailures}
          canEdit={canEditOwn}
          onRecordDeathSave={(outcome) => recordDeathSave(participant.id, outcome)}
          trailingSlot={!isDM}
          trailing={
            isOwner ? (
              <HpControlsPopover
                onDamage={(amount) => adjustHp(participant.id, -amount)}
                onHeal={(amount) => adjustHp(participant.id, amount)}
                onTemp={(amount) => grantTempHp(participant.id, amount)}
              />
            ) : null
          }
        />

        {isDM && (
          <HpControls
            onDamage={(amount) => adjustHp(participant.id, -amount)}
            onHeal={(amount) => adjustHp(participant.id, amount)}
            onTemp={(amount) => grantTempHp(participant.id, amount)}
          />
        )}

        {isDM && (
          <AttackAbilitiesStrip
            scores={participant.abilityScores}
            spellAbility={participant.spellAbility}
            proficiencyBonus={participant.proficiencyBonus}
          />
        )}

        <div className="mt-auto">
          <ConditionsPicker
            active={participant.conditions}
            isDM={canEditOwn}
            onToggle={(c) => toggleCondition(participant.id, c)}
          />
        </div>
      </li>

      {detailsOpen && (
        <ParticipantDetailsModal
          participant={participant}
          isDM={isDM}
          isOwner={isOwner}
          onClose={() => setDetailsOpen(false)}
        />
      )}
    </>
  );
};

export default EncounterParticipantCard;
