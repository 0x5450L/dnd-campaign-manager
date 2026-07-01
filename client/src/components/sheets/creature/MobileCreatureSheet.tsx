import { useState } from "react";
import { useCharacterSheet } from "../../../hooks/useCharacterSheet";
import type {
  AbilityName,
  CharacterSheetState,
} from "../../../types/characters/characterSheet";
import { MobileHeader } from "../shared/navigation/MobileHeader";
import { MobileTabBar, type MobileTab } from "../shared/navigation/MobileTabBar";
import { ArmorClass } from "../shared/sections/ArmorClass";
import { HitPoints } from "../shared/sections/HitPoints";
import { CombatStats } from "../shared/sections/CombatStats";
import { AttacksTable } from "../shared/sections/AttacksTable";
import { AbilityScore } from "../shared/sections/AbilityScore";
import { TextBlock } from "../shared/inputs/TextBlock";
import { CreatureHeader } from "./sections/CreatureHeader";

const ABILITY_NAMES: Record<AbilityName, string> = {
  str: "Strength",
  dex: "Dexterity",
  con: "Constitution",
  int: "Intelligence",
  wis: "Wisdom",
  cha: "Charisma",
};

const ALL_ABILITIES: AbilityName[] = ["str", "con", "dex", "int", "wis", "cha"];

type MobileCreatureSheetProps = {
  onClose: () => void;
  onForceSave?: (state: CharacterSheetState) => void;
};

export const MobileCreatureSheet = ({ onClose, onForceSave }: MobileCreatureSheetProps) => {
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
    addAttack,
    updateAttack,
    removeAttack,
  } = useCharacterSheet();

  const [activeTab, setActiveTab] = useState<MobileTab>("combat");

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <MobileHeader onClose={onClose} onForceSave={onForceSave} />

      <div className="flex-1 overflow-y-auto p-3 pb-3 flex flex-col gap-3">
        {activeTab === "combat" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex justify-center"><ArmorClass /></div>
              <HitPoints />
            </div>
            <CombatStats
              ac={state.ac}
              initiative={initiative}
              speed={state.speed}
              size={state.size}
              proficiencyBonus={proficiencyBonus}
              passivePerception={passivePerception}
              showInspiration={false}
              onUpdate={(field, value) => {
                if (field === "speed") setField("speed", value as number);
                else if (field === "size") setField("size", value as string);
              }}
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
            <CreatureHeader />
            <TextBlock
              title="Notes"
              value={state.notes}
              onChange={(v) => setField("notes", v)}
            />
          </>
        )}
      </div>

      <MobileTabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};
