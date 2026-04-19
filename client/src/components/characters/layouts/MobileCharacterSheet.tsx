import { useState } from "react";
import { useCharacterSheet } from "../../../context/characterSheetContext/useCharacterSheet";
import type { AbilityName } from "../../../types/characters/characterSheet";
import { MobileHeader } from "./MobileHeader";
import { MobileTabBar, type MobileTab } from "./MobileTabBar";
import { ArmorClass } from "../blocks/ArmorClass";
import { HitPoints } from "../blocks/HitPoints";
import { HitDice } from "../blocks/HitDice";
import { DeathSaves } from "../blocks/DeathSaves";
import { CombatStats } from "../blocks/CombatStats";
import { AttacksTable } from "../blocks/AttacksTable";
import { AbilityScore } from "../blocks/AbilityScore";
import { CharacterLore } from "../blocks/CharacterLore";
import { ClassFeatures } from "../blocks/ClassFeatures";
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

export const MobileCharacterSheet = ({ onClose }: { onClose: () => void }) => {
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

  const [activeTab, setActiveTab] = useState<MobileTab>("combat");

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <MobileHeader onClose={onClose} />

      <div className="flex-1 overflow-y-auto p-3 pb-3 flex flex-col gap-3">
        {activeTab === "combat" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex justify-center"><ArmorClass /></div>
              <HitPoints />
              <HitDice />
              <DeathSaves />
            </div>
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
            <AttacksTable
              attacks={state.attacks}
              onUpdate={updateAttack}
              onAdd={addAttack}
              onRemove={removeAttack}
            />
          </>
        )}

        {activeTab === "stats" && (
          <div className="grid grid-cols-2 gap-3">
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
        )}

        {activeTab === "lore" && (
          <>
            <CharacterLore />
            <ClassFeatures />
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
            <TextBlock
              title="Notes"
              value={state.notes}
              onChange={(v) => setField("notes", v)}
            />
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
          </>
        )}
      </div>

      <MobileTabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};
