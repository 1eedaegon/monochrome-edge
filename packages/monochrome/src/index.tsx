// Main entry point for @monochrome package
import React from 'react';

// Button Component
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClass = size === 'small' ? 'btn-small' : size === 'large' ? 'btn-large' : '';
  const classes = `btn btn-${variant} ${sizeClass} ${loading ? 'loading' : ''} ${className}`.trim();
  
  return (
    <button 
      className={classes} 
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="spinner spinner-small" />}
      {children}
    </button>
  );
};

// Card Component
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  clickable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  hoverable = false,
  clickable = false,
  children,
  className = '',
  ...props
}) => {
  const classes = `card ${hoverable ? 'card-hoverable' : ''} ${clickable ? 'card-clickable' : ''} ${className}`.trim();
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`card-header ${className}`.trim()} {...props}>{children}</div>
);

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`card-body ${className}`.trim()} {...props}>{children}</div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`card-footer ${className}`.trim()} {...props}>{children}</div>
);

// Form Components
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  success?: boolean;
}

export const Input: React.FC<InputProps> = ({
  error = false,
  success = false,
  className = '',
  ...props
}) => {
  const statusClass = error ? 'input-error' : success ? 'input-success' : '';
  const classes = `input ${statusClass} ${className}`.trim();
  
  return <input className={classes} {...props} />;
};

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  optional?: boolean;
}

export const Label: React.FC<LabelProps> = ({
  required = false,
  optional = false,
  children,
  className = '',
  ...props
}) => {
  const modifierClass = required ? 'label-required' : optional ? 'label-optional' : '';
  const classes = `label ${modifierClass} ${className}`.trim();
  
  return (
    <label className={classes} {...props}>
      {children}
    </label>
  );
};

export const FormGroup: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`form-group ${className}`.trim()} {...props}>{children}</div>
);

// Theme Hook
export const useTheme = () => {
  const [theme, setTheme] = React.useState<'warm' | 'cold'>('cold');
  const [mode, setMode] = React.useState<'light' | 'dark'>('light');

  React.useEffect(() => {
    // Check initial theme
    const linkElement = document.getElementById('theme-link') as HTMLLinkElement;
    if (linkElement) {
      const currentTheme = linkElement.href.includes('warm') ? 'warm' : 'cold';
      setTheme(currentTheme);
    }

    // Check initial mode
    const htmlElement = document.documentElement;
    const currentMode = htmlElement.getAttribute('data-theme') as 'light' | 'dark' || 'light';
    setMode(currentMode);
  }, []);

  const toggleTheme = React.useCallback(() => {
    const newTheme = theme === 'warm' ? 'cold' : 'warm';
    const linkElement = document.getElementById('theme-link') as HTMLLinkElement;
    if (linkElement) {
      linkElement.href = linkElement.href.replace(theme, newTheme);
    }
    setTheme(newTheme);
  }, [theme]);

  const toggleMode = React.useCallback(() => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newMode);
    setMode(newMode);
  }, [mode]);

  return { theme, mode, toggleTheme, toggleMode, setTheme, setMode };
};

// Export all components
export default {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Label,
  FormGroup,
  useTheme
};