import { useState } from "react";
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
import { MobileHeader } from "../shared/navigation/MobileHeader";
import { MobileTabBar, type MobileTab } from "../shared/navigation/MobileTabBar";
import { ArmorClass } from "../shared/sections/ArmorClass";
import { HitPoints } from "../shared/sections/HitPoints";
import { CombatStats } from "../shared/sections/CombatStats";
import { AttacksTable } from "../shared/sections/AttacksTable";
import { AbilityScore } from "../shared/sections/AbilityScore";
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

type MobileCreatureSheetProps = {
  onClose: () => void;
  onForceSave?: () => void;
};

export const MobileCreatureSheet = ({ onClose, onForceSave }: MobileCreatureSheetProps) => {
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
                modifier={getAbilityModifier(state, ability)}
                saveProficient={state.abilities[ability].saveProficient}
                saveValue={getSaveValue(state, ability)}
                skills={getSkillsForAbility(state, ability)}
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
            <CreatureDetails />
            <CreatureTraits />
            <TextBlock
              title="Notes"
              value={state.notes}
              onChange={(v) => setSharedField("notes", v)}
            />
          </>
        )}
      </div>

      <MobileTabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};
