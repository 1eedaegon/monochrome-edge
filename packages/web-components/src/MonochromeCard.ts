export class MonochromeCard extends HTMLElement {
  private _variant: string = "default";
  private _padding: string = "medium";

  static get observedAttributes(): string[] {
    return ["variant", "padding"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback(): void {
    this.render();
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null,
  ): void {
    if (oldValue !== newValue) {
      switch (name) {
        case "variant":
          this._variant = newValue || "default";
          break;
        case "padding":
          this._padding = newValue || "medium";
          break;
      }
      this.render();
    }
  }

  private render(): void {
    if (!this.shadowRoot) return;

    const variantClass =
      this._variant === "highlight"
        ? "card-highlight"
        : this._variant === "bordered"
          ? "card-bordered"
          : "";
    const paddingClass =
      this._padding === "none"
        ? "p-0"
        : this._padding === "small"
          ? "p-2"
          : this._padding === "large"
            ? "p-6"
            : "";

    const classes = `card ${variantClass} ${paddingClass}`.trim();

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="/ui/monochrome-edge.css">
      <style>
        :host {
          display: block;
        }
        .card {
          background-color: var(--theme-surface);
          border: 1px solid var(--theme-border);
          border-radius: var(--border-radius);
          padding: 1.5rem;
        }
        ::slotted([slot="header"]) {
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--theme-border);
        }
        ::slotted([slot="footer"]) {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--theme-border);
        }
      </style>
      <div class="${classes}">
        <slot name="header"></slot>
        <slot></slot>
        <slot name="footer"></slot>
      </div>
    `;
  }
}

// Register the custom element
customElements.define("monochrome-card", MonochromeCard);

// TypeScript declaration
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "monochrome-card": {
        variant?: "default" | "highlight" | "bordered";
        padding?: "none" | "small" | "medium" | "large";
      };
    }
  }
}
