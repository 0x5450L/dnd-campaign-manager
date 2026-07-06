type AddButtonProps = {
  label: string;
  onClick: () => void;
  className?: string;
};

export const AddButton = ({ label, onClick, className = "" }: AddButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`self-start text-xs text-dim hover:text-gold cursor-pointer transition-colors ${className}`}
  >
    {label}
  </button>
);
