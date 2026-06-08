/**
 * @monochrome-edge/ui - React components
 */

import React, {
  useState,
  useContext,
  createContext,
  forwardRef,
  useId,
  useRef,
  useEffect,
  useLayoutEffect,
  ReactNode,
  CSSProperties,
} from "react";

// Re-export the interactive component wrappers (Accordion, Tabs, Dropdown,
// SearchBar, SearchToolbar, TreeView, Stepper, Math, GraphView) that wrap the
// canonical vanilla classes, so `@monochrome-edge/ui/react` exposes the full
// library surface from one entry point.
export * from "./react-interactive";

import {
  iconToggleIcons,
  nextIconToggleState,
  applyIconToggleState,
} from "./icon-toggle-data";

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
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
    <button
      type="button"
      className={btnClass}
      disabled={disabled || loading}
      {...props}
    >
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
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className = "", id, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  return (
    <div className="form-group">
      {label && (
        <label className="label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`input ${error ? "input-error" : ""} ${className}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error && (
        <span id={errorId} className="error-message" role="alert">
          {error}
        </span>
      )}
    </div>
  );
});

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
  const contentRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const titleId = useId();

  // Move focus into the dialog on open, restore it on close, and keep a
  // Tab cycle trapped inside while open (WCAG 2.4.3 / 2.1.2). useLayoutEffect
  // so the dialog node is committed before we read contentRef and focus it.
  useLayoutEffect(() => {
    if (!isOpen) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const root = contentRef.current;
    const focusable = () =>
      Array.from(
        root?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => !el.hasAttribute("disabled"));

    // Focus the first focusable element, or the dialog itself when it has none
    // (so focus never leaks back to the page behind the modal).
    (focusable()[0] ?? root)?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusable();
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal is-open">
      <div className="modal-backdrop" onClick={onClose} />
      <div
        ref={contentRef}
        className={`modal-content modal-${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
      >
        {title && (
          <div className="modal-header">
            <h3 className="modal-title" id={titleId}>
              {title}
            </h3>
            <button
              type="button"
              className="modal-close"
              aria-label="Close"
              onClick={onClose}
            >
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
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    { label, error, className = "", children, id, ...props },
    ref,
  ) {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const errorId = `${selectId}-error`;
    return (
      <div className="form-group">
        {label && (
          <label className="label" htmlFor={selectId}>
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`select ${error ? "select-error" : ""} ${className}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...props}
        >
          {children}
        </select>
        {error && (
          <span id={errorId} className="error-message" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  },
);

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
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, error, className = "", id, ...props }, ref) {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const errorId = `${textareaId}-error`;
    return (
      <div className="form-group">
        {label && (
          <label className="label" htmlFor={textareaId}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`textarea ${error ? "textarea-error" : ""} ${className}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...props}
        />
        {error && (
          <span id={errorId} className="error-message" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  },
);

// Checkbox Component
export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ label, className = "", ...props }, ref) {
    return (
      <label className={`checkbox ${className}`}>
        <input ref={ref} type="checkbox" {...props} />
        <span className="checkbox-mark"></span>
        {label && <span>{label}</span>}
      </label>
    );
  },
);

// Radio Component
export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { label, className = "", ...props },
  ref,
) {
  return (
    <label className={`radio ${className}`}>
      <input ref={ref} type="radio" {...props} />
      <span className="radio-mark"></span>
      {label && <span>{label}</span>}
    </label>
  );
});

// FormGroup Component
export interface FormGroupProps {
  children: ReactNode;
  className?: string;
}

export function FormGroup({ children, className = "" }: FormGroupProps) {
  return <div className={`form-group ${className}`}>{children}</div>;
}

// Label Component
export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
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

    toast.setAttribute("role", type === "error" ? "alert" : "status");

    let container = document.querySelector(".toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
      container.setAttribute("role", "status");
      container.setAttribute("aria-live", "polite");
      container.setAttribute("aria-atomic", "true");
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

// Unified TOC Component — convenience API over the TOC primitives.
export interface TOCEntry {
  id: string;
  label: string;
  href: string;
}

export interface TOCProps {
  items: TOCEntry[];
  activeId?: string;
  collapsible?: boolean;
  title?: string;
  className?: string;
  onItemClick?: (item: TOCEntry) => void;
}

export function TOC({
  items,
  activeId,
  collapsible = false,
  title = "Table of Contents",
  className = "",
  onItemClick,
}: TOCProps) {
  const [isOpen, setIsOpen] = useState(true);
  const headingId = useId();

  const list = (
    <ul className="toc-list">
      {items.map((item) => (
        <li key={item.id} className="toc-list-item">
          <a
            href={item.href}
            aria-current={item.id === activeId ? "location" : undefined}
            className={`toc-list-link ${item.id === activeId ? "is-active" : ""}`}
            onClick={() => onItemClick?.(item)}
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  );

  if (!collapsible) {
    return (
      <nav className={`toc ${className}`.trim()} aria-labelledby={headingId}>
        <h4 className="toc-title" id={headingId}>
          {title}
        </h4>
        {list}
      </nav>
    );
  }

  return (
    <nav
      className={`toc-collapsible ${isOpen ? "is-open" : ""} ${className}`.trim()}
      aria-labelledby={headingId}
    >
      <button
        type="button"
        className="toc-collapsible-header"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((v) => !v)}
      >
        {/* span, not <h4> — heading elements are not valid inside <button> */}
        <span className="toc-collapsible-title" id={headingId}>
          {title}
        </span>
        <span className="toc-collapsible-icon" aria-hidden="true">
          ▼
        </span>
      </button>
      <div className="toc-collapsible-content" hidden={!isOpen}>
        {list}
      </div>
    </nav>
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
  // SSR-safe default — never read `document` during render so the component
  // can be server-rendered (Next.js, Astro, VitePress, Docusaurus).
  const ssrSafeDefault = () => {
    switch (type) {
      case "mode":
        return "light";
      case "theme":
        return "warm";
      case "color":
        return "monochrome";
      case "language":
        return "ko";
      default:
        return "default";
    }
  };

  const [state, setState] = useState(ssrSafeDefault);
  const [isAnimating, setIsAnimating] = useState(false);

  // Sync from the live theme attributes after mount (client only).
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (type === "mode") {
      setState(document.documentElement.getAttribute("data-theme") || "light");
    } else if (type === "theme") {
      setState(
        document.documentElement.getAttribute("data-theme-variant") || "warm",
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const handleToggle = () => {
    if (disabled) return;

    setIsAnimating(true);

    const newState = nextIconToggleState(type, state);
    setState(newState);
    applyIconToggleState(type, newState);

    onToggle?.(newState);

    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  const [icon1, icon2] = iconToggleIcons(type);

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
      <span
        className="icon-btn-toggle-icon"
        // Static, trusted SVG markup from the shared icon-toggle data.
        dangerouslySetInnerHTML={{ __html: icon1 + icon2 }}
      />
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
