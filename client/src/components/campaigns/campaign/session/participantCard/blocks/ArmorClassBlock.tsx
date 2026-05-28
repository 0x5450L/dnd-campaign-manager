type ArmorClassBlockProps = {
  value: number;
  hidden: boolean;
  isDM: boolean;
  onToggleHidden?: () => void;
};

const EyeIcon = ({ open }: { open: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-3 w-3"
  >
    {open ? (
      <>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-7 0-10-7-10-7a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19" />
        <path d="M14.12 14.12A3 3 0 1 1 9.88 9.88" />
        <line x1="2" y1="2" x2="22" y2="22" />
      </>
    )}
  </svg>
);

export const ArmorClassBlock = ({
  value,
  hidden,
  isDM,
  onToggleHidden,
}: ArmorClassBlockProps) => {
  const display = hidden && !isDM ? "??" : value;
  const showToggle = isDM && onToggleHidden;

  return (
    <div className="relative flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-md border border-rule bg-bg/60 font-fantasy text-ink">
      <span className="text-[8px] uppercase tracking-[0.18em] text-faint">
        AC
      </span>
      <span
        className={`text-xl font-bold leading-none ${
          hidden && !isDM ? "text-faint" : "text-ink"
        } ${hidden && isDM ? "text-dim" : ""}`}
      >
        {display}
      </span>
      {showToggle && (
        <button
          type="button"
          onClick={onToggleHidden}
          aria-label={hidden ? "Reveal AC to players" : "Hide AC from players"}
          title={hidden ? "Hidden from players" : "Visible to players"}
          className="absolute -bottom-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-rule bg-bg text-faint transition-colors hover:border-hover hover:text-gold"
        >
          <EyeIcon open={!hidden} />
        </button>
      )}
    </div>
  );
};

export default ArmorClassBlock;
