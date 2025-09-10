/// <reference types="jquery" />

// Type definitions
interface MonochromeOptions {
  theme?: "warm" | "cold";
  mode?: "light" | "dark";
}

interface MonochromeButtonOptions {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  size?: "small" | "medium" | "large";
  loading?: boolean;
}

interface MonochromeModalOptions {
  title?: string;
  content?: string | JQuery;
  size?: "small" | "medium" | "large";
  closeOnOverlay?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

interface MonochromeToastOptions {
  message: string;
  type?: "success" | "error" | "info" | "warning";
  duration?: number;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

// Extend jQuery interface
declare global {
  interface JQuery {
    monochrome(options?: MonochromeOptions): JQuery;
    monochromeButton(options?: MonochromeButtonOptions): JQuery;
    monochromeModal(options?: MonochromeModalOptions): JQuery;
    monochromeToast(options: MonochromeToastOptions): JQuery;
    monochromeForm(): JQuery;
    monochromeCard(variant?: "default" | "highlight" | "bordered"): JQuery;
  }
}

(function ($: JQueryStatic) {
  // Ensure CSS is loaded
  function ensureCSS(): void {
    if (!$("#monochrome-main-css").length) {
      $("<link>")
        .attr("id", "monochrome-main-css")
        .attr("rel", "stylesheet")
        .attr("href", "/ui/monochrome-edge.css")
        .appendTo("head");
    }
  }

  // Main theme plugin
  $.fn.monochrome = function (this: JQuery, options: MonochromeOptions = {}) {
    const settings = $.extend(
      {
        theme: "warm",
        mode: "light",
      },
      options,
    );

    ensureCSS();

    return this.each(function () {
      const $element = $(this);

      // Apply mode
      $element.attr("data-theme", settings.mode);

      // Load or update theme CSS
      let $themeLink = $("#theme-link");
      if (!$themeLink.length) {
        $themeLink = $("<link>")
          .attr("id", "theme-link")
          .attr("rel", "stylesheet")
          .appendTo("head");
      }
      $themeLink.attr("href", `/ui/tokens/${settings.theme}-theme.css`);
    });
  };

  // Button plugin
  $.fn.monochromeButton = function (
    this: JQuery,
    options: MonochromeButtonOptions = {},
  ) {
    const settings = $.extend(
      {
        variant: "primary",
        size: "medium",
        loading: false,
      },
      options,
    );

    ensureCSS();

    return this.each(function () {
      const $button = $(this);
      const sizeClass =
        settings.size === "small"
          ? "btn-small"
          : settings.size === "large"
            ? "btn-large"
            : "";

      // Add classes
      $button
        .addClass(`btn btn-${settings.variant} ${sizeClass}`)
        .toggleClass("loading", settings.loading || false);

      // Add spinner if loading
      if (settings.loading) {
        if (!$button.find(".spinner").length) {
          $button.prepend('<span class="spinner"></span>');
        }
        $button.prop("disabled", true);
      } else {
        $button.find(".spinner").remove();
      }
    });
  };

  // Modal plugin
  $.fn.monochromeModal = function (
    this: JQuery,
    options: MonochromeModalOptions = {},
  ) {
    const settings = $.extend(
      {
        title: "Modal Title",
        content: "Modal content",
        size: "medium",
        closeOnOverlay: true,
        onOpen: () => {},
        onClose: () => {},
      },
      options,
    );

    ensureCSS();

    return this.each(function () {
      const $trigger = $(this);

      $trigger.on("click.monochrome", function (e: JQuery.ClickEvent) {
        e.preventDefault();

        const sizeClass =
          settings.size === "small"
            ? "modal-small"
            : settings.size === "large"
              ? "modal-large"
              : "";

        const modalHtml = `
          <div class="modal">
            <div class="modal-backdrop"></div>
            <div class="modal-content ${sizeClass}">
              ${
                settings.title
                  ? `
                <div class="modal-header">
                  <h3 class="modal-title">${settings.title}</h3>
                  <button class="modal-close">×</button>
                </div>
              `
                  : ""
              }
              <div class="modal-body"></div>
              <div class="modal-footer">
                <button class="btn btn-ghost modal-cancel">Cancel</button>
                <button class="btn btn-primary modal-confirm">Confirm</button>
              </div>
            </div>
          </div>
        `;

        const $modal = $(modalHtml);

        // Add content
        if (typeof settings.content === "string") {
          $modal.find(".modal-body").html(settings.content);
        } else {
          $modal.find(".modal-body").append(settings.content);
        }

        // Append to body
        $("body").append($modal);

        // Prevent body scroll
        $("body").css("overflow", "hidden");

        // Show modal with animation
        setTimeout(() => {
          $modal.addClass("is-open");
          settings.onOpen?.();
        }, 10);

        // Close handlers
        const closeModal = () => {
          $modal.removeClass("is-open");
          $("body").css("overflow", "");
          setTimeout(() => {
            $modal.remove();
            settings.onClose?.();
          }, 300);
        };

        $modal.find(".modal-close, .modal-cancel").on("click", closeModal);

        if (settings.closeOnOverlay) {
          $modal.find(".modal-backdrop").on("click", closeModal);
        }

        // Confirm handler
        $modal.find(".modal-confirm").on("click", function () {
          $modal.trigger("monochrome:confirm");
          closeModal();
        });
      });
    });
  };

  // Toast plugin
  $.fn.monochromeToast = function (options: MonochromeToastOptions) {
    const settings = $.extend(
      {
        message: "",
        type: "info",
        duration: 5000,
        position: "top-right",
      },
      options,
    );

    ensureCSS();

    // Icons for different types
    const icons = {
      success: "✓",
      error: "✕",
      warning: "⚠",
      info: "ℹ",
    };

    const toastHtml = `
      <div class="toast toast-${settings.type}">
        <div class="toast-icon">${icons[settings.type as keyof typeof icons]}</div>
        <div class="toast-content">
          <span class="toast-message">${settings.message}</span>
        </div>
        <button class="toast-close">×</button>
      </div>
    `;

    const $toast = $(toastHtml);

    // Create or get container
    let $container = $(`.toast-container.${settings.position}`);
    if (!$container.length) {
      $container = $("<div>")
        .addClass(`toast-container ${settings.position}`)
        .css({
          position: "fixed",
          zIndex: 10000,
          padding: "1rem",
        });

      // Position styles
      const positions: Record<string, any> = {
        "top-right": { top: 0, right: 0 },
        "top-left": { top: 0, left: 0 },
        "bottom-right": { bottom: 0, right: 0 },
        "bottom-left": { bottom: 0, left: 0 },
      };

      $container.css(positions[settings.position!] || positions["top-right"]);
      $("body").append($container);
    }

    $container.append($toast);

    // Animate in
    setTimeout(() => {
      $toast.addClass("is-visible");
    }, 10);

    // Auto remove
    let timeout: number | undefined;
    if (settings.duration > 0) {
      timeout = window.setTimeout(() => {
        removeToast();
      }, settings.duration);
    }

    // Manual close
    const removeToast = () => {
      if (timeout) clearTimeout(timeout);
      $toast.removeClass("is-visible");
      setTimeout(() => {
        $toast.remove();
        if ($container.children().length === 0) {
          $container.remove();
        }
      }, 300);
    };

    $toast.find(".toast-close").on("click", removeToast);

    return this;
  };

  // Form enhancement plugin
  $.fn.monochromeForm = function (this: JQuery) {
    ensureCSS();

    return this.each(function () {
      const $form = $(this);

      // Style form groups
      $form.find(".form-group").each(function () {
        const $group = $(this);

        // Style labels
        $group.find("label").addClass("label");

        // Style inputs
        $group
          .find(
            'input[type="text"], input[type="email"], input[type="password"], input[type="number"]',
          )
          .addClass("input");

        // Style textareas
        $group.find("textarea").addClass("textarea");

        // Style selects
        $group.find("select").addClass("select");

        // Style checkboxes
        $group.find('input[type="checkbox"]').each(function () {
          const $checkbox = $(this);
          const $label = $checkbox.parent("label");

          if ($label.length && !$label.hasClass("checkbox")) {
            $label.addClass("checkbox");
            if (!$checkbox.next(".checkbox-mark").length) {
              $checkbox.after('<span class="checkbox-mark"></span>');
            }
          }
        });

        // Style radios
        $group.find('input[type="radio"]').each(function () {
          const $radio = $(this);
          const $label = $radio.parent("label");

          if ($label.length && !$label.hasClass("radio")) {
            $label.addClass("radio");
            if (!$radio.next(".radio-mark").length) {
              $radio.after('<span class="radio-mark"></span>');
            }
          }
        });
      });

      // Add validation states
      $form.on("invalid", "input, textarea, select", function () {
        $(this).addClass("is-error");
      });

      $form.on(
        "input change",
        "input.is-error, textarea.is-error, select.is-error",
        function () {
          if (this.checkValidity()) {
            $(this).removeClass("is-error");
          }
        },
      );
    });
  };

  // Card plugin
  $.fn.monochromeCard = function (
    this: JQuery,
    variant: "default" | "highlight" | "bordered" = "default",
  ) {
    ensureCSS();

    return this.each(function () {
      const $card = $(this);
      const variantClass =
        variant === "highlight"
          ? "card-highlight"
          : variant === "bordered"
            ? "card-bordered"
            : "";

      $card.addClass(`card ${variantClass}`);

      // Style card sections if they exist
      $card.find(".card-header, .card-body, .card-footer").each(function () {
        const $section = $(this);
        if (
          !$section.hasClass("card-header") &&
          !$section.hasClass("card-body") &&
          !$section.hasClass("card-footer")
        ) {
          // Detect section type based on position or content
          if ($section.find("h1, h2, h3, h4, h5, h6").length) {
            $section.addClass("card-header");
          } else if (
            $section.is(":last-child") &&
            $section.find("button, .btn").length
          ) {
            $section.addClass("card-footer");
          } else {
            $section.addClass("card-body");
          }
        }
      });
    });
  };
})(jQuery);
