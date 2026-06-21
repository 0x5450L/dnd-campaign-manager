import type {
  EncounterParticipantDTO,
  ParticipantAbilityScore,
} from "../../../../../../types/encounter";
import { calcModifier, formatSigned, SPELL_SAVE_DC_BASE } from "../../../../../../utils/dndMath";
import {
  applyDamage,
  applyHealing,
  applyTempHp,
  incrementDeathSave,
  toggleConditionInList,
} from "../../../../../../utils/encounterParticipant";
import ArmorClassBlock from "../blocks/ArmorClassBlock";
import ConditionsPicker from "../blocks/ConditionsPicker";
import DeathSavesBlock from "../blocks/DeathSavesBlock";
import HpBar from "../blocks/HpBar";
import HpControls from "../blocks/HpControls";
import InitiativeBlock from "../blocks/InitiativeBlock";
import AbilityScoresStrip from "./AbilityScoresStrip";
import AttacksBlock from "./AttacksBlock";
import SpellAbilitySelect from "./SpellAbilitySelect";
import { SpellSlotsTracker } from "../../../../../spells/SpellSlotsTracker";
import StatInput from "./StatInput";

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

type ParticipantEditorBodyProps = {
  draft: EncounterParticipantDTO;
  updateDraft: (fields: Partial<EncounterParticipantDTO>) => void;
  canEditOwn: boolean;
  canManage: boolean;
};

export const ParticipantEditorBody = ({
  draft,
  updateDraft,
  canEditOwn,
  canManage,
}: ParticipantEditorBodyProps) => {
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
    <>
      <div className="flex flex-wrap items-stretch gap-2.5">
        <InitiativeBlock
          value={draft.sortOrder}
          isActive={false}
          size="lg"
          onChange={canEditOwn ? (sortOrder) => updateDraft({ sortOrder }) : undefined}
        />
        <ArmorClassBlock
          value={draft.armorClass}
          hidden={draft.acHidden}
          isDM={canManage}
          size="lg"
          onChange={canEditOwn ? (armorClass) => updateDraft({ armorClass }) : undefined}
          onToggleHidden={canManage ? () => updateDraft({ acHidden: !draft.acHidden }) : undefined}
        />
        <StatInput
          label="Cur"
          value={draft.currentHp}
          editable={canEditOwn}
          onCommit={(currentHp) => updateDraft({ currentHp })}
          min={0}
        />
        <StatInput
          label="Max"
          value={draft.maxHp}
          editable={canEditOwn}
          onCommit={(maxHp) => updateDraft({ maxHp })}
          min={1}
        />
        <StatInput
          label="Tmp"
          value={draft.tempHp}
          editable={canEditOwn}
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

      {canEditOwn && (
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
          editable={canEditOwn}
          onScoreChange={(name, score) =>
            updateDraft({ abilityScores: setScore(draft.abilityScores, name, score) })
          }
        />
      </div>

      <div className="flex flex-wrap items-stretch gap-2.5">
        <SpellAbilitySelect
          value={draft.spellAbility}
          editable={canEditOwn}
          onChange={(spellAbility) => updateDraft({ spellAbility })}
        />
        <StatInput
          label="Prof"
          value={draft.proficiencyBonus ?? 0}
          editable={canEditOwn}
          onCommit={(proficiencyBonus) => updateDraft({ proficiencyBonus })}
          min={0}
        />
        {spellDerived && (
          <div className="flex h-16 sm:h-20 min-w-36 grow-[2] basis-0 flex-col items-center justify-center gap-1 sm:gap-1.5 rounded-md border border-rule bg-bg/60 font-fantasy">
            <span className="text-sm sm:text-base leading-none text-dim">
              Save DC <span className="font-bold text-ink">{spellDerived.dc}</span>
            </span>
            <span className="text-sm sm:text-base leading-none text-dim">
              Spell atk{" "}
              <span className="font-bold text-ink">{formatSigned(spellDerived.attack)}</span>
            </span>
          </div>
        )}
      </div>

      <SpellSlotsTracker
        slots={draft.spellSlots ?? null}
        editable={canEditOwn}
        onChange={(spellSlots) => updateDraft({ spellSlots })}
      />

      <AttacksBlock
        attacks={draft.attacks}
        editable={canEditOwn}
        onChange={(attacks) => updateDraft({ attacks })}
      />

      {draft.type === "pc" && (
        <div className="flex flex-col gap-1">
          <DeathSavesBlock
            successes={draft.deathSaveSuccesses}
            failures={draft.deathSaveFailures}
            canEdit={canEditOwn}
            onRecord={(outcome) => updateDraft(incrementDeathSave(draft, outcome))}
          />
          {canEditOwn && (
            <button
              type="button"
              onClick={() => updateDraft({ deathSaveSuccesses: 0, deathSaveFailures: 0 })}
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
          isDM={canEditOwn}
          onToggle={(condition) =>
            updateDraft({ conditions: toggleConditionInList(draft.conditions, condition) })
          }
        />
      </div>
    </>
  );
};

export default ParticipantEditorBody;
