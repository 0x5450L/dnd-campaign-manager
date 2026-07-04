import {
  getAbilityModifier,
  getInitiative,
  getPassivePerception,
  getSaveValue,
  getSheetProficiencyBonus,
  getSkillsForAbility,
  useCreatureSheetState,
  useSheetActions,
} from "../../../state/sheet";
import type { AbilityName } from "../../../types/characters/characterSheet";
import { ArmorClass } from "../shared/sections/ArmorClass";
import { HitPoints } from "../shared/sections/HitPoints";
import { AbilityScore } from "../shared/sections/AbilityScore";
import { CombatStats } from "../shared/sections/CombatStats";
import { AttacksTable } from "../shared/sections/AttacksTable";
import { TextBlock } from "../shared/inputs/TextBlock";
import { CreatureHeader } from "./sections/CreatureHeader";
import { CreatureDetails } from "./sections/CreatureDetails";
import { CreatureTraits } from "./sections/CreatureTraits";

const ABILITY_NAMES: Record<AbilityName, string> = {
  str: "Strength",
  dex: "Dexterity",
  con: "Constitution",
  int: "Intelligence",
  wis: "Wisdom",
  cha: "Charisma",
};

const ALL_ABILITIES: AbilityName[] = ["str", "con", "dex", "int", "wis", "cha"];

export const DesktopCreatureSheet = () => {
  const state = useCreatureSheetState();
  const {
    setSharedField,
    setAbilityScore,
    setSaveProficient,
    setSkillProficient,
    addAttack,
    updateAttack,
    removeAttack,
  } = useSheetActions();

  return (
    <div className="min-h-screen py-4">
      <div className="flex flex-col gap-3 max-w-6xl mx-auto p-4 lg:grid lg:grid-cols-[420px_1fr] lg:grid-rows-[auto_1fr]">
        <CreatureHeader />

        <div className="flex flex-wrap gap-3">
          <ArmorClass />
          <HitPoints />
        </div>

        <div className="contents lg:flex lg:flex-col lg:gap-3">
          <div className="order-5 lg:order-0">
            <div className="grid grid-cols-3 lg:grid-cols-2 gap-3">
              {ALL_ABILITIES.map((ability) => (
                <AbilityScore
                  key={ability}
                  name={ABILITY_NAMES[ability]}
                  score={state.abilities[ability].score}
                  modifier={getAbilityModifier(state, ability)}
                  saveProficient={state.abilities[ability].saveProficient}
                  saveValue={getSaveValue(state, ability)}
                  skills={getSkillsForAbility(state, ability)}
                  onScoreChange={(updatedAbilityScore) => setAbilityScore(ability, updatedAbilityScore)}
                  onSaveProfChange={(updatedAbilityProficient) => setSaveProficient(ability, updatedAbilityProficient)}
                  onSkillProfChange={setSkillProficient}
                />
              ))}
            </div>
          </div>

          <div className="order-6 lg:order-0">
            <TextBlock title="Notes" value={state.notes} onChange={(updatedNotes) => setSharedField("notes", updatedNotes)} />
          </div>

          <div className="order-7 lg:order-0">
            <CreatureDetails />
          </div>
        </div>

        <div className="contents lg:flex lg:flex-col lg:gap-3">
          <div className="order-3 lg:order-0">
            <CombatStats
              ac={state.ac}
              initiative={getInitiative(state)}
              speed={state.speed}
              size={state.size}
              proficiencyBonus={getSheetProficiencyBonus(state)}
              passivePerception={getPassivePerception(state)}
              showInspiration={false}
              onUpdate={(field, value) => {
                if (field === "speed") setSharedField("speed", value as number);
                else if (field === "size") setSharedField("size", value as string);
              }}
            />
          </div>

          <div className="order-4 lg:order-0">
            <AttacksTable attacks={state.attacks} onUpdate={updateAttack} onAdd={addAttack} onRemove={removeAttack} />
          </div>

          <div className="order-8 lg:order-0">
            <CreatureTraits />
          </div>
        </div>
      </div>
    </div>
  );
};
