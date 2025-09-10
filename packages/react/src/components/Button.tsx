import React, { ButtonHTMLAttributes, FC } from "react";
import "../../../ui/monochrome-edge.css";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  size?: "small" | "medium" | "large";
  loading?: boolean;
}

export const Button: FC<ButtonProps> = ({
  variant = "primary",
  size = "medium",
  loading = false,
  children,
  className = "",
  disabled,
  ...props
}) => {
  const sizeClass =
    size === "small" ? "btn-small" : size === "large" ? "btn-large" : "";
  const classes =
    `btn btn-${variant} ${sizeClass} ${loading ? "loading" : ""} ${className}`.trim();

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading && <span className="spinner" />}
      {children}
    </button>
  );
};
