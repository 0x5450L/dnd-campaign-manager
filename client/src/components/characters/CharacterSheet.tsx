import { CharacterSheetProvider } from "../../context/characterSheetContext/CharacterSheetProvider";
import { useCharacterSheet } from "../../context/characterSheetContext/useCharacterSheet";
import type { AbilityName } from "../../context/characterSheetContext/CharacterSheetContext";
import { CharacterHeader } from "./blocks/CharacterHeader";
import { ArmorClass } from "./blocks/ArmorClass";
import { HitPoints } from "./blocks/HitPoints";
import { HitDice } from "./blocks/HitDice";
import { DeathSaves } from "./blocks/DeathSaves";
import { AbilityScoreBlock } from "./blocks/AbilityScoreBlock";
import { CombatStats } from "./blocks/CombatStats";
import { AttacksTable } from "./blocks/AttacksTable";
import { TextBlock } from "./blocks/TextBlock";
import { ProficienciesBlock } from "./blocks/ProficienciesBlock";

const ABILITY_NAMES: Record<AbilityName, string> = {
  str: "Strength",
  dex: "Dexterity",
  con: "Constitution",
  int: "Intelligence",
  wis: "Wisdom",
  cha: "Charisma",
};

const ALL_ABILITIES: AbilityName[] = ["str", "con", "dex", "int", "wis", "cha"];

const CharacterSheetInner = () => {
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

  const handleCombatUpdate = (field: string, value: number | string) => {
    if (field === "speed") setField("speed", value as number);
    else if (field === "size") setField("size", value as string);
  };

  const handleProficienciesUpdate = (field: string, value: string) => {
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
        <CharacterHeader />

        <div className="flex flex-wrap gap-3">
          <ArmorClass />
          <HitPoints />
          <HitDice />
          <DeathSaves />
        </div>


        <div className="contents lg:flex lg:flex-col lg:gap-3">
          <div className="grid grid-cols-3 gap-3 order-5 sm:gap-3 lg:grid-cols-2 lg:order-none">
            {ALL_ABILITIES.map((ability) => (
              <AbilityScoreBlock
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

          <div className="order-6 lg:order-none">
            <TextBlock
              title="Notes"
              value={state.notes}
              onChange={(v) => setField("notes", v)}
            />
          </div>
        </div>

        <div className="contents lg:flex lg:flex-col lg:gap-3">
          <div className="flex flex-col gap-3 order-3 sm:flex-row sm:items-stretch lg:order-none">
            <CombatStats
              ac={state.ac}
              initiative={initiative}
              speed={state.speed}
              size={state.size}
              proficiencyBonus={proficiencyBonus}
              passivePerception={passivePerception}
              hasInspiration={state.inspiration}
              onUpdate={handleCombatUpdate}
              onToggleInspiration={toggleInspiration}
            />

            <div className="cs-section-card p-3 flex flex-col flex-1">
              <div className="cs-section-title">Class Features</div>
              <textarea
                value={state.classFeatures}
                onChange={(e) => setField("classFeatures", e.target.value)}
                className="cs-textarea flex-1 min-h-20"
                placeholder="Class Features..."
              />
            </div>
          </div>

          <div className="order-4 lg:order-none">
            <AttacksTable
              attacks={state.attacks}
              onUpdate={updateAttack}
              onAdd={addAttack}
              onRemove={removeAttack}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 order-7 sm:grid-cols-2 lg:order-none">
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

          <div className="order-8 lg:order-none">
            <ProficienciesBlock
              armorProficiencies={state.armorProficiencies}
              weaponProficiencies={state.weaponProficiencies}
              toolProficiencies={state.toolProficiencies}
              onUpdate={handleProficienciesUpdate}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const CharacterSheet = () => (
  <CharacterSheetProvider>
    <CharacterSheetInner />
  </CharacterSheetProvider>
);
