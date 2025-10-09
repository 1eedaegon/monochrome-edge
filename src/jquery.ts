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
