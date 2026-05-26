import { useLiveSession } from "../../../../context/liveSessionContext/useLiveSession";
import CommonButton from "../../../ui/buttons/CommonButton";
import EncounterParticipantRow from "./EncounterParticipantRow";

type EncounterTrackerProps = {
  isDM: boolean;
};

export const EncounterTracker = ({ isDM }: EncounterTrackerProps) => {
  const {
    encounter,
    participants,
    activeParticipant,
    startEncounter,
    endEncounter,
    advanceTurn,
  } = useLiveSession();

  if (!encounter || encounter.status === "ended") {
    return (
      <div className="cs-section-card flex flex-col items-center gap-3 p-6 text-center">
        <span className="cs-section-title">Encounter</span>
        <p className="max-w-md text-sm text-dim">
          {isDM
            ? "No encounter running. Start one — every connected player joins automatically."
            : "Your DM hasn't started an encounter yet."}
        </p>
        {isDM && (
          <CommonButton onClick={startEncounter} size="md" className="mt-2">
            Start encounter
          </CommonButton>
        )}
      </div>
    );
  }

  return (
    <div className="cs-section-card flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-col">
          <span className="font-fantasy text-base font-bold uppercase tracking-[0.16em] text-gold-bright">
            {encounter.name ?? "Encounter"}
          </span>
          <span className="text-xs uppercase tracking-[0.12em] text-faint">
            Round {encounter.round} &middot; {participants.length} combatants
            {activeParticipant ? ` · ${activeParticipant.name}'s turn` : ""}
          </span>
        </div>
        {isDM && (
          <div className="flex items-center gap-2">
            <CommonButton onClick={advanceTurn} size="sm">
              Next turn
            </CommonButton>
            <CommonButton onClick={endEncounter} variant="decline" size="sm">
              End
            </CommonButton>
          </div>
        )}
      </div>

      <ul className="flex flex-col gap-1.5">
        {participants.map((p, idx) => (
          <EncounterParticipantRow
            key={p.id}
            participant={p}
            isActive={idx === encounter.currentTurnIndex}
            isDM={isDM}
          />
        ))}
      </ul>
    </div>
  );
};

export default EncounterTracker;
