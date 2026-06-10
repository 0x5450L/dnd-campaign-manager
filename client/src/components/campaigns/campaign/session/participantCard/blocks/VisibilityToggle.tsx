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
        : "border-arcane/60 bg-arcane/15 text-arcane-soft hover:bg-arcane/25"
    }`}
  >
    <EyeIcon open={isVisible} />
  </button>
);

export default VisibilityToggle;
