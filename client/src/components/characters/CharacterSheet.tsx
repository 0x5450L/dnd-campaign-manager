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

const leftAbilities: AbilityName[] = ["str", "dex", "con"];
const centerAbilities: AbilityName[] = ["int", "wis", "cha"];

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
    if (field === "armorProficiencies") setField("armorProficiencies", value);
    else if (field === "weaponProficiencies")
      setField("weaponProficiencies", value);
    else if (field === "toolProficiencies") setField("toolProficiencies", value);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* 2-column layout */}
      <div className="flex gap-3">
        {/* ═══ LEFT COLUMN: lore + abilities ═══ */}
        <div className="flex flex-col gap-3" style={{ flex: "0 0 420px" }}>
          {/* Lore header (name, class, level, etc.) */}
          <CharacterHeader />

          {/* Abilities in 2 sub-columns */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-3 flex-1">
              {leftAbilities.map((ability) => (
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

            <div className="flex flex-col gap-3 flex-1">
              {centerAbilities.map((ability) => (
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
          </div>
        </div>

        {/* ═══ RIGHT COLUMN: header stats + combat + attacks + features ═══ */}
        <div className="flex flex-col gap-3 flex-1">
          {/* AC, HP, Hit Dice, Death Saves */}
          <div className="flex gap-3">
            <ArmorClass />
            <HitPoints />
            <HitDice />
            <DeathSaves />
          </div>

          {/* Combat stats */}
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

          <AttacksTable
            attacks={state.attacks}
            onUpdate={updateAttack}
            onAdd={addAttack}
            onRemove={removeAttack}
          />

          <TextBlock
            title="Class Features"
            value={state.classFeatures}
            onChange={(v) => setField("classFeatures", v)}
          />

          <div className="grid grid-cols-2 gap-3">
            <TextBlock
              title="Racial Traits"
              value={state.racialTraits}
              onChange={(v) => setField("racialTraits", v)}
              minHeight="80px"
            />
            <TextBlock
              title="Feats"
              value={state.feats}
              onChange={(v) => setField("feats", v)}
              minHeight="80px"
            />
          </div>
        </div>
      </div>

      {/* Bottom — Proficiencies */}
      <div className="mt-3">
        <ProficienciesBlock
          armorProficiencies={state.armorProficiencies}
          weaponProficiencies={state.weaponProficiencies}
          toolProficiencies={state.toolProficiencies}
          onUpdate={handleProficienciesUpdate}
        />
      </div>
    </div>
  );
};

export const CharacterSheet = () => (
  <CharacterSheetProvider>
    <CharacterSheetInner />
  </CharacterSheetProvider>
);
