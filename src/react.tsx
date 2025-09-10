/**
 * @monochrome-edge/ui - React components
 */

import React, { useState, useContext, createContext, ReactNode, CSSProperties } from 'react';

// Theme Context
interface ThemeContextType {
  theme: 'warm' | 'cold';
  mode: 'light' | 'dark';
  setTheme: (theme: 'warm' | 'cold') => void;
  setMode: (mode: 'light' | 'dark') => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'warm',
  mode: 'light',
  setTheme: () => {},
  setMode: () => {},
  toggleMode: () => {}
});

export const useTheme = () => useContext(ThemeContext);

export interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: 'warm' | 'cold';
  defaultMode?: 'light' | 'dark';
}

export function ThemeProvider({ 
  children, 
  defaultTheme = 'warm', 
  defaultMode = 'light' 
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<'warm' | 'cold'>(defaultTheme);
  const [mode, setMode] = useState<'light' | 'dark'>(defaultMode);

  const toggleMode = () => {
    setMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    document.documentElement.setAttribute('data-theme-variant', theme);
  }, [mode, theme]);

  return (
    <ThemeContext.Provider value={{ theme, mode, setTheme, setMode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Button Component
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
}

export function Button({ 
  variant = 'primary', 
  size = 'medium', 
  loading = false,
  className = '',
  disabled,
  children,
  ...props 
}: ButtonProps) {
  const btnClass = [
    'btn',
    `btn-${variant}`,
    size !== 'medium' && `btn-${size}`,
    loading && 'loading',
    className
  ].filter(Boolean).join(' ');

  return (
    <button 
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

export function Card({ title, children, className = '', style }: CardProps) {
  return (
    <div className={`card ${className}`} style={style}>
      {title && (
        <div className="card-header">
          {title}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
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

export function Layout({ children, sidebar, header, className = '' }: LayoutProps) {
  return (
    <div className={`ui-layout ${className}`}>
      {sidebar && (
        <aside className="sidebar">
          {sidebar}
        </aside>
      )}
      <div className="main-container">
        {header && (
          <header className="header">
            {header}
          </header>
        )}
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}

// Form Components
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="form-group">
      {label && <label className="label">{label}</label>}
      <input className={`input ${error ? 'input-error' : ''} ${className}`} {...props} />
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
  size?: 'small' | 'medium' | 'large';
}

export function Modal({ isOpen, onClose, title, children, size = 'medium' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal is-open">
      <div className="modal-backdrop" onClick={onClose} />
      <div className={`modal-content modal-${size}`}>
        {title && (
          <div className="modal-header">
            <h3 className="modal-title">{title}</h3>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
        )}
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}

// Table Components
export interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <table className={`table ${className}`}>
      {children}
    </table>
  );
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

export function TableCell({ children, header = false, className = '' }: TableCellProps) {
  const Tag = header ? 'th' : 'td';
  return <Tag className={className}>{children}</Tag>;
}

// Navigation Components
export interface NavProps {
  children: ReactNode;
  className?: string;
}

export function Nav({ children, className = '' }: NavProps) {
  return (
    <nav className={`nav ${className}`}>
      {children}
    </nav>
  );
}

export interface NavGroupProps {
  title?: string;
  children: ReactNode;
}

export function NavGroup({ title, children }: NavGroupProps) {
  return (
    <div className="nav-group">
      {title && <div className="nav-group-title">{title}</div>}
      <div className="nav-group-items">
        {children}
      </div>
    </div>
  );
}

export interface NavItemProps {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  href?: string;
}

export function NavItem({ children, active = false, onClick, href = '#' }: NavItemProps) {
  return (
    <a 
      href={href}
      className={`nav-item ${active ? 'is-active' : ''}`}
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

export function Select({ label, error, className = '', children, ...props }: SelectProps) {
  return (
    <div className="form-group">
      {label && <label className="label">{label}</label>}
      <select className={`select ${error ? 'select-error' : ''} ${className}`} {...props}>
        {children}
      </select>
      {error && <span className="error-message">{error}</span>}
    </div>
  );
}

// Badge Component
export interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {children}
    </span>
  );
}

// Textarea Component
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  return (
    <div className="form-group">
      {label && <label className="label">{label}</label>}
      <textarea className={`textarea ${error ? 'textarea-error' : ''} ${className}`} {...props} />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
}

// Checkbox Component
export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Checkbox({ label, className = '', ...props }: CheckboxProps) {
  return (
    <label className={`checkbox ${className}`}>
      <input type="checkbox" {...props} />
      <span className="checkbox-mark"></span>
      {label && <span>{label}</span>}
    </label>
  );
}

// Radio Component
export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Radio({ label, className = '', ...props }: RadioProps) {
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

export function FormGroup({ children, className = '' }: FormGroupProps) {
  return (
    <div className={`form-group ${className}`}>
      {children}
    </div>
  );
}

// Label Component
export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({ children, required = false, className = '', ...props }: LabelProps) {
  return (
    <label className={`label ${className}`} {...props}>
      {children}
      {required && <span className="text-danger">*</span>}
    </label>
  );
}

// Toast Hook
export function useToast() {
  const show = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  return {
    success: (message: string) => show(message, 'success'),
    error: (message: string) => show(message, 'error'),
    info: (message: string) => show(message, 'info')
  };
}