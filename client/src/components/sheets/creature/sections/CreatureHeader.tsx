import { GradientInput } from "../../shared/inputs/GradientInput";
import { useCharacterSheet } from "../../../../hooks/useCharacterSheet";

export const CreatureHeader = () => {
  const { state, setField } = useCharacterSheet();

  return (
    <div className="cs-section-card p-3 flex flex-col justify-center gap-2">
      <div>
        <GradientInput
          value={state.name}
          onChange={(v) => setField("name", v)}
          placeholder="Creature Name"
          large
          required
        />
        <div className="cs-label mt-1">Creature Name</div>
      </div>

      <div>
        <GradientInput
          value={state.race}
          onChange={(v) => setField("race", v)}
          placeholder="—"
        />
        <div className="cs-label">Type</div>
      </div>
    </div>
  );
};
