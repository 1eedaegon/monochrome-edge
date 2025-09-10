// Component factory for Monochrome Edge UI Components
export interface ComponentOptions {
  className?: string;
  id?: string;
  attributes?: Record<string, string>;
  dataset?: Record<string, string>;
}

export interface ButtonOptions extends ComponentOptions {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  size?: "small" | "medium" | "large";
  loading?: boolean;
  disabled?: boolean;
  onClick?: (event: MouseEvent) => void;
}

export class MonochromeComponents {
  static createElement<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    options: ComponentOptions = {},
    children?: (Node | string)[],
  ): HTMLElementTagNameMap[K] {
    const element = document.createElement(tag);

    if (options.className) {
      element.className = options.className;
    }

    if (options.id) {
      element.id = options.id;
    }

    if (options.attributes) {
      Object.entries(options.attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
    }

    if (options.dataset) {
      Object.entries(options.dataset).forEach(([key, value]) => {
        element.dataset[key] = value;
      });
    }

    if (children) {
      children.forEach((child) => {
        if (typeof child === "string") {
          element.appendChild(document.createTextNode(child));
        } else {
          element.appendChild(child);
        }
      });
    }

    return element;
  }

  static button(text: string, options: ButtonOptions = {}): HTMLButtonElement {
    const {
      variant = "primary",
      size = "medium",
      loading = false,
      disabled = false,
      onClick,
      ...componentOptions
    } = options;

    const sizeClass =
      size === "small" ? "btn-small" : size === "large" ? "btn-large" : "";
    const classes = [
      "btn",
      `btn-${variant}`,
      sizeClass,
      loading ? "loading" : "",
      componentOptions.className || "",
    ]
      .filter(Boolean)
      .join(" ");

    const button = this.createElement(
      "button",
      {
        ...componentOptions,
        className: classes,
        attributes: {
          ...componentOptions.attributes,
          ...(disabled ? { disabled: "true" } : {}),
        },
      },
      [text],
    );

    if (loading) {
      const spinner = this.createElement("span", { className: "spinner" });
      button.insertBefore(spinner, button.firstChild);
    }

    if (onClick) {
      button.addEventListener("click", onClick);
    }

    return button;
  }

  static input(
    options: {
      type?: string;
      placeholder?: string;
      value?: string;
      error?: boolean;
      onChange?: (value: string) => void;
    } & ComponentOptions = {},
  ): HTMLInputElement {
    const {
      type = "text",
      placeholder = "",
      value = "",
      error = false,
      onChange,
      ...componentOptions
    } = options;

    const input = this.createElement("input", {
      ...componentOptions,
      className:
        `input ${error ? "is-error" : ""} ${componentOptions.className || ""}`.trim(),
      attributes: {
        ...componentOptions.attributes,
        type,
        placeholder,
        value,
      },
    }) as HTMLInputElement;

    if (onChange) {
      input.addEventListener("input", (e) => {
        onChange((e.target as HTMLInputElement).value);
      });
    }

    return input;
  }

  static textarea(
    options: {
      placeholder?: string;
      value?: string;
      rows?: number;
      error?: boolean;
      onChange?: (value: string) => void;
    } & ComponentOptions = {},
  ): HTMLTextAreaElement {
    const {
      placeholder = "",
      value = "",
      rows = 4,
      error = false,
      onChange,
      ...componentOptions
    } = options;

    const textarea = this.createElement(
      "textarea",
      {
        ...componentOptions,
        className:
          `textarea ${error ? "is-error" : ""} ${componentOptions.className || ""}`.trim(),
        attributes: {
          ...componentOptions.attributes,
          placeholder,
          rows: rows.toString(),
        },
      },
      [value],
    ) as HTMLTextAreaElement;

    if (onChange) {
      textarea.addEventListener("input", (e) => {
        onChange((e.target as HTMLTextAreaElement).value);
      });
    }

    return textarea;
  }

  static select(
    options: {
      options: Array<{ value: string; label: string }>;
      value?: string;
      error?: boolean;
      onChange?: (value: string) => void;
    } & ComponentOptions,
  ): HTMLSelectElement {
    const {
      options: selectOptions,
      value = "",
      error = false,
      onChange,
      ...componentOptions
    } = options;

    const select = this.createElement("select", {
      ...componentOptions,
      className:
        `select ${error ? "is-error" : ""} ${componentOptions.className || ""}`.trim(),
    }) as HTMLSelectElement;

    selectOptions.forEach((option) => {
      const optionElement = this.createElement(
        "option",
        {
          attributes: {
            value: option.value,
            ...(option.value === value ? { selected: "true" } : {}),
          },
        },
        [option.label],
      );
      select.appendChild(optionElement);
    });

    if (onChange) {
      select.addEventListener("change", (e) => {
        onChange((e.target as HTMLSelectElement).value);
      });
    }

    return select;
  }

  static card(
    content: (Node | string)[],
    options: ComponentOptions & {
      variant?: "default" | "highlight" | "bordered";
    } = {},
  ): HTMLDivElement {
    const { variant = "default", ...componentOptions } = options;
    const variantClass =
      variant === "highlight"
        ? "card-highlight"
        : variant === "bordered"
          ? "card-bordered"
          : "";

    return this.createElement(
      "div",
      {
        ...componentOptions,
        className:
          `card ${variantClass} ${componentOptions.className || ""}`.trim(),
      },
      content,
    );
  }

  static modal(
    options: {
      title?: string;
      content: (Node | string)[];
      size?: "small" | "medium" | "large";
      onClose?: () => void;
      footer?: (Node | string)[];
    } & ComponentOptions = {},
  ): HTMLDivElement {
    const {
      title,
      content,
      size = "medium",
      onClose,
      footer,
      ...componentOptions
    } = options;

    const sizeClass =
      size === "small" ? "modal-small" : size === "large" ? "modal-large" : "";

    const modal = this.createElement("div", {
      ...componentOptions,
      className: `modal ${componentOptions.className || ""}`.trim(),
    });

    // Backdrop
    const backdrop = this.createElement("div", { className: "modal-backdrop" });
    if (onClose) {
      backdrop.addEventListener("click", onClose);
    }
    modal.appendChild(backdrop);

    // Content container
    const modalContent = this.createElement("div", {
      className: `modal-content ${sizeClass}`.trim(),
    });

    // Header
    if (title) {
      const header = this.createElement("div", { className: "modal-header" });
      const titleElement = this.createElement(
        "h3",
        { className: "modal-title" },
        [title],
      );
      const closeButton = this.createElement(
        "button",
        { className: "modal-close" },
        ["×"],
      );

      if (onClose) {
        closeButton.addEventListener("click", onClose);
      }

      header.appendChild(titleElement);
      header.appendChild(closeButton);
      modalContent.appendChild(header);
    }

    // Body
    const body = this.createElement(
      "div",
      { className: "modal-body" },
      content,
    );
    modalContent.appendChild(body);

    // Footer
    if (footer) {
      const footerElement = this.createElement(
        "div",
        { className: "modal-footer" },
        footer,
      );
      modalContent.appendChild(footerElement);
    }

    modal.appendChild(modalContent);
    return modal;
  }

  static formGroup(
    label: string,
    input: HTMLElement,
    options: ComponentOptions & {
      required?: boolean;
      helperText?: string;
    } = {},
  ): HTMLDivElement {
    const { required = false, helperText, ...componentOptions } = options;

    const group = this.createElement("div", {
      ...componentOptions,
      className: `form-group ${componentOptions.className || ""}`.trim(),
    });

    const labelElement = this.createElement(
      "label",
      { className: "label" },
      [
        label,
        required
          ? this.createElement("span", { className: "text-danger" }, [" *"])
          : null,
      ].filter(Boolean) as (Node | string)[],
    );

    group.appendChild(labelElement);
    group.appendChild(input);

    if (helperText) {
      const helper = this.createElement("span", { className: "helper-text" }, [
        helperText,
      ]);
      group.appendChild(helper);
    }

    return group;
  }

  static checkbox(
    label: string,
    options: ComponentOptions & {
      checked?: boolean;
      onChange?: (checked: boolean) => void;
    } = {},
  ): HTMLLabelElement {
    const { checked = false, onChange, ...componentOptions } = options;

    const labelElement = this.createElement("label", {
      ...componentOptions,
      className: `checkbox ${componentOptions.className || ""}`.trim(),
    });

    const input = this.createElement("input", {
      attributes: {
        type: "checkbox",
        ...(checked ? { checked: "true" } : {}),
      },
    }) as HTMLInputElement;

    if (onChange) {
      input.addEventListener("change", (e) => {
        onChange((e.target as HTMLInputElement).checked);
      });
    }

    const checkmark = this.createElement("span", {
      className: "checkbox-mark",
    });

    labelElement.appendChild(input);
    labelElement.appendChild(checkmark);
    labelElement.appendChild(document.createTextNode(label));

    return labelElement;
  }

  static radio(
    name: string,
    label: string,
    options: ComponentOptions & {
      value: string;
      checked?: boolean;
      onChange?: (value: string) => void;
    },
  ): HTMLLabelElement {
    const { value, checked = false, onChange, ...componentOptions } = options;

    const labelElement = this.createElement("label", {
      ...componentOptions,
      className: `radio ${componentOptions.className || ""}`.trim(),
    });

    const input = this.createElement("input", {
      attributes: {
        type: "radio",
        name,
        value,
        ...(checked ? { checked: "true" } : {}),
      },
    }) as HTMLInputElement;

    if (onChange) {
      input.addEventListener("change", (e) => {
        if ((e.target as HTMLInputElement).checked) {
          onChange((e.target as HTMLInputElement).value);
        }
      });
    }

    const radioMark = this.createElement("span", { className: "radio-mark" });

    labelElement.appendChild(input);
    labelElement.appendChild(radioMark);
    labelElement.appendChild(document.createTextNode(label));

    return labelElement;
  }
}
