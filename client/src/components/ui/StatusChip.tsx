export type StatusChipState =
  | { status: "idle" }
  | { status: "success"; message?: string }
  | { status: "error"; message?: string };

type StatusChipProps = {
  state: StatusChipState;
  onDismiss: () => void;
};

export const StatusChip = ({ state, onDismiss }: StatusChipProps) => {
  if (state.status === "idle") return null;

  const isSuccess = state.status === "success";
  const defaultMessage = isSuccess ? "Saved" : "Save failed";
  const message = state.message ?? defaultMessage;

  return (
    <button
      type="button"
      onClick={onDismiss}
      title={message}
      aria-label={`${message} (click to dismiss)`}
      className={`h-10 px-3 max-w-[14rem] rounded-full border cursor-pointer transition-colors duration-200 flex items-center gap-2 shadow-lg backdrop-blur-sm ${
        isSuccess
          ? "bg-emerald-700/90 hover:bg-emerald-600 border-emerald-500 text-emerald-50"
          : "bg-red-700/90 hover:bg-red-600 border-red-500 text-red-50"
      }`}
    >
      {isSuccess ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 shrink-0"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 10l3 3 7-7" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 shrink-0"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-5a1 1 0 102 0V9a1 1 0 10-2 0v4zm1-8a1 1 0 100 2 1 1 0 000-2z"
            clipRule="evenodd"
          />
        </svg>
      )}
      <span className="text-sm font-medium truncate">{message}</span>
    </button>
  );
};
