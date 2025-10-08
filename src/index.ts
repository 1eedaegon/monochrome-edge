/**
 * @monochrome-edge/ui - Modern minimalist UI components
 * Main entry point for all exports
 */

// Core utilities
export const VERSION = "1.0.0";

// Export SearchToolbar
export { SearchToolbar } from "./search-toolbar";
export type {
  SearchToolbarOptions,
  FilterOption,
  SortOption,
  AutocompleteItem,
} from "./search-toolbar";

// Theme management
export class ThemeManager {
  private currentTheme: "warm" | "cold" = "warm";
  private currentMode: "light" | "dark" = "light";

  constructor(theme?: "warm" | "cold", mode?: "light" | "dark") {
    if (theme) this.currentTheme = theme;
    if (mode) this.currentMode = mode;
    this.apply();
  }

  setTheme(theme: "warm" | "cold") {
    this.currentTheme = theme;
    this.apply();
  }

  setMode(mode: "light" | "dark") {
    this.currentMode = mode;
    this.apply();
  }

  toggle() {
    this.currentMode = this.currentMode === "light" ? "dark" : "light";
    this.apply();
  }

  private apply() {
    const root = document.documentElement;
    root.setAttribute("data-theme", this.currentMode);
    root.setAttribute("data-theme-variant", this.currentTheme);
  }

  getTheme() {
    return { theme: this.currentTheme, mode: this.currentMode };
  }
}

// Component utilities
export function createButton(
  text: string,
  options: {
    variant?: "primary" | "secondary" | "ghost" | "danger";
    size?: "small" | "medium" | "large";
    onClick?: () => void;
  } = {},
) {
  const button = document.createElement("button");
  const { variant = "primary", size = "medium", onClick } = options;

  button.className = `btn btn-${variant}${size !== "medium" ? ` btn-${size}` : ""}`;
  button.textContent = text;

  if (onClick) {
    button.addEventListener("click", onClick);
  }

  return button;
}

export function createCard(title: string, content: string | HTMLElement) {
  const card = document.createElement("div");
  card.className = "card";

  const header = document.createElement("div");
  header.className = "card-header";
  header.textContent = title;

  const body = document.createElement("div");
  body.className = "card-body";

  if (typeof content === "string") {
    body.textContent = content;
  } else {
    body.appendChild(content);
  }

  card.appendChild(header);
  card.appendChild(body);

  return card;
}

export function showToast(
  message: string,
  type: "success" | "error" | "info" = "info",
) {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// TOC utilities
export interface TocItem {
  href: string;
  text: string;
  isActive?: boolean;
}

export function createTocHoverCard(
  items: TocItem[],
  title: string = "Contents",
): HTMLElement {
  const container = document.createElement("div");
  container.className = "toc-hover-card";

  const card = document.createElement("div");
  card.className = "toc-card";

  const cardTitle = document.createElement("h4");
  cardTitle.className = "toc-card-title";
  cardTitle.textContent = title;

  const list = document.createElement("ul");
  list.className = "toc-card-list";

  items.forEach((item) => {
    const li = document.createElement("li");
    li.className = "toc-card-item";

    const link = document.createElement("a");
    link.href = item.href;
    link.className = "toc-card-link";
    if (item.isActive) {
      link.classList.add("is-active");
    }
    link.textContent = item.text;

    li.appendChild(link);
    list.appendChild(li);
  });

  card.appendChild(cardTitle);
  card.appendChild(list);
  container.appendChild(card);

  return container;
}

export function createTocCollapsible(
  items: TocItem[],
  options: { title?: string; open?: boolean } = {},
): HTMLElement {
  const { title = "Table of Contents", open = true } = options;

  const container = document.createElement("div");
  container.className = "toc-collapsible";
  if (open) {
    container.classList.add("is-open");
  }

  const header = document.createElement("div");
  header.className = "toc-collapsible-header";

  const headerTitle = document.createElement("h4");
  headerTitle.className = "toc-collapsible-title";
  headerTitle.textContent = title;

  const icon = document.createElement("span");
  icon.className = "toc-collapsible-icon";
  icon.textContent = "▼";

  header.appendChild(headerTitle);
  header.appendChild(icon);

  const content = document.createElement("div");
  content.className = "toc-collapsible-content";

  const list = document.createElement("ul");
  list.className = "toc-list";

  items.forEach((item) => {
    const li = document.createElement("li");
    li.className = "toc-list-item";

    const link = document.createElement("a");
    link.href = item.href;
    link.className = "toc-list-link";
    if (item.isActive) {
      link.classList.add("is-active");
    }
    link.textContent = item.text;

    li.appendChild(link);
    list.appendChild(li);
  });

  content.appendChild(list);
  container.appendChild(header);
  container.appendChild(content);

  // Add toggle functionality
  header.addEventListener("click", () => {
    container.classList.toggle("is-open");
  });

  return container;
}

export function initTocCollapsible(selector: string = ".toc-collapsible") {
  const tocElements = document.querySelectorAll(selector);
  tocElements.forEach((toc) => {
    const header = toc.querySelector(".toc-collapsible-header");
    if (header) {
      header.addEventListener("click", () => {
        toc.classList.toggle("is-open");
      });
    }
  });
}

// Changelog utilities
export interface ChangelogEntry {
  version: string;
  date: string;
  categories: {
    title: string;
    items: { commit: string; hash: string; url?: string }[];
  }[];
}

export function initChangelogPagination(
  options: { itemsPerPage?: number; containerSelector?: string } = {},
) {
  const { itemsPerPage = 10, containerSelector = ".changelog-entry" } = options;

  const entries = Array.from(
    document.querySelectorAll(containerSelector),
  ) as HTMLElement[];
  if (entries.length === 0) return;

  let currentPage = 1;
  const totalPages = Math.ceil(entries.length / itemsPerPage);

  const prevBtn = document.getElementById(
    "changelog-prev",
  ) as HTMLButtonElement;
  const nextBtn = document.getElementById(
    "changelog-next",
  ) as HTMLButtonElement;
  const pageInfo = document.getElementById("changelog-page-info");

  function renderPage(page: number) {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    entries.forEach((entry, index) => {
      entry.style.display = index >= start && index < end ? "block" : "none";
    });

    if (pageInfo) {
      pageInfo.textContent = `Page ${page} of ${totalPages}`;
    }
    if (prevBtn) {
      prevBtn.disabled = page === 1;
    }
    if (nextBtn) {
      nextBtn.disabled = page === totalPages;
    }
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        renderPage(currentPage);
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderPage(currentPage);
      }
    });
  }

  renderPage(1);
}

// Export everything as default as well
export default {
  VERSION,
  ThemeManager,
  createButton,
  createCard,
  showToast,
  createTocHoverCard,
  createTocCollapsible,
  initTocCollapsible,
  initChangelogPagination,
};
