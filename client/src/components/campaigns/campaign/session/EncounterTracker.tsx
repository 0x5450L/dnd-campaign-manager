import { useState } from "react";
import { useLiveSession } from "../../../../hooks/useLiveSession";
import CommonButton from "../../../ui/buttons/CommonButton";
import EncounterParticipantCard from "./participantCard/EncounterParticipantCard";
import AddParticipantModal from "./AddParticipantModal";

type EncounterTrackerProps = {
  isDM: boolean;
};

export const EncounterTracker = ({ isDM }: EncounterTrackerProps) => {
  const {
    encounter,
    participants,
    activeParticipant,
    startEncounter,
    beginCombat,
    endEncounter,
    advanceTurn,
    rollInitiative,
    isOwnParticipant,
  } = useLiveSession();
  const [isAddOpen, setIsAddOpen] = useState(false);

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

  const isSetup = encounter.status === "setup";

  return (
    <div className="cs-section-card flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-col">
          <span className="font-fantasy text-base font-bold uppercase tracking-[0.16em] text-gold-bright">
            {encounter.name ?? "Encounter"}
          </span>
          <span className="text-xs uppercase tracking-[0.12em] text-faint">
            {isSetup
              ? `Setup · ${participants.length} combatants · hidden from players`
              : `Round ${encounter.round} · ${participants.length} combatants${
                  activeParticipant ? ` · ${activeParticipant.name}'s turn` : ""
                }`}
          </span>
        </div>
        {isDM && (
          <div className="flex items-center gap-2">
            <CommonButton onClick={() => setIsAddOpen(true)} variant="secondary" size="sm">
              + Add
            </CommonButton>
            <CommonButton onClick={() => rollInitiative()} variant="secondary" size="sm">
              Roll initiative
            </CommonButton>
            {isSetup ? (
              <CommonButton onClick={beginCombat} size="sm">
                Start combat
              </CommonButton>
            ) : (
              <CommonButton onClick={advanceTurn} size="sm">
                Next turn
              </CommonButton>
            )}
            <CommonButton onClick={endEncounter} variant="decline" size="sm">
              End
            </CommonButton>
          </div>
        )}
      </div>

      <ul className="custom-scrollbar-x -mx-1 flex snap-x snap-mandatory gap-3 px-1 pb-2">
        {participants.map((p, idx) => (
          <EncounterParticipantCard
            key={p.id}
            participant={p}
            isActive={!isSetup && idx === encounter.currentTurnIndex}
            isDM={isDM}
            isOwner={isOwnParticipant(p)}
          />
        ))}
      </ul>

      {isAddOpen && <AddParticipantModal onClose={() => setIsAddOpen(false)} />}
    </div>
  );
};

export default EncounterTracker;
