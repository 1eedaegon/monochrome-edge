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