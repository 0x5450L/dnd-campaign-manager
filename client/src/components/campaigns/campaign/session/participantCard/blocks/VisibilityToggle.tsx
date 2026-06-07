import { EyeIcon } from "./icons";

type VisibilityToggleProps = {
  isVisible: boolean;
  onToggle: () => void;
};

export const VisibilityToggle = ({
  isVisible,
  onToggle,
}: VisibilityToggleProps) => (
  <button
    type="button"
    onClick={onToggle}
    aria-label={isVisible ? "Hide from players" : "Reveal to players"}
    title={isVisible ? "Visible to players" : "Hidden from players"}
    className={`flex h-6 w-6 items-center justify-center rounded border transition-colors ${
      isVisible
        ? "border-rule text-faint hover:border-hover hover:text-ink"
        : "border-[#7a5aa5]/60 bg-[#7a5aa5]/15 text-[#c8b0e0] hover:bg-[#7a5aa5]/25"
    }`}
  >
    <EyeIcon open={isVisible} />
  </button>
);

export default VisibilityToggle;
