import { useState } from "react";
import { CharacterHeader } from "./blocks/CharacterHeader";
import { AbilityScoreBlock } from "./blocks/AbilityScoreBlock";
import { CombatStats } from "./blocks/CombatStats";
import { Inspiration } from "./blocks/Inspiration";
import { AttacksTable } from "./blocks/AttacksTable";
import { TextBlock } from "./blocks/TextBlock";
import { ProficienciesBlock } from "./blocks/ProficienciesBlock";

type AbilityName = "str" | "dex" | "con" | "int" | "wis" | "cha";

type AbilityState = {
  score: number;
  saveProficient: boolean;
};

type SkillDef = {
  name: string;
  ability: AbilityName;
  proficient: boolean;
};

type Attack = {
  id: string;
  name: string;
  attackBonus: string;
  damage: string;
  notes: string;
};

const ABILITY_NAMES: Record<AbilityName, string> = {
  str: "Strength",
  dex: "Dexterity",
  con: "Constitution",
  int: "Intelligence",
  wis: "Wisdom",
  cha: "Charisma",
};

const DEFAULT_SKILLS: SkillDef[] = [
  { name: "Athletics", ability: "str", proficient: false },
  { name: "Acrobatics", ability: "dex", proficient: false },
  { name: "Sleight of Hand", ability: "dex", proficient: false },
  { name: "Stealth", ability: "dex", proficient: false },
  { name: "Arcana", ability: "int", proficient: false },
  { name: "History", ability: "int", proficient: false },
  { name: "Investigation", ability: "int", proficient: false },
  { name: "Nature", ability: "int", proficient: false },
  { name: "Religion", ability: "int", proficient: false },
  { name: "Animal Handling", ability: "wis", proficient: false },
  { name: "Insight", ability: "wis", proficient: false },
  { name: "Medicine", ability: "wis", proficient: false },
  { name: "Perception", ability: "wis", proficient: false },
  { name: "Survival", ability: "wis", proficient: false },
  { name: "Deception", ability: "cha", proficient: false },
  { name: "Intimidation", ability: "cha", proficient: false },
  { name: "Performance", ability: "cha", proficient: false },
  { name: "Persuasion", ability: "cha", proficient: false },
];

const calcModifier = (score: number) => Math.floor((score - 10) / 2);

export const CharacterSheet = () => {
  // Header
  const [name, setName] = useState("New Character");
  const [race, setRace] = useState("");
  const [characterClass, setCharacterClass] = useState("");
  const [level, setLevel] = useState(1);
  const [background, setBackground] = useState("");
  const [subclass, setSubclass] = useState("");
  const [xp, setXp] = useState(0);

  // Abilities
  const [abilities, setAbilities] = useState<Record<AbilityName, AbilityState>>({
    str: { score: 10, saveProficient: false },
    dex: { score: 10, saveProficient: false },
    con: { score: 10, saveProficient: false },
    int: { score: 10, saveProficient: false },
    wis: { score: 10, saveProficient: false },
    cha: { score: 10, saveProficient: false },
  });

  // Skills
  const [skills, setSkills] = useState<SkillDef[]>(DEFAULT_SKILLS);

  // Combat
  const [ac, setAc] = useState(10);
  const [speed, setSpeed] = useState(30);
  const [size, setSize] = useState("Medium");
  const [currentHp, setCurrentHp] = useState(10);
  const [maxHp, setMaxHp] = useState(10);
  const [tempHp, setTempHp] = useState(0);
  const [hitDiceType, setHitDiceType] = useState("d8");
  const [hpSpent, setHpSpent] = useState(0);
  const [deathSaveSuccesses, setDeathSaveSuccesses] = useState(0);
  const [deathSaveFailures, setDeathSaveFailures] = useState(0);
  const [inspiration, setInspiration] = useState(false);
  const [usesShield, setUsesShield] = useState(false);

  // Attacks
  const [attacks, setAttacks] = useState<Attack[]>([]);

  // Text blocks
  const [classFeatures, setClassFeatures] = useState("");
  const [racialTraits, setRacialTraits] = useState("");
  const [feats, setFeats] = useState("");

  // Proficiencies
  const [armorProficiencies, setArmorProficiencies] = useState("");
  const [weaponProficiencies, setWeaponProficiencies] = useState("");
  const [toolProficiencies, setToolProficiencies] = useState("");

  // Derived values
  const proficiencyBonus = Math.ceil(level / 4) + 1;

  const getModifier = (ability: AbilityName) => calcModifier(abilities[ability].score);

  const getSaveValue = (ability: AbilityName) => {
    const mod = getModifier(ability);
    return abilities[ability].saveProficient ? mod + proficiencyBonus : mod;
  };

  const getSkillValue = (skill: SkillDef) => {
    const mod = getModifier(skill.ability);
    return skill.proficient ? mod + proficiencyBonus : mod;
  };

  const initiative = getModifier("dex");
  const passivePerception = 10 + getSkillValue(skills.find((s) => s.name === "Perception")!);

  const getSkillsForAbility = (ability: AbilityName) =>
    skills
      .filter((s) => s.ability === ability)
      .map((s) => ({ name: s.name, proficient: s.proficient, value: getSkillValue(s) }));

  // Header update handler
  const handleHeaderUpdate = (field: string, value: string | number) => {
    switch (field) {
      case "name": setName(value as string); break;
      case "race": setRace(value as string); break;
      case "characterClass": setCharacterClass(value as string); break;
      case "level": setLevel(value as number); break;
      case "background": setBackground(value as string); break;
      case "subclass": setSubclass(value as string); break;
      case "xp": setXp(value as number); break;
      case "ac": setAc(value as number); break;
      case "currentHp": setCurrentHp(value as number); break;
      case "maxHp": setMaxHp(value as number); break;
      case "tempHp": setTempHp(value as number); break;
      case "hpSpent": setHpSpent(value as number); break;
      case "hitDiceType": setHitDiceType(value as string); break;
      case "deathSaveSuccesses": setDeathSaveSuccesses(value as number); break;
      case "deathSaveFailures": setDeathSaveFailures(value as number); break;
    }
  };

  // Combat update handler
  const handleCombatUpdate = (field: string, value: number | string) => {
    switch (field) {
      case "speed": setSpeed(value as number); break;
      case "size": setSize(value as string); break;
    }
  };

  // Attacks handlers
  const handleAttackUpdate = (id: string, field: keyof Attack, value: string) => {
    setAttacks((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  };
  const handleAddAttack = () => {
    setAttacks((prev) => [...prev, { id: crypto.randomUUID(), name: "", attackBonus: "", damage: "", notes: "" }]);
  };
  const handleRemoveAttack = (id: string) => {
    setAttacks((prev) => prev.filter((a) => a.id !== id));
  };

  // Proficiencies handler
  const handleProficienciesUpdate = (field: string, value: string) => {
    switch (field) {
      case "armorProficiencies": setArmorProficiencies(value); break;
      case "weaponProficiencies": setWeaponProficiencies(value); break;
      case "toolProficiencies": setToolProficiencies(value); break;
    }
  };

  // Ability score update
  const handleAbilityScoreChange = (ability: AbilityName, score: number) => {
    setAbilities((prev) => ({ ...prev, [ability]: { ...prev[ability], score } }));
  };

  const handleSaveProfChange = (ability: AbilityName, proficient: boolean) => {
    setAbilities((prev) => ({ ...prev, [ability]: { ...prev[ability], saveProficient: proficient } }));
  };

  const handleSkillProfChange = (skillName: string, proficient: boolean) => {
    setSkills((prev) => prev.map((s) => (s.name === skillName ? { ...s, proficient } : s)));
  };

  // PDF layout: left column = STR, DEX, CON; center column = INT, WIS, CHA
  const leftAbilities: AbilityName[] = ["str", "dex", "con"];
  const centerAbilities: AbilityName[] = ["int", "wis", "cha"];

  return (
    <div className="max-w-6xl mx-auto p-4 flex flex-col gap-4">
      {/* ── Header — top bar ── */}
      <CharacterHeader
        name={name}
        race={race}
        characterClass={characterClass}
        level={level}
        background={background}
        subclass={subclass}
        xp={xp}
        ac={ac}
        usesShield={usesShield}
        onToggleShield={() => setUsesShield((v) => !v)}
        currentHp={currentHp}
        maxHp={maxHp}
        tempHp={tempHp}
        hpSpent={hpSpent}
        hitDiceType={hitDiceType}
        deathSaveSuccesses={deathSaveSuccesses}
        deathSaveFailures={deathSaveFailures}
        onUpdate={handleHeaderUpdate}
      />

      {/* ── Combat stats row ── */}
      <CombatStats
        ac={ac}
        initiative={initiative}
        speed={speed}
        size={size}
        proficiencyBonus={proficiencyBonus}
        passivePerception={passivePerception}
        onUpdate={handleCombatUpdate}
      />

      {/* ── Main 3-column layout (matching PDF) ── */}
      <div className="grid grid-cols-[200px_200px_1fr] gap-4">

        {/* LEFT COLUMN — Physical abilities: STR, DEX, CON + Inspiration */}
        <div className="flex flex-col gap-3">
          {leftAbilities.map((ability) => (
            <AbilityScoreBlock
              key={ability}
              name={ABILITY_NAMES[ability]}
              score={abilities[ability].score}
              modifier={getModifier(ability)}
              saveProficient={abilities[ability].saveProficient}
              saveValue={getSaveValue(ability)}
              skills={getSkillsForAbility(ability)}
              onScoreChange={(v) => handleAbilityScoreChange(ability, v)}
              onSaveProfChange={(v) => handleSaveProfChange(ability, v)}
              onSkillProfChange={handleSkillProfChange}
            />
          ))}

          <Inspiration
            hasInspiration={inspiration}
            onToggle={() => setInspiration(!inspiration)}
          />
        </div>

        {/* CENTER COLUMN — Mental abilities: INT, WIS, CHA */}
        <div className="flex flex-col gap-3">
          {centerAbilities.map((ability) => (
            <AbilityScoreBlock
              key={ability}
              name={ABILITY_NAMES[ability]}
              score={abilities[ability].score}
              modifier={getModifier(ability)}
              saveProficient={abilities[ability].saveProficient}
              saveValue={getSaveValue(ability)}
              skills={getSkillsForAbility(ability)}
              onScoreChange={(v) => handleAbilityScoreChange(ability, v)}
              onSaveProfChange={(v) => handleSaveProfChange(ability, v)}
              onSkillProfChange={handleSkillProfChange}
            />
          ))}
        </div>

        {/* RIGHT COLUMN — Attacks, Class Features, Traits, Feats */}
        <div className="flex flex-col gap-3">
          <AttacksTable
            attacks={attacks}
            onUpdate={handleAttackUpdate}
            onAdd={handleAddAttack}
            onRemove={handleRemoveAttack}
          />

          <TextBlock
            title="Class Features"
            value={classFeatures}
            onChange={setClassFeatures}
          />

          {/* Bottom row: Racial Traits + Feats side by side */}
          <div className="grid grid-cols-2 gap-3">
            <TextBlock
              title="Racial Traits"
              value={racialTraits}
              onChange={setRacialTraits}
              minHeight="80px"
            />
            <TextBlock
              title="Feats"
              value={feats}
              onChange={setFeats}
              minHeight="80px"
            />
          </div>
        </div>
      </div>

      {/* ── Bottom section — Proficiencies ── */}
      <div className="grid grid-cols-[400px_1fr] gap-4">
        <ProficienciesBlock
          armorProficiencies={armorProficiencies}
          weaponProficiencies={weaponProficiencies}
          toolProficiencies={toolProficiencies}
          onUpdate={handleProficienciesUpdate}
        />
      </div>
    </div>
  );
};
