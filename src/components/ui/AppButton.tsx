import { forwardRef, ButtonHTMLAttributes } from "react";

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "icon" | "text";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const AppButton = forwardRef<HTMLButtonElement, AppButtonProps>(
  ({ variant = "secondary", size = "md", className = "", children, ...props }, ref) => {
    const variantClasses = {
      primary: "bg-[color:var(--primary-color)] text-[color:var(--primary-foreground)] hover:bg-[color:var(--primary-hover)] disabled:opacity-50",
      secondary: "bg-[color:var(--btn-secondary-bg)] text-[color:var(--btn-secondary-text)] hover:bg-[color:var(--btn-secondary-hover-bg)] disabled:opacity-50",
      destructive: "bg-[color:var(--destructive-color)] text-[color:var(--destructive-foreground)] hover:bg-[color:var(--destructive-hover)] disabled:opacity-50",
      icon: "p-1.5 rounded-md transition-colors text-[color:var(--text-secondary)] hover:text-[color:var(--primary-color)] hover:bg-[color:var(--surface-bg-hover)] disabled:opacity-50",
      text: "text-[color:var(--primary-color)] hover:text-[color:var(--primary-hover)] font-semibold uppercase tracking-wider transition-colors disabled:opacity-50",
    };

    const sizeClasses = {
      sm: "px-3 py-1 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    return (
      <button
        ref={ref}
        className={`rounded-md transition-colors font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

AppButton.displayName = "AppButton";
export default AppButton;
