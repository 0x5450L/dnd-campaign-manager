import { useNavigate } from "react-router-dom";
import CommonButton from "../components/ui/buttons/CommonButton";

function D20NatOne() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="w-40 h-40 md:w-48 md:h-48 text-rust drop-shadow-[0_0_18px_rgba(201,85,85,0.25)]"
      aria-hidden
    >
      <polygon
        points="100,10 180,55 180,145 100,190 20,145 20,55"
        fill="rgba(26,26,46,0.85)"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <polygon
        points="100,50 150,100 100,150 50,100"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        opacity="0.5"
      />
      <g stroke="currentColor" strokeWidth="1.25" opacity="0.5">
        <line x1="100" y1="10" x2="100" y2="50" />
        <line x1="180" y1="55" x2="150" y2="100" />
        <line x1="180" y1="145" x2="150" y2="100" />
        <line x1="100" y1="190" x2="100" y2="150" />
        <line x1="20" y1="145" x2="50" y2="100" />
        <line x1="20" y1="55" x2="50" y2="100" />
      </g>
      <text
        x="100"
        y="125"
        textAnchor="middle"
        fontFamily="Cinzel, Palatino, serif"
        fontWeight="700"
        fontSize="72"
        fill="var(--color-gold)"
      >
        1
      </text>
    </svg>
  );
}

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-bg">
      <div className="max-w-xl w-full flex flex-col items-center text-center gap-6">
        <div className="rotate-[-8deg]">
          <D20NatOne />
        </div>

        <div className="flex items-center gap-4 text-gold-dim">
          <span className="h-px w-16 bg-rule" />
          <span className="font-fantasy text-4xl md:text-5xl tracking-[0.2em] font-semibold">
            404
          </span>
          <span className="h-px w-16 bg-rule" />
        </div>

        <h1 className="font-fantasy text-2xl md:text-3xl text-gold tracking-wide">
          Natural 1 on Perception
        </h1>

        <p className="text-ink text-base max-w-md leading-relaxed">
          You wandered off the map. This page does not exist in any known realm
          &mdash; not in the archives, not in the libraries of Candlekeep, not even
          in a forgotten DM's notebook.
        </p>

        <p className="text-faint text-sm italic">
          Perhaps the link was lost to the ages, or the URL was mistyped in haste.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <CommonButton onClick={() => navigate("/", { replace: true })} variant="primary">
            Return to the Tavern
          </CommonButton>
          <CommonButton onClick={() => navigate(-1)} variant="secondary">
            Retrace Your Steps
          </CommonButton>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
