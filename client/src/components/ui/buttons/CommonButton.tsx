type CommonButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "accept" | "decline";
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
};

const variantStyles: Record<string, string> = {
  primary:
    "bg-amber-600 hover:bg-amber-500 text-white font-semibold border border-transparent",
  secondary:
    "bg-transparent hover:bg-gray-700/50 text-gray-400 hover:text-gray-200 border border-transparent",
  accept:
    "bg-green-900/50 hover:bg-green-800 text-green-300 font-semibold border border-green-800",
  decline:
    "bg-red-900/50 hover:bg-red-800 text-red-300 font-semibold border border-red-800",
};

const sizeStyles: Record<string, string> = {
  sm: "text-sm px-4 py-2",
  md: "px-4 py-2.5",
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
      className={`rounded-lg cursor-pointer transition-colors duration-200 ${variantStyles[variant]} ${sizeStyles[size]} ${
        disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
      } ${className}`}
    >
      {children}
    </button>
  );
}

export default CommonButton;
