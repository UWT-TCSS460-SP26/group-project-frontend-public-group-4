import type { HTMLAttributes } from "react";

interface SurfaceCardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "sm" | "md" | "lg";
}

const paddingClass = { sm: "p-3", md: "p-4", lg: "p-5 sm:p-6" };

export default function SurfaceCard({
  padding = "md",
  className = "",
  children,
  ...props
}: SurfaceCardProps) {
  return (
    <div
      className={`surface-card ${paddingClass[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}