import { useCharacterSheet } from "../../../context/characterSheetContext/useCharacterSheet";
import type { AbilityName } from "../../../context/characterSheetContext/CharacterSheetContext";
import { CharacterLore } from "../blocks/CharacterLore";
import { ArmorClass } from "../blocks/ArmorClass";
import { HitPoints } from "../blocks/HitPoints";
import { HitDice } from "../blocks/HitDice";
import { DeathSaves } from "../blocks/DeathSaves";
import { AbilityScore } from "../blocks/AbilityScore";
import { CombatStats } from "../blocks/CombatStats";
import { ClassFeatures } from "../blocks/ClassFeatures";
import { AttacksTable } from "../blocks/AttacksTable";
import { TextBlock } from "../inputs/TextBlock";
import { Proficiencies } from "../blocks/Proficiencies";

const ABILITY_NAMES: Record<AbilityName, string> = {
  str: "Strength",
  dex: "Dexterity",
  con: "Constitution",
  int: "Intelligence",
  wis: "Wisdom",
  cha: "Charisma",
};

const ALL_ABILITIES: AbilityName[] = ["str", "con", "dex", "int", "wis", "cha"];

export const DesktopCharacterSheet = () => {
  const {
    state,
    proficiencyBonus,
    getModifier,
    getSaveValue,
    getSkillsForAbility,
    initiative,
    passivePerception,
    setField,
    setAbilityScore,
    setSaveProficient,
    setSkillProficient,
    toggleInspiration,
    addAttack,
    updateAttack,
    removeAttack,
  } = useCharacterSheet();

  return (
    <div className="min-h-screen py-4">
      <div className="flex flex-col gap-3 max-w-6xl mx-auto p-4 lg:grid lg:grid-cols-[420px_1fr] lg:grid-rows-[auto_1fr]">
        <CharacterLore />

        <div className="flex flex-wrap gap-3">
          <ArmorClass />
          <HitPoints />
          <HitDice />
          <DeathSaves />
        </div>

        <div className="contents lg:flex lg:flex-col lg:gap-3">
          <div className="order-5 lg:order-0">
            <div className="grid grid-cols-3 lg:grid-cols-2 gap-3">
              {ALL_ABILITIES.map((ability) => (
                <AbilityScore
                  key={ability}
                  name={ABILITY_NAMES[ability]}
                  score={state.abilities[ability].score}
                  modifier={getModifier(ability)}
                  saveProficient={state.abilities[ability].saveProficient}
                  saveValue={getSaveValue(ability)}
                  skills={getSkillsForAbility(ability)}
                  onScoreChange={(v) => setAbilityScore(ability, v)}
                  onSaveProfChange={(v) => setSaveProficient(ability, v)}
                  onSkillProfChange={setSkillProficient}
                />
              ))}
            </div>
          </div>

          <div className="order-6 lg:order-0">
            <TextBlock
              title="Notes"
              value={state.notes}
              onChange={(v) => setField("notes", v)}
            />
          </div>
        </div>

        <div className="contents lg:flex lg:flex-col lg:gap-3">
          <div className="flex flex-col gap-3 order-3 sm:flex-row sm:items-stretch lg:order-0">
            <CombatStats
              ac={state.ac}
              initiative={initiative}
              speed={state.speed}
              size={state.size}
              proficiencyBonus={proficiencyBonus}
              passivePerception={passivePerception}
              hasInspiration={state.inspiration}
              onUpdate={(field, value) => {
                if (field === "speed") setField("speed", value as number);
                else if (field === "size") setField("size", value as string);
              }}
              onToggleInspiration={toggleInspiration}
            />
            <ClassFeatures />
          </div>

          <div className="order-4 lg:order-0">
            <AttacksTable
              attacks={state.attacks}
              onUpdate={updateAttack}
              onAdd={addAttack}
              onRemove={removeAttack}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 order-7 sm:grid-cols-2 lg:order-0">
            <TextBlock
              title="Racial Traits"
              value={state.racialTraits}
              onChange={(v) => setField("racialTraits", v)}
            />
            <TextBlock
              title="Feats"
              value={state.feats}
              onChange={(v) => setField("feats", v)}
            />
          </div>

          <div className="order-8 lg:order-0">
            <Proficiencies
              armorProficiencies={state.armorProficiencies}
              weaponProficiencies={state.weaponProficiencies}
              toolProficiencies={state.toolProficiencies}
              onUpdate={(field, value) => {
                switch (field) {
                  case "armorProficiencies":
                    setField("armorProficiencies", value);
                    break;
                  case "weaponProficiencies":
                    setField("weaponProficiencies", value);
                    break;
                  case "toolProficiencies":
                    setField("toolProficiencies", value);
                    break;
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
