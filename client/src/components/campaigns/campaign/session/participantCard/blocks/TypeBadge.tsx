import type { ParticipantType } from "../../../../../../types/session";

type TypeBadgeProps = {
  type: ParticipantType;
  hidden: boolean;
  isDM: boolean;
  onToggleHidden?: () => void;
};

const typeStyle: Record<ParticipantType, string> = {
  pc: "border-leaf/60 bg-leaf/10 text-[#c2e8c2]",
  npc: "border-gold-dim/60 bg-gold/10 text-gold-bright",
  monster: "border-rust/60 bg-rust/10 text-[#f1c2c2]",
};

const typeLabel: Record<ParticipantType, string> = {
  pc: "PC",
  npc: "NPC",
  monster: "Monster",
};

export const TypeBadge = ({
  type,
  hidden,
  isDM,
  onToggleHidden,
}: TypeBadgeProps) => {
  const canToggle = isDM && type !== "pc" && onToggleHidden;

  if (hidden && !isDM) return null;

  return (
    <button
      type="button"
      disabled={!canToggle}
      onClick={canToggle ? onToggleHidden : undefined}
      title={
        canToggle
          ? hidden
            ? "Hidden from players — click to reveal"
            : "Visible to players — click to hide"
          : undefined
      }
      className={`rounded border px-2 py-0.5 font-fantasy text-[11px] uppercase tracking-widest transition-opacity ${typeStyle[type]} ${
        hidden ? "opacity-50" : ""
      } ${canToggle ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
    >
      {typeLabel[type]}
      {hidden && isDM ? " · hidden" : ""}
    </button>
  );
};

export default TypeBadge;
