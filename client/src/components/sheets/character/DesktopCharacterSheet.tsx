import {
  getAbilityModifier,
  getInitiative,
  getPassivePerception,
  getSaveValue,
  getSheetProficiencyBonus,
  getSkillsForAbility,
  useCharacterSheetState,
  useSheetActions,
} from "../../../state/sheet";
import type { AbilityName } from "../../../types/characters/characterSheet";
import { CharacterLore } from "./sections/CharacterLore";
import { ArmorClass } from "../shared/sections/ArmorClass";
import { HitPoints } from "../shared/sections/HitPoints";
import { HitDice } from "./sections/HitDice";
import { DeathSaves } from "./sections/DeathSaves";
import { AbilityScore } from "../shared/sections/AbilityScore";
import { CombatStats } from "../shared/sections/CombatStats";
import { ClassFeatures } from "./sections/ClassFeatures";
import { AttacksTable } from "../shared/sections/AttacksTable";
import { SpellSlots } from "./sections/SpellSlots";
import { TextBlock } from "../shared/inputs/TextBlock";
import { SheetDetails } from "../shared/sections/SheetDetails";
import { Proficiencies } from "./sections/Proficiencies";

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
  const state = useCharacterSheetState();
  const {
    setSharedField,
    setCharacterField,
    setAbilityScore,
    setSaveProficient,
    setSkillProficient,
    toggleInspiration,
    addAttack,
    updateAttack,
    removeAttack,
  } = useSheetActions();

  const onProficienciesUpdate = (field: string, value: string) => {
    switch (field) {
      case "armorProficiencies":
        setCharacterField("armorProficiencies", value);
        break;
      case "weaponProficiencies":
        setCharacterField("weaponProficiencies", value);
        break;
      case "toolProficiencies":
        setCharacterField("toolProficiencies", value);
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
        </div>

        <div className="contents lg:flex lg:flex-col lg:gap-3">
          <div className="flex flex-col gap-3 order-3 sm:flex-row sm:items-stretch lg:order-0">
            <CombatStats
              ac={state.ac}
              initiative={getInitiative(state)}
              speed={state.speed}
              size={state.size}
              proficiencyBonus={getSheetProficiencyBonus(state)}
              passivePerception={getPassivePerception(state)}
              hasInspiration={state.inspiration}
              onUpdate={(field, value) => {
                if (field === "speed") setSharedField("speed", value as number);
                else if (field === "size") setSharedField("size", value as string);
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
              onChange={(updatedRacialTraisValue) => setCharacterField("racialTraits", updatedRacialTraisValue)}
            />
            <TextBlock
              title="Feats"
              value={state.feats}
              onChange={(updatedFeatsValue) => setCharacterField("feats", updatedFeatsValue)}
            />
          </div>

          <div className="order-8 lg:order-0">
            <SheetDetails title="Details" />
          </div>

          <div className="order-9 lg:order-0">
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
