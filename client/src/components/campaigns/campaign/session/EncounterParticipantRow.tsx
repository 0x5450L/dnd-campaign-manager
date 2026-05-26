import { useLiveSession } from "../../../../context/liveSessionContext/useLiveSession";
import type { EncounterParticipantDTO, ParticipantType } from "../../../../types/session";

type EncounterParticipantRowProps = {
  participant: EncounterParticipantDTO;
  isActive: boolean;
  isDM: boolean;
};

const CONDITIONS_QUICK = ["Prone", "Stunned", "Poisoned", "Frightened"] as const;

const typeStyle: Record<ParticipantType, string> = {
  pc: "border-leaf/60 text-[#c2e8c2]",
  npc: "border-gold-dim/60 text-gold-bright",
  monster: "border-rust/60 text-[#f1c2c2]",
};

const hpBarColor = (percent: number) => {
  if (percent <= 25) return "bg-rust";
  if (percent <= 60) return "bg-gold-dim";
  return "bg-leaf";
};

export const EncounterParticipantRow = ({
  participant,
  isActive,
  isDM,
}: EncounterParticipantRowProps) => {
  const { adjustHp, toggleCondition } = useLiveSession();

  const hpPercent = Math.round(
    (participant.currentHp / Math.max(1, participant.maxHp)) * 100,
  );
  const hidden = !participant.isVisible && !isDM;

  return (
    <li
      className={`relative flex flex-col gap-2 rounded-md border px-3 py-2 transition-colors ${
        isActive
          ? "border-gold bg-gold/5 shadow-[inset_0_0_0_1px_rgba(212,165,116,0.25)]"
          : "border-rule bg-surface/40 hover:border-hover/60"
      }`}
    >
      {isActive && (
        <span className="absolute -left-2 top-1/2 hidden h-6 w-1 -translate-y-1/2 rounded-full bg-gold sm:block" />
      )}

      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-rule bg-bg/60 font-fantasy text-sm text-gold">
          {participant.sortOrder}
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-2">
            <span className="truncate font-fantasy text-sm text-ink">
              {participant.name}
            </span>
            <span
              className={`rounded border px-1.5 py-0.5 text-[9px] uppercase tracking-widest ${typeStyle[participant.type]}`}
            >
              {participant.type}
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-[0.12em] text-faint">
            AC {participant.armorClass} · Init {participant.sortOrder}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {isDM && (
            <>
              <HpButton label="−5" onClick={() => adjustHp(participant.id, -5)} />
              <HpButton label="−1" onClick={() => adjustHp(participant.id, -1)} />
              <HpButton label="+1" onClick={() => adjustHp(participant.id, 1)} variant="heal" />
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative h-2 flex-1 overflow-hidden rounded-full border border-rule bg-bg/70">
          {!hidden && (
            <div
              className={`h-full transition-[width] ${hpBarColor(hpPercent)}`}
              style={{ width: `${hpPercent}%` }}
            />
          )}
        </div>
        <span className="w-20 text-right font-fantasy text-xs text-ink">
          {hidden ? "??/??" : `${participant.currentHp}/${participant.maxHp}`}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {participant.conditions.map((c) => (
          <button
            key={c}
            type="button"
            disabled={!isDM}
            onClick={() => toggleCondition(participant.id, c)}
            className="rounded border border-gold-dim/60 bg-gold/5 px-1.5 py-0.5 font-fantasy text-[10px] uppercase tracking-widest text-gold-bright disabled:cursor-default disabled:opacity-80"
          >
            {c}
          </button>
        ))}
        {isDM &&
          CONDITIONS_QUICK.filter((c) => !participant.conditions.includes(c)).map(
            (c) => (
              <button
                key={c}
                type="button"
                onClick={() => toggleCondition(participant.id, c)}
                className="rounded border border-dashed border-rule px-1.5 py-0.5 font-fantasy text-[10px] uppercase tracking-widest text-faint transition-colors hover:border-hover hover:text-ink"
              >
                + {c}
              </button>
            ),
          )}
      </div>
    </li>
  );
};

const HpButton = ({
  label,
  onClick,
  variant = "damage",
}: {
  label: string;
  onClick: () => void;
  variant?: "damage" | "heal";
}) => {
  const color =
    variant === "heal"
      ? "border-leaf/60 text-[#c2e8c2] hover:bg-leaf/10"
      : "border-rust/60 text-[#f1c2c2] hover:bg-rust/10";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer rounded border bg-transparent px-2 py-0.5 font-fantasy text-[11px] transition-colors ${color}`}
    >
      {label}
    </button>
  );
};

export default EncounterParticipantRow;
