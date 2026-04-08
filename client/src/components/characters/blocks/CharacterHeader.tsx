import { NumericInput } from "../inputs/NumericInput";
import { GradientInput } from "../inputs/GradientInput";
import { ArmorClass } from "./ArmorClass";
import { DeathSaves } from "./DeathSaves";
import { HitDice } from "./HitDice";
import { HitPoints } from "./HitPoints";

type CharacterHeaderProps = {
  name: string;
  race: string;
  characterClass: string;
  level: number;
  background: string;
  subclass: string;
  xp: number;
  ac: number;
  usesShield: boolean;
  onToggleShield: () => void;
  currentHp: number;
  maxHp: number;
  tempHp: number;
  hpSpent: number;
  hitDiceType: string;
  deathSaveSuccesses: number;
  deathSaveFailures: number;
  onUpdate: (field: string, value: string | number) => void;
};

export const CharacterHeader = ({
  name,
  race,
  characterClass,
  level,
  background,
  subclass,
  xp,
  ac,
  usesShield,
  onToggleShield,
  currentHp,
  maxHp,
  tempHp,
  hpSpent,
  hitDiceType,
  deathSaveSuccesses,
  deathSaveFailures,
  onUpdate,
}: CharacterHeaderProps) => {
  return (
    <div className="flex gap-3">
      {/* ── LEFT BOX: Lore (ornate frame) ── */}
      <div className="cs-ornate-frame p-3 flex-1 flex items-stretch gap-4">
        {/* Character info fields */}
        <div className="flex-1 flex flex-col justify-center">
          {/* Name */}
          <div className="mb-2">
            <GradientInput value={name} onChange={(v) => onUpdate("name", v)} placeholder="Character Name" large />
            <div className="cs-label mt-1">Character Name</div>
          </div>

          {/* Info grid: 2x2 */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <div>
              <GradientInput value={background} onChange={(v) => onUpdate("background", v)} placeholder="—" />
              <div className="cs-label">Background</div>
            </div>
            <div>
              <GradientInput value={characterClass} onChange={(v) => onUpdate("characterClass", v)} placeholder="—" />
              <div className="cs-label">Class</div>
            </div>
            <div>
              <GradientInput value={race} onChange={(v) => onUpdate("race", v)} placeholder="—" />
              <div className="cs-label">Species</div>
            </div>
            <div>
              <GradientInput value={subclass} onChange={(v) => onUpdate("subclass", v)} placeholder="—" />
              <div className="cs-label">Subclass</div>
            </div>
          </div>
        </div>

        {/* Level circle + XP (right side of lore box) */}
        <div
          className="flex flex-col items-center justify-center pl-4"
          style={{ borderLeft: "1px solid var(--color-border)" }}
        >
          <span className="cs-section-title mb-1">Level</span>
          <div className="cs-level-circle">
            <NumericInput
              value={level}
              onChange={(v) => onUpdate("level", v)}
              min={1}
              max={20}
              defaultValue={1}
              className="bg-transparent text-center outline-none w-8 text-xl font-bold"
              style={{ fontFamily: "var(--font-fantasy)", color: "var(--color-gold)" }}
            />
          </div>
          <div className="flex flex-col items-center mt-1">
            <NumericInput
              value={xp}
              onChange={(v) => onUpdate("xp", v)}
              min={0}
              defaultValue={0}
              className="bg-transparent text-center outline-none w-16 text-xs"
              style={{ color: "var(--color-text-dim)" }}
            />
            <span className="cs-label">XP</span>
          </div>
        </div>
      </div>

      <ArmorClass ac={ac} usesShield={usesShield} onToggleShield={onToggleShield} onUpdate={onUpdate} />

      <HitPoints currentHp={currentHp} maxHp={maxHp} tempHp={tempHp} onUpdate={onUpdate} />

      <HitDice hitDiceType={hitDiceType} hitDiceTotal={level} hitDiceUsed={hpSpent} onUpdate={onUpdate} />

      <DeathSaves successes={deathSaveSuccesses} failures={deathSaveFailures} onUpdate={onUpdate} />
    </div>
  );
};
