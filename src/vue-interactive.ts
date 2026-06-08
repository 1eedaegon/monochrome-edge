/**
 * @monochrome-edge/ui - Vue wrappers for interactive components
 *
 * Like the React wrappers, these do not reimplement behaviour: each
 * Vue component mounts a container, instantiates the canonical vanilla
 * class, and tears it down on unmount. This keeps the Vue surface in
 * lock-step with the pure CSS/JS base library.
 */

import {
  defineComponent,
  ref,
  onMounted,
  onBeforeUnmount,
  watch,
  h,
  PropType,
} from "vue";

import {
  Accordion as AccordionCore,
} from "../ui/components/accordion/accordion";
import { Tabs as TabsCore } from "../ui/components/tabs/tabs";
import { Dropdown as DropdownCore } from "../ui/components/dropdown/dropdown";
import {
  SearchBar as SearchBarCore,
  type SearchDocument,
} from "../ui/components/search-bar/search-bar";
import {
  SearchToolbar as SearchToolbarCore,
  type FilterOption,
  type SortOption,
} from "../ui/components/search-toolbar/search-toolbar";
import {
  TreeView as TreeViewCore,
  type TreeNode,
} from "../ui/components/tree-view/tree-view";
import {
  Stepper as StepperCore,
  type Step,
} from "../ui/components/stepper/stepper";
import { MathRenderer as MathRendererCore } from "../ui/components/math-renderer/math-renderer";
import { GraphView as GraphViewCore } from "../ui/components/graph-view/graph-view";
import type { DocumentMetadata } from "../ui/components/graph-view/graph-builder";

export const Accordion = defineComponent({
  name: "MonoAccordion",
  props: {
    allowMultiple: { type: Boolean, default: false },
    defaultOpen: { type: Array as PropType<number[]>, default: () => [] },
    onToggle: Function as PropType<(index: number, isOpen: boolean) => void>,
  },
  setup(props, { slots }) {
    const el = ref<HTMLDivElement>();
    let inst: AccordionCore | undefined;
    onMounted(() => {
      inst = new AccordionCore(el.value!, {
        allowMultiple: props.allowMultiple,
        defaultOpen: props.defaultOpen,
        onToggle: props.onToggle,
      });
    });
    onBeforeUnmount(() => inst?.destroy());
    return () => h("div", { ref: el, class: "accordion" }, slots.default?.());
  },
});

export const Tabs = defineComponent({
  name: "MonoTabs",
  props: {
    defaultTab: { type: Number, default: 0 },
    onChange: Function as PropType<(index: number, tabId?: string) => void>,
  },
  setup(props, { slots }) {
    const el = ref<HTMLDivElement>();
    let inst: TabsCore | undefined;
    onMounted(() => {
      inst = new TabsCore(el.value!, {
        defaultTab: props.defaultTab,
        onChange: props.onChange,
      });
    });
    onBeforeUnmount(() => inst?.destroy());
    return () => h("div", { ref: el, class: "tabs" }, slots.default?.());
  },
});

export const Dropdown = defineComponent({
  name: "MonoDropdown",
  props: {
    closeOnSelect: { type: Boolean, default: true },
    placement: {
      type: String as PropType<"bottom" | "top" | "left" | "right">,
      default: "bottom",
    },
    offset: { type: Number, default: 4 },
    onOpen: Function as PropType<() => void>,
    onClose: Function as PropType<() => void>,
  },
  setup(props, { slots }) {
    const trigger = ref<HTMLButtonElement>();
    let inst: DropdownCore | undefined;
    onMounted(() => {
      inst = new DropdownCore(trigger.value!, {
        closeOnSelect: props.closeOnSelect,
        placement: props.placement,
        offset: props.offset,
        onOpen: props.onOpen,
        onClose: props.onClose,
      });
    });
    onBeforeUnmount(() => inst?.destroy());
    return () =>
      h("div", { class: "dropdown" }, [
        h(
          "button",
          { ref: trigger, type: "button", class: "dropdown-trigger" },
          slots.trigger?.(),
        ),
        h("div", { class: "dropdown-menu" }, slots.default?.()),
      ]);
  },
});

export const SearchBar = defineComponent({
  name: "MonoSearchBar",
  props: {
    documents: {
      type: Array as PropType<SearchDocument[]>,
      required: true,
    },
    placeholder: String,
    maxResults: Number,
    highlightMatches: { type: Boolean, default: true },
    showCategories: { type: Boolean, default: true },
    onSelect: Function as PropType<(doc: SearchDocument) => void>,
  },
  setup(props) {
    const el = ref<HTMLDivElement>();
    let inst: SearchBarCore | undefined;
    onMounted(() => {
      inst = new SearchBarCore({
        container: el.value!,
        documents: props.documents,
        placeholder: props.placeholder,
        maxResults: props.maxResults,
        highlightMatches: props.highlightMatches,
        showCategories: props.showCategories,
        onSelect: props.onSelect,
      });
    });
    watch(
      () => props.documents,
      (docs) => inst?.updateDocuments(docs),
      { deep: true },
    );
    onBeforeUnmount(() => inst?.destroy());
    return () => h("div", { ref: el });
  },
});

export const SearchToolbar = defineComponent({
  name: "MonoSearchToolbar",
  props: {
    placeholder: String,
    filters: { type: Array as PropType<FilterOption[]>, default: () => [] },
    sortOptions: { type: Array as PropType<SortOption[]>, default: () => [] },
    debounceMs: Number,
    onSearch: Function as PropType<
      (query: string, filters: Record<string, string>, sort: string) => void
    >,
  },
  setup(props) {
    const el = ref<HTMLDivElement>();
    let inst: SearchToolbarCore | undefined;
    onMounted(() => {
      inst = new SearchToolbarCore(el.value!, {
        placeholder: props.placeholder,
        filters: props.filters,
        sortOptions: props.sortOptions,
        debounceMs: props.debounceMs,
        onSearch: props.onSearch,
      });
    });
    onBeforeUnmount(() => inst?.destroy());
    return () => h("div", { ref: el });
  },
});

export const TreeView = defineComponent({
  name: "MonoTreeView",
  props: {
    data: { type: Array as PropType<TreeNode[]>, required: true },
    expandedByDefault: { type: Boolean, default: false },
    onNodeClick: Function as PropType<(node: TreeNode) => void>,
    onNodeToggle: Function as PropType<
      (node: TreeNode, isExpanded: boolean) => void
    >,
  },
  setup(props) {
    const el = ref<HTMLDivElement>();
    let inst: TreeViewCore | undefined;
    onMounted(() => {
      inst = new TreeViewCore({
        container: el.value!,
        data: props.data,
        expandedByDefault: props.expandedByDefault,
        onNodeClick: props.onNodeClick,
        onNodeToggle: props.onNodeToggle,
      });
    });
    onBeforeUnmount(() => inst?.destroy());
    return () => h("div", { ref: el });
  },
});

export const Stepper = defineComponent({
  name: "MonoStepper",
  props: {
    steps: { type: Array as PropType<Step[]>, required: true },
    type: {
      type: String as PropType<"default" | "text">,
      default: "default",
    },
    layout: {
      type: String as PropType<"horizontal" | "vertical" | "snake">,
      default: "horizontal",
    },
    showProgress: { type: Boolean, default: false },
    onStepClick: Function as PropType<(step: Step, index: number) => void>,
  },
  setup(props) {
    const el = ref<HTMLDivElement>();
    let inst: StepperCore | undefined;
    onMounted(() => {
      inst = new StepperCore(el.value!, {
        type: props.type,
        layout: props.layout,
        showProgress: props.showProgress,
        onStepClick: props.onStepClick,
      });
    });
    onBeforeUnmount(() => inst?.destroy());
    return () =>
      h("div", {
        ref: el,
        class: "stepper",
        "data-steps": JSON.stringify(props.steps),
        "data-type": props.type,
        "data-layout": props.layout,
      });
  },
});

export const Math = defineComponent({
  name: "MonoMath",
  props: {
    latex: { type: String, required: true },
    displayMode: { type: Boolean, default: true },
  },
  setup(props) {
    const el = ref<HTMLDivElement>();
    let inst: MathRendererCore | undefined;
    onMounted(() => {
      inst = new MathRendererCore({
        container: el.value!,
        displayMode: props.displayMode,
      });
      inst.render(props.latex);
    });
    watch(
      () => props.latex,
      (latex) => inst?.update(latex),
    );
    onBeforeUnmount(() => inst?.destroy());
    return () => h("div", { ref: el });
  },
});

export const GraphView = defineComponent({
  name: "MonoGraphView",
  props: {
    documents: {
      type: Array as PropType<DocumentMetadata[]>,
      required: true,
    },
    width: Number,
    height: Number,
    showLabels: { type: Boolean, default: true },
    onNodeClick: Function as PropType<
      (node: { id: string; title: string; tags: string[] }) => void
    >,
  },
  setup(props) {
    const el = ref<HTMLDivElement>();
    let inst: GraphViewCore | undefined;
    onMounted(() => {
      inst = new GraphViewCore({
        container: el.value!,
        documents: props.documents,
        width: props.width,
        height: props.height,
        showLabels: props.showLabels,
        onNodeClick: props.onNodeClick,
      });
    });
    onBeforeUnmount(() => inst?.destroy());
    return () => h("div", { ref: el });
  },
});
