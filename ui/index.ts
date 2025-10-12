/**
 * @monochrome-edge/ui - Modern minimalist UI components
 * Main entry point for UI components
 */

export const VERSION = "1.13.0";

// Export SearchBar
export { SearchBar } from "./components/search-bar/search-bar";
export type {
  SearchDocument,
  SearchBarOptions,
} from "./components/search-bar/search-bar";

// Export SearchToolbar
export { SearchToolbar } from "./components/search-toolbar/search-toolbar";
export type {
  SearchToolbarOptions,
  FilterOption,
  SortOption,
  AutocompleteItem,
} from "./components/search-toolbar/search-toolbar";

// Export Tree View
export { TreeView } from "./components/tree-view/tree-view";
export type {
  TreeNode,
  TreeViewOptions,
} from "./components/tree-view/tree-view";

// Export Graph View
export { GraphView } from "./components/graph-view/graph-view";
export type { GraphViewOptions } from "./components/graph-view/graph-view";
export { DocumentGraph } from "./components/graph-view/graph-builder";
export type {
  DocumentMetadata,
  GraphNode,
  GraphEdge,
} from "./components/graph-view/graph-builder";
export { BarnesHutLayout } from "./components/graph-view/barnes-hut-layout";
export type { LayoutOptions } from "./components/graph-view/barnes-hut-layout";
export { CanvasRenderer } from "./components/graph-view/canvas-renderer";
export type { RenderOptions } from "./components/graph-view/canvas-renderer";
export { QuadTree } from "./components/graph-view/quad-tree";
export type { QuadTreeNode } from "./components/graph-view/quad-tree";

// Export Math Renderer
export {
  MathRenderer,
  renderAllMath,
} from "./components/math-renderer/math-renderer";
export type { MathRendererOptions } from "./components/math-renderer/math-renderer";

// Export Stepper
export { Stepper, initSteppers } from "./components/stepper/stepper";
export type { StepperOptions, Step } from "./components/stepper/stepper";

// Export Accordion
export { Accordion } from "./components/accordion/accordion";
export type { AccordionOptions } from "./components/accordion/accordion";

// Export Modal
export { Modal } from "./components/modal/modal";
export type { ModalOptions } from "./components/modal/modal";

// Export Tabs
export { Tabs } from "./components/tabs/tabs";
export type { TabsOptions } from "./components/tabs/tabs";

// Export Toast
export { Toast } from "./components/toast/toast";
export type { ToastOptions } from "./components/toast/toast";

// Export Dropdown
export { Dropdown } from "./components/dropdown/dropdown";
export type { DropdownOptions } from "./components/dropdown/dropdown";

// Export utilities
export { ThemeManager } from "./utils/theme-manager";
export { iconLoader, IconLoader } from "./utils/icon-loader";
export {
  createButton,
  createCard,
  showToast,
  createTocHoverCard,
  createTocCollapsible,
  initTocCollapsible,
  initChangelogPagination,
} from "./utils/dom-helpers";
export type { TocItem, ChangelogEntry } from "./utils/dom-helpers";
