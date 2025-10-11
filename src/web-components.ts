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
};

export default {
  registerMonochromeComponents,
  showToast,
  ThemeController,
};
