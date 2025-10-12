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

    const content = document.createElement("span");
    content.className = "toast-content";
    content.textContent = message;
    toast.appendChild(content);

    if (closable) {
      const closeBtn = document.createElement("button");
      closeBtn.className = "toast-close";
      closeBtn.innerHTML = "&times;";
      closeBtn.addEventListener("click", () => {
        Toast.dismiss(toast);
      });
      toast.appendChild(closeBtn);
    }

    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add("toast-show");
    });

    // Auto dismiss
    if (duration > 0) {
      setTimeout(() => {
        Toast.dismiss(toast);
      }, duration);
    }
  }

  public static dismiss(toast: HTMLElement): void {
    toast.classList.remove("toast-show");
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
