// Providers
export { ThemeProvider, useTheme } from './providers/ThemeProvider';
export type { ThemeProviderProps } from './providers/ThemeProvider';

// Components
export { Button } from './components/Button';
export type { ButtonProps } from './components/Button';

export { Input } from './components/Input';
export type { InputProps } from './components/Input';

export { Modal, useModal } from './components/Modal';
export type { ModalProps } from './components/Modal';

// Hooks
export { useToast } from './hooks/useToast';
export type { UseToastReturn } from './hooks/useToast';

// Re-export core types
export type {
  Theme,
  Mode,
  Variant,
  Size,
  ButtonProps as ButtonCoreProps,
  InputProps as InputCoreProps,
  ModalProps as ModalCoreProps,
  ToastProps,
  CardProps,
  FormProps,
  TableProps
} from '@monochrome-edge/core';

// Re-export core utilities
export { ThemeManager, Toast } from '@monochrome-edge/core';
