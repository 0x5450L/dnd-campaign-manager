import type { ParticipantType } from "../../../../../../types/session";

type TypeBadgeProps = {
  type: ParticipantType;
};

export const TypeBadge = ({ type }: TypeBadgeProps) => {
  if (type !== "pc") return null;

  return (
    <span className="rounded border border-leaf/60 bg-leaf/10 px-2 py-0.5 font-fantasy text-xs uppercase tracking-widest text-[#c2e8c2]">
      PC
    </span>
  );
};

export default TypeBadge;
