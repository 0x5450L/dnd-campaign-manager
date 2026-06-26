import { useCharacterSheet } from "../../../hooks/useCharacterSheet";
import type { HitDiceType } from "../../../types/characters/characterSheet";

const DICE_OPTIONS: HitDiceType[] = ["d6", "d8", "d10", "d12"];

export const HitDice = () => {
  const {
    state,
    setField,
    hitDiceRemaining,
    hitDiceMax,
    spendHitDie,
    longRest,
  } = useCharacterSheet();

  const canSpend =
    hitDiceRemaining > 0 && state.currentHp < state.maxHp && state.currentHp > 0;

  const spendTitle = !canSpend
    ? hitDiceRemaining <= 0
      ? "No hit dice remaining"
      : state.currentHp >= state.maxHp
        ? "Already at full HP"
        : "Unconscious — cannot spend hit dice"
    : `Roll ${state.hitDiceType} + CON mod and heal`;

  return (
    <div
      className="cs-section-card flex flex-col justify-between p-3 gap-2 flex-1"
    >
      <div className="cs-section-title">Hit Dice</div>

      {/* Remaining / Max  |  Dice type select */}
      <div className="flex items-center justify-evenly gap-2 px-1">
        <div className="flex flex-col items-center leading-none">
          <span className="cs-modifier text-lg">
            {hitDiceRemaining}
            <span className="text-xs font-normal opacity-60">
              {" "}
              / {hitDiceMax}
            </span>
          </span>
        </div>

        <div className="flex flex-col items-center leading-none">
          <select
            value={state.hitDiceType}
            onChange={(e) =>
              setField("hitDiceType", e.target.value as HitDiceType)
            }
            className="cs-select"
          >
            {DICE_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Actions */}
      <button
        type="button"
        onClick={() => canSpend && spendHitDie()}
        disabled={!canSpend}
        title={spendTitle}
        className="cs-btn-ghost w-full"
      >
        Use Hit Die
      </button>

      <button
        type="button"
        onClick={longRest}
        title="Long Rest — restore HP, hit dice and death saves"
        className="cs-btn-ghost w-full"
      >
        Long Rest
      </button>
    </div>
  );
};
