import { GradientInput } from "../../shared/inputs/GradientInput";
import { useSheet, useSheetActions } from "../../../../state/sheet";

export const CreatureHeader = () => {
  const { name, race } = useSheet((s) => ({ name: s.name, race: s.race }));
  const { setSharedField } = useSheetActions();

  return (
    <div className="cs-section-card p-3 flex flex-col justify-center gap-2">
      <div>
        <GradientInput
          value={name}
          onChange={(v) => setSharedField("name", v)}
          placeholder="Creature Name"
          large
          required
        />
        <div className="cs-label mt-1">Creature Name</div>
      </div>

      <div>
        <GradientInput
          value={race}
          onChange={(v) => setSharedField("race", v)}
          placeholder="—"
        />
        <div className="cs-label">Type</div>
      </div>
    </div>
  );
};
