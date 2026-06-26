import { NumericInput } from "../inputs/NumericInput";
import { GradientInput } from "../inputs/GradientInput";
import { useCharacterSheet } from "../../../hooks/useCharacterSheet";

export const CharacterLore = () => {
  const { state, setField, setLevelFromXp, setXpFromLevel } = useCharacterSheet();

  return (
    <div className="cs-section-card p-3 flex items-stretch gap-4">
      {/* Character info fields */}
      <div className="flex-1 flex flex-col justify-center">
        {/* Name */}
        <div className="mb-2">
          <GradientInput
            value={state.name}
            onChange={(v) => setField("name", v)}
            placeholder="Character Name"
            large
            required
          />
          <div className="cs-label mt-1">Character Name</div>
        </div>

        {/* Info grid: 2x2 */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div>
            <GradientInput
              value={state.background}
              onChange={(v) => setField("background", v)}
              placeholder="—"
            />
            <div className="cs-label">Background</div>
          </div>
          <div>
            <GradientInput
              value={state.characterClass}
              onChange={(v) => setField("characterClass", v)}
              placeholder="—"
              required
            />
            <div className="cs-label">Class</div>
          </div>
          <div>
            <GradientInput
              value={state.race}
              onChange={(v) => setField("race", v)}
              placeholder="—"
              required
            />
            <div className="cs-label">Species</div>
          </div>
          <div>
            <GradientInput
              value={state.subclass}
              onChange={(v) => setField("subclass", v)}
              placeholder="—"
            />
            <div className="cs-label">Subclass</div>
          </div>
        </div>
      </div>

      {/* Level circle + XP (right side of lore box) */}
      <div className="flex flex-col items-center justify-center pl-4 border-l border-rule">
        <span className="cs-section-title mb-1">Level</span>
        <div className="cs-level-circle">
          <NumericInput
            value={state.level}
            onChange={setXpFromLevel}
            min={1}
            max={20}
            defaultValue={1}
            className="bg-transparent text-center outline-none w-8 text-xl font-bold font-fantasy text-gold"
          />
        </div>
        <div className="flex flex-col items-center mt-1">
          <NumericInput
            value={state.xp}
            onChange={setLevelFromXp}
            min={0}
            defaultValue={0}
            className="bg-transparent text-center outline-none w-16 text-xs text-dim"
          />
          <span className="cs-label">XP</span>
        </div>
      </div>
    </div>
  );
};
