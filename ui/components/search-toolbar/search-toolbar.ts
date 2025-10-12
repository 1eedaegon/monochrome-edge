/**
 * Search Toolbar Component
 * Advanced search with filters, sorting, and autocomplete
 */

import { iconLoader } from "@ui/utils/icon-loader";

export interface SearchToolbarOptions {
  placeholder?: string;
  autocomplete?: string[] | ((query: string) => Promise<string[]>);
  filters?: FilterOption[];
  sortOptions?: SortOption[];
  onSearch?: (
    query: string,
    filters: Record<string, string>,
    sort: string,
  ) => void;
  debounceMs?: number;
}

export interface FilterOption {
  id: string;
  label: string;
  values: { value: string; label: string }[];
  default?: string;
}

export interface SortOption {
  value: string;
  label: string;
}

export interface AutocompleteItem {
  text: string;
  category?: string;
  meta?: string;
}

export class SearchToolbar {
  private container: HTMLElement;
  private options: Required<SearchToolbarOptions>;
  private inputElement: HTMLInputElement;
  private autocompleteElement: HTMLElement;
  private clearButton: HTMLButtonElement;
  private tagsContainer: HTMLElement | null = null;
  private activeFilters: Record<string, string> = {};
  private activeSort: string = "";
  private debounceTimer?: number;
  private currentQuery: string = "";
  private autocompleteItems: AutocompleteItem[] = [];
  private activeItemIndex: number = -1;
  public selectedTags: Set<string> = new Set();

  constructor(
    container: string | HTMLElement,
    options: SearchToolbarOptions = {},
  ) {
    this.container =
      typeof container === "string"
        ? document.querySelector(container)!
        : container;

    if (!this.container) {
      throw new Error("Container element not found");
    }

    this.options = {
      placeholder: "Search...",
      autocomplete: [],
      filters: [],
      sortOptions: [],
      onSearch: () => {},
      debounceMs: 300,
      ...options,
    };

    // Initialize default filter values
    this.options.filters.forEach((filter) => {
      this.activeFilters[filter.id] =
        filter.default || filter.values[0]?.value || "";
    });

    if (this.options.sortOptions && this.options.sortOptions.length > 0) {
      const firstSort = this.options.sortOptions[0];
      if (firstSort) {
        this.activeSort = firstSort.value;
      }
    }

    this.render();
    this.inputElement = this.container.querySelector(".search-toolbar-input")!;
    this.autocompleteElement = this.container.querySelector(
      ".search-toolbar-autocomplete",
    )!;
    this.clearButton = this.container.querySelector(".search-toolbar-clear")!;

    // Try to find external tags container first, fallback to internal
    this.tagsContainer =
      document.getElementById("search-tags") ||
      this.container.querySelector(".search-toolbar-tags");

    this.attachEventListeners();
  }

  private async render(): Promise<void> {
    const hasControls =
      this.options.filters.length > 0 || this.options.sortOptions.length > 0;

    this.container.innerHTML = `
      <div class="search-toolbar">
        <div class="search-toolbar-main">
          <div class="search-toolbar-input-wrapper">
            <span class="search-toolbar-icon" data-icon="search"></span>
            <input
              type="text"
              class="search-toolbar-input"
              placeholder="${this.options.placeholder}"
              aria-label="Search"
            />
            <button class="search-toolbar-clear" aria-label="Clear search" type="button">
              <span data-icon="close"></span>
            </button>
          </div>
        </div>
        ${
          hasControls
            ? `
          <div class="search-toolbar-controls">
            ${this.renderFilters()}
            ${
              this.options.filters.length > 0 &&
              this.options.sortOptions.length > 0
                ? '<div class="search-toolbar-divider"></div>'
                : ""
            }
            ${this.renderSortOptions()}
            <div class="search-toolbar-results"></div>
          </div>
        `
            : ""
        }
      </div>
      <div class="search-toolbar-autocomplete"></div>
    `;

    // Load icons dynamically
    await this.loadIcons();
  }

  private async loadIcons(): Promise<void> {
    try {
      const searchIcon = this.container.querySelector('[data-icon="search"]');
      if (searchIcon) {
        const svg = await iconLoader.load("search", { width: 20, height: 20 });
        searchIcon.innerHTML = svg;
      }

      const closeIcon = this.container.querySelector('[data-icon="close"]');
      if (closeIcon) {
        const svg = await iconLoader.load("close", { width: 16, height: 16 });
        closeIcon.innerHTML = svg;
      }
    } catch (error) {
      console.error("Failed to load icons:", error);
    }
  }

  private renderFilters(): string {
    return this.options.filters
      .map(
        (filter) => `
      <div class="search-toolbar-filter-group" data-filter-id="${filter.id}">
        ${filter.values
          .map(
            (value) => `
          <button
            class="search-toolbar-filter-btn ${this.activeFilters[filter.id] === value.value ? "is-active" : ""}"
            data-filter-value="${value.value}"
          >
            ${value.label}
          </button>
        `,
          )
          .join("")}
      </div>
    `,
      )
      .join("");
  }

  private renderSortOptions(): string {
    if (this.options.sortOptions.length === 0) return "";

    return `
      <div class="search-toolbar-filter-group" data-sort-group>
        ${this.options.sortOptions
          .map(
            (option) => `
          <button
            class="search-toolbar-filter-btn ${this.activeSort === option.value ? "is-active" : ""}"
            data-sort-value="${option.value}"
          >
            ${option.label}
          </button>
        `,
          )
          .join("")}
      </div>
    `;
  }

  private attachEventListeners(): void {
    // Input events
    this.inputElement.addEventListener("input", () => this.handleInput());
    this.inputElement.addEventListener("keydown", (e) => this.handleKeyDown(e));
    this.inputElement.addEventListener("focus", () => this.handleInput());
    this.inputElement.addEventListener("blur", () => {
      setTimeout(() => this.hideAutocomplete(), 200);
    });

    // Clear button
    this.clearButton.addEventListener("click", () => this.clear());

    // Filter buttons
    this.container.querySelectorAll("[data-filter-id]").forEach((group) => {
      const filterId = group.getAttribute("data-filter-id")!;
      group.querySelectorAll(".search-toolbar-filter-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const value = btn.getAttribute("data-filter-value")!;
          this.setFilter(filterId, value);
        });
      });
    });

    // Sort buttons
    this.container
      .querySelectorAll("[data-sort-group] .search-toolbar-filter-btn")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          const value = btn.getAttribute("data-sort-value")!;
          this.setSort(value);
        });
      });
  }

  private handleInput(): void {
    this.currentQuery = this.inputElement.value;

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = window.setTimeout(async () => {
      await this.updateAutocomplete();
      this.triggerSearch();
    }, this.options.debounceMs);
  }

  private async updateAutocomplete(): Promise<void> {
    const query = this.currentQuery.trim();

    if (!query) {
      this.hideAutocomplete();
      return;
    }

    let items: string[] | AutocompleteItem[];

    if (typeof this.options.autocomplete === "function") {
      items = await this.options.autocomplete(query);
    } else {
      items = this.options.autocomplete.filter((item) =>
        item.toLowerCase().includes(query.toLowerCase()),
      );
    }

    // Convert strings to AutocompleteItem
    this.autocompleteItems = items.map((item) =>
      typeof item === "string" ? { text: item } : item,
    );

    if (this.autocompleteItems.length > 0) {
      this.renderAutocomplete();
      this.showAutocomplete();
    } else {
      this.hideAutocomplete();
    }
  }

  private renderAutocomplete(): void {
    const query = this.currentQuery.toLowerCase();
    const groupedItems = this.groupItemsByCategory(this.autocompleteItems);

    let html = "";
    Object.entries(groupedItems).forEach(([category, items]) => {
      if (category) {
        html += `<div class="search-toolbar-autocomplete-category">${category}</div>`;
      }
      items.forEach((item, index) => {
        const highlightedText = this.highlightMatch(item.text, query);
        html += `
          <div class="search-toolbar-autocomplete-item" data-index="${index}">
            <div class="search-toolbar-autocomplete-text">${highlightedText}</div>
            ${item.meta ? `<div class="search-toolbar-autocomplete-meta">${item.meta}</div>` : ""}
          </div>
        `;
      });
    });

    this.autocompleteElement.innerHTML = html;

    // Attach click handlers
    this.autocompleteElement
      .querySelectorAll(".search-toolbar-autocomplete-item")
      .forEach((item) => {
        item.addEventListener("click", () => {
          const index = parseInt(item.getAttribute("data-index")!);
          this.selectItem(index);
        });
      });
  }

  private groupItemsByCategory(
    items: AutocompleteItem[],
  ): Record<string, AutocompleteItem[]> {
    const grouped: Record<string, AutocompleteItem[]> = {};
    items.forEach((item) => {
      const category = item.category || "";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });
    return grouped;
  }

  private highlightMatch(text: string, query: string): string {
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text;

    const before = text.slice(0, index);
    const match = text.slice(index, index + query.length);
    const after = text.slice(index + query.length);

    return `${before}<span class="search-toolbar-autocomplete-highlight">${match}</span>${after}`;
  }

  private handleKeyDown(e: KeyboardEvent): void {
    const items = this.autocompleteElement.querySelectorAll(
      ".search-toolbar-autocomplete-item",
    );

    if (items.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        this.activeItemIndex = Math.min(
          this.activeItemIndex + 1,
          items.length - 1,
        );
        this.updateActiveItem(items);
        break;
      case "ArrowUp":
        e.preventDefault();
        this.activeItemIndex = Math.max(this.activeItemIndex - 1, -1);
        this.updateActiveItem(items);
        break;
      case "Enter":
        e.preventDefault();
        if (this.activeItemIndex >= 0) {
          this.selectItem(this.activeItemIndex);
        } else {
          this.hideAutocomplete();
          this.triggerSearch();
        }
        break;
      case "Escape":
        this.hideAutocomplete();
        break;
    }
  }

  private updateActiveItem(items: NodeListOf<Element>): void {
    items.forEach((item, index) => {
      item.classList.toggle("is-active", index === this.activeItemIndex);
    });

    if (this.activeItemIndex >= 0) {
      const activeItem = items[this.activeItemIndex];
      if (activeItem) {
        activeItem.scrollIntoView({ block: "nearest" });
      }
    }
  }

  private selectItem(index: number): void {
    const item = this.autocompleteItems[index];
    if (item) {
      // Add to selected tags
      this.selectedTags.add(item.text);
      this.renderTags();

      // Clear input and hide autocomplete, but keep input focused
      this.inputElement.value = "";
      this.currentQuery = "";
      this.autocompleteItems = [];
      this.hideAutocomplete();
      this.triggerSearch();

      // Re-focus input for continued typing
      this.inputElement.focus();
    }
  }

  private renderTags(): void {
    if (!this.tagsContainer) return;

    if (this.selectedTags.size === 0) {
      this.tagsContainer.innerHTML = "";
      return;
    }

    this.tagsContainer.innerHTML = `
      <div style="display: flex; flex-wrap: wrap; gap: 0.375rem;">
        ${Array.from(this.selectedTags)
          .map(
            (tag) => `
          <div class="search-toolbar-tag" data-tag="${tag}">
            <span>${tag}</span>
            <button class="search-toolbar-tag-remove" aria-label="Remove ${tag}">
              <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        `,
          )
          .join("")}
      </div>
    `;

    // Attach remove handlers
    this.tagsContainer
      .querySelectorAll(".search-toolbar-tag-remove")
      .forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const tag = (e.currentTarget as HTMLElement)
            .closest(".search-toolbar-tag")
            ?.getAttribute("data-tag");
          if (tag) {
            this.removeTag(tag);
          }
        });
      });
  }

  private removeTag(tag: string): void {
    this.selectedTags.delete(tag);
    this.renderTags();
    this.triggerSearch();
  }

  private showAutocomplete(): void {
    // Position autocomplete below input
    const inputRect = this.inputElement.getBoundingClientRect();
    this.autocompleteElement.style.top = `${inputRect.bottom + 4}px`;
    this.autocompleteElement.style.left = `${inputRect.left}px`;
    this.autocompleteElement.style.width = `${inputRect.width}px`;

    this.autocompleteElement.classList.add("is-visible");
    this.activeItemIndex = -1;
  }

  private hideAutocomplete(): void {
    this.autocompleteElement.classList.remove("is-visible");
    this.activeItemIndex = -1;
  }

  private setFilter(filterId: string, value: string): void {
    this.activeFilters[filterId] = value;

    // Update button states
    const group = this.container.querySelector(
      `[data-filter-id="${filterId}"]`,
    );
    if (group) {
      group.querySelectorAll(".search-toolbar-filter-btn").forEach((btn) => {
        btn.classList.toggle(
          "is-active",
          btn.getAttribute("data-filter-value") === value,
        );
      });
    }

    this.triggerSearch();
  }

  private setSort(value: string): void {
    this.activeSort = value;

    // Update button states
    this.container
      .querySelectorAll("[data-sort-group] .search-toolbar-filter-btn")
      .forEach((btn) => {
        btn.classList.toggle(
          "is-active",
          btn.getAttribute("data-sort-value") === value,
        );
      });

    this.triggerSearch();
  }

  private triggerSearch(): void {
    this.options.onSearch(
      this.currentQuery,
      this.activeFilters,
      this.activeSort,
    );
  }

  public clear(): void {
    this.inputElement.value = "";
    this.currentQuery = "";
    this.selectedTags.clear();
    this.renderTags();
    this.hideAutocomplete();
    this.triggerSearch();
  }

  public getQuery(): string {
    return this.currentQuery;
  }

  public getFilters(): Record<string, string> {
    return { ...this.activeFilters };
  }

  public getSort(): string {
    return this.activeSort;
  }

  public setResultsCount(count: number): void {
    const resultsEl = this.container.querySelector(".search-toolbar-results");
    if (resultsEl) {
      resultsEl.textContent = `${count} result${count !== 1 ? "s" : ""}`;
    }
  }

  public destroy(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.container.innerHTML = "";
  }
}

// Export for use in browser
if (typeof window !== "undefined") {
  (window as any).SearchToolbar = SearchToolbar;
}
