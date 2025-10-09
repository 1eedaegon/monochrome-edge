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

export { SearchToolbar } from './components/SearchToolbar';
export type { SearchToolbarProps } from './components/SearchToolbar';

export { GraphView } from './components/GraphView';
export type { GraphViewProps, DocumentMetadata } from './components/GraphView';

export { TreeView } from './components/TreeView';
export type { TreeViewProps, TreeNode } from './components/TreeView';

export { Tabs } from './components/Tabs';
export type { TabsProps, TabItem } from './components/Tabs';

export { TOC } from './components/TOC';
export type { TOCProps, TOCItem } from './components/TOC';

export { Dropdown } from './components/Dropdown';
export type { DropdownProps, DropdownOption } from './components/Dropdown';

export { NavigationHeader, NavigationSidebar } from './components/Navigation';
export type { NavigationHeaderProps, NavigationSidebarProps, NavItem } from './components/Navigation';

export { Accordion } from './components/Accordion';
export type { AccordionProps, AccordionItem } from './components/Accordion';

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
