/**
 * Modal Component
 * Dialog/popup window overlay
 */

export interface ModalOptions {
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

export class Modal {
  private container: HTMLElement;
  private options: Required<ModalOptions>;
  private isOpen: boolean = false;
  private escapeHandler?: (e: KeyboardEvent) => void;

  constructor(container: HTMLElement | string, options: ModalOptions = {}) {
    this.container =
      typeof container === "string"
        ? (document.querySelector(container) as HTMLElement)
        : container;

    if (!this.container) {
      throw new Error("Modal: Container element not found");
    }

    this.options = {
      closeOnBackdrop: true,
      closeOnEscape: true,
      onOpen: () => {},
      onClose: () => {},
      ...options,
    };

    this.init();
  }

  private init(): void {
    // Backdrop click
    if (this.options.closeOnBackdrop) {
      this.container.addEventListener("click", (e) => {
        if (e.target === this.container) {
          this.close();
        }
      });
    }

    // Escape key
    if (this.options.closeOnEscape) {
      this.escapeHandler = (e: KeyboardEvent) => {
        if (e.key === "Escape" && this.isOpen) {
          this.close();
        }
      };
      document.addEventListener("keydown", this.escapeHandler);
    }

    // Close button
    const closeBtn = this.container.querySelector("[data-modal-close]");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.close());
    }
  }

  public open(): void {
    if (this.isOpen) return;

    this.container.classList.add("is-open");
    document.body.style.overflow = "hidden";
    this.isOpen = true;

    this.options.onOpen();
  }

  public close(): void {
    if (!this.isOpen) return;

    this.container.classList.remove("is-open");
    document.body.style.overflow = "";
    this.isOpen = false;

    this.options.onClose();
  }

  public toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  public isModalOpen(): boolean {
    return this.isOpen;
  }

  public destroy(): void {
    if (this.escapeHandler) {
      document.removeEventListener("keydown", this.escapeHandler);
    }
    this.close();
  }
}

// Auto-initialize modals with data attribute
export function initModals(): void {
  document.querySelectorAll("[data-modal]").forEach((el) => {
    if (!el.hasAttribute("data-modal-initialized")) {
      new Modal(el as HTMLElement);
      el.setAttribute("data-modal-initialized", "true");
    }
  });
}
