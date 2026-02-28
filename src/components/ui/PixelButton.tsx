"use client";

interface PixelButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "danger" | "success";
  size?: "sm" | "md" | "lg";
}

const VARIANTS = {
  primary: "bg-primary hover:bg-pink-400 text-white",
  danger: "bg-danger hover:bg-red-400 text-white",
  success: "bg-success hover:bg-teal-400 text-background",
};

const SIZES = {
  sm: "px-3 py-1.5 text-[8px]",
  md: "px-6 py-3 text-[10px]",
  lg: "px-8 py-4 text-xs",
};

export function PixelButton({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  size = "md",
}: PixelButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`font-pixel ${VARIANTS[variant]} ${SIZES[size]}
        rounded-lg shadow-lg transition-all duration-150 select-none
        active:translate-y-0.5 active:shadow-sm
        disabled:opacity-40 disabled:cursor-not-allowed disabled:active:translate-y-0
        border-b-4 border-black/20 active:border-b-0`}
    >
      {children}
    </button>
  );
}
