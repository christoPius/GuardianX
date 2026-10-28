import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
}

const VARIANT_CLASSES: Record<string, string> = {
  primary:
    "bg-signal-info text-ground hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100",
  secondary:
    "bg-panel-raised text-ink border border-hairline-strong hover:border-ink-muted disabled:opacity-40",
  danger:
    "bg-signal-high-dim text-signal-high border border-signal-high/30 hover:brightness-125 disabled:opacity-40",
  ghost: "text-ink-muted hover:text-ink hover:bg-panel-raised disabled:opacity-40",
};

export function Button({ children, variant = "secondary", className = "", ...rest }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-[3px] px-3.5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
