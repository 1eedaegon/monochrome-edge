/**
 * @monochrome-edge/ui - jQuery plugins
 * jQuery plugin implementations for Monochrome Edge UI
 */

import $ from "jquery";

// Extend jQuery interface
declare global {
  interface JQuery {
    mceButton(options?: ButtonOptions): JQuery;
    mceCard(options?: CardOptions): JQuery;
    mceModal(options?: ModalOptions): JQuery;
    mceTabs(options?: TabsOptions): JQuery;
    mceAccordion(options?: AccordionOptions): JQuery;
    mceToast(message: string, type?: "success" | "error" | "info"): void;
    mceTheme(action: "set" | "toggle" | "get", value?: string): any;
    mceIconToggle(options?: IconToggleOptions): JQuery;
    mceBreadcrumb(options?: BreadcrumbOptions): JQuery;
  }
}

// Button Options
interface ButtonOptions {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "small" | "medium" | "large";
  loading?: boolean;
  onClick?: () => void;
}

$.fn.mceButton = function (options?: ButtonOptions) {
  const settings = $.extend(
    {
      variant: "primary",
      size: "medium",
      loading: false,
    },
    options,
  );

  return this.each(function () {
    const $btn = $(this);
    $btn
      .addClass("btn")
      .addClass(`btn-${settings.variant}`)
      .toggleClass(`btn-${settings.size}`, settings.size !== "medium")
      .toggleClass("loading", settings.loading || false);

    if (settings.onClick) {
      $btn.on("click", settings.onClick);
    }
  });
};

// Card Options
interface CardOptions {
  title?: string;
  content?: string | JQuery;
}

$.fn.mceCard = function (options?: CardOptions) {
  const settings = $.extend({}, options);

  return this.each(function () {
    const $card = $(this);
    $card.addClass("card");

    if (settings.title) {
      const $header = $('<div class="card-header"></div>').text(settings.title);
      $card.append($header);
    }

    if (settings.content) {
      const $body = $('<div class="card-body"></div>');
      if (typeof settings.content === "string") {
        $body.text(settings.content);
      } else {
        $body.append(settings.content);
      }
      $card.append($body);
    }
  });
};

// Modal Options
interface ModalOptions {
  title?: string;
  content?: string | JQuery;
  size?: "small" | "medium" | "large";
  onClose?: () => void;
}

$.fn.mceModal = function (options?: ModalOptions) {
  const settings = $.extend(
    {
      size: "medium",
    },
    options,
  );

  return this.each(function () {
    const $modal = $(this);
    $modal.addClass("modal");

    // Create backdrop
    const $backdrop = $('<div class="modal-backdrop"></div>');

    // Create modal content
    const $content = $(
      `<div class="modal-content modal-${settings.size}"></div>`,
    );

    if (settings.title) {
      const $header = $('<div class="modal-header"></div>');
      const $title = $('<h3 class="modal-title"></h3>').text(settings.title);
      const $close = $('<button class="modal-close">&times;</button>');
      $header.append($title, $close);
      $content.append($header);

      $close.on("click", function () {
        $modal.removeClass("is-open");
        if (settings.onClose) settings.onClose();
      });
    }

    if (settings.content) {
      const $body = $('<div class="modal-body"></div>');
      if (typeof settings.content === "string") {
        $body.text(settings.content);
      } else {
        $body.append(settings.content);
      }
      $content.append($body);
    }

    $modal.append($backdrop, $content);

    // Close on backdrop click
    $backdrop.on("click", function () {
      $modal.removeClass("is-open");
      if (settings.onClose) settings.onClose();
    });

    // Method to open/close
    $modal.data("mceModal", {
      open: () => $modal.addClass("is-open"),
      close: () => {
        $modal.removeClass("is-open");
        if (settings.onClose) settings.onClose();
      },
    });
  });
};

// Tabs Options
interface TabsOptions {
  activeIndex?: number;
  onChange?: (index: number) => void;
}

$.fn.mceTabs = function (options?: TabsOptions) {
  const settings = $.extend(
    {
      activeIndex: 0,
    },
    options,
  );

  return this.each(function () {
    const $tabs = $(this);
    $tabs.addClass("tabs");

    const $tabButtons = $tabs.find(".tab-button");
    const $tabPanels = $tabs.find(".tab-panel");

    $tabButtons.on("click", function () {
      const index = $tabButtons.index(this);

      $tabButtons.removeClass("is-active");
      $(this).addClass("is-active");

      $tabPanels.removeClass("is-active");
      $tabPanels.eq(index).addClass("is-active");

      if (settings.onChange) {
        settings.onChange(index);
      }
    });

    // Set initial active tab
    $tabButtons.eq(settings.activeIndex).addClass("is-active");
    $tabPanels.eq(settings.activeIndex).addClass("is-active");
  });
};

// Accordion Options
interface AccordionOptions {
  allowMultiple?: boolean;
  defaultOpen?: number[];
}

$.fn.mceAccordion = function (options?: AccordionOptions) {
  const settings = $.extend(
    {
      allowMultiple: false,
      defaultOpen: [],
    },
    options,
  );

  return this.each(function () {
    const $accordion = $(this);
    $accordion.addClass("accordion");

    const $items = $accordion.find(".accordion-item");

    $items.each(function (index) {
      const $item = $(this);
      const $header = $item.find(".accordion-header");
      const $content = $item.find(".accordion-content");

      if (settings.defaultOpen?.includes(index)) {
        $item.addClass("is-open");
      }

      $header.on("click", function () {
        const isOpen = $item.hasClass("is-open");

        if (!settings.allowMultiple) {
          $items.removeClass("is-open");
        }

        if (isOpen) {
          $item.removeClass("is-open");
        } else {
          $item.addClass("is-open");
        }
      });
    });
  });
};

// Toast utility
$.fn.mceToast = function (
  message: string,
  type: "success" | "error" | "info" = "info",
) {
  const $toast = $(`<div class="toast toast-${type}"></div>`).text(message);

  let $container = $(".toast-container");
  if ($container.length === 0) {
    $container = $('<div class="toast-container"></div>');
    $("body").append($container);
  }

  $container.append($toast);

  setTimeout(() => {
    $toast.css("opacity", "0");
    setTimeout(() => $toast.remove(), 300);
  }, 3000);

  return this;
};

// Theme management
$.fn.mceTheme = function (
  action: "set" | "toggle" | "get",
  value?: string,
): any {
  const $root = $(document.documentElement);

  switch (action) {
    case "set":
      if (value) {
        const [mode, variant] = value.split("-");
        if (mode === "light" || mode === "dark") {
          $root.attr("data-theme", mode);
        }
        if (variant === "warm" || variant === "cold") {
          $root.attr("data-theme-variant", variant);
        }
      }
      break;

    case "toggle":
      const currentMode = $root.attr("data-theme");
      const newMode = currentMode === "light" ? "dark" : "light";
      $root.attr("data-theme", newMode);
      break;

    case "get":
      return {
        mode: $root.attr("data-theme") || "light",
        variant: $root.attr("data-theme-variant") || "warm",
      };
  }

  return this;
};

// Icon Toggle Options
interface IconToggleOptions {
  type?: "mode" | "theme" | "color" | "language";
  variant?: "default" | "ghost";
  disabled?: boolean;
  onToggle?: (state: string) => void;
}

$.fn.mceIconToggle = function (options?: IconToggleOptions) {
  const settings = $.extend(
    {
      type: "mode",
      variant: "default",
      disabled: false,
    },
    options,
  );

  return this.each(function () {
    const $btn = $(this);

    const getDefaultState = () => {
      switch (settings.type) {
        case "mode":
          return $(document.documentElement).attr("data-theme") || "light";
        case "theme":
          return (
            $(document.documentElement).attr("data-theme-variant") || "warm"
          );
        case "color":
          return "monochrome";
        case "language":
          return "ko";
        default:
          return "default";
      }
    };

    let state = getDefaultState();

    const getIcons = () => {
      const iconSets: Record<string, { icon1: string; icon2: string }> = {
        mode: {
          icon1:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
          icon2:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
        },
        theme: {
          icon1:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
          icon2:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>',
        },
        color: {
          icon1:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>',
          icon2:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
        },
        language: {
          icon1:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
          icon2:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>',
        },
      };
      return iconSets[settings.type!] || iconSets.mode;
    };

    // Initialize button
    $btn
      .addClass("icon-btn-toggle")
      .addClass(`icon-btn-toggle-${settings.type}`)
      .attr("data-state", state);

    if (settings.variant === "ghost") {
      $btn.addClass("icon-btn-toggle-ghost");
    }
    if (settings.type === "color") {
      $btn.addClass("icon-btn-toggle-colored");
    }
    if (settings.disabled) {
      $btn.prop("disabled", true);
    }

    const icons = getIcons();
    if (!icons) return;
    $btn.html(
      `<span class="icon-btn-toggle-icon">${icons.icon1}${icons.icon2}</span>`,
    );

    // Handle toggle
    $btn.on("click", function () {
      if (settings.disabled) return;

      $btn.addClass("is-animating");

      const stateMap: Record<string, Record<string, string>> = {
        mode: { light: "dark", dark: "light" },
        theme: { warm: "cold", cold: "warm" },
        color: { monochrome: "colored", colored: "monochrome" },
        language: { ko: "en", en: "ko" },
      };

      state = stateMap[settings.type!]?.[state] || state;
      $btn.attr("data-state", state);

      // Apply to document
      switch (settings.type) {
        case "mode":
          $(document.documentElement).attr("data-theme", state);
          break;
        case "theme":
          $(document.documentElement).attr("data-theme-variant", state);
          break;
      }

      if (settings.onToggle) {
        settings.onToggle(state);
      }

      setTimeout(() => {
        $btn.removeClass("is-animating");
      }, 500);
    });
  });
};

// Breadcrumb Options
interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface BreadcrumbOptions {
  items: BreadcrumbItem[];
  separator?: string;
  variant?: "default" | "compact" | "large" | "contained";
  maxItems?: number;
}

$.fn.mceBreadcrumb = function (options?: BreadcrumbOptions) {
  const settings = $.extend(
    {
      separator: "/",
      variant: "default",
    },
    options,
  );

  return this.each(function () {
    const $breadcrumb = $(this);
    $breadcrumb.addClass("breadcrumb").attr("aria-label", "Breadcrumb").empty();

    if (settings.variant !== "default") {
      $breadcrumb.addClass(`breadcrumb-${settings.variant}`);
    }

    if (!settings.items || settings.items.length === 0) return;

    let displayItems = settings.items;

    // Handle max items with ellipsis
    if (settings.maxItems && settings.items.length > settings.maxItems) {
      const firstItems = settings.items.slice(
        0,
        Math.floor(settings.maxItems / 2),
      );
      const lastItems = settings.items.slice(-Math.ceil(settings.maxItems / 2));
      displayItems = [
        ...firstItems,
        { label: "...", href: undefined, active: false },
        ...lastItems,
      ];
    }

    // Build breadcrumb
    displayItems.forEach((item, index) => {
      const $item = $('<span class="breadcrumb-item"></span>');

      if (item.active) {
        $item.addClass("is-active");
      }

      if (item.href && !item.active) {
        const $link = $(`<a href="${item.href}"></a>`).text(item.label);
        $item.append($link);
      } else {
        $item.text(item.label);
      }

      $breadcrumb.append($item);

      // Add separator
      if (index < displayItems.length - 1) {
        const $separator = $(
          `<span class="breadcrumb-separator" aria-hidden="true"></span>`,
        ).text(settings.separator!);
        $breadcrumb.append($separator);
      }
    });
  });
};

// Helper functions for direct usage
export const MCE = {
  toast: (message: string, type: "success" | "error" | "info" = "info") => {
    $("body").mceToast(message, type);
  },

  setTheme: (mode: "light" | "dark", variant: "warm" | "cold") => {
    $(document.documentElement).mceTheme("set", `${mode}-${variant}`);
  },

  toggleTheme: () => {
    $(document.documentElement).mceTheme("toggle");
  },

  getTheme: () => {
    return $(document.documentElement).mceTheme("get");
  },
};

export default MCE;
