type CommonButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "accept" | "decline";
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const variantStyles: Record<NonNullable<CommonButtonProps["variant"]>, string> = {
  primary:
    "border border-gold-dim bg-gradient-to-b from-gold-bright to-gold-dim text-bg font-fantasy font-bold uppercase tracking-widest hover:brightness-110 active:scale-[0.97]",
  secondary:
    "border border-rule bg-transparent text-dim font-fantasy uppercase tracking-widest hover:text-ink hover:border-hover hover:bg-surface-light/30 active:scale-[0.97]",
  accept:
    "border border-leaf/70 bg-leaf/15 text-leaf-soft font-fantasy font-bold uppercase tracking-widest hover:bg-leaf/25 hover:brightness-110 active:scale-[0.97]",
  decline:
    "border border-rust/70 bg-rust/15 text-rust-soft font-fantasy font-bold uppercase tracking-widest hover:bg-rust/25 hover:brightness-110 active:scale-[0.97]",
};

const sizeStyles: Record<NonNullable<CommonButtonProps["size"]>, string> = {
  sm: "text-xs px-3 py-1.5",
  md: "text-sm px-5 py-2.5",
  lg: "text-sm px-6 py-3",
};

function CommonButton({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  size = "md",
  className = "",
}: CommonButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex cursor-pointer items-center justify-center rounded-md transition-[filter,transform,background-color,color,border-color] duration-150 ${variantStyles[variant]} ${sizeStyles[size]} ${
        disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
      } ${className}`}
    >
      {children}
    </button>
  );
}

export default CommonButton;
