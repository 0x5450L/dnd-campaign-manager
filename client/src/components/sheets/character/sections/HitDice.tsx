import {
  getHitDiceMax,
  getHitDiceRemaining,
  useCharacterSheet,
  useSheetActions,
} from "../../../../state/sheet";
import type { HitDiceType } from "../../../../types/characters/characterSheet";

const DICE_OPTIONS: HitDiceType[] = ["d6", "d8", "d10", "d12"];

export const HitDice = () => {
  const { currentHp, maxHp, hitDiceType, hitDiceRemaining, hitDiceMax } =
    useCharacterSheet((s) => ({
      currentHp: s.currentHp,
      maxHp: s.maxHp,
      hitDiceType: s.hitDiceType,
      hitDiceRemaining: getHitDiceRemaining(s),
      hitDiceMax: getHitDiceMax(s),
    }));
  const { setCharacterField, spendHitDie, longRest } = useSheetActions();

  const canSpend = hitDiceRemaining > 0 && currentHp < maxHp && currentHp > 0;

  const spendTitle = !canSpend
    ? hitDiceRemaining <= 0
      ? "No hit dice remaining"
      : currentHp >= maxHp
        ? "Already at full HP"
        : "Unconscious — cannot spend hit dice"
    : `Roll ${hitDiceType} + CON mod and heal`;

  return (
    <div
      className="cs-section-card flex flex-col justify-between p-3 gap-2 flex-1"
    >
      <div className="cs-section-title">Hit Dice</div>

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
            value={hitDiceType}
            onChange={(e) =>
              setCharacterField("hitDiceType", e.target.value as HitDiceType)
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
