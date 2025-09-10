export class MonochromeModal extends HTMLElement {
  private _isOpen: boolean = false;
  private _title: string = "";
  private _size: string = "medium";
  private _closeOnOverlay: boolean = true;

  static get observedAttributes(): string[] {
    return ["open", "title", "size", "close-on-overlay"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback(): void {
    this.render();
    this.setupEventListeners();
  }

  disconnectedCallback(): void {
    this.removeEventListeners();
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null,
  ): void {
    if (oldValue !== newValue) {
      switch (name) {
        case "open":
          this._isOpen = newValue === "true";
          this.handleOpenChange();
          break;
        case "title":
          this._title = newValue || "";
          break;
        case "size":
          this._size = newValue || "medium";
          break;
        case "close-on-overlay":
          this._closeOnOverlay = newValue !== "false";
          break;
      }
      this.render();
    }
  }

  private handleOpenChange(): void {
    if (this._isOpen) {
      document.body.style.overflow = "hidden";
      this.dispatchEvent(new CustomEvent("open"));
    } else {
      document.body.style.overflow = "";
      this.dispatchEvent(new CustomEvent("close"));
    }
  }

  private setupEventListeners(): void {
    const backdrop = this.shadowRoot?.querySelector(".modal-backdrop");
    const closeButton = this.shadowRoot?.querySelector(".modal-close");

    backdrop?.addEventListener("click", this.handleBackdropClick);
    closeButton?.addEventListener("click", this.close);
  }

  private removeEventListeners(): void {
    const backdrop = this.shadowRoot?.querySelector(".modal-backdrop");
    const closeButton = this.shadowRoot?.querySelector(".modal-close");

    backdrop?.removeEventListener("click", this.handleBackdropClick);
    closeButton?.removeEventListener("click", this.close);
  }

  private handleBackdropClick = (): void => {
    if (this._closeOnOverlay) {
      this.close();
    }
  };

  private render(): void {
    if (!this.shadowRoot) return;

    const sizeClass =
      this._size === "small"
        ? "modal-small"
        : this._size === "large"
          ? "modal-large"
          : "";

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="/ui/monochrome-edge.css">
      <style>
        :host {
          display: ${this._isOpen ? "block" : "none"};
        }
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: ${this._isOpen ? "1" : "0"};
          transition: opacity 0.3s ease;
        }
        .modal-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
        }
        .modal-content {
          position: relative;
          background-color: var(--theme-surface);
          border-radius: var(--border-radius);
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow: auto;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }
        .modal-small {
          max-width: 300px;
        }
        .modal-large {
          max-width: 800px;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid var(--theme-border);
        }
        .modal-title {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
        }
        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--theme-text-secondary);
          padding: 0;
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal-close:hover {
          color: var(--theme-text-primary);
        }
        .modal-body {
          padding: 1.5rem;
        }
        ::slotted([slot="footer"]) {
          padding: 1.5rem;
          border-top: 1px solid var(--theme-border);
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
        }
      </style>
      <div class="modal">
        <div class="modal-backdrop"></div>
        <div class="modal-content ${sizeClass}">
          ${
            this._title
              ? `
            <div class="modal-header">
              <h3 class="modal-title">${this._title}</h3>
              <button class="modal-close">×</button>
            </div>
          `
              : ""
          }
          <div class="modal-body">
            <slot></slot>
          </div>
          <slot name="footer"></slot>
        </div>
      </div>
    `;

    this.setupEventListeners();
  }

  // Public methods
  public open = (): void => {
    this.setAttribute("open", "true");
  };

  public close = (): void => {
    this.setAttribute("open", "false");
  };

  public toggle = (): void => {
    this._isOpen ? this.close() : this.open();
  };
}

// Register the custom element
customElements.define("monochrome-modal", MonochromeModal);

// TypeScript declaration
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "monochrome-modal": {
        open?: boolean;
        title?: string;
        size?: "small" | "medium" | "large";
        "close-on-overlay"?: boolean;
      };
    }
  }
}
