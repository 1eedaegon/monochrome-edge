/**
 * Toast notification component for Monochrome Edge UI Components
 */

import { BaseComponent, ComponentConfig } from './base';
import { ToastProps } from '../types';
import { cx } from '../utils';

export interface ToastConfig extends ComponentConfig, ToastProps {}

export class Toast extends BaseComponent<HTMLElement, ToastConfig> {
  private static container?: HTMLElement;
  private static toasts: Toast[] = [];
  private closeButton?: HTMLButtonElement;
  private progressBar?: HTMLElement;
  private timeoutId?: number;
  private startTime?: number;
  private remainingTime?: number;

  protected getDefaultConfig(): Partial<ToastConfig> {
    return {
      type: 'info',
      position: 'bottom-right',
      duration: 5000,
      closable: true,
      pauseOnHover: true,
      animated: true
    };
  }

  protected init(): void {
    // Ensure container exists
    Toast.ensureContainer(this.config.position);

    // Create toast structure
    this.createStructure();

    // Set initial properties
    this.render();

    // Bind events
    this.bindEvents();

    // Add to container
    Toast.container?.appendChild(this.element);
    Toast.toasts.push(this);

    // Start auto-dismiss timer
    if (this.config.duration && this.config.duration > 0) {
      this.startTimer();
    }

    // Trigger entrance animation
    setTimeout(() => {
      this.addClass('toast-show');
    }, 10);
  }

  private static ensureContainer(position?: string): void {
    if (!Toast.container) {
      Toast.container = document.createElement('div');
      Toast.container.className = `toast-container toast-${position || 'bottom-right'}`;
      document.body.appendChild(Toast.container);
    } else if (position) {
      // Update position if different
      Toast.container.className = `toast-container toast-${position}`;
    }
  }

  private createStructure(): void {
    // Add base class
    this.addClass('toast');

    // Create content wrapper
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'toast-content';

    // Add icon based on type
    const icon = this.getIcon();
    if (icon) {
      const iconElement = document.createElement('span');
      iconElement.className = 'toast-icon';
      iconElement.innerHTML = icon;
      contentWrapper.appendChild(iconElement);
    }

    // Add message
    const messageElement = document.createElement('div');
    messageElement.className = 'toast-message';

    if (this.config.title) {
      const titleElement = document.createElement('div');
      titleElement.className = 'toast-title';
      titleElement.textContent = this.config.title;
      messageElement.appendChild(titleElement);
    }

    if (this.config.message) {
      const textElement = document.createElement('div');
      textElement.className = 'toast-text';
      textElement.textContent = this.config.message;
      messageElement.appendChild(textElement);
    }

    contentWrapper.appendChild(messageElement);

    // Add close button if closable
    if (this.config.closable) {
      this.closeButton = document.createElement('button');
      this.closeButton.className = 'toast-close';
      this.closeButton.setAttribute('aria-label', 'Close notification');
      this.closeButton.innerHTML = '×';
      contentWrapper.appendChild(this.closeButton);
    }

    this.element.appendChild(contentWrapper);

    // Add progress bar if duration is set
    if (this.config.duration && this.config.duration > 0) {
      this.progressBar = document.createElement('div');
      this.progressBar.className = 'toast-progress';
      this.element.appendChild(this.progressBar);
    }
  }

  private getIcon(): string {
    const icons: Record<string, string> = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    return icons[this.config.type || 'info'];
  }

  protected render(): void {
    const {
      type,
      animated,
      className
    } = this.config;

    // Build class names
    const classes = cx(
      'toast',
      type && `toast-${type}`,
      animated && 'toast-animated',
      className
    );

    // Apply classes
    this.element.className = classes;

    // Set ARIA attributes
    this.element.setAttribute('role', 'alert');
    this.element.setAttribute('aria-live', 'polite');
  }

  private bindEvents(): void {
    // Close button
    if (this.closeButton) {
      this.closeButton.addEventListener('click', () => this.close());
    }

    // Pause on hover
    if (this.config.pauseOnHover && this.config.duration) {
      this.element.addEventListener('mouseenter', () => this.pauseTimer());
      this.element.addEventListener('mouseleave', () => this.resumeTimer());
    }
  }

  private startTimer(): void {
    if (!this.config.duration) return;

    this.startTime = Date.now();
    this.remainingTime = this.config.duration;

    // Animate progress bar
    if (this.progressBar) {
      this.progressBar.style.transition = `width ${this.config.duration}ms linear`;
      this.progressBar.style.width = '0%';
    }

    this.timeoutId = window.setTimeout(() => {
      this.close();
    }, this.config.duration);
  }

  private pauseTimer(): void {
    if (!this.timeoutId || !this.startTime) return;

    // Calculate remaining time
    const elapsed = Date.now() - this.startTime;
    this.remainingTime = (this.remainingTime || 0) - elapsed;

    // Clear timeout
    window.clearTimeout(this.timeoutId);
    this.timeoutId = undefined;

    // Pause progress bar
    if (this.progressBar) {
      const progress = ((this.config.duration || 0) - this.remainingTime) / (this.config.duration || 1);
      this.progressBar.style.transition = 'none';
      this.progressBar.style.width = `${progress * 100}%`;
    }
  }

  private resumeTimer(): void {
    if (!this.remainingTime || this.timeoutId) return;

    this.startTime = Date.now();

    // Resume progress bar
    if (this.progressBar) {
      this.progressBar.style.transition = `width ${this.remainingTime}ms linear`;
      this.progressBar.style.width = '0%';
    }

    this.timeoutId = window.setTimeout(() => {
      this.close();
    }, this.remainingTime);
  }

  /**
   * Close toast
   */
  close(): void {
    // Clear timer
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }

    // Trigger exit animation
    this.removeClass('toast-show');
    this.addClass('toast-hide');

    // Remove after animation
    setTimeout(() => {
      // Remove from DOM
      this.element.remove();

      // Remove from static list
      const index = Toast.toasts.indexOf(this);
      if (index > -1) {
        Toast.toasts.splice(index, 1);
      }

      // Remove container if empty
      if (Toast.toasts.length === 0 && Toast.container) {
        Toast.container.remove();
        Toast.container = undefined;
      }

      // Emit event
      this.emit('monochrome:toast-close', { toast: this });

      // Call callback
      if (this.config.onClose) {
        this.config.onClose();
      }
    }, 300);
  }

  /**
   * Static factory method for showing toast
   */
  static show(config: Partial<ToastConfig>): Toast {
    const element = document.createElement('div');
    return new Toast(element, config);
  }

  /**
   * Show success toast
   */
  static success(message: string, title?: string, config?: Partial<ToastConfig>): Toast {
    return Toast.show({
      ...config,
      type: 'success',
      message,
      title
    });
  }

  /**
   * Show error toast
   */
  static error(message: string, title?: string, config?: Partial<ToastConfig>): Toast {
    return Toast.show({
      ...config,
      type: 'error',
      message,
      title
    });
  }

  /**
   * Show warning toast
   */
  static warning(message: string, title?: string, config?: Partial<ToastConfig>): Toast {
    return Toast.show({
      ...config,
      type: 'warning',
      message,
      title
    });
  }

  /**
   * Show info toast
   */
  static info(message: string, title?: string, config?: Partial<ToastConfig>): Toast {
    return Toast.show({
      ...config,
      type: 'info',
      message,
      title
    });
  }

  /**
   * Clear all toasts
   */
  static clear(): void {
    Toast.toasts.forEach(toast => toast.close());
  }

  /**
   * Get all active toasts
   */
  static getAll(): Toast[] {
    return [...Toast.toasts];
  }

  protected onDestroy(): void {
    // Close toast if not already closed
    if (this.element.parentNode) {
      this.close();
    }
  }
}

export default Toast;
