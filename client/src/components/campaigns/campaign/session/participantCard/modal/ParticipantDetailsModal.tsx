import { useEffect } from "react";
import { useLiveSession } from "../../../../../../context/liveSessionContext/useLiveSession";
import type {
  EncounterParticipantDTO,
  ParticipantAbilityScore,
} from "../../../../../../types/session";
import { calcModifier, formatSigned } from "../../../../../../utils/dndMath";
import ArmorClassBlock from "../blocks/ArmorClassBlock";
import ConditionsPicker from "../blocks/ConditionsPicker";
import DeathSavesBlock from "../blocks/DeathSavesBlock";
import HpBar from "../blocks/HpBar";
import HpControls from "../blocks/HpControls";
import InitiativeBlock from "../blocks/InitiativeBlock";
import TypeBadge from "../blocks/TypeBadge";
import VisibilityToggle from "../blocks/VisibilityToggle";
import { CloseIcon } from "../blocks/icons";
import AbilityScoresStrip from "./AbilityScoresStrip";
import AttacksBlock from "./AttacksBlock";
import EditableText from "./EditableText";
import SpellAbilitySelect from "./SpellAbilitySelect";
import StatInput from "./StatInput";

type ParticipantDetailsModalProps = {
  participant: EncounterParticipantDTO;
  isDM: boolean;
  onClose: () => void;
};

type AbilityName = ParticipantAbilityScore["name"];

const setScore = (
  scores: ParticipantAbilityScore[] | null,
  name: AbilityName,
  score: number,
): ParticipantAbilityScore[] => {
  const base = scores ?? [];
  const exists = base.some((s) => s.name === name);
  return exists
    ? base.map((s) => (s.name === name ? { ...s, score } : s))
    : [...base, { name, score }];
};

export const ParticipantDetailsModal = ({
  participant,
  isDM,
  onClose,
}: ParticipantDetailsModalProps) => {
  const {
    adjustHp,
    grantTempHp,
    toggleCondition,
    setVisibility,
    setAcHidden,
    recordDeathSave,
    resetDeathSaves,
    updateParticipant,
  } = useLiveSession();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const patch = (fields: Parameters<typeof updateParticipant>[1]) =>
    updateParticipant(participant.id, fields);

  const spellScore = participant.spellAbility
    ? participant.abilityScores?.find((s) => s.name === participant.spellAbility)
        ?.score
    : undefined;
  const spellMod =
    typeof spellScore === "number" ? calcModifier(spellScore) : null;
  const spellDerived =
    spellMod !== null && participant.proficiencyBonus !== null
      ? {
          dc: 8 + participant.proficiencyBonus + spellMod,
          attack: participant.proficiencyBonus + spellMod,
        }
      : null;

  const hasDeathSaves =
    participant.deathSaveSuccesses > 0 || participant.deathSaveFailures > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="custom-scrollbar relative flex max-h-[85vh] w-full max-w-xl flex-col gap-4 overflow-y-auto rounded-md border border-rule bg-surface p-4 shadow-xl sm:p-5"
      >
        <div className="flex items-center justify-between gap-3">
          <EditableText
            value={participant.name}
            editable={isDM}
            onCommit={(name) => patch({ name })}
            ariaLabel="Participant name"
            className={`w-full truncate font-fantasy text-xl sm:text-2xl font-bold text-gold-bright ${
              isDM
                ? "rounded border-b border-transparent focus:border-rule"
                : ""
            }`}
          />
          <div className="flex shrink-0 items-center gap-2">
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
              onClick={onClose}
              aria-label="Close"
              className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded border border-rule text-faint transition-colors hover:border-hover hover:text-ink"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-stretch gap-2.5">
          <InitiativeBlock
            value={participant.sortOrder}
            isActive={false}
            size="lg"
            onChange={isDM ? (sortOrder) => patch({ sortOrder }) : undefined}
          />
          <ArmorClassBlock
            value={participant.armorClass}
            hidden={participant.acHidden}
            isDM={isDM}
            size="lg"
            onChange={isDM ? (armorClass) => patch({ armorClass }) : undefined}
            onToggleHidden={
              isDM
                ? () => setAcHidden(participant.id, !participant.acHidden)
                : undefined
            }
          />
          <StatInput
            label="Cur"
            value={participant.currentHp}
            editable={isDM}
            onCommit={(currentHp) => patch({ currentHp })}
            min={0}
          />
          <StatInput
            label="Max"
            value={participant.maxHp}
            editable={isDM}
            onCommit={(maxHp) => patch({ maxHp })}
            min={1}
          />
          <StatInput
            label="Tmp"
            value={participant.tempHp}
            editable={isDM}
            onCommit={(tempHp) => patch({ tempHp })}
            min={0}
          />
        </div>

        <HpBar
          currentHp={participant.currentHp}
          maxHp={participant.maxHp}
          tempHp={participant.tempHp}
          hidden={false}
        />

        {isDM && (
          <HpControls
            size="lg"
            onDamage={(amount) => adjustHp(participant.id, -amount)}
            onHeal={(amount) => adjustHp(participant.id, amount)}
            onTemp={(amount) => grantTempHp(participant.id, amount)}
          />
        )}

        <div className="flex flex-col gap-1.5">
          <span className="text-xs sm:text-sm uppercase tracking-[0.18em] text-faint">
            Ability scores
          </span>
          <AbilityScoresStrip
            scores={participant.abilityScores}
            editable={isDM}
            onScoreChange={(name, score) =>
              patch({
                abilityScores: setScore(participant.abilityScores, name, score),
              })
            }
          />
        </div>

        <div className="flex flex-wrap items-stretch gap-2.5">
          <SpellAbilitySelect
            value={participant.spellAbility}
            editable={isDM}
            onChange={(spellAbility) => patch({ spellAbility })}
          />
          <StatInput
            label="Prof"
            value={participant.proficiencyBonus ?? 0}
            editable={isDM}
            onCommit={(proficiencyBonus) => patch({ proficiencyBonus })}
            min={0}
          />
          {spellDerived && (
            <div className="flex h-16 sm:h-20 min-w-36 grow-[2] basis-0 flex-col items-center justify-center gap-1 sm:gap-1.5 rounded-md border border-rule bg-bg/60 font-fantasy">
              <span className="text-sm sm:text-base leading-none text-dim">
                Save DC{" "}
                <span className="font-bold text-ink">{spellDerived.dc}</span>
              </span>
              <span className="text-sm sm:text-base leading-none text-dim">
                Spell atk{" "}
                <span className="font-bold text-ink">
                  {formatSigned(spellDerived.attack)}
                </span>
              </span>
            </div>
          )}
        </div>

        <AttacksBlock
          attacks={participant.attacks}
          editable={isDM}
          onChange={(attacks) => patch({ attacks })}
        />

        {participant.type === "pc" && (
          <div className="flex flex-col gap-1">
            <DeathSavesBlock
              successes={participant.deathSaveSuccesses}
              failures={participant.deathSaveFailures}
              canEdit={isDM}
              onRecord={(outcome) => recordDeathSave(participant.id, outcome)}
            />
            {isDM && (
              <button
                type="button"
                onClick={() => resetDeathSaves(participant.id)}
                disabled={!hasDeathSaves}
                className="self-end text-xs sm:text-sm uppercase tracking-widest text-faint transition-colors hover:text-ink disabled:opacity-40"
              >
                Reset saves
              </button>
            )}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <span className="text-xs sm:text-sm uppercase tracking-[0.18em] text-faint">
            Conditions
          </span>
          <ConditionsPicker
            active={participant.conditions}
            isDM={isDM}
            onToggle={(c) => toggleCondition(participant.id, c)}
          />
        </div>
      </div>
    </div>
  );
};

export default ParticipantDetailsModal;
