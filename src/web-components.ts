/**
 * @monochrome-edge/ui - Web Components
 * Custom Elements implementation for Monochrome Edge UI
 */

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
      html += `<div class="card-header">${title}</div>`;
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
      <div class="modal-content modal-${size}">
        ${
          title
            ? `
          <div class="modal-header">
            <h3 class="modal-title">${title}</h3>
            <button class="modal-close">&times;</button>
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
        ${label ? `<label class="label">${label}</label>` : ""}
        <input
          class="input ${error ? "input-error" : ""}"
          type="${type}"
          value="${value}"
          placeholder="${placeholder}"
          ${disabled ? "disabled" : ""}
        />
        ${error ? `<span class="error-message">${error}</span>` : ""}
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
        ${label ? `<span>${label}</span>` : ""}
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
    return ["type", "state", "disabled", "variant", "icon1", "icon2"];
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
    const state = this.getAttribute("state") || this.getDefaultState(type);
    const disabled = this.hasAttribute("disabled");
    const variant = this.getAttribute("variant") || "default"; // default, ghost
    const icon1 = this.getAttribute("icon1");
    const icon2 = this.getAttribute("icon2");

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

    const icons = this.getIcons(type, icon1, icon2);
    this.innerHTML = `
      <span class="icon-btn-toggle-icon">
        ${icons.icon1}
        ${icons.icon2}
      </span>
    `;
  }

  getDefaultState(type: string): string {
    switch (type) {
      case "mode":
        return document.documentElement.getAttribute("data-theme") || "light";
      case "theme":
        return (
          document.documentElement.getAttribute("data-theme-variant") || "warm"
        );
      case "color":
        return "monochrome";
      case "language":
        return "ko";
      default:
        return "default";
    }
  }

  getIcons(
    type: string,
    customIcon1?: string | null,
    customIcon2?: string | null,
  ): { icon1: string; icon2: string } {
    if (customIcon1 && customIcon2) {
      return { icon1: customIcon1, icon2: customIcon2 };
    }

    const iconSets: Record<string, { icon1: string; icon2: string }> = {
      mode: {
        icon1:
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
        icon2:
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
      },
      theme: {
        icon1:
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
        icon2:
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>',
      },
      color: {
        icon1:
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>',
        icon2:
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
      },
      language: {
        icon1:
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
        icon2:
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>',
      },
    };

    const result = iconSets[type];
    if (result) {
      return result;
    }
    return iconSets.mode!;
  }

  setupEventListeners() {
    this.addEventListener("click", () => {
      if (this.hasAttribute("disabled")) return;

      const type = this.getAttribute("type") || "mode";
      const currentState = this.getAttribute("data-state");

      // Add animation class
      this.classList.add("is-animating");

      // Toggle state
      const newState = this.getNextState(type, currentState || "");
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

  getNextState(type: string, currentState: string): string {
    const stateMap: Record<string, Record<string, string>> = {
      mode: { light: "dark", dark: "light" },
      theme: { warm: "cold", cold: "warm" },
      color: { monochrome: "colored", colored: "monochrome" },
      language: { ko: "en", en: "ko" },
    };

    return stateMap[type]?.[currentState] || currentState;
  }

  applyState(type: string, state: string) {
    switch (type) {
      case "mode":
        document.documentElement.setAttribute("data-theme", state);
        break;
      case "theme":
        document.documentElement.setAttribute("data-theme-variant", state);
        break;
      case "color":
        // Custom handling for color toggle
        this.emit("color-change", { state });
        break;
      case "language":
        // Custom handling for language toggle
        this.emit("language-change", { state });
        break;
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
      this.innerHTML = `<a href="${href}">${content}</a>`;
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

// Register all components
export function registerMonochromeComponents() {
  customElements.define("mce-button", MonochromeButton);
  customElements.define("mce-card", MonochromeCard);
  customElements.define("mce-modal", MonochromeModal);
  customElements.define("mce-tabs", MonochromeTabs);
  customElements.define("mce-accordion", MonochromeAccordion);
  customElements.define("mce-input", MonochromeInput);
  customElements.define("mce-checkbox", MonochromeCheckbox);
  customElements.define("mce-badge", MonochromeBadge);
  customElements.define("mce-toast", MonochromeToast);
  customElements.define("mce-icon-toggle", MonochromeIconToggle);
  customElements.define("mce-breadcrumb", MonochromeBreadcrumb);
  customElements.define("mce-breadcrumb-item", MonochromeBreadcrumbItem);
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
};

export default {
  registerMonochromeComponents,
  showToast,
  ThemeController,
};
