import { NumericInput } from "@/components/sheets/shared/inputs/NumericInput";
import { GradientInput } from "@/components/sheets/shared/inputs/GradientInput";
import { useCharacterSheet, useSheetActions } from "@/state/sheet";

export const CharacterLore = () => {
  const { name, race, characterClass, subclass, background, level, xp } =
    useCharacterSheet((s) => ({
      name: s.name,
      race: s.race,
      characterClass: s.characterClass,
      subclass: s.subclass,
      background: s.background,
      level: s.level,
      xp: s.xp,
    }));
  const { setSharedField, setCharacterField, setLevelFromXp, setXpFromLevel } =
    useSheetActions();

  return (
    <div className="cs-section-card p-3 flex items-stretch gap-4">
      <div className="flex-1 flex flex-col justify-center">
        <div className="mb-2">
          <GradientInput
            value={name}
            onChange={(v) => setSharedField("name", v)}
            placeholder="Character Name"
            large
            required
          />
          <div className="cs-label mt-1">Character Name</div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div>
            <GradientInput
              value={background}
              onChange={(v) => setCharacterField("background", v)}
              placeholder="—"
            />
            <div className="cs-label">Background</div>
          </div>
          <div>
            <GradientInput
              value={characterClass}
              onChange={(v) => setCharacterField("characterClass", v)}
              placeholder="—"
              required
            />
            <div className="cs-label">Class</div>
          </div>
          <div>
            <GradientInput
              value={race}
              onChange={(v) => setSharedField("race", v)}
              placeholder="—"
              required
            />
            <div className="cs-label">Species</div>
          </div>
          <div>
            <GradientInput
              value={subclass}
              onChange={(v) => setCharacterField("subclass", v)}
              placeholder="—"
            />
            <div className="cs-label">Subclass</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center pl-4 border-l border-rule">
        <span className="cs-section-title mb-1">Level</span>
        <div className="cs-level-circle">
          <NumericInput
            value={level}
            onChange={setXpFromLevel}
            min={1}
            max={20}
            defaultValue={1}
            className="bg-transparent text-center outline-none w-8 text-xl font-bold font-fantasy text-gold"
          />
        </div>
        <div className="flex flex-col items-center mt-1">
          <NumericInput
            value={xp}
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
