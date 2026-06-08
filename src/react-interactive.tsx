/**
 * @monochrome-edge/ui - React wrappers for interactive components
 *
 * These components do NOT reimplement behaviour. They wrap the canonical
 * vanilla TypeScript classes (the pure CSS/JS source of truth) so the
 * React surface stays compatible with the base library by construction:
 * a ref-mounted container, the class instantiated in an effect, and
 * `destroy()` on unmount.
 */

import React, { useRef, useEffect, ReactNode } from "react";

import {
  Accordion as AccordionCore,
  type AccordionOptions,
} from "../ui/components/accordion/accordion";
import { Tabs as TabsCore, type TabsOptions } from "../ui/components/tabs/tabs";
import {
  Dropdown as DropdownCore,
  type DropdownOptions,
} from "../ui/components/dropdown/dropdown";
import {
  SearchBar as SearchBarCore,
  type SearchDocument,
  type SearchBarOptions,
} from "../ui/components/search-bar/search-bar";
import {
  SearchToolbar as SearchToolbarCore,
  type SearchToolbarOptions,
} from "../ui/components/search-toolbar/search-toolbar";
import {
  TreeView as TreeViewCore,
  type TreeNode,
  type TreeViewOptions,
} from "../ui/components/tree-view/tree-view";
import {
  Stepper as StepperCore,
  type StepperOptions,
  type Step,
} from "../ui/components/stepper/stepper";
import {
  MathRenderer as MathRendererCore,
  type MathRendererOptions,
} from "../ui/components/math-renderer/math-renderer";
import {
  GraphView as GraphViewCore,
  type GraphViewOptions,
} from "../ui/components/graph-view/graph-view";

type Div = HTMLDivElement;

interface BaseProps {
  className?: string;
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Accordion — enhances author-provided markup (.accordion-item children)
// ---------------------------------------------------------------------------
export interface AccordionProps extends BaseProps, AccordionOptions {
  children: ReactNode;
}

export function Accordion({
  children,
  className = "",
  style,
  allowMultiple,
  defaultOpen,
  onToggle,
}: AccordionProps) {
  const ref = useRef<Div>(null);
  useEffect(() => {
    if (!ref.current) return;
    const inst = new AccordionCore(ref.current, {
      allowMultiple,
      defaultOpen,
      onToggle,
    });
    return () => inst.destroy();
    // Re-init when structural options change.
  }, [allowMultiple, JSON.stringify(defaultOpen)]);

  return (
    <div ref={ref} className={`accordion ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tabs — enhances author-provided markup (.tab buttons + .tab-panel)
// ---------------------------------------------------------------------------
export interface TabsProps extends BaseProps, TabsOptions {
  children: ReactNode;
}

export function Tabs({
  children,
  className = "",
  style,
  defaultTab,
  onChange,
}: TabsProps) {
  const ref = useRef<Div>(null);
  useEffect(() => {
    if (!ref.current) return;
    const inst = new TabsCore(ref.current, { defaultTab, onChange });
    return () => inst.destroy();
  }, [defaultTab]);

  return (
    <div ref={ref} className={`tabs ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dropdown — trigger + menu as adjacent siblings (vanilla expects menu to be
// the trigger's next sibling)
// ---------------------------------------------------------------------------
export interface DropdownProps extends BaseProps, DropdownOptions {
  trigger: ReactNode;
  children: ReactNode;
}

export function Dropdown({
  trigger,
  children,
  className = "",
  style,
  closeOnSelect,
  placement,
  offset,
  onOpen,
  onClose,
}: DropdownProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!triggerRef.current) return;
    const inst = new DropdownCore(triggerRef.current, {
      closeOnSelect,
      placement,
      offset,
      onOpen,
      onClose,
    });
    return () => inst.destroy();
  }, [closeOnSelect, placement, offset]);

  return (
    <div className={`dropdown ${className}`.trim()} style={style}>
      <button ref={triggerRef} type="button" className="dropdown-trigger">
        {trigger}
      </button>
      <div className="dropdown-menu">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SearchBar — data-driven
// ---------------------------------------------------------------------------
export interface SearchBarProps
  extends BaseProps,
    Omit<SearchBarOptions, "container"> {}

export function SearchBar({
  className = "",
  style,
  documents,
  ...options
}: SearchBarProps) {
  const ref = useRef<Div>(null);
  const inst = useRef<SearchBarCore | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    inst.current = new SearchBarCore({
      container: ref.current,
      documents,
      ...options,
    });
    return () => inst.current?.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update documents without tearing down the component.
  useEffect(() => {
    inst.current?.updateDocuments(documents);
  }, [documents]);

  return <div ref={ref} className={className} style={style} />;
}

// ---------------------------------------------------------------------------
// SearchToolbar — container + options
// ---------------------------------------------------------------------------
export interface SearchToolbarProps extends BaseProps, SearchToolbarOptions {}

export function SearchToolbar({
  className = "",
  style,
  ...options
}: SearchToolbarProps) {
  const ref = useRef<Div>(null);
  useEffect(() => {
    if (!ref.current) return;
    const inst = new SearchToolbarCore(ref.current, options);
    return () => inst.destroy?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(options.filters), JSON.stringify(options.sortOptions)]);

  return <div ref={ref} className={className} style={style} />;
}

// ---------------------------------------------------------------------------
// TreeView — data-driven (options.container is required by the class)
// ---------------------------------------------------------------------------
export interface TreeViewProps
  extends BaseProps,
    Omit<TreeViewOptions, "container"> {}

export function TreeView({
  className = "",
  style,
  data,
  ...options
}: TreeViewProps) {
  const ref = useRef<Div>(null);
  useEffect(() => {
    if (!ref.current) return;
    const inst = new TreeViewCore({ container: ref.current, data, ...options });
    return () => inst.destroy?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(data)]);

  return <div ref={ref} className={className} style={style} />;
}

// ---------------------------------------------------------------------------
// Stepper — steps passed via data-steps (the class reads it on init)
// ---------------------------------------------------------------------------
export interface StepperProps extends BaseProps, StepperOptions {
  steps: Step[];
}

export function Stepper({
  className = "",
  style,
  steps,
  ...options
}: StepperProps) {
  const ref = useRef<Div>(null);
  useEffect(() => {
    if (!ref.current) return;
    const inst = new StepperCore(ref.current, options);
    return () => inst.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(steps), options.type, options.layout]);

  return (
    <div
      ref={ref}
      className={`stepper ${className}`.trim()}
      style={style}
      data-steps={JSON.stringify(steps)}
      data-type={options.type}
      data-layout={options.layout}
    />
  );
}

// ---------------------------------------------------------------------------
// MathRenderer — renders a LaTeX string
// ---------------------------------------------------------------------------
export interface MathProps
  extends BaseProps,
    Omit<MathRendererOptions, "container"> {
  latex: string;
}

export function Math({ className = "", style, latex, ...options }: MathProps) {
  const ref = useRef<Div>(null);
  const inst = useRef<MathRendererCore | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    inst.current = new MathRendererCore({ container: ref.current, ...options });
    inst.current.render(latex);
    return () => inst.current?.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    inst.current?.update(latex);
  }, [latex]);

  return <div ref={ref} className={className} style={style} />;
}

// ---------------------------------------------------------------------------
// GraphView — data-driven document graph
// ---------------------------------------------------------------------------
export interface GraphViewProps
  extends BaseProps,
    Omit<GraphViewOptions, "container"> {}

export function GraphView({
  className = "",
  style,
  documents,
  ...options
}: GraphViewProps) {
  const ref = useRef<Div>(null);
  useEffect(() => {
    if (!ref.current) return;
    const inst = new GraphViewCore({
      container: ref.current,
      documents,
      ...options,
    });
    return () => inst.destroy?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(documents)]);

  return <div ref={ref} className={className} style={style} />;
}

export type {
  SearchDocument,
  TreeNode,
  Step,
};
