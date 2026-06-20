import { useEffect, useState } from "react";
import { useLiveSession } from "../../../../../../context/liveSessionContext/useLiveSession";
import type {
  EncounterParticipantDTO,
  ParticipantAbilityScore,
} from "../../../../../../types/encounter";
import { calcModifier, formatSigned, SPELL_SAVE_DC_BASE } from "../../../../../../utils/dndMath";
import {
  applyDamage,
  applyHealing,
  applyTempHp,
  diffParticipant,
  incrementDeathSave,
  toggleConditionInList,
} from "../../../../../../utils/encounterParticipant";
import ArmorClassBlock from "../blocks/ArmorClassBlock";
import ConditionsPicker from "../blocks/ConditionsPicker";
import DeathSavesBlock from "../blocks/DeathSavesBlock";
import HpBar from "../blocks/HpBar";
import HpControls from "../blocks/HpControls";
import InitiativeBlock from "../blocks/InitiativeBlock";
import TypeBadge from "../blocks/TypeBadge";
import VisibilityToggle from "../blocks/VisibilityToggle";
import { CheckIcon, CloseIcon } from "../blocks/icons";
import AbilityScoresStrip from "./AbilityScoresStrip";
import AttacksBlock from "./AttacksBlock";
import EditableText from "./EditableText";
import SpellAbilitySelect from "./SpellAbilitySelect";
import SpellSlotsBlock from "./SpellSlotsBlock";
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
  const { updateParticipant } = useLiveSession();

  const [savedParticipant, setSavedParticipant] = useState(participant);
  const [draft, setDraft] = useState(participant);

  const updateDraft = (fields: Partial<EncounterParticipantDTO>) =>
    setDraft((current) => ({ ...current, ...fields }));

  const pendingPatch = diffParticipant(savedParticipant, draft);
  const hasUnsavedChanges = Object.keys(pendingPatch).length > 0;

  const commitChanges = () => {
    if (!hasUnsavedChanges) return;
    updateParticipant(participant.id, pendingPatch);
    setSavedParticipant(draft);
  };

  const saveAndClose = () => {
    if (hasUnsavedChanges) updateParticipant(participant.id, pendingPatch);
    onClose();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") saveAndClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  const spellScore = draft.spellAbility
    ? draft.abilityScores?.find((s) => s.name === draft.spellAbility)?.score
    : undefined;
  const spellMod = typeof spellScore === "number" ? calcModifier(spellScore) : null;
  const spellDerived =
    spellMod !== null && draft.proficiencyBonus !== null
      ? {
          dc: SPELL_SAVE_DC_BASE + draft.proficiencyBonus + spellMod,
          attack: draft.proficiencyBonus + spellMod,
        }
      : null;

  const hasDeathSaves = draft.deathSaveSuccesses > 0 || draft.deathSaveFailures > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={saveAndClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="custom-scrollbar relative flex max-h-[85vh] w-full max-w-xl flex-col gap-4 overflow-y-auto rounded-md border border-rule bg-surface p-4 shadow-xl sm:p-5"
      >
        <div className="flex items-center justify-between gap-3">
          <EditableText
            value={draft.name}
            editable={isDM}
            onCommit={(name) => updateDraft({ name })}
            ariaLabel="Participant name"
            className={`w-full truncate font-fantasy text-xl sm:text-2xl font-bold text-gold-bright ${
              isDM
                ? "rounded border-b border-transparent focus:border-rule"
                : ""
            }`}
          />
          <div className="flex shrink-0 items-center gap-2">
            <TypeBadge type={draft.type} />
            {isDM && (
              <VisibilityToggle
                isVisible={draft.isVisible}
                onToggle={() => updateDraft({ isVisible: !draft.isVisible })}
              />
            )}
            {isDM && hasUnsavedChanges && (
              <button
                type="button"
                onClick={commitChanges}
                aria-label="Save changes"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-leaf/70 bg-leaf/15 text-leaf-soft transition-colors hover:bg-leaf/25 hover:brightness-110"
              >
                <CheckIcon />
              </button>
            )}
            <button
              type="button"
              onClick={saveAndClose}
              aria-label="Close"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-rule text-faint transition-colors hover:border-hover hover:text-ink"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-stretch gap-2.5">
          <InitiativeBlock
            value={draft.sortOrder}
            isActive={false}
            size="lg"
            onChange={isDM ? (sortOrder) => updateDraft({ sortOrder }) : undefined}
          />
          <ArmorClassBlock
            value={draft.armorClass}
            hidden={draft.acHidden}
            isDM={isDM}
            size="lg"
            onChange={isDM ? (armorClass) => updateDraft({ armorClass }) : undefined}
            onToggleHidden={isDM ? () => updateDraft({ acHidden: !draft.acHidden }) : undefined}
          />
          <StatInput
            label="Cur"
            value={draft.currentHp}
            editable={isDM}
            onCommit={(currentHp) => updateDraft({ currentHp })}
            min={0}
          />
          <StatInput
            label="Max"
            value={draft.maxHp}
            editable={isDM}
            onCommit={(maxHp) => updateDraft({ maxHp })}
            min={1}
          />
          <StatInput
            label="Tmp"
            value={draft.tempHp}
            editable={isDM}
            onCommit={(tempHp) => updateDraft({ tempHp })}
            min={0}
          />
        </div>

        <HpBar
          currentHp={draft.currentHp}
          maxHp={draft.maxHp}
          tempHp={draft.tempHp}
          hidden={false}
        />

        {isDM && (
          <HpControls
            size="lg"
            onDamage={(amount) => updateDraft(applyDamage(draft, amount))}
            onHeal={(amount) => updateDraft(applyHealing(draft, amount))}
            onTemp={(amount) => updateDraft(applyTempHp(draft, amount))}
          />
        )}

        <div className="flex flex-col gap-1.5">
          <span className="text-xs sm:text-sm uppercase tracking-[0.18em] text-faint">
            Ability scores
          </span>
          <AbilityScoresStrip
            scores={draft.abilityScores}
            editable={isDM}
            onScoreChange={(name, score) =>
              updateDraft({ abilityScores: setScore(draft.abilityScores, name, score) })
            }
          />
        </div>

        <div className="flex flex-wrap items-stretch gap-2.5">
          <SpellAbilitySelect
            value={draft.spellAbility}
            editable={isDM}
            onChange={(spellAbility) => updateDraft({ spellAbility })}
          />
          <StatInput
            label="Prof"
            value={draft.proficiencyBonus ?? 0}
            editable={isDM}
            onCommit={(proficiencyBonus) => updateDraft({ proficiencyBonus })}
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

        <div className="flex flex-col gap-1.5">
          <span className="text-xs sm:text-sm uppercase tracking-[0.18em] text-faint">
            Spell slots
          </span>
          <SpellSlotsBlock
            slots={draft.spellSlots ?? null}
            editable={isDM}
            onChange={(spellSlots) => updateDraft({ spellSlots })}
          />
        </div>

        <AttacksBlock
          attacks={draft.attacks}
          editable={isDM}
          onChange={(attacks) => updateDraft({ attacks })}
        />

        {draft.type === "pc" && (
          <div className="flex flex-col gap-1">
            <DeathSavesBlock
              successes={draft.deathSaveSuccesses}
              failures={draft.deathSaveFailures}
              canEdit={isDM}
              onRecord={(outcome) => updateDraft(incrementDeathSave(draft, outcome))}
            />
            {isDM && (
              <button
                type="button"
                onClick={() =>
                  updateDraft({ deathSaveSuccesses: 0, deathSaveFailures: 0 })
                }
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
            active={draft.conditions}
            isDM={isDM}
            onToggle={(condition) =>
              updateDraft({ conditions: toggleConditionInList(draft.conditions, condition) })
            }
          />
        </div>
      </div>
    </div>
  );
};

export default ParticipantDetailsModal;
