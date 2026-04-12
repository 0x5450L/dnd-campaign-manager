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
    else if (field === "weaponProficiencies") setField("weaponProficiencies", value);
    else if (field === "toolProficiencies") setField("toolProficiencies", value);
  };

  return (
    <div className="min-h-screen py-4">
      {/* 2×2 grid layout */}
      <div
        className="max-w-6xl mx-auto p-4"
        style={{
          display: "grid",
          gridTemplateColumns: "420px 1fr",
          gridTemplateRows: "auto 1fr",
          gap: "12px",
        }}
      >
        {/* ═══ TOP-LEFT: Character header (name, class, level) ═══ */}
        <CharacterHeader />

        {/* ═══ TOP-RIGHT: AC, HP, Hit Dice, Death Saves ═══ */}
        <div className="flex gap-3">
          <ArmorClass />
          <HitPoints />
          <HitDice />
          <DeathSaves />
        </div>

        {/* ═══ BOTTOM-LEFT: All ability scores ═══ */}
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

        {/* ═══ BOTTOM-RIGHT: Combat stats, attacks, features ═══ */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-3" style={{ alignItems: "stretch" }}>
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
                className="cs-textarea flex-1"
                placeholder="Class Features..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <TextBlock
              title="Racial Traits"
              value={state.racialTraits}
              onChange={(v) => setField("racialTraits", v)}
              minHeight="80px"
            />
            <TextBlock title="Feats" value={state.feats} onChange={(v) => setField("feats", v)} minHeight="80px" />
          </div>

          <AttacksTable attacks={state.attacks} onUpdate={updateAttack} onAdd={addAttack} onRemove={removeAttack} />

          <ProficienciesBlock
            armorProficiencies={state.armorProficiencies}
            weaponProficiencies={state.weaponProficiencies}
            toolProficiencies={state.toolProficiencies}
            onUpdate={handleProficienciesUpdate}
          />
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