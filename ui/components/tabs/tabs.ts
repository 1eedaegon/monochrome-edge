/**
 * Tabs Component
 * Tabbed content navigation
 */

export interface TabsOptions {
  defaultTab?: number;
  onChange?: (index: number, tabId?: string) => void;
}

export class Tabs {
  private container: HTMLElement;
  private options: Required<TabsOptions>;
  private tabButtons: HTMLElement[];
  private tabPanels: HTMLElement[];
  private currentIndex: number;

  constructor(container: HTMLElement | string, options: TabsOptions = {}) {
    this.container =
      typeof container === "string"
        ? (document.querySelector(container) as HTMLElement)
        : container;

    if (!this.container) {
      throw new Error("Tabs: Container element not found");
    }

    this.options = {
      defaultTab: 0,
      onChange: () => {},
      ...options,
    };

    this.tabButtons = Array.from(this.container.querySelectorAll(".tab"));
    this.tabPanels = Array.from(this.container.querySelectorAll(".tab-panel"));
    this.currentIndex = this.options.defaultTab;

    this.init();
  }

  private init(): void {
    this.tabButtons.forEach((button, index) => {
      button.addEventListener("click", () => this.switchTo(index));
    });

    this.switchTo(this.currentIndex);
  }

  public switchTo(index: number): void {
    if (index < 0 || index >= this.tabButtons.length) return;

    // Remove active class from all
    this.tabButtons.forEach((btn) => btn.classList.remove("active"));
    this.tabPanels.forEach((panel) => panel.classList.remove("active"));

    // Add active class to selected
    const button = this.tabButtons[index];
    const panel = this.tabPanels[index];

    if (button) button.classList.add("active");
    if (panel) panel.classList.add("active");

    this.currentIndex = index;

    const tabId = button?.getAttribute("data-tab-id") || undefined;
    this.options.onChange(index, tabId);
  }

  public next(): void {
    const nextIndex = (this.currentIndex + 1) % this.tabButtons.length;
    this.switchTo(nextIndex);
  }

  public prev(): void {
    const prevIndex =
      (this.currentIndex - 1 + this.tabButtons.length) % this.tabButtons.length;
    this.switchTo(prevIndex);
  }

  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  public getTabCount(): number {
    return this.tabButtons.length;
  }

  public destroy(): void {
    this.tabButtons.forEach((button) => {
      const clone = button.cloneNode(true);
      button.parentNode?.replaceChild(clone, button);
    });
  }
}

// Auto-initialize tabs with data attribute
export function initTabs(): void {
  document.querySelectorAll("[data-tabs]").forEach((el) => {
    if (!el.hasAttribute("data-tabs-initialized")) {
      new Tabs(el as HTMLElement);
      el.setAttribute("data-tabs-initialized", "true");
    }
  });
}
