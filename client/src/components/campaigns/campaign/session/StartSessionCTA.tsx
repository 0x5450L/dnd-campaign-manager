import { useSessionCommands } from "@/hooks/liveSession/useSessionCommands";
import CommonButton from "@/components/ui/buttons/CommonButton";

type StartSessionCTAProps = {
  isDM: boolean;
};

export const StartSessionCTA = ({ isDM }: StartSessionCTAProps) => {
  const { startSession } = useSessionCommands();

  return (
    <div className="cs-section-card flex flex-col items-center gap-3 p-8 text-center">
      <span className="font-fantasy text-sm uppercase tracking-[0.18em] text-gold-dim">
        No active session
      </span>
      <p className="max-w-md text-sm text-dim">
        {isDM
          ? "Start a session to gather your party, run encounters and roll initiative together."
          : "Your DM hasn't started a session yet. You'll be able to join the moment they do."}
      </p>
      {isDM && (
        <CommonButton onClick={startSession} size="lg" className="mt-2">
          Start session
        </CommonButton>
      )}
    </div>
  );
};

export default StartSessionCTA;
