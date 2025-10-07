import React, { ButtonHTMLAttributes, FC } from "react";
import "../../../ui/monochrome-edge.css";

export type IconType = "flame" | "snowflake" | "sun" | "moon";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconType;
  variant?: "default" | "primary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg" | "xl";
  active?: boolean;
  loading?: boolean;
}

const icons: Record<IconType, JSX.Element> = {
  flame: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
    </svg>
  ),
  snowflake: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="2" x2="22" y1="12" y2="12"/>
      <line x1="12" x2="12" y1="2" y2="22"/>
      <path d="m20 16-4-4 4-4"/>
      <path d="m4 8 4 4-4 4"/>
      <path d="m16 4-4 4-4-4"/>
      <path d="m8 20 4-4 4 4"/>
    </svg>
  ),
  sun: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2"/>
      <path d="M12 20v2"/>
      <path d="m4.93 4.93 1.41 1.41"/>
      <path d="m17.66 17.66 1.41 1.41"/>
      <path d="M2 12h2"/>
      <path d="M20 12h2"/>
      <path d="m6.34 17.66-1.41 1.41"/>
      <path d="m19.07 4.93-1.41 1.41"/>
    </svg>
  ),
  moon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
    </svg>
  ),
};

export const IconButton: FC<IconButtonProps> = ({
  icon,
  variant = "default",
  size = "md",
  active = false,
  loading = false,
  className = "",
  disabled,
  ...props
}) => {
  const sizeClass = size !== "md" ? `icon-btn-${size}` : "";
  const variantClass = variant !== "default" ? `icon-btn-${variant}` : "";
  const classes = `icon-btn ${sizeClass} ${variantClass} ${active ? "active" : ""} ${loading ? "loading" : ""} ${className}`.trim();

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {icons[icon]}
    </button>
  );
};
