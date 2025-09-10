// Vanilla TypeScript/JavaScript entry point
// This can be used without any framework

export class MonochromeComponents {
  static button(
    text: string,
    options: {
      variant?: "primary" | "secondary" | "ghost" | "outline";
      size?: "small" | "medium" | "large";
      onClick?: (e: MouseEvent) => void;
      loading?: boolean;
    } = {},
  ) {
    const button = document.createElement("button");
    const variant = options.variant || "primary";
    const size =
      options.size === "small"
        ? "btn-small"
        : options.size === "large"
          ? "btn-large"
          : "";

    button.className =
      `btn btn-${variant} ${size} ${options.loading ? "loading" : ""}`.trim();
    button.textContent = text;

    if (options.onClick) {
      button.addEventListener("click", options.onClick);
    }

    if (options.loading) {
      button.disabled = true;
      const spinner = document.createElement("span");
      spinner.className = "spinner spinner-small";
      button.prepend(spinner);
    }

    return button;
  }

  static card(
    content: string | HTMLElement,
    options: {
      title?: string;
      footer?: string | HTMLElement;
      hoverable?: boolean;
      clickable?: boolean;
    } = {},
  ) {
    const card = document.createElement("div");
    card.className =
      `card ${options.hoverable ? "card-hoverable" : ""} ${options.clickable ? "card-clickable" : ""}`.trim();

    if (options.title) {
      const header = document.createElement("div");
      header.className = "card-header";
      const title = document.createElement("h3");
      title.className = "card-header-title";
      title.textContent = options.title;
      header.appendChild(title);
      card.appendChild(header);
    }

    const body = document.createElement("div");
    body.className = "card-body";
    if (typeof content === "string") {
      body.innerHTML = content;
    } else {
      body.appendChild(content);
    }
    card.appendChild(body);

    if (options.footer) {
      const footer = document.createElement("div");
      footer.className = "card-footer";
      if (typeof options.footer === "string") {
        footer.innerHTML = options.footer;
      } else {
        footer.appendChild(options.footer);
      }
      card.appendChild(footer);
    }

    return card;
  }

  static input(
    options: {
      type?: string;
      placeholder?: string;
      value?: string;
      onChange?: (value: string) => void;
      error?: boolean;
      success?: boolean;
    } = {},
  ) {
    const input = document.createElement("input");
    input.type = options.type || "text";
    input.className =
      `input ${options.error ? "input-error" : ""} ${options.success ? "input-success" : ""}`.trim();

    if (options.placeholder) {
      input.placeholder = options.placeholder;
    }

    if (options.value) {
      input.value = options.value;
    }

    if (options.onChange) {
      input.addEventListener("input", (e) => {
        options.onChange!((e.target as HTMLInputElement).value);
      });
    }

    return input;
  }

  static formGroup(
    label: string,
    input: HTMLElement,
    options: {
      required?: boolean;
      helperText?: string;
    } = {},
  ) {
    const group = document.createElement("div");
    group.className = "form-group";

    const labelEl = document.createElement("label");
    labelEl.className =
      `label ${options.required ? "label-required" : ""}`.trim();
    labelEl.textContent = label;

    group.appendChild(labelEl);
    group.appendChild(input);

    if (options.helperText) {
      const helper = document.createElement("span");
      helper.className = "helper-text";
      helper.textContent = options.helperText;
      group.appendChild(helper);
    }

    return group;
  }
}

export class ThemeManager {
  private theme: "warm" | "cold" = "cold";
  private mode: "light" | "dark" = "light";

  constructor() {
    this.detectInitialTheme();
    this.detectInitialMode();
  }

  private detectInitialTheme() {
    const linkElement = document.getElementById(
      "theme-link",
    ) as HTMLLinkElement;
    if (linkElement && linkElement.href.includes("warm")) {
      this.theme = "warm";
    }
  }

  private detectInitialMode() {
    const htmlElement = document.documentElement;
    const currentMode = htmlElement.getAttribute("data-theme");
    if (currentMode === "dark") {
      this.mode = "dark";
    }
  }

  getTheme() {
    return this.theme;
  }

  getMode() {
    return this.mode;
  }

  setTheme(theme: "warm" | "cold") {
    this.theme = theme;
    const linkElement = document.getElementById(
      "theme-link",
    ) as HTMLLinkElement;
    if (linkElement) {
      const currentTheme = this.theme === "warm" ? "cold" : "warm";
      linkElement.href = linkElement.href.replace(currentTheme, theme);
    }
  }

  setMode(mode: "light" | "dark") {
    this.mode = mode;
    document.documentElement.setAttribute("data-theme", mode);
  }

  toggleTheme() {
    this.setTheme(this.theme === "warm" ? "cold" : "warm");
  }

  toggleMode() {
    this.setMode(this.mode === "light" ? "dark" : "light");
  }
}

// Auto-initialize function
export function initMonochrome(
  options: {
    theme?: "warm" | "cold";
    mode?: "light" | "dark";
    autoEnhance?: boolean;
  } = {},
) {
  // Load CSS if not already loaded
  if (!document.getElementById("monochrome-css")) {
    console.warn(
      "Monochrome CSS not found. Please import @monochrome-edge/styles",
    );
  }

  // Set initial theme and mode
  const themeManager = new ThemeManager();
  if (options.theme) {
    themeManager.setTheme(options.theme);
  }
  if (options.mode) {
    themeManager.setMode(options.mode);
  }

  // Auto-enhance elements if requested
  if (options.autoEnhance) {
    // Add click handlers to buttons with data-toggle attributes
    document.querySelectorAll('[data-toggle="theme"]').forEach((el) => {
      el.addEventListener("click", () => themeManager.toggleTheme());
    });

    document.querySelectorAll('[data-toggle="mode"]').forEach((el) => {
      el.addEventListener("click", () => themeManager.toggleMode());
    });
  }

  return themeManager;
}
