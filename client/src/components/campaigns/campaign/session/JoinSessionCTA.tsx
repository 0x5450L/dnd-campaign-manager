import { useLiveSessionStore } from "@/state/liveSession/liveSessionStore";
import { useSessionCommands } from "@/hooks/liveSession/useSessionCommands";
import CommonButton from "@/components/ui/buttons/CommonButton";

export const JoinSessionCTA = () => {
  const session = useLiveSessionStore((s) => s.session);
  const { joinSession } = useSessionCommands();

  if (!session) return null;

  return (
    <div className="cs-section-card flex flex-col items-center gap-3 p-8 text-center">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-leaf opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-leaf" />
        </span>
        <span className="font-fantasy text-sm uppercase tracking-[0.18em] text-gold-dim">
          Session #{session.number} is live
        </span>
      </div>
      <p className="max-w-md text-sm text-dim">
        {session.title ?? "The party is gathering."} Join to see the encounter,
        rolls and session log in real time.
      </p>
      <CommonButton onClick={joinSession} variant="accept">
        Join session
      </CommonButton>
    </div>
  );
};

export default JoinSessionCTA;
