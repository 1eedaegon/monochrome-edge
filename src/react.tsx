/**
 * @monochrome-edge/ui - React components
 */

import React, {
  useState,
  useContext,
  createContext,
  ReactNode,
  CSSProperties,
} from "react";

// Theme Context
interface ThemeContextType {
  theme: "warm" | "cold";
  mode: "light" | "dark";
  setTheme: (theme: "warm" | "cold") => void;
  setMode: (mode: "light" | "dark") => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "warm",
  mode: "light",
  setTheme: () => {},
  setMode: () => {},
  toggleMode: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: "warm" | "cold";
  defaultMode?: "light" | "dark";
}

export function ThemeProvider({
  children,
  defaultTheme = "warm",
  defaultMode = "light",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<"warm" | "cold">(defaultTheme);
  const [mode, setMode] = useState<"light" | "dark">(defaultMode);

  const toggleMode = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
    document.documentElement.setAttribute("data-theme-variant", theme);
  }, [mode, theme]);

  return (
    <ThemeContext.Provider
      value={{ theme, mode, setTheme, setMode, toggleMode }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// Button Component
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "small" | "medium" | "large";
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "medium",
  loading = false,
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  const btnClass = [
    "btn",
    `btn-${variant}`,
    size !== "medium" && `btn-${size}`,
    loading && "loading",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={btnClass} disabled={disabled || loading} {...props}>
      {children}
    </button>
  );
}

// Card Component
export interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function Card({ title, children, className = "", style }: CardProps) {
  return (
    <div className={`card ${className}`} style={style}>
      {title && <div className="card-header">{title}</div>}
      <div className="card-body">{children}</div>
    </div>
  );
}

// Layout Components
export interface LayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  header?: ReactNode;
  className?: string;
}

export function Layout({
  children,
  sidebar,
  header,
  className = "",
}: LayoutProps) {
  return (
    <div className={`ui-layout ${className}`}>
      {sidebar && <aside className="sidebar">{sidebar}</aside>}
      <div className="main-container">
        {header && <header className="header">{header}</header>}
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}

// Form Components
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className="form-group">
      {label && <label className="label">{label}</label>}
      <input
        className={`input ${error ? "input-error" : ""} ${className}`}
        {...props}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
}

// Modal Component
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "small" | "medium" | "large";
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "medium",
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal is-open">
      <div className="modal-backdrop" onClick={onClose} />
      <div className={`modal-content modal-${size}`}>
        {title && (
          <div className="modal-header">
            <h3 className="modal-title">{title}</h3>
            <button className="modal-close" onClick={onClose}>
              ×
            </button>
          </div>
        )}
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

// Table Components
export interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className = "" }: TableProps) {
  return <table className={`table ${className}`}>{children}</table>;
}

export interface TableHeaderProps {
  children: ReactNode;
}

export function TableHeader({ children }: TableHeaderProps) {
  return <thead>{children}</thead>;
}

export function TableBody({ children }: TableHeaderProps) {
  return <tbody>{children}</tbody>;
}

export interface TableRowProps {
  children: ReactNode;
  onClick?: () => void;
}

export function TableRow({ children, onClick }: TableRowProps) {
  return <tr onClick={onClick}>{children}</tr>;
}

export interface TableCellProps {
  children: ReactNode;
  header?: boolean;
  className?: string;
}

export function TableCell({
  children,
  header = false,
  className = "",
}: TableCellProps) {
  const Tag = header ? "th" : "td";
  return <Tag className={className}>{children}</Tag>;
}

// Navigation Components
export interface NavProps {
  children: ReactNode;
  className?: string;
}

export function Nav({ children, className = "" }: NavProps) {
  return <nav className={`nav ${className}`}>{children}</nav>;
}

export interface NavGroupProps {
  title?: string;
  children: ReactNode;
}

export function NavGroup({ title, children }: NavGroupProps) {
  return (
    <div className="nav-group">
      {title && <div className="nav-group-title">{title}</div>}
      <div className="nav-group-items">{children}</div>
    </div>
  );
}

export interface NavItemProps {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  href?: string;
}

export function NavItem({
  children,
  active = false,
  onClick,
  href = "#",
}: NavItemProps) {
  return (
    <a
      href={href}
      className={`nav-item ${active ? "is-active" : ""}`}
      onClick={(e) => {
        e.preventDefault();
        onClick?.();
      }}
    >
      {children}
    </a>
  );
}

// Select Component
export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Select({
  label,
  error,
  className = "",
  children,
  ...props
}: SelectProps) {
  return (
    <div className="form-group">
      {label && <label className="label">{label}</label>}
      <select
        className={`select ${error ? "select-error" : ""} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="error-message">{error}</span>}
    </div>
  );
}

// Badge Component
export interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "danger";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  return (
    <span className={`badge badge-${variant} ${className}`}>{children}</span>
  );
}

// Textarea Component
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({
  label,
  error,
  className = "",
  ...props
}: TextareaProps) {
  return (
    <div className="form-group">
      {label && <label className="label">{label}</label>}
      <textarea
        className={`textarea ${error ? "textarea-error" : ""} ${className}`}
        {...props}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
}

// Checkbox Component
export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Checkbox({ label, className = "", ...props }: CheckboxProps) {
  return (
    <label className={`checkbox ${className}`}>
      <input type="checkbox" {...props} />
      <span className="checkbox-mark"></span>
      {label && <span>{label}</span>}
    </label>
  );
}

// Radio Component
export interface RadioProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Radio({ label, className = "", ...props }: RadioProps) {
  return (
    <label className={`radio ${className}`}>
      <input type="radio" {...props} />
      <span className="radio-mark"></span>
      {label && <span>{label}</span>}
    </label>
  );
}

// FormGroup Component
export interface FormGroupProps {
  children: ReactNode;
  className?: string;
}

export function FormGroup({ children, className = "" }: FormGroupProps) {
  return <div className={`form-group ${className}`}>{children}</div>;
}

// Label Component
export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({
  children,
  required = false,
  className = "",
  ...props
}: LabelProps) {
  return (
    <label className={`label ${className}`} {...props}>
      {children}
      {required && <span className="text-danger">*</span>}
    </label>
  );
}

// Toast Hook
export function useToast() {
  const show = (
    message: string,
    type: "success" | "error" | "info" = "info",
  ) => {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    let container = document.querySelector(".toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  return {
    success: (message: string) => show(message, "success"),
    error: (message: string) => show(message, "error"),
    info: (message: string) => show(message, "info"),
  };
}

// TOC Components
export interface TocItem {
  href: string;
  text: string;
  isActive?: boolean;
}

export interface TocHoverCardProps {
  items: TocItem[];
  title?: string;
  className?: string;
}

export function TocHoverCard({
  items,
  title = "Contents",
  className = "",
}: TocHoverCardProps) {
  return (
    <div className={`toc-hover-card ${className}`}>
      <div className="toc-card">
        <h4 className="toc-card-title">{title}</h4>
        <ul className="toc-card-list">
          {items.map((item, index) => (
            <li key={index} className="toc-card-item">
              <a
                href={item.href}
                className={`toc-card-link ${item.isActive ? "is-active" : ""}`}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export interface TocCollapsibleProps {
  items: TocItem[];
  title?: string;
  defaultOpen?: boolean;
  className?: string;
}

export function TocCollapsible({
  items,
  title = "Table of Contents",
  defaultOpen = true,
  className = "",
}: TocCollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`toc-collapsible ${isOpen ? "is-open" : ""} ${className}`}>
      <div
        className="toc-collapsible-header"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h4 className="toc-collapsible-title">{title}</h4>
        <span className="toc-collapsible-icon">▼</span>
      </div>
      <div className="toc-collapsible-content">
        <ul className="toc-list">
          {items.map((item, index) => (
            <li key={index} className="toc-list-item">
              <a
                href={item.href}
                className={`toc-list-link ${item.isActive ? "is-active" : ""}`}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Changelog Components
export interface ChangelogEntry {
  version: string;
  date: string;
  categories: {
    title: string;
    items: { commit: string; hash: string; url?: string }[];
  }[];
}

export interface ChangelogProps {
  entries: ChangelogEntry[];
  itemsPerPage?: number;
  className?: string;
}

export function Changelog({
  entries,
  itemsPerPage = 10,
  className = "",
}: ChangelogProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(entries.length / itemsPerPage);

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const visibleEntries = entries.slice(start, end);

  return (
    <div className={`changelog-container ${className}`}>
      {visibleEntries.map((entry, index) => (
        <div
          key={index}
          className="changelog-entry"
          data-version={entry.version}
        >
          <h3 className="changelog-version">
            v{entry.version}{" "}
            <span className="changelog-date">{entry.date}</span>
          </h3>
          <div className="changelog-content">
            {entry.categories.map((category, catIndex) => (
              <div key={catIndex} className="changelog-category">
                <h4 className="changelog-category-title">{category.title}</h4>
                <ul className="changelog-list">
                  {category.items.map((item, itemIndex) => (
                    <li key={itemIndex}>
                      <span className="changelog-commit">{item.commit}</span>
                      <a
                        href={item.url || "#"}
                        className="changelog-hash"
                        title={item.hash}
                      >
                        {item.hash.substring(0, 7)}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ))}

      {totalPages > 1 && (
        <div className="changelog-pagination">
          <button
            className="changelog-pagination-btn"
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="changelog-pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="changelog-pagination-btn"
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

// Icon Toggle Component
export interface IconToggleProps {
  type?: "mode" | "theme" | "color" | "language";
  variant?: "default" | "ghost";
  disabled?: boolean;
  onToggle?: (state: string) => void;
  className?: string;
}

export function IconToggle({
  type = "mode",
  variant = "default",
  disabled = false,
  onToggle,
  className = "",
}: IconToggleProps) {
  const getDefaultState = () => {
    switch (type) {
      case "mode":
        return document.documentElement.getAttribute("data-theme") || "light";
      case "theme":
        return (
          document.documentElement.getAttribute("data-theme-variant") || "warm"
        );
      case "color":
        return "monochrome";
      case "language":
        return "ko";
      default:
        return "default";
    }
  };

  const [state, setState] = useState(getDefaultState());
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    if (disabled) return;

    setIsAnimating(true);

    const stateMap: Record<string, Record<string, string>> = {
      mode: { light: "dark", dark: "light" },
      theme: { warm: "cold", cold: "warm" },
      color: { monochrome: "colored", colored: "monochrome" },
      language: { ko: "en", en: "ko" },
    };

    const newState = stateMap[type]?.[state] || state;
    setState(newState);

    // Apply to document
    switch (type) {
      case "mode":
        document.documentElement.setAttribute("data-theme", newState);
        break;
      case "theme":
        document.documentElement.setAttribute("data-theme-variant", newState);
        break;
    }

    onToggle?.(newState);

    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  const getIcons = () => {
    const iconSets: Record<
      string,
      { icon1: React.ReactElement; icon2: React.ReactElement }
    > = {
      mode: {
        icon1: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        ),
        icon2: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ),
      },
      theme: {
        icon1: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
          </svg>
        ),
        icon2: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="2" x2="12" y2="6" />
            <line x1="12" y1="18" x2="12" y2="22" />
            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
            <line x1="2" y1="12" x2="6" y2="12" />
            <line x1="18" y1="12" x2="22" y2="12" />
            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
          </svg>
        ),
      },
      color: {
        icon1: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12h8" />
          </svg>
        ),
        icon2: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </svg>
        ),
      },
      language: {
        icon1: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        ),
        icon2: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18" />
            <path d="M9 21V9" />
          </svg>
        ),
      },
    };

    return iconSets[type] || iconSets.mode;
  };

  const icons = getIcons();
  if (!icons) return null;

  const btnClass = [
    "icon-btn-toggle",
    `icon-btn-toggle-${type}`,
    variant === "ghost" && "icon-btn-toggle-ghost",
    type === "color" && "icon-btn-toggle-colored",
    isAnimating && "is-animating",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={btnClass}
      data-state={state}
      disabled={disabled}
      onClick={handleToggle}
    >
      <span className="icon-btn-toggle-icon">
        {icons.icon1}
        {icons.icon2}
      </span>
    </button>
  );
}

// Breadcrumb Components
export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: string;
  variant?: "default" | "compact" | "large" | "contained";
  maxItems?: number;
  className?: string;
}

export function Breadcrumb({
  items,
  separator = "/",
  variant = "default",
  maxItems,
  className = "",
}: BreadcrumbProps) {
  const breadcrumbClass = [
    "breadcrumb",
    variant !== "default" && `breadcrumb-${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  let displayItems = items;

  // Handle max items with ellipsis
  if (maxItems && items.length > maxItems) {
    const firstItems = items.slice(0, Math.floor(maxItems / 2));
    const lastItems = items.slice(-Math.ceil(maxItems / 2));
    displayItems = [
      ...firstItems,
      { label: "...", href: undefined, active: false },
      ...lastItems,
    ];
  }

  return (
    <nav className={breadcrumbClass} aria-label="Breadcrumb">
      {displayItems.map((item, index) => (
        <React.Fragment key={index}>
          <span className={`breadcrumb-item${item.active ? " is-active" : ""}`}>
            {item.href && !item.active ? (
              <a href={item.href}>{item.label}</a>
            ) : (
              item.label
            )}
          </span>
          {index < displayItems.length - 1 && (
            <span className="breadcrumb-separator" aria-hidden="true">
              {separator}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
