export class MonochromeButton extends HTMLElement {
  private _variant: string = "primary";
  private _size: string = "medium";
  private _loading: boolean = false;
  private _disabled: boolean = false;

  static get observedAttributes(): string[] {
    return ["variant", "size", "loading", "disabled"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback(): void {
    this.render();
    this.addEventListener("click", this.handleClick);
  }

  disconnectedCallback(): void {
    this.removeEventListener("click", this.handleClick);
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null,
  ): void {
    if (oldValue !== newValue) {
      switch (name) {
        case "variant":
          this._variant = newValue || "primary";
          break;
        case "size":
          this._size = newValue || "medium";
          break;
        case "loading":
          this._loading = newValue === "true";
          break;
        case "disabled":
          this._disabled = newValue === "true";
          break;
      }
      this.render();
    }
  }

  private handleClick = (event: MouseEvent): void => {
    if (this._loading || this._disabled) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  private render(): void {
    if (!this.shadowRoot) return;

    const sizeClass =
      this._size === "small"
        ? "btn-small"
        : this._size === "large"
          ? "btn-large"
          : "";
    const classes =
      `btn btn-${this._variant} ${sizeClass} ${this._loading ? "loading" : ""}`.trim();

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="/ui/monochrome-edge.css">
      <style>
        :host {
          display: inline-block;
        }
        :host([disabled]) button {
          cursor: not-allowed;
          opacity: 0.5;
        }
      </style>
      <button class="${classes}" ${this._disabled ? "disabled" : ""}>
        ${this._loading ? '<span class="spinner"></span>' : ""}
        <slot></slot>
      </button>
    `;
  }

  // Public methods
  public setLoading(loading: boolean): void {
    this._loading = loading;
    this.setAttribute("loading", loading.toString());
  }

  public setDisabled(disabled: boolean): void {
    this._disabled = disabled;
    if (disabled) {
      this.setAttribute("disabled", "");
    } else {
      this.removeAttribute("disabled");
    }
  }

  public click(): void {
    const button = this.shadowRoot?.querySelector("button");
    button?.click();
  }
}

// Register the custom element
customElements.define("monochrome-button", MonochromeButton);

// TypeScript declaration for JSX
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "monochrome-button": {
        variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
        size?: "small" | "medium" | "large";
        loading?: boolean;
        disabled?: boolean;
      };
    }
  }
}
