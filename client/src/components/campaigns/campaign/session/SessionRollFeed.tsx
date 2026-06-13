import { useLiveSession } from "../../../../context/liveSessionContext/useLiveSession";
import type { SessionDiceRoll } from "../../../../types/session";
import { DICE_TYPES, type DiceType } from "../../../../types/dice";
import DiceShape from "../../../dice/DiceShape";

const formatTime = (iso: string) => {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

const formatExpression = (expression: string) =>
  expression.replace(
    /(\d*)d(\d+)(kh|kl)(\d+)/gi,
    (_match, _count, sides, kind, keep) =>
      `${keep}D${sides} ${kind.toLowerCase() === "kh" ? "adv" : "dis"}`,
  );

const usedDiceTypes = (expression: string): DiceType[] => {
  const seen = new Set<DiceType>();
  for (const m of expression.matchAll(/d(\d+)/gi)) {
    const type = `d${Number(m[1])}` as DiceType;
    if (DICE_TYPES.includes(type)) seen.add(type);
  }
  return DICE_TYPES.filter((t) => seen.has(t));
};

const rollMode = (expression: string): "adv" | "dis" | "normal" => {
  if (/kh\d*/i.test(expression)) return "adv";
  if (/kl\d*/i.test(expression)) return "dis";
  return "normal";
};

const totalColor = (roll: SessionDiceRoll) => {
  if (roll.critSuccess) return "text-gold-bright";
  if (roll.critFail) return "text-rust";
  return "text-ink";
};

const diceSizeFor = (count: number) => {
  if (count <= 1) return 28;
  if (count === 2) return 15;
  if (count <= 4) return 14;
  return 10;
};

const DiceCluster = ({
  types,
  glow,
}: {
  types: DiceType[];
  glow: "success" | "fail" | "none";
}) => {
  if (types.length === 0) return <span className="inline-block h-8 w-8" />;
  const size = diceSizeFor(types.length);
  return (
    <span className="flex h-8 w-8 flex-wrap content-center items-center justify-center gap-px">
      {types.map((type) => (
        <DiceShape key={type} type={type} size={size} glow={glow} />
      ))}
    </span>
  );
};

export const SessionRollFeed = () => {
  const { rolls } = useLiveSession();

  return (
    <div className="cs-section-card flex h-[220px] flex-col gap-1.5 p-3">
      <div className="flex items-center justify-between">
        <span className="cs-section-title !p-0 !text-left">Table rolls</span>
        <span className="text-[10px] uppercase tracking-[0.12em] text-faint">
          {rolls.length}
        </span>
      </div>
      <ul className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pr-1">
        {rolls.length === 0 && (
          <li className="px-2 py-2 text-center text-xs italic text-faint">
            No shared rolls yet.
          </li>
        )}
        {rolls.map((roll) => {
          const mode = rollMode(roll.expression);
          const glow =
            mode === "adv" ? "success" : mode === "dis" ? "fail" : "none";
          return (
            <li
              key={roll.id}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded border border-transparent bg-surface/40 px-2 py-1.5 transition-colors hover:border-rule hover:bg-surface"
            >
              <DiceCluster types={usedDiceTypes(roll.expression)} glow={glow} />

              <div className="min-w-0">
                <span className="block truncate font-fantasy text-sm tracking-wide text-ink">
                  {formatExpression(roll.expression)}
                </span>
                <span className="block truncate text-[11px] text-faint">
                  {roll.actorName}
                  <span className="font-fantasy"> · {formatTime(roll.at)}</span>
                </span>
              </div>

              <span
                className={`min-w-[34px] text-right font-fantasy text-xl font-bold leading-none ${totalColor(roll)}`}
              >
                {roll.total}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default SessionRollFeed;
