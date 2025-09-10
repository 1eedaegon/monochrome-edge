/**
 * Core type definitions for Monochrome Edge UI Components
 */

// Theme types
export type Theme = 'warm' | 'cold';
export type Mode = 'light' | 'dark';

// Component variant types
export type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'success' | 'warning' | 'info';
export type Size = 'small' | 'medium' | 'large';
export type Status = 'idle' | 'loading' | 'success' | 'error';

// Base component props
export interface BaseComponentProps {
  className?: string;
  id?: string;
  style?: Record<string, string | number>;
  'data-testid'?: string;
}

// Button types
export interface ButtonProps extends BaseComponentProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  type?: 'button' | 'submit' | 'reset';
  onClick?: (event: MouseEvent) => void;
}

// Input types
export interface InputProps extends BaseComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  placeholder?: string;
  value?: string | number;
  defaultValue?: string | number;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  size?: Size;
  onChange?: (value: string) => void;
  onBlur?: (event: FocusEvent) => void;
  onFocus?: (event: FocusEvent) => void;
}

// Select types
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends BaseComponentProps {
  options: SelectOption[];
  value?: string | number;
  defaultValue?: string | number;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  size?: Size;
  multiple?: boolean;
  onChange?: (value: string | string[]) => void;
}

// Card types
export interface CardProps extends BaseComponentProps {
  variant?: 'default' | 'bordered' | 'elevated' | 'interactive';
  padding?: Size | 'none';
  onClick?: (event: MouseEvent) => void;
}

// Modal types
export interface ModalProps extends BaseComponentProps {
  open: boolean;
  title?: string;
  size?: Size | 'fullscreen';
  closeOnOverlay?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  onClose: () => void;
}

// Toast types
export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
  position?: ToastPosition;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
}

// Table types
export interface Column<T = any> {
  key: string;
  header: string;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render?: (value: any, row: T) => string | HTMLElement;
}

export interface TableProps<T = any> extends BaseComponentProps {
  columns: Column<T>[];
  data: T[];
  striped?: boolean;
  bordered?: boolean;
  hoverable?: boolean;
  compact?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T, index: number) => void;
  onSort?: (column: Column<T>, direction: 'asc' | 'desc') => void;
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'switch';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: SelectOption[];
  validation?: (value: any) => string | null;
  defaultValue?: any;
}

export interface FormProps extends BaseComponentProps {
  fields: FormField[];
  values?: Record<string, any>;
  errors?: Record<string, string>;
  onSubmit: (values: Record<string, any>) => void | Promise<void>;
  onChange?: (name: string, value: any) => void;
  validationMode?: 'onChange' | 'onBlur' | 'onSubmit';
}

// Navigation types
export interface NavItem {
  id: string;
  label: string;
  href?: string;
  icon?: string;
  badge?: string | number;
  active?: boolean;
  disabled?: boolean;
  children?: NavItem[];
}

export interface NavigationProps extends BaseComponentProps {
  items: NavItem[];
  variant?: 'vertical' | 'horizontal';
  collapsible?: boolean;
  onItemClick?: (item: NavItem) => void;
}

// Layout types
export interface LayoutProps extends BaseComponentProps {
  theme?: Theme;
  mode?: Mode;
  sidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type ValueOf<T> = T[keyof T];

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;
