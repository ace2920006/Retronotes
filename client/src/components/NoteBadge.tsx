"use client";

import React from "react";

interface NoteBadgeProps {
  label: string;
  variant?: "accent" | "muted" | "warning" | "danger";
  icon?: string;
  onClick?: () => void;
  className?: string;
}

const variantStyles = {
  accent: "border-[var(--accent-color)] text-[var(--accent-color)] bg-[var(--accent-color)]/10",
  muted: "border-[var(--border-color)] text-[var(--fg-color)]/70 bg-[var(--panel-bg)]",
  warning: "border-amber-500 text-amber-400 bg-amber-500/10",
  danger: "border-red-500 text-red-400 bg-red-500/10",
};

export default function NoteBadge({
  label,
  variant = "muted",
  icon,
  onClick,
  className = "",
}: NoteBadgeProps) {
  const Component = onClick ? "button" : "span";

  return (
    <Component
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono uppercase font-bold border transition-colors ${variantStyles[variant]} ${
        onClick ? "cursor-pointer hover:opacity-80" : ""
      } ${className}`}
    >
      {icon && <span>{icon}</span>}
      <span>{label}</span>
    </Component>
  );
}
