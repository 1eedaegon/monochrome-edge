/**
 * Accordion Component
 * Collapsible content panels
 */

export interface AccordionOptions {
  allowMultiple?: boolean;
  defaultOpen?: number[];
  onToggle?: (index: number, isOpen: boolean) => void;
}

export class Accordion {
  private container: HTMLElement;
  private options: Required<AccordionOptions>;
  private items: HTMLElement[];

  constructor(container: HTMLElement | string, options: AccordionOptions = {}) {
    this.container =
      typeof container === "string"
        ? (document.querySelector(container) as HTMLElement)
        : container;

    if (!this.container) {
      throw new Error("Accordion: Container element not found");
    }

    this.options = {
      allowMultiple: false,
      defaultOpen: [],
      onToggle: () => {},
      ...options,
    };

    this.items = Array.from(this.container.querySelectorAll(".accordion-item"));
    this.init();
  }

  private init(): void {
    this.items.forEach((item, index) => {
      const header = item.querySelector(".accordion-header");
      if (!header) return;

      header.addEventListener("click", () => this.toggle(index));

      // Default open
      if (this.options.defaultOpen.includes(index)) {
        item.classList.add("is-open");
      }
    });
  }

  public toggle(index: number): void {
    const item = this.items[index];
    if (!item) return;

    const isOpen = item.classList.contains("is-open");

    if (!this.options.allowMultiple) {
      // Close all others
      this.items.forEach((i) => i.classList.remove("is-open"));
    }

    if (isOpen) {
      item.classList.remove("is-open");
      this.options.onToggle(index, false);
    } else {
      item.classList.add("is-open");
      this.options.onToggle(index, true);
    }
  }

  public open(index: number): void {
    const item = this.items[index];
    if (!item) return;

    if (!this.options.allowMultiple) {
      this.items.forEach((i) => i.classList.remove("is-open"));
    }

    item.classList.add("is-open");
    this.options.onToggle(index, true);
  }

  public close(index: number): void {
    const item = this.items[index];
    if (!item) return;

    item.classList.remove("is-open");
    this.options.onToggle(index, false);
  }

  public closeAll(): void {
    this.items.forEach((item) => item.classList.remove("is-open"));
  }

  public openAll(): void {
    if (!this.options.allowMultiple) {
      console.warn("Accordion: Cannot open all when allowMultiple is false");
      return;
    }
    this.items.forEach((item) => item.classList.add("is-open"));
  }

  public destroy(): void {
    this.items.forEach((item) => {
      const header = item.querySelector(".accordion-header");
      if (header) {
        const clone = header.cloneNode(true);
        header.parentNode?.replaceChild(clone, header);
      }
    });
  }
}

// Auto-initialize accordions with data attribute
export function initAccordions(): void {
  document.querySelectorAll("[data-accordion]").forEach((el) => {
    if (!el.hasAttribute("data-accordion-initialized")) {
      new Accordion(el as HTMLElement);
      el.setAttribute("data-accordion-initialized", "true");
    }
  });
}
