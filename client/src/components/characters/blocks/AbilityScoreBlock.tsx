import { CheckboxInput } from "../inputs/CheckboxInput";
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
    <div className="border border-gray-700 rounded-lg bg-gray-800/30 p-2">
      {/* Ability name */}
      <div className="text-center text-[10px] uppercase tracking-wider text-amber-400 font-semibold mb-1">
        {name}
      </div>

      {/* Score input */}
      <div className="flex justify-center mb-1">
        <NumericInput
          value={score}
          onChange={onScoreChange}
          min={1}
          max={30}
          defaultValue={10}
          className="border border-gray-600 rounded w-10 h-8 text-gray-200 text-sm focus:border-amber-500"
        />
      </div>

      {/* Modifier */}
      <div className="text-center text-gray-400 text-xs mb-2">
        Modifier: <span className="text-gray-200 font-medium">{modStr}</span>
      </div>

      {/* Saving throw */}
      <div className="flex items-center gap-1.5 mb-2 pl-1">
        <CheckboxInput checked={saveProficient} onChange={onSaveProfChange} />
        <span className="text-gray-400 text-xs">
          <span className="text-gray-300 font-medium">{saveValue >= 0 ? `+${saveValue}` : saveValue}</span> Save
        </span>
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="flex flex-col gap-1 border-t border-gray-700 pt-1.5">
          {skills.map((skill) => (
            <div key={skill.name} className="flex items-center gap-1.5 pl-1">
              <CheckboxInput
                checked={skill.proficient}
                onChange={(v) => onSkillProfChange(skill.name, v)}
              />
              <span className="text-gray-400 text-xs">
                <span className="text-gray-300 font-medium">
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
