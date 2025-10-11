import {
  defineComponent,
  ref,
  computed,
  onMounted,
  provide,
  inject,
  Ref,
  InjectionKey,
  PropType,
  h,
  VNode,
} from "vue";

type ThemeVariant = "warm" | "cold";
type ThemeMode = "light" | "dark";

interface ThemeContext {
  theme: Ref<ThemeVariant>;
  mode: Ref<ThemeMode>;
  setTheme: (theme: ThemeVariant) => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeKey: InjectionKey<ThemeContext> = Symbol("theme");

export const ThemeProvider = defineComponent({
  name: "ThemeProvider",
  props: {
    defaultTheme: {
      type: String as PropType<ThemeVariant>,
      default: "warm",
    },
    defaultMode: {
      type: String as PropType<ThemeMode>,
      default: "light",
    },
  },
  setup(props, { slots }) {
    const theme = ref<ThemeVariant>(props.defaultTheme);
    const mode = ref<ThemeMode>(props.defaultMode);

    const setTheme = (newTheme: ThemeVariant) => {
      theme.value = newTheme;
      document.documentElement.setAttribute("data-theme-variant", newTheme);
    };

    const setMode = (newMode: ThemeMode) => {
      mode.value = newMode;
      document.documentElement.setAttribute("data-theme", newMode);
    };

    const toggleMode = () => {
      const newMode = mode.value === "light" ? "dark" : "light";
      setMode(newMode);
    };

    onMounted(() => {
      setTheme(theme.value);
      setMode(mode.value);
    });

    provide(ThemeKey, {
      theme,
      mode,
      setTheme,
      setMode,
      toggleMode,
    });

    return () => slots.default?.();
  },
});

export function useTheme() {
  const context = inject(ThemeKey);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

export const Button = defineComponent({
  name: "MonoButton",
  props: {
    variant: {
      type: String as PropType<"primary" | "secondary" | "ghost" | "danger">,
      default: "primary",
    },
    size: {
      type: String as PropType<"small" | "medium" | "large">,
      default: "medium",
    },
    loading: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    onClick: {
      type: Function as PropType<(e: MouseEvent) => void>,
    },
  },
  setup(props, { slots }) {
    const classes = computed(() => {
      const classList = ["btn", `btn-${props.variant}`];
      if (props.size !== "medium") {
        classList.push(`btn-${props.size}`);
      }
      if (props.loading) {
        classList.push("loading");
      }
      return classList.join(" ");
    });

    return () =>
      h(
        "button",
        {
          class: classes.value,
          disabled: props.disabled || props.loading,
          onClick: props.onClick,
        },
        slots.default?.(),
      );
  },
});

export const Card = defineComponent({
  name: "MonoCard",
  props: {
    title: {
      type: String,
    },
  },
  setup(props, { slots }) {
    return () =>
      h("div", { class: "card" }, [
        props.title && h("div", { class: "card-header" }, props.title),
        h("div", { class: "card-body" }, slots.default?.()),
      ]);
  },
});

export const Input = defineComponent({
  name: "MonoInput",
  props: {
    modelValue: {
      type: [String, Number],
      default: "",
    },
    label: {
      type: String,
    },
    error: {
      type: String,
    },
    type: {
      type: String,
      default: "text",
    },
    placeholder: {
      type: String,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const handleInput = (e: Event) => {
      const target = e.target as HTMLInputElement;
      emit("update:modelValue", target.value);
    };

    return () =>
      h("div", { class: "form-group" }, [
        props.label && h("label", { class: "label" }, props.label),
        h("input", {
          class: `input ${props.error ? "input-error" : ""}`,
          type: props.type,
          value: props.modelValue,
          placeholder: props.placeholder,
          disabled: props.disabled,
          onInput: handleInput,
        }),
        props.error && h("span", { class: "error-message" }, props.error),
      ]);
  },
});

export const Modal = defineComponent({
  name: "MonoModal",
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
    title: {
      type: String,
    },
    size: {
      type: String as PropType<"small" | "medium" | "large">,
      default: "medium",
    },
  },
  emits: ["close"],
  setup(props, { emit, slots }) {
    const handleClose = () => emit("close");

    return () => {
      if (!props.isOpen) return null;

      return h("div", { class: "modal is-open" }, [
        h("div", { class: "modal-backdrop", onClick: handleClose }),
        h("div", { class: `modal-content modal-${props.size}` }, [
          props.title &&
            h("div", { class: "modal-header" }, [
              h("h3", { class: "modal-title" }, props.title),
              h("button", { class: "modal-close", onClick: handleClose }, "×"),
            ]),
          h("div", { class: "modal-body" }, slots.default?.()),
        ]),
      ]);
    };
  },
});

export const Layout = defineComponent({
  name: "MonoLayout",
  setup(_, { slots }) {
    return () =>
      h("div", { class: "ui-layout" }, [
        slots.sidebar && h("aside", { class: "sidebar" }, slots.sidebar()),
        h("div", { class: "main-container" }, [
          slots.header && h("header", { class: "header" }, slots.header()),
          h("main", { class: "main-content" }, slots.default?.()),
        ]),
      ]);
  },
});

// Table Components
export const Table = defineComponent({
  name: "MonoTable",
  setup(_, { slots }) {
    return () => h("table", { class: "table" }, slots.default?.());
  },
});

export const TableHeader = defineComponent({
  name: "MonoTableHeader",
  setup(_, { slots }) {
    return () => h("thead", {}, slots.default?.());
  },
});

export const TableBody = defineComponent({
  name: "MonoTableBody",
  setup(_, { slots }) {
    return () => h("tbody", {}, slots.default?.());
  },
});

export const TableRow = defineComponent({
  name: "MonoTableRow",
  props: {
    onClick: {
      type: Function as PropType<() => void>,
    },
  },
  setup(props, { slots }) {
    return () => h("tr", { onClick: props.onClick }, slots.default?.());
  },
});

export const TableCell = defineComponent({
  name: "MonoTableCell",
  props: {
    header: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots }) {
    const tag = props.header ? "th" : "td";
    return () => h(tag, {}, slots.default?.());
  },
});

// Navigation Components
export const Nav = defineComponent({
  name: "MonoNav",
  setup(_, { slots }) {
    return () => h("nav", { class: "nav" }, slots.default?.());
  },
});

export const NavGroup = defineComponent({
  name: "MonoNavGroup",
  props: {
    title: {
      type: String,
    },
  },
  setup(props, { slots }) {
    return () =>
      h("div", { class: "nav-group" }, [
        props.title && h("div", { class: "nav-group-title" }, props.title),
        h("div", { class: "nav-group-items" }, slots.default?.()),
      ]);
  },
});

export const NavItem = defineComponent({
  name: "MonoNavItem",
  props: {
    active: {
      type: Boolean,
      default: false,
    },
    href: {
      type: String,
      default: "#",
    },
    onClick: {
      type: Function as PropType<() => void>,
    },
  },
  setup(props, { slots }) {
    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      props.onClick?.();
    };

    return () =>
      h(
        "a",
        {
          href: props.href,
          class: `nav-item ${props.active ? "is-active" : ""}`,
          onClick: handleClick,
        },
        slots.default?.(),
      );
  },
});

// Select Component
export const Select = defineComponent({
  name: "MonoSelect",
  props: {
    modelValue: {
      type: [String, Number, Array] as PropType<
        string | number | string[] | number[]
      >,
    },
    label: {
      type: String,
    },
    error: {
      type: String,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit, slots }) {
    const handleChange = (e: Event) => {
      const target = e.target as HTMLSelectElement;
      if (props.multiple) {
        const values = Array.from(target.selectedOptions).map(
          (option) => option.value,
        );
        emit("update:modelValue", values);
      } else {
        emit("update:modelValue", target.value);
      }
    };

    return () =>
      h("div", { class: "form-group" }, [
        props.label && h("label", { class: "label" }, props.label),
        h(
          "select",
          {
            class: `select ${props.error ? "select-error" : ""}`,
            value: props.modelValue,
            multiple: props.multiple,
            disabled: props.disabled,
            onChange: handleChange,
          },
          slots.default?.(),
        ),
        props.error && h("span", { class: "error-message" }, props.error),
      ]);
  },
});

// Badge Component
export const Badge = defineComponent({
  name: "MonoBadge",
  props: {
    variant: {
      type: String as PropType<
        "default" | "primary" | "success" | "warning" | "danger"
      >,
      default: "default",
    },
  },
  setup(props, { slots }) {
    return () =>
      h("span", { class: `badge badge-${props.variant}` }, slots.default?.());
  },
});

// Textarea Component
export const Textarea = defineComponent({
  name: "MonoTextarea",
  props: {
    modelValue: {
      type: String,
      default: "",
    },
    label: {
      type: String,
    },
    error: {
      type: String,
    },
    placeholder: {
      type: String,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    rows: {
      type: Number,
      default: 3,
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const handleInput = (e: Event) => {
      const target = e.target as HTMLTextAreaElement;
      emit("update:modelValue", target.value);
    };

    return () =>
      h("div", { class: "form-group" }, [
        props.label && h("label", { class: "label" }, props.label),
        h("textarea", {
          class: `textarea ${props.error ? "textarea-error" : ""}`,
          value: props.modelValue,
          placeholder: props.placeholder,
          disabled: props.disabled,
          rows: props.rows,
          onInput: handleInput,
        }),
        props.error && h("span", { class: "error-message" }, props.error),
      ]);
  },
});

// Checkbox Component
export const Checkbox = defineComponent({
  name: "MonoCheckbox",
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const handleChange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      emit("update:modelValue", target.checked);
    };

    return () =>
      h("label", { class: "checkbox" }, [
        h("input", {
          type: "checkbox",
          checked: props.modelValue,
          disabled: props.disabled,
          onChange: handleChange,
        }),
        h("span", { class: "checkbox-mark" }),
        props.label && h("span", {}, props.label),
      ]);
  },
});

// Radio Component
export const Radio = defineComponent({
  name: "MonoRadio",
  props: {
    modelValue: {
      type: [String, Number],
    },
    value: {
      type: [String, Number],
      required: true,
    },
    label: {
      type: String,
    },
    name: {
      type: String,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const handleChange = () => {
      emit("update:modelValue", props.value);
    };

    return () =>
      h("label", { class: "radio" }, [
        h("input", {
          type: "radio",
          name: props.name,
          checked: props.modelValue === props.value,
          disabled: props.disabled,
          onChange: handleChange,
        }),
        h("span", { class: "radio-mark" }),
        props.label && h("span", {}, props.label),
      ]);
  },
});

// FormGroup Component
export const FormGroup = defineComponent({
  name: "MonoFormGroup",
  setup(_, { slots }) {
    return () => h("div", { class: "form-group" }, slots.default?.());
  },
});

// Label Component
export const Label = defineComponent({
  name: "MonoLabel",
  props: {
    for: {
      type: String,
    },
    required: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots }) {
    return () =>
      h("label", { class: "label", for: props.for }, [
        slots.default?.(),
        props.required && h("span", { class: "text-danger" }, "*"),
      ]);
  },
});

export function useToast() {
  const show = (
    message: string,
    type: "success" | "error" | "info" = "info",
  ) => {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    let container = document.querySelector(".toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
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
    show,
  };
}

// TOC Components
interface TocItem {
  href: string;
  text: string;
  isActive?: boolean;
}

export const TocHoverCard = defineComponent({
  name: "MonoTocHoverCard",
  props: {
    items: {
      type: Array as PropType<TocItem[]>,
      required: true,
    },
    title: {
      type: String,
      default: "Contents",
    },
  },
  setup(props) {
    return () =>
      h("div", { class: "toc-hover-card" }, [
        h("div", { class: "toc-card" }, [
          h("h4", { class: "toc-card-title" }, props.title),
          h(
            "ul",
            { class: "toc-card-list" },
            props.items.map((item: TocItem) =>
              h("li", { class: "toc-card-item" }, [
                h(
                  "a",
                  {
                    href: item.href,
                    class: `toc-card-link ${item.isActive ? "is-active" : ""}`,
                  },
                  item.text,
                ),
              ]),
            ),
          ),
        ]),
      ]);
  },
});

export const TocCollapsible = defineComponent({
  name: "MonoTocCollapsible",
  props: {
    items: {
      type: Array as PropType<TocItem[]>,
      required: true,
    },
    title: {
      type: String,
      default: "Table of Contents",
    },
    defaultOpen: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const isOpen = ref(props.defaultOpen);

    const toggle = () => {
      isOpen.value = !isOpen.value;
    };

    return () =>
      h(
        "div",
        {
          class: `toc-collapsible ${isOpen.value ? "is-open" : ""}`,
        },
        [
          h(
            "div",
            {
              class: "toc-collapsible-header",
              onClick: toggle,
            },
            [
              h("h4", { class: "toc-collapsible-title" }, props.title),
              h("span", { class: "toc-collapsible-icon" }, "▼"),
            ],
          ),
          h("div", { class: "toc-collapsible-content" }, [
            h(
              "ul",
              { class: "toc-list" },
              props.items.map((item: TocItem) =>
                h("li", { class: "toc-list-item" }, [
                  h(
                    "a",
                    {
                      href: item.href,
                      class: `toc-list-link ${item.isActive ? "is-active" : ""}`,
                    },
                    item.text,
                  ),
                ]),
              ),
            ),
          ]),
        ],
      );
  },
});

// Changelog Component
interface ChangelogEntry {
  version: string;
  date: string;
  categories: {
    title: string;
    items: { commit: string; hash: string; url?: string }[];
  }[];
}

export const Changelog = defineComponent({
  name: "MonoChangelog",
  props: {
    entries: {
      type: Array as PropType<ChangelogEntry[]>,
      required: true,
    },
    itemsPerPage: {
      type: Number,
      default: 10,
    },
  },
  setup(props) {
    const currentPage = ref(1);
    const totalPages = computed(() =>
      Math.ceil(props.entries.length / props.itemsPerPage),
    );

    const visibleEntries = computed(() => {
      const start = (currentPage.value - 1) * props.itemsPerPage;
      const end = start + props.itemsPerPage;
      return props.entries.slice(start, end);
    });

    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
      }
    };

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
      }
    };

    return () =>
      h("div", { class: "changelog-container" }, [
        ...visibleEntries.value.map((entry: ChangelogEntry) =>
          h(
            "div",
            {
              class: "changelog-entry",
              "data-version": entry.version,
            },
            [
              h("h3", { class: "changelog-version" }, [
                `v${entry.version} `,
                h("span", { class: "changelog-date" }, entry.date),
              ]),
              h(
                "div",
                { class: "changelog-content" },
                entry.categories.map((category) =>
                  h("div", { class: "changelog-category" }, [
                    h(
                      "h4",
                      { class: "changelog-category-title" },
                      category.title,
                    ),
                    h(
                      "ul",
                      { class: "changelog-list" },
                      category.items.map((item) =>
                        h("li", {}, [
                          h("span", { class: "changelog-commit" }, item.commit),
                          h(
                            "a",
                            {
                              href: item.url || "#",
                              class: "changelog-hash",
                              title: item.hash,
                            },
                            item.hash.substring(0, 7),
                          ),
                        ]),
                      ),
                    ),
                  ]),
                ),
              ),
            ],
          ),
        ),
        totalPages.value > 1 &&
          h("div", { class: "changelog-pagination" }, [
            h(
              "button",
              {
                class: "changelog-pagination-btn",
                onClick: prevPage,
                disabled: currentPage.value === 1,
              },
              "Previous",
            ),
            h(
              "span",
              { class: "changelog-pagination-info" },
              `Page ${currentPage.value} of ${totalPages.value}`,
            ),
            h(
              "button",
              {
                class: "changelog-pagination-btn",
                onClick: nextPage,
                disabled: currentPage.value === totalPages.value,
              },
              "Next",
            ),
          ]),
      ]);
  },
});

// Icon Toggle Component
type IconToggleType = "mode" | "theme" | "color" | "language";

export const IconToggle = defineComponent({
  name: "MonoIconToggle",
  props: {
    type: {
      type: String as PropType<IconToggleType>,
      default: "mode",
    },
    variant: {
      type: String as PropType<"default" | "ghost">,
      default: "default",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["toggle"],
  setup(props, { emit }) {
    const getDefaultState = () => {
      switch (props.type) {
        case "mode":
          return document.documentElement.getAttribute("data-theme") || "light";
        case "theme":
          return (
            document.documentElement.getAttribute("data-theme-variant") ||
            "warm"
          );
        case "color":
          return "monochrome";
        case "language":
          return "ko";
        default:
          return "default";
      }
    };

    const state = ref(getDefaultState());
    const isAnimating = ref(false);

    const handleToggle = () => {
      if (props.disabled) return;

      isAnimating.value = true;

      const stateMap: Record<string, Record<string, string>> = {
        mode: { light: "dark", dark: "light" },
        theme: { warm: "cold", cold: "warm" },
        color: { monochrome: "colored", colored: "monochrome" },
        language: { ko: "en", en: "ko" },
      };

      const newState = stateMap[props.type]?.[state.value] || state.value;
      state.value = newState;

      // Apply to document
      switch (props.type) {
        case "mode":
          document.documentElement.setAttribute("data-theme", newState);
          break;
        case "theme":
          document.documentElement.setAttribute("data-theme-variant", newState);
          break;
      }

      emit("toggle", newState);

      setTimeout(() => {
        isAnimating.value = false;
      }, 500);
    };

    const getIcons = () => {
      const iconSets: Record<string, { icon1: VNode; icon2: VNode }> = {
        mode: {
          icon1: h(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              "stroke-width": "2",
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
            },
            [
              h("circle", { cx: "12", cy: "12", r: "5" }),
              h("line", { x1: "12", y1: "1", x2: "12", y2: "3" }),
              h("line", { x1: "12", y1: "21", x2: "12", y2: "23" }),
              h("line", { x1: "4.22", y1: "4.22", x2: "5.64", y2: "5.64" }),
              h("line", {
                x1: "18.36",
                y1: "18.36",
                x2: "19.78",
                y2: "19.78",
              }),
              h("line", { x1: "1", y1: "12", x2: "3", y2: "12" }),
              h("line", { x1: "21", y1: "12", x2: "23", y2: "12" }),
              h("line", {
                x1: "4.22",
                y1: "19.78",
                x2: "5.64",
                y2: "18.36",
              }),
              h("line", { x1: "18.36", y1: "5.64", x2: "19.78", y2: "4.22" }),
            ],
          ),
          icon2: h(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              "stroke-width": "2",
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
            },
            [
              h("path", {
                d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
              }),
            ],
          ),
        },
        theme: {
          icon1: h(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              "stroke-width": "2",
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
            },
            [
              h("path", {
                d: "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z",
              }),
            ],
          ),
          icon2: h(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              "stroke-width": "2",
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
            },
            [
              h("line", { x1: "12", y1: "2", x2: "12", y2: "6" }),
              h("line", { x1: "12", y1: "18", x2: "12", y2: "22" }),
              h("line", { x1: "4.93", y1: "4.93", x2: "7.76", y2: "7.76" }),
              h("line", {
                x1: "16.24",
                y1: "16.24",
                x2: "19.07",
                y2: "19.07",
              }),
              h("line", { x1: "2", y1: "12", x2: "6", y2: "12" }),
              h("line", { x1: "18", y1: "12", x2: "22", y2: "12" }),
              h("line", { x1: "4.93", y1: "19.07", x2: "7.76", y2: "16.24" }),
              h("line", { x1: "16.24", y1: "7.76", x2: "19.07", y2: "4.93" }),
            ],
          ),
        },
        color: {
          icon1: h(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              "stroke-width": "2",
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
            },
            [
              h("circle", { cx: "12", cy: "12", r: "10" }),
              h("path", { d: "M8 12h8" }),
            ],
          ),
          icon2: h(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              "stroke-width": "2",
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
            },
            [
              h("circle", { cx: "12", cy: "12", r: "10" }),
              h("circle", { cx: "12", cy: "12", r: "6" }),
              h("circle", { cx: "12", cy: "12", r: "2" }),
            ],
          ),
        },
        language: {
          icon1: h(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              "stroke-width": "2",
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
            },
            [
              h("circle", { cx: "12", cy: "12", r: "10" }),
              h("line", { x1: "2", y1: "12", x2: "22", y2: "12" }),
              h("path", {
                d: "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
              }),
            ],
          ),
          icon2: h(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              "stroke-width": "2",
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
            },
            [
              h("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2" }),
              h("path", { d: "M3 9h18" }),
              h("path", { d: "M9 21V9" }),
            ],
          ),
        },
      };

      return iconSets[props.type] || iconSets.mode;
    };

    const classes = computed(() => {
      const classList = ["icon-btn-toggle", `icon-btn-toggle-${props.type}`];
      if (props.variant === "ghost") {
        classList.push("icon-btn-toggle-ghost");
      }
      if (props.type === "color") {
        classList.push("icon-btn-toggle-colored");
      }
      if (isAnimating.value) {
        classList.push("is-animating");
      }
      return classList.join(" ");
    });

    return () => {
      const icons = getIcons();
      return h(
        "button",
        {
          class: classes.value,
          "data-state": state.value,
          disabled: props.disabled,
          onClick: handleToggle,
        },
        [
          h("span", { class: "icon-btn-toggle-icon" }, [
            icons?.icon1,
            icons?.icon2,
          ]),
        ],
      );
    };
  },
});

// Breadcrumb Component
interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

export const Breadcrumb = defineComponent({
  name: "MonoBreadcrumb",
  props: {
    items: {
      type: Array as PropType<BreadcrumbItem[]>,
      required: true,
    },
    separator: {
      type: String,
      default: "/",
    },
    variant: {
      type: String as PropType<"default" | "compact" | "large" | "contained">,
      default: "default",
    },
    maxItems: {
      type: Number,
    },
  },
  setup(props) {
    const displayItems = computed(() => {
      if (props.maxItems && props.items.length > props.maxItems) {
        const firstItems = props.items.slice(0, Math.floor(props.maxItems / 2));
        const lastItems = props.items.slice(-Math.ceil(props.maxItems / 2));
        return [
          ...firstItems,
          { label: "...", href: undefined, active: false },
          ...lastItems,
        ];
      }
      return props.items;
    });

    const classes = computed(() => {
      const classList = ["breadcrumb"];
      if (props.variant !== "default") {
        classList.push(`breadcrumb-${props.variant}`);
      }
      return classList.join(" ");
    });

    return () =>
      h("nav", { class: classes.value, "aria-label": "Breadcrumb" }, [
        displayItems.value.map((item: BreadcrumbItem, index: number) => [
          h(
            "span",
            {
              class: `breadcrumb-item${item.active ? " is-active" : ""}`,
            },
            item.href && !item.active
              ? h("a", { href: item.href }, item.label)
              : item.label,
          ),
          index < displayItems.value.length - 1 &&
            h(
              "span",
              { class: "breadcrumb-separator", "aria-hidden": "true" },
              props.separator,
            ),
        ]),
      ]);
  },
});

import { ThemeManager } from "./index";
export { ThemeManager };

export default {
  ThemeProvider,
  Button,
  Card,
  Input,
  Modal,
  Layout,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  Nav,
  NavGroup,
  NavItem,
  Select,
  Badge,
  Textarea,
  Checkbox,
  Radio,
  FormGroup,
  Label,
  TocHoverCard,
  TocCollapsible,
  Changelog,
  IconToggle,
  Breadcrumb,
  useTheme,
  useToast,
  ThemeManager,
};
