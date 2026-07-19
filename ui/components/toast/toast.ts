/**
 * Toast Component
 * Notification messages
 */

export interface ToastOptions {
  duration?: number;
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center"
    | "bottom-center";
  type?: "success" | "error" | "info" | "warning";
  closable?: boolean;
}

export class Toast {
  private static containers: Map<string, HTMLElement> = new Map();

  private static getContainer(position: string): HTMLElement {
    let container = Toast.containers.get(position);

    if (!container) {
      container = document.querySelector(
        `.toast-container[data-position="${position}"]`,
      ) as HTMLElement;

      if (!container) {
        container = document.createElement("div");
        container.className = "toast-container";
        container.dataset.position = position;
        // The stylesheet positions the container via a class selector
        // (.toast-container.top-right, …), so add the position as a class too —
        // data-position alone matched no CSS and toasts stacked at the origin.
        container.classList.add(position);
        // Announce dynamically-added toasts to assistive technology.
        container.setAttribute("role", "status");
        container.setAttribute("aria-live", "polite");
        container.setAttribute("aria-atomic", "true");
        document.body.appendChild(container);
      }

      Toast.containers.set(position, container);
    }

    return container;
  }

  public static show(message: string, options: ToastOptions = {}): void {
    const {
      duration = 3000,
      position = "top-right",
      type = "info",
      closable = true,
    } = options;

    const container = Toast.getContainer(position);

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    // Errors are announced assertively; everything else politely.
    toast.setAttribute("role", type === "error" ? "alert" : "status");

    // Non-color cue for the toast type (WCAG 1.4.1 Use of Color).
    const typeLabel = document.createElement("span");
    typeLabel.className = "sr-only";
    typeLabel.textContent = `${type}: `;
    toast.appendChild(typeLabel);

    const content = document.createElement("span");
    content.className = "toast-content";
    content.textContent = message;
    toast.appendChild(content);

    if (closable) {
      const closeBtn = document.createElement("button");
      closeBtn.className = "toast-close";
      closeBtn.type = "button";
      closeBtn.setAttribute("aria-label", "Dismiss notification");
      closeBtn.textContent = "×";
      closeBtn.addEventListener("click", () => {
        Toast.dismiss(toast);
      });
      toast.appendChild(closeBtn);
    }

    container.appendChild(toast);
    // Entrance is handled purely in CSS (.toast { animation: toastSlideIn }).
    // The former "toast-show" class was styled nowhere and is intentionally gone.

    // Auto dismiss
    if (duration > 0) {
      setTimeout(() => {
        Toast.dismiss(toast);
      }, duration);
    }
  }

  public static dismiss(toast: HTMLElement): void {
    // .closing drives the exit animation (toastSlideOut); remove after it plays.
    toast.classList.add("closing");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }

  public static success(
    message: string,
    options: Omit<ToastOptions, "type"> = {},
  ): void {
    Toast.show(message, { ...options, type: "success" });
  }

  public static error(
    message: string,
    options: Omit<ToastOptions, "type"> = {},
  ): void {
    Toast.show(message, { ...options, type: "error" });
  }

  public static info(
    message: string,
    options: Omit<ToastOptions, "type"> = {},
  ): void {
    Toast.show(message, { ...options, type: "info" });
  }

  public static warning(
    message: string,
    options: Omit<ToastOptions, "type"> = {},
  ): void {
    Toast.show(message, { ...options, type: "warning" });
  }

  public static clearAll(position?: string): void {
    if (position) {
      const container = Toast.containers.get(position);
      if (container) {
        container.innerHTML = "";
      }
    } else {
      Toast.containers.forEach((container) => {
        container.innerHTML = "";
      });
    }
  }
}
