import { NumericInput } from "../inputs/NumericInput";
import { ArmorClass } from "./ArmorClass";

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
  name, race, characterClass, level, background, subclass, xp,
  ac, usesShield, onToggleShield, currentHp, maxHp, tempHp, hpSpent,
  hitDiceType, deathSaveSuccesses, deathSaveFailures,
  onUpdate,
}: CharacterHeaderProps) => {

  const DeathDots = ({ count, max, type, field }: {
    count: number; max: number; type: "success" | "fail"; field: string;
  }) => (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => (
        <div
          key={i}
          onClick={() => onUpdate(field, i < count ? i : i + 1)}
          className={`cs-death-dot ${i < count ? type : ""}`}
        />
      ))}
    </div>
  );

  const GradientInput = ({ value, onChange, placeholder, large }: {
    value: string; onChange: (v: string) => void; placeholder?: string; large?: boolean;
  }) => (
    <div className="cs-input-wrap">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cs-input"
        style={large ? { fontFamily: "var(--font-fantasy)", fontSize: "18px", fontWeight: 500 } : { fontSize: "13px" }}
        placeholder={placeholder}
      />
    </div>
  );

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
        <div className="flex flex-col items-center justify-center pl-4" style={{ borderLeft: "1px solid var(--color-border)" }}>
          <span className="cs-label mb-1">Level</span>
          <div className="cs-level-circle">
            <NumericInput
              value={level}
              onChange={(v) => onUpdate("level", v)}
              min={1} max={20} defaultValue={1}
              className="bg-transparent text-center outline-none w-8 text-xl font-bold"
              style={{ fontFamily: "var(--font-fantasy)", color: "var(--color-gold)" }}
            />
          </div>
          <div className="flex flex-col items-center mt-1">
            <NumericInput
              value={xp}
              onChange={(v) => onUpdate("xp", v)}
              min={0} defaultValue={0}
              className="bg-transparent text-center outline-none w-16 text-xs"
              style={{ color: "var(--color-text-dim)" }}
            />
            <span className="cs-label">XP</span>
          </div>
        </div>
      </div>

      {/* ── MIDDLE: AC Shield ── */}
      <ArmorClass
        ac={ac}
        usesShield={usesShield}
        onToggleShield={onToggleShield}
        onUpdate={onUpdate}
      />

      {/* ── RIGHT BOX: Combat (section card) ── */}
      <div className="cs-section-card flex-1 flex items-stretch">

        {/* Hit Points */}
        <div className="flex flex-col items-center justify-center px-4 py-3 border-r border-[var(--color-border)]">
          <span className="cs-label mb-2">Hit Points</span>
          <div className="flex items-end gap-2">
            <div className="flex flex-col items-center">
              <NumericInput
                value={currentHp}
                onChange={(v) => onUpdate("currentHp", v)}
                defaultValue={0}
                className="cs-score-input w-11 h-8 text-sm"
              />
              <span className="cs-label mt-0.5">Current</span>
            </div>
            <div className="flex flex-col items-center">
              <NumericInput
                value={tempHp}
                onChange={(v) => onUpdate("tempHp", v)}
                min={0} defaultValue={0}
                className="cs-score-input w-11 h-8 text-sm"
              />
              <span className="cs-label mt-0.5">Temp</span>
            </div>
            <div className="flex flex-col items-center">
              <NumericInput
                value={maxHp}
                onChange={(v) => onUpdate("maxHp", v)}
                min={0} defaultValue={0}
                className="cs-score-input w-11 h-8 text-sm"
              />
              <span className="cs-label mt-0.5">Maximum</span>
            </div>
          </div>
        </div>

        {/* Hit Dice */}
        <div className="flex flex-col items-center justify-center px-3 border-r border-[var(--color-border)]">
          <span className="cs-label mb-1">Hit Dice</span>
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{level}</span>
            <select
              value={hitDiceType}
              onChange={(e) => onUpdate("hitDiceType", e.target.value)}
              className="cs-select text-xs rounded px-1 py-0.5"
              style={{ backgroundColor: "var(--color-surface)" }}
            >
              <option value="d6">d6</option>
              <option value="d8">d8</option>
              <option value="d10">d10</option>
              <option value="d12">d12</option>
            </select>
          </div>
          <div className="flex flex-col items-center mt-1">
            <NumericInput
              value={hpSpent}
              onChange={(v) => onUpdate("hpSpent", v)}
              min={0} max={level} defaultValue={0}
              className="cs-score-input w-8 h-6 text-xs"
            />
            <span className="cs-label mt-0.5">Spent</span>
          </div>
        </div>

        {/* Death Saves */}
        <div className="flex flex-col items-center justify-center px-4">
          <span className="cs-label" style={{ marginBottom: "8px" }}>Death Saves</span>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[9px] uppercase tracking-wider w-7" style={{ color: "var(--color-accent-green)" }}>Pass</span>
              <DeathDots count={deathSaveSuccesses} max={3} type="success" field="deathSaveSuccesses" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] uppercase tracking-wider w-7" style={{ color: "var(--color-accent-red)" }}>Fail</span>
              <DeathDots count={deathSaveFailures} max={3} type="fail" field="deathSaveFailures" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
