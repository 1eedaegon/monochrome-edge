/**
 * @monochrome-edge/ui - Web Components
 * Custom Elements implementation for Monochrome Edge UI
 */

import { escapeHtml, safeUrl } from "../ui/utils/security";
import {
  iconToggleIcons,
  nextIconToggleState,
  applyIconToggleState,
  readIconToggleState,
} from "./icon-toggle-data";
import { TreeView, type TreeNode } from "../ui/components/tree-view/tree-view";
import { GraphView } from "../ui/components/graph-view/graph-view";
import type { DocumentMetadata } from "../ui/components/graph-view/graph-builder";
import { SearchToolbar } from "../ui/components/search-toolbar/search-toolbar";
import { iconLoader } from "../ui/utils/icon-loader";

// Base Component Class
class MonochromeElement extends HTMLElement {
  constructor() {
    super();
  }

  protected emit(eventName: string, detail?: any) {
    this.dispatchEvent(
      new CustomEvent(eventName, {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  }
}

// Button Component
class MonochromeButton extends MonochromeElement {
  static get observedAttributes() {
    return ["variant", "size", "loading", "disabled"];
  }

  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const variant = this.getAttribute("variant") || "primary";
    const size = this.getAttribute("size") || "medium";
    const loading = this.hasAttribute("loading");
    const disabled = this.hasAttribute("disabled");

    const classList = ["btn", `btn-${variant}`];
    if (size !== "medium") {
      classList.push(`btn-${size}`);
    }
    if (loading) {
      classList.push("loading");
    }

    this.className = classList.join(" ");

    if (disabled || loading) {
      this.setAttribute("disabled", "");
    } else {
      this.removeAttribute("disabled");
    }
  }
}

// Card Component
class MonochromeCard extends MonochromeElement {
  static get observedAttributes() {
    return ["title"];
  }

  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    this.className = "card";
    const title = this.getAttribute("title");
    const content = this.innerHTML;

    let html = "";
    if (title) {
      html += `<div class="card-header">${escapeHtml(title)}</div>`;
    }
    html += `<div class="card-body">${content}</div>`;

    this.innerHTML = html;
  }
}

// Modal Component
class MonochromeModal extends MonochromeElement {
  static get observedAttributes() {
    return ["open", "title", "size"];
  }

  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  attributeChangedCallback(name: string) {
    if (name === "open") {
      this.toggleOpen();
    } else {
      this.render();
    }
  }

  render() {
    const title = this.getAttribute("title");
    const size = this.getAttribute("size") || "medium";
    const isOpen = this.hasAttribute("open");

    this.className = `modal${isOpen ? " is-open" : ""}`;

    const content = this.querySelector("[slot='content']")?.innerHTML || "";

    this.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content modal-${escapeHtml(size)}">
        ${
          title
            ? `
          <div class="modal-header">
            <h3 class="modal-title">${escapeHtml(title)}</h3>
            <button class="modal-close" type="button" aria-label="Close">&times;</button>
          </div>
        `
            : ""
        }
        <div class="modal-body">${content}</div>
      </div>
    `;
  }

  setupEventListeners() {
    const backdrop = this.querySelector(".modal-backdrop");
    const closeBtn = this.querySelector(".modal-close");

    backdrop?.addEventListener("click", () => this.close());
    closeBtn?.addEventListener("click", () => this.close());
  }

  open() {
    this.setAttribute("open", "");
    this.emit("modal-open");
  }

  close() {
    this.removeAttribute("open");
    this.emit("modal-close");
  }

  toggleOpen() {
    if (this.hasAttribute("open")) {
      this.classList.add("is-open");
    } else {
      this.classList.remove("is-open");
    }
  }
}

// Tabs Component
class MonochromeTabs extends MonochromeElement {
  private activeIndex = 0;

  constructor() {
    super();
  }

  connectedCallback() {
    this.className = "tabs";
    this.setupTabs();
  }

  setupTabs() {
    const buttons = this.querySelectorAll(".tab-button");
    const panels = this.querySelectorAll(".tab-panel");

    buttons.forEach((button, index) => {
      button.addEventListener("click", () => {
        this.setActiveTab(index);
      });
    });

    this.setActiveTab(this.activeIndex);
  }

  setActiveTab(index: number) {
    const buttons = this.querySelectorAll(".tab-button");
    const panels = this.querySelectorAll(".tab-panel");

    buttons.forEach((btn) => btn.classList.remove("is-active"));
    panels.forEach((panel) => panel.classList.remove("is-active"));

    buttons[index]?.classList.add("is-active");
    panels[index]?.classList.add("is-active");

    this.activeIndex = index;
    this.emit("tab-change", { index });
  }
}

// Accordion Component
class MonochromeAccordion extends MonochromeElement {
  private allowMultiple = false;

  static get observedAttributes() {
    return ["allow-multiple"];
  }

  constructor() {
    super();
  }

  connectedCallback() {
    this.className = "accordion";
    this.allowMultiple = this.hasAttribute("allow-multiple");
    this.setupAccordion();
  }

  attributeChangedCallback() {
    this.allowMultiple = this.hasAttribute("allow-multiple");
  }

  setupAccordion() {
    const items = this.querySelectorAll(".accordion-item");

    items.forEach((item) => {
      const header = item.querySelector(".accordion-header");

      header?.addEventListener("click", () => {
        const isOpen = item.classList.contains("is-open");

        if (!this.allowMultiple) {
          items.forEach((i) => i.classList.remove("is-open"));
        }

        if (isOpen) {
          item.classList.remove("is-open");
        } else {
          item.classList.add("is-open");
        }

        this.emit("accordion-toggle", { item, isOpen: !isOpen });
      });
    });
  }
}

// Input Component
class MonochromeInput extends MonochromeElement {
  static get observedAttributes() {
    return ["label", "error", "value", "placeholder", "type", "disabled"];
  }

  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const label = this.getAttribute("label");
    const error = this.getAttribute("error");
    const value = this.getAttribute("value") || "";
    const placeholder = this.getAttribute("placeholder") || "";
    const type = this.getAttribute("type") || "text";
    const disabled = this.hasAttribute("disabled");

    this.innerHTML = `
      <div class="form-group">
        ${label ? `<label class="label">${escapeHtml(label)}</label>` : ""}
        <input
          class="input ${error ? "input-error" : ""}"
          type="${escapeHtml(type)}"
          value="${escapeHtml(value)}"
          placeholder="${escapeHtml(placeholder)}"
          ${error ? 'aria-invalid="true"' : ""}
          ${disabled ? "disabled" : ""}
        />
        ${error ? `<span class="error-message" role="alert">${escapeHtml(error)}</span>` : ""}
      </div>
    `;

    const input = this.querySelector("input");
    input?.addEventListener("input", (e) => {
      const target = e.target as HTMLInputElement;
      this.setAttribute("value", target.value);
      this.emit("input-change", { value: target.value });
    });
  }
}

// Checkbox Component
class MonochromeCheckbox extends MonochromeElement {
  static get observedAttributes() {
    return ["label", "checked", "disabled"];
  }

  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const label = this.getAttribute("label");
    const checked = this.hasAttribute("checked");
    const disabled = this.hasAttribute("disabled");

    this.innerHTML = `
      <label class="checkbox">
        <input type="checkbox" ${checked ? "checked" : ""} ${disabled ? "disabled" : ""} />
        <span class="checkbox-mark"></span>
        ${label ? `<span>${escapeHtml(label)}</span>` : ""}
      </label>
    `;

    const input = this.querySelector("input");
    input?.addEventListener("change", (e) => {
      const target = e.target as HTMLInputElement;
      if (target.checked) {
        this.setAttribute("checked", "");
      } else {
        this.removeAttribute("checked");
      }
      this.emit("checkbox-change", { checked: target.checked });
    });
  }
}

// Badge Component
class MonochromeBadge extends MonochromeElement {
  static get observedAttributes() {
    return ["variant"];
  }

  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const variant = this.getAttribute("variant") || "default";
    this.className = `badge badge-${variant}`;
  }
}

// Toast Component
class MonochromeToast extends MonochromeElement {
  static get observedAttributes() {
    return ["type", "message", "duration"];
  }

  constructor() {
    super();
  }

  connectedCallback() {
    this.show();
  }

  show() {
    const type = this.getAttribute("type") || "info";
    const message = this.getAttribute("message") || "";
    const duration = parseInt(this.getAttribute("duration") || "3000");

    this.className = `toast toast-${type}`;
    this.textContent = message;

    setTimeout(() => {
      this.style.opacity = "0";
      setTimeout(() => this.remove(), 300);
    }, duration);
  }
}

// Icon Toggle Component
class MonochromeIconToggle extends MonochromeElement {
  static get observedAttributes() {
    return ["type", "state", "disabled", "variant"];
  }

  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const type = this.getAttribute("type") || "mode"; // mode, theme, color, language
    const state = this.getAttribute("state") || readIconToggleState(type);
    const disabled = this.hasAttribute("disabled");
    const variant = this.getAttribute("variant") || "default"; // default, ghost

    const classList = ["icon-btn-toggle", `icon-btn-toggle-${type}`];

    if (variant === "ghost") {
      classList.push("icon-btn-toggle-ghost");
    }
    if (type === "color") {
      classList.push("icon-btn-toggle-colored");
    }

    this.className = classList.join(" ");
    this.setAttribute("data-state", state);

    if (disabled) {
      this.setAttribute("disabled", "");
    } else {
      this.removeAttribute("disabled");
    }

    // Icons come only from the shared, static icon-toggle data — never from
    // attributes — so there is no HTML-injection surface here.
    const [icon1, icon2] = iconToggleIcons(type);
    this.innerHTML = `
      <span class="icon-btn-toggle-icon">
        ${icon1}
        ${icon2}
      </span>
    `;
  }

  setupEventListeners() {
    this.addEventListener("click", () => {
      if (this.hasAttribute("disabled")) return;

      const type = this.getAttribute("type") || "mode";
      const currentState = this.getAttribute("data-state");

      // Add animation class
      this.classList.add("is-animating");

      // Toggle state
      const newState = nextIconToggleState(type, currentState || "");
      this.setAttribute("state", newState);
      this.setAttribute("data-state", newState);

      // Apply to document
      this.applyState(type, newState);

      // Remove animation class after transition
      setTimeout(() => {
        this.classList.remove("is-animating");
      }, 500);

      this.emit("toggle", { type, state: newState });
    });
  }

  applyState(type: string, state: string) {
    // Reflect mode/theme onto the document; surface color/language changes
    // as events for the host app to handle.
    applyIconToggleState(type, state);
    if (type === "color") {
      this.emit("color-change", { state });
    } else if (type === "language") {
      this.emit("language-change", { state });
    }
  }
}

// Breadcrumb Item Component
class MonochromeBreadcrumbItem extends MonochromeElement {
  static get observedAttributes() {
    return ["active", "href"];
  }

  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const active = this.hasAttribute("active");
    const href = this.getAttribute("href");
    const content = this.textContent?.trim() || "";

    this.className = `breadcrumb-item${active ? " is-active" : ""}`;

    if (href && !active) {
      this.innerHTML = `<a href="${escapeHtml(safeUrl(href))}">${escapeHtml(content)}</a>`;
    } else {
      this.textContent = content;
    }
  }
}

// Breadcrumb Component
class MonochromeBreadcrumb extends MonochromeElement {
  static get observedAttributes() {
    return ["variant", "separator", "max-items"];
  }

  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const variant = this.getAttribute("variant") || "default"; // default, compact, large, contained
    const separator = this.getAttribute("separator") || "/";
    const maxItems = parseInt(this.getAttribute("max-items") || "0");

    const classList = ["breadcrumb"];
    if (variant !== "default") {
      classList.push(`breadcrumb-${variant}`);
    }

    this.className = classList.join(" ");

    // Get all breadcrumb items
    const items = Array.from(this.querySelectorAll("mce-breadcrumb-item"));

    // Handle max-items with ellipsis
    if (maxItems > 0 && items.length > maxItems) {
      const firstItems = items.slice(0, Math.floor(maxItems / 2));
      const lastItems = items.slice(-Math.ceil(maxItems / 2));

      items.forEach((item) => {
        if (!firstItems.includes(item) && !lastItems.includes(item)) {
          (item as HTMLElement).style.display = "none";
        }
      });

      // Insert ellipsis
      if (firstItems.length > 0) {
        const ellipsis = document.createElement("span");
        ellipsis.className = "breadcrumb-item breadcrumb-ellipsis";
        ellipsis.textContent = "...";
        const lastFirstItem = firstItems[firstItems.length - 1];
        if (lastFirstItem) {
          lastFirstItem.insertAdjacentElement("afterend", ellipsis);
        }
      }
    }

    // Add separators
    items.forEach((item, index) => {
      if (
        index < items.length - 1 &&
        (item as HTMLElement).style.display !== "none"
      ) {
        const sep = document.createElement("span");
        sep.className = "breadcrumb-separator";
        sep.setAttribute("aria-hidden", "true");
        sep.textContent = separator;
        item.insertAdjacentElement("afterend", sep);
      }
    });
  }
}

// ---------------------------------------------------------------------------
// Interactive elements — wrap the canonical vanilla classes
// ---------------------------------------------------------------------------

// <mce-tree-view> — set `.data = [...]`, listen for `node-click`
class MonochromeTreeView extends MonochromeElement {
  private _data: TreeNode[] = [];
  private instance?: TreeView;

  set data(value: TreeNode[]) {
    this._data = value;
    this.renderTree();
  }
  get data(): TreeNode[] {
    return this._data;
  }

  connectedCallback() {
    if (this._data.length) this.renderTree();
  }

  disconnectedCallback() {
    this.instance?.destroy();
  }

  private renderTree() {
    this.instance?.destroy();
    this.instance = new TreeView({
      container: this,
      data: this._data,
      onNodeClick: (node) => this.emit("node-click", node),
      onNodeToggle: (node, isExpanded) =>
        this.emit("node-toggle", { node, isExpanded }),
    });
  }
}

// <mce-graph-view> — call `.setDocuments([...])`, listen for `node-click`
class MonochromeGraphView extends MonochromeElement {
  private instance?: GraphView;

  setDocuments(documents: DocumentMetadata[]) {
    this.instance?.destroy();
    this.instance = new GraphView({
      container: this,
      documents,
      width: parseInt(this.getAttribute("width") || "800", 10),
      height: parseInt(this.getAttribute("height") || "600", 10),
      onNodeClick: (node) => this.emit("node-click", node),
    });
  }

  disconnectedCallback() {
    this.instance?.destroy();
  }
}

// <mce-search-toolbar> — `.setAutocomplete(fn)`, listen for `search`
class MonochromeSearchToolbar extends MonochromeElement {
  private instance?: SearchToolbar;
  private autocompleteFn?: (query: string) => Promise<string[]>;

  connectedCallback() {
    this.build();
  }

  disconnectedCallback() {
    this.instance?.destroy();
  }

  setAutocomplete(fn: (query: string) => Promise<string[]>) {
    this.autocompleteFn = fn;
    this.build();
  }

  private build() {
    this.instance?.destroy();
    this.innerHTML = "";
    this.instance = new SearchToolbar(this, {
      placeholder: this.getAttribute("placeholder") || "Search...",
      autocomplete: this.autocompleteFn ?? [],
      onSearch: (query, filters, sort) =>
        this.emit("search", { query, filters, sort }),
    });
  }
}

// <mce-toc> with <mce-toc-item id href>label</mce-toc-item> children
class MonochromeTOCItem extends MonochromeElement {
  // Pure data holder; the parent <mce-toc> reads its attributes/text.
}

class MonochromeTOC extends MonochromeElement {
  connectedCallback() {
    const items = Array.from(this.querySelectorAll("mce-toc-item")).map(
      (el) => ({
        id: el.getAttribute("id") || "",
        href: el.getAttribute("href") || "#",
        label: el.textContent?.trim() || "",
      }),
    );
    const title = this.getAttribute("title") || "Table of Contents";
    const collapsible = this.hasAttribute("collapsible");
    const activeId = this.getAttribute("active-id") || "";

    const listHtml = items
      .map(
        (item) =>
          `<li class="toc-list-item"><a href="${escapeHtml(
            safeUrl(item.href),
          )}" data-id="${escapeHtml(item.id)}" class="toc-list-link${
            item.id === activeId ? " is-active" : ""
          }"${
            item.id === activeId ? ' aria-current="location"' : ""
          }>${escapeHtml(item.label)}</a></li>`,
      )
      .join("");

    if (collapsible) {
      this.className = "toc-collapsible is-open";
      this.innerHTML = `
        <button type="button" class="toc-collapsible-header" aria-expanded="true">
          <h4 class="toc-collapsible-title">${escapeHtml(title)}</h4>
          <span class="toc-collapsible-icon" aria-hidden="true">▼</span>
        </button>
        <div class="toc-collapsible-content"><ul class="toc-list">${listHtml}</ul></div>`;
      const header = this.querySelector(".toc-collapsible-header");
      const content = this.querySelector<HTMLElement>(
        ".toc-collapsible-content",
      );
      header?.addEventListener("click", () => {
        const open = this.classList.toggle("is-open");
        header.setAttribute("aria-expanded", String(open));
        if (content) content.hidden = !open;
      });
    } else {
      this.className = "toc";
      this.innerHTML = `<h4 class="toc-title">${escapeHtml(
        title,
      )}</h4><ul class="toc-list">${listHtml}</ul>`;
    }

    this.querySelectorAll<HTMLAnchorElement>(".toc-list-link").forEach(
      (link) => {
        link.addEventListener("click", () => {
          const id = link.getAttribute("data-id") || "";
          this.emit("item-click", { id, href: link.getAttribute("href") });
        });
      },
    );
  }
}

// <mce-icon-button icon="sun" variant="default">
class MonochromeIconButton extends MonochromeElement {
  static get observedAttributes() {
    return ["icon", "variant"];
  }

  connectedCallback() {
    this.renderButton();
  }
  attributeChangedCallback() {
    this.renderButton();
  }

  private async renderButton() {
    const icon = this.getAttribute("icon") || "";
    const variant = this.getAttribute("variant") || "default";
    const label = this.getAttribute("aria-label") || icon || "icon button";
    this.innerHTML = `<button type="button" class="icon-btn icon-btn-${escapeHtml(
      variant,
    )}" aria-label="${escapeHtml(label)}"></button>`;
    const btn = this.querySelector("button");
    // Only load named icons (allow-list) so the icon attribute cannot point
    // the loader at an arbitrary/remote SVG that would be injected as HTML.
    if (btn && icon && /^[a-z0-9-]+$/i.test(icon)) {
      try {
        btn.innerHTML = await iconLoader.load(icon, { width: 20, height: 20 });
      } catch {
        /* icon not found — leave the button empty but functional */
      }
    }
  }
}

// Register all components. Every define is guarded so the function is
// idempotent — calling it twice (e.g. two bundles on one page) is a no-op
// rather than a "has already been defined" DOMException.
export function registerMonochromeComponents() {
  const define = (name: string, ctor: CustomElementConstructor) => {
    if (!customElements.get(name)) customElements.define(name, ctor);
  };
  define("mce-button", MonochromeButton);
  define("mce-card", MonochromeCard);
  define("mce-modal", MonochromeModal);
  define("mce-tabs", MonochromeTabs);
  define("mce-accordion", MonochromeAccordion);
  define("mce-input", MonochromeInput);
  define("mce-checkbox", MonochromeCheckbox);
  define("mce-badge", MonochromeBadge);
  define("mce-toast", MonochromeToast);
  define("mce-icon-toggle", MonochromeIconToggle);
  define("mce-breadcrumb", MonochromeBreadcrumb);
  define("mce-breadcrumb-item", MonochromeBreadcrumbItem);
  define("mce-tree-view", MonochromeTreeView);
  define("mce-graph-view", MonochromeGraphView);
  define("mce-search-toolbar", MonochromeSearchToolbar);
  define("mce-toc", MonochromeTOC);
  define("mce-toc-item", MonochromeTOCItem);
  define("mce-icon-button", MonochromeIconButton);
}

// Auto-register if not in module context
if (typeof window !== "undefined" && !window.customElements.get("mce-button")) {
  registerMonochromeComponents();
}

// Toast helper
export function showToast(
  message: string,
  type: "success" | "error" | "info" = "info",
  duration = 3000,
) {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("mce-toast");
  toast.setAttribute("message", message);
  toast.setAttribute("type", type);
  toast.setAttribute("duration", duration.toString());

  container.appendChild(toast);
}

// Theme helper
export class ThemeController {
  static setTheme(mode: "light" | "dark", variant: "warm" | "cold") {
    document.documentElement.setAttribute("data-theme", mode);
    document.documentElement.setAttribute("data-theme-variant", variant);
  }

  static toggleMode() {
    const current = document.documentElement.getAttribute("data-theme");
    const newMode = current === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", newMode);
  }

  static getTheme() {
    return {
      mode: document.documentElement.getAttribute("data-theme") || "light",
      variant:
        document.documentElement.getAttribute("data-theme-variant") || "warm",
    };
  }
}

// Export components
export {
  MonochromeButton,
  MonochromeCard,
  MonochromeModal,
  MonochromeTabs,
  MonochromeAccordion,
  MonochromeInput,
  MonochromeCheckbox,
  MonochromeBadge,
  MonochromeToast,
  MonochromeIconToggle,
  MonochromeBreadcrumb,
  MonochromeBreadcrumbItem,
  MonochromeTreeView,
  MonochromeGraphView,
  MonochromeSearchToolbar,
  MonochromeTOC,
  MonochromeTOCItem,
  MonochromeIconButton,
};

export default {
  registerMonochromeComponents,
  showToast,
  ThemeController,
};
