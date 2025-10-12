/**
 * Dropdown Component
 * Contextual menu overlay
 */

export interface DropdownOptions {
  closeOnSelect?: boolean;
  placement?: "bottom" | "top" | "left" | "right";
  offset?: number;
  onOpen?: () => void;
  onClose?: () => void;
}

export class Dropdown {
  private trigger: HTMLElement;
  private menu: HTMLElement;
  private options: Required<DropdownOptions>;
  private isOpen: boolean = false;
  private documentClickHandler?: (e: Event) => void;

  constructor(trigger: HTMLElement | string, options: DropdownOptions = {}) {
    this.trigger =
      typeof trigger === "string"
        ? (document.querySelector(trigger) as HTMLElement)
        : trigger;

    if (!this.trigger) {
      throw new Error("Dropdown: Trigger element not found");
    }

    this.options = {
      closeOnSelect: true,
      placement: "bottom",
      offset: 4,
      onOpen: () => {},
      onClose: () => {},
      ...options,
    };

    // Find menu (next sibling or data-target)
    const menuId = this.trigger.dataset.dropdownTarget;
    this.menu = menuId
      ? (document.querySelector(menuId) as HTMLElement)
      : (this.trigger.nextElementSibling as HTMLElement);

    if (!this.menu) {
      throw new Error("Dropdown: Menu element not found");
    }

    this.init();
  }

  private init(): void {
    // Trigger click
    this.trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggle();
    });

    // Close on item select
    if (this.options.closeOnSelect) {
      this.menu.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;
        if (
          target.classList.contains("dropdown-item") ||
          target.closest(".dropdown-item")
        ) {
          this.close();
        }
      });
    }

    // Prevent menu clicks from closing
    this.menu.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  public open(): void {
    if (this.isOpen) return;

    this.menu.classList.add("is-open");
    this.trigger.classList.add("is-active");
    this.isOpen = true;

    this.updatePosition();

    // Close on outside click
    this.documentClickHandler = () => {
      if (this.isOpen) {
        this.close();
      }
    };
    setTimeout(() => {
      document.addEventListener("click", this.documentClickHandler!);
    }, 0);

    this.options.onOpen();
  }

  public close(): void {
    if (!this.isOpen) return;

    this.menu.classList.remove("is-open");
    this.trigger.classList.remove("is-active");
    this.isOpen = false;

    if (this.documentClickHandler) {
      document.removeEventListener("click", this.documentClickHandler);
    }

    this.options.onClose();
  }

  public toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  public isDropdownOpen(): boolean {
    return this.isOpen;
  }

  private updatePosition(): void {
    const triggerRect = this.trigger.getBoundingClientRect();
    const { placement, offset } = this.options;

    // Reset position
    this.menu.style.position = "absolute";

    switch (placement) {
      case "bottom":
        this.menu.style.top = `${triggerRect.bottom + offset}px`;
        this.menu.style.left = `${triggerRect.left}px`;
        this.menu.style.right = "auto";
        this.menu.style.bottom = "auto";
        break;
      case "top":
        this.menu.style.bottom = `${window.innerHeight - triggerRect.top + offset}px`;
        this.menu.style.left = `${triggerRect.left}px`;
        this.menu.style.right = "auto";
        this.menu.style.top = "auto";
        break;
      case "left":
        this.menu.style.top = `${triggerRect.top}px`;
        this.menu.style.right = `${window.innerWidth - triggerRect.left + offset}px`;
        this.menu.style.left = "auto";
        this.menu.style.bottom = "auto";
        break;
      case "right":
        this.menu.style.top = `${triggerRect.top}px`;
        this.menu.style.left = `${triggerRect.right + offset}px`;
        this.menu.style.right = "auto";
        this.menu.style.bottom = "auto";
        break;
    }
  }

  public destroy(): void {
    if (this.documentClickHandler) {
      document.removeEventListener("click", this.documentClickHandler);
    }
    this.close();

    // Remove event listeners
    const triggerClone = this.trigger.cloneNode(true);
    this.trigger.parentNode?.replaceChild(triggerClone, this.trigger);

    const menuClone = this.menu.cloneNode(true);
    this.menu.parentNode?.replaceChild(menuClone, this.menu);
  }
}

// Auto-initialize dropdowns with data attribute
export function initDropdowns(): void {
  document.querySelectorAll("[data-dropdown]").forEach((el) => {
    if (!el.hasAttribute("data-dropdown-initialized")) {
      new Dropdown(el as HTMLElement);
      el.setAttribute("data-dropdown-initialized", "true");
    }
  });
}
