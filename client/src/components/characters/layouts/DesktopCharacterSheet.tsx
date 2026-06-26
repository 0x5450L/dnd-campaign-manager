import { useCharacterSheet } from "../../../hooks/useCharacterSheet";
import type { AbilityName } from "../../../types/characters/characterSheet";
import { CharacterLore } from "../blocks/CharacterLore";
import { ArmorClass } from "../blocks/ArmorClass";
import { HitPoints } from "../blocks/HitPoints";
import { HitDice } from "../blocks/HitDice";
import { DeathSaves } from "../blocks/DeathSaves";
import { AbilityScore } from "../blocks/AbilityScore";
import { CombatStats } from "../blocks/CombatStats";
import { ClassFeatures } from "../blocks/ClassFeatures";
import { AttacksTable } from "../blocks/AttacksTable";
import { SpellSlots } from "../blocks/SpellSlots";
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

  const onProficienciesUpdate = (field: string, value: string) => {
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
  };

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
                  onScoreChange={(updatedAbilityScore) => setAbilityScore(ability, updatedAbilityScore)}
                  onSaveProfChange={(updatedAbilityProficient) => setSaveProficient(ability, updatedAbilityProficient)}
                  onSkillProfChange={setSkillProficient}
                />
              ))}
            </div>
          </div>

          <div className="order-6 lg:order-0">
            <TextBlock title="Notes" value={state.notes} onChange={(updatedNotes) => setField("notes", updatedNotes)} />
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
            <AttacksTable attacks={state.attacks} onUpdate={updateAttack} onAdd={addAttack} onRemove={removeAttack} />
          </div>

          <div className="order-4 lg:order-0">
            <SpellSlots />
          </div>

          <div className="grid grid-cols-1 gap-3 order-7 sm:grid-cols-2 lg:order-0">
            <TextBlock
              title="Racial Traits"
              value={state.racialTraits}
              onChange={(updatedRacialTraisValue) => setField("racialTraits", updatedRacialTraisValue)}
            />
            <TextBlock
              title="Feats"
              value={state.feats}
              onChange={(updatedFeatsValue) => setField("feats", updatedFeatsValue)}
            />
          </div>

          <div className="order-8 lg:order-0">
            <Proficiencies
              armorProficiencies={state.armorProficiencies}
              weaponProficiencies={state.weaponProficiencies}
              toolProficiencies={state.toolProficiencies}
              onUpdate={onProficienciesUpdate}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
