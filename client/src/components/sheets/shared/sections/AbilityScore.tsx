import { NumericInput } from "../inputs/NumericInput";
import {
  getAbilityModifier,
  getSaveValue,
  getSheetProficiencyBonus,
  useSheet,
  useSheetActions,
} from "@/state/sheet";
import type { AbilityName } from "@/types/characters/characterSheet";

const ABILITY_NAMES: Record<AbilityName, string> = {
  str: "Strength",
  dex: "Dexterity",
  con: "Constitution",
  int: "Intelligence",
  wis: "Wisdom",
  cha: "Charisma",
};

type AbilityScoreProps = {
  ability: AbilityName;
};

export const AbilityScore = ({ ability }: AbilityScoreProps) => {
  const { score, modifier, saveProficient, saveValue, proficiencyBonus } = useSheet((s) => ({
    score: s.abilities[ability].score,
    modifier: getAbilityModifier(s, ability),
    saveProficient: s.abilities[ability].saveProficient,
    saveValue: getSaveValue(s, ability),
    proficiencyBonus: getSheetProficiencyBonus(s),
  }));
  const allSkills = useSheet((s) => s.skills);
  const { setAbilityScore, setSaveProficient, setSkillProficient } = useSheetActions();

  const skills = allSkills
    .filter((skill) => skill.ability === ability)
    .map((skill) => ({
      name: skill.name,
      proficient: skill.proficient,
      value: skill.proficient ? modifier + proficiencyBonus : modifier,
    }));

  const modStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;

  return (
    <div className="cs-section-card p-2">
      <div className="mb-1 text-center text-[10px] font-semibold uppercase tracking-[0.15em] text-gold font-fantasy">
        {ABILITY_NAMES[ability]}
      </div>

      <div className="flex justify-center mb-0.5">
        <NumericInput
          value={score}
          onChange={(v) => setAbilityScore(ability, v)}
          min={1} max={30} defaultValue={10}
          className="cs-score-input"
        />
      </div>

      <div className="text-center text-xs mb-2 text-dim">
        Mod: <span className="cs-modifier text-sm">{modStr}</span>
      </div>

      <div className="cs-skill-row mb-1">
        <div
          className={`cs-dot ${saveProficient ? "active" : ""}`}
          onClick={() => setSaveProficient(ability, !saveProficient)}
        />
        <span className="text-xs text-dim">
          <span className={`font-medium ${saveProficient ? "text-gold-bright" : "text-ink"}`}>
            {saveValue >= 0 ? `+${saveValue}` : saveValue}
          </span>{" "}
          Save
        </span>
      </div>

      {skills.length > 0 && (
        <div className="flex flex-col gap-0.5 pt-1 border-t border-rule">
          {skills.map((skill) => (
            <div key={skill.name} className="cs-skill-row">
              <div
                className={`cs-dot ${skill.proficient ? "active" : ""}`}
                onClick={() => setSkillProficient(skill.name, !skill.proficient)}
              />
              <span className="text-xs text-dim">
                <span className={`font-medium ${skill.proficient ? "text-gold-bright" : "text-ink"}`}>
                  {skill.value >= 0 ? `+${skill.value}` : skill.value}
                </span>{" "}
                {skill.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
