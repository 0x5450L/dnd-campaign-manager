import { NumericInput } from "../inputs/NumericInput";

type Skill = {
  name: string;
  proficient: boolean;
  value: number;
};

type AbilityScoreBlockProps = {
  name: string;
  score: number;
  modifier: number;
  saveProficient: boolean;
  saveValue: number;
  skills: Skill[];
  onScoreChange: (value: number) => void;
  onSaveProfChange: (value: boolean) => void;
  onSkillProfChange: (skillName: string, value: boolean) => void;
};

export const AbilityScoreBlock = ({
  name, score, modifier, saveProficient, saveValue, skills,
  onScoreChange, onSaveProfChange, onSkillProfChange,
}: AbilityScoreBlockProps) => {
  const modStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;

  return (
    <div className="cs-section-card p-2">
      {/* Ability name — fantasy header */}
      <div
        className="text-center text-[10px] uppercase tracking-[0.15em] mb-1 font-semibold"
        style={{ fontFamily: "var(--font-fantasy)", color: "var(--color-gold)" }}
      >
        {name}
      </div>

      {/* Score input */}
      <div className="flex justify-center mb-0.5">
        <NumericInput
          value={score}
          onChange={onScoreChange}
          min={1} max={30} defaultValue={10}
          className="cs-score-input"
        />
      </div>

      {/* Modifier */}
      <div className="text-center text-xs mb-2" style={{ color: "var(--color-text-dim)" }}>
        Mod:{" "}
        <span className="cs-modifier text-sm">{modStr}</span>
      </div>

      {/* Saving throw */}
      <div className="cs-skill-row mb-1">
        <div
          className={`cs-dot ${saveProficient ? "active" : ""}`}
          onClick={() => onSaveProfChange(!saveProficient)}
        />
        <span className="text-xs" style={{ color: "var(--color-text-dim)" }}>
          <span className="font-medium" style={{ color: saveProficient ? "var(--color-gold-bright)" : "var(--color-text)" }}>
            {saveValue >= 0 ? `+${saveValue}` : saveValue}
          </span>{" "}
          Save
        </span>
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="flex flex-col gap-0.5 pt-1" style={{ borderTop: "1px solid var(--color-border)" }}>
          {skills.map((skill) => (
            <div key={skill.name} className="cs-skill-row">
              <div
                className={`cs-dot ${skill.proficient ? "active" : ""}`}
                onClick={() => onSkillProfChange(skill.name, !skill.proficient)}
              />
              <span className="text-xs" style={{ color: "var(--color-text-dim)" }}>
                <span className="font-medium" style={{ color: skill.proficient ? "var(--color-gold-bright)" : "var(--color-text)" }}>
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
