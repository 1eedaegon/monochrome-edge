/**
 * Button component for Monochrome Edge UI Components
 */

import { BaseComponent, ComponentConfig } from './base';
import { ButtonProps, Variant, Size } from '../types';
import { cx } from '../utils';

export interface ButtonConfig extends ComponentConfig, ButtonProps {
  text?: string;
}

export class Button extends BaseComponent<HTMLButtonElement, ButtonConfig> {
  private loadingSpinner?: HTMLElement;

  protected getDefaultConfig(): Partial<ButtonConfig> {
    return {
      variant: 'primary',
      size: 'medium',
      loading: false,
      disabled: false,
      fullWidth: false,
      type: 'button'
    };
  }

  protected init(): void {
    // Ensure we have a button element
    if (this.element.tagName !== 'BUTTON') {
      const button = document.createElement('button');
      button.innerHTML = this.element.innerHTML;
      this.element.parentNode?.replaceChild(button, this.element);
      this.element = button;
    }

    // Set initial properties
    this.render();

    // Bind events
    this.bindEvents();
  }

  protected render(): void {
    const {
      variant,
      size,
      loading,
      disabled,
      fullWidth,
      icon,
      iconPosition,
      type,
      className,
      text
    } = this.config;

    // Build class names
    const classes = cx(
      'btn',
      variant && `btn-${variant}`,
      size && size !== 'medium' && `btn-${size}`,
      loading && 'loading',
      fullWidth && 'btn-full-width',
      icon && !text && 'btn-icon-only',
      className
    );

    // Apply classes
    this.element.className = classes;

    // Set attributes
    this.element.type = type || 'button';
    this.element.disabled = !!(disabled || loading);

    if (loading) {
      this.element.setAttribute('aria-busy', 'true');
      this.showLoadingSpinner();
    } else {
      this.element.removeAttribute('aria-busy');
      this.hideLoadingSpinner();
    }

    if (disabled) {
      this.element.setAttribute('aria-disabled', 'true');
    } else {
      this.element.removeAttribute('aria-disabled');
    }

    // Set content
    if (text) {
      this.setText(text);
    }

    // Add icon if provided
    if (icon) {
      this.setIcon(icon, iconPosition);
    }
  }

  private bindEvents(): void {
    this.on('click', this.handleClick.bind(this));
  }

  private handleClick(event: MouseEvent): void {
    if (this.config.loading || this.config.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    // Emit custom event
    this.emit('monochrome:click', {
      button: this,
      originalEvent: event
    });

    // Call onClick handler if provided
    if (this.config.onClick) {
      this.config.onClick(event);
    }
  }

  private showLoadingSpinner(): void {
    if (this.loadingSpinner) return;

    this.loadingSpinner = document.createElement('span');
    this.loadingSpinner.className = 'btn-spinner';
    this.loadingSpinner.setAttribute('aria-hidden', 'true');

    // Store original content
    const originalContent = this.element.innerHTML;
    this.element.setAttribute('data-original-content', originalContent);

    // Add spinner
    this.element.innerHTML = '';
    this.element.appendChild(this.loadingSpinner);
  }

  private hideLoadingSpinner(): void {
    if (!this.loadingSpinner) return;

    // Restore original content
    const originalContent = this.element.getAttribute('data-original-content');
    if (originalContent) {
      this.element.innerHTML = originalContent;
      this.element.removeAttribute('data-original-content');
    }

    this.loadingSpinner = undefined;
  }

  /**
   * Set button text
   */
  setText(text: string): void {
    this.config.text = text;

    if (!this.config.loading) {
      this.element.textContent = text;
    }
  }

  /**
   * Get button text
   */
  getText(): string {
    return this.config.text || this.element.textContent || '';
  }

  /**
   * Set button icon
   */
  setIcon(icon: string, position: 'left' | 'right' = 'left'): void {
    this.config.icon = icon;
    this.config.iconPosition = position;

    // Remove existing icon
    const existingIcon = this.find('.btn-icon');
    if (existingIcon) {
      existingIcon.remove();
    }

    // Create icon element
    const iconElement = document.createElement('span');
    iconElement.className = 'btn-icon';
    iconElement.innerHTML = icon;

    // Insert icon
    if (position === 'left') {
      this.element.prepend(iconElement);
    } else {
      this.element.append(iconElement);
    }
  }

  /**
   * Set button variant
   */
  setVariant(variant: Variant): void {
    // Remove old variant class
    const oldVariant = this.config.variant;
    if (oldVariant) {
      this.removeClass(`btn-${oldVariant}`);
    }

    // Add new variant class
    this.config.variant = variant;
    this.addClass(`btn-${variant}`);
  }

  /**
   * Set button size
   */
  setSize(size: Size): void {
    // Remove old size class
    const oldSize = this.config.size;
    if (oldSize && oldSize !== 'medium') {
      this.removeClass(`btn-${oldSize}`);
    }

    // Add new size class
    this.config.size = size;
    if (size !== 'medium') {
      this.addClass(`btn-${size}`);
    }
  }

  /**
   * Set loading state
   */
  setLoading(loading: boolean): void {
    this.config.loading = loading;
    this.render();
  }

  /**
   * Set disabled state
   */
  setDisabled(disabled: boolean): void {
    this.config.disabled = disabled;
    this.element.disabled = disabled;

    if (disabled) {
      this.element.setAttribute('aria-disabled', 'true');
    } else {
      this.element.removeAttribute('aria-disabled');
    }
  }

  /**
   * Check if button is loading
   */
  isLoading(): boolean {
    return !!this.config.loading;
  }

  /**
   * Check if button is disabled
   */
  isDisabled(): boolean {
    return !!this.config.disabled;
  }

  /**
   * Focus button
   */
  focus(): void {
    this.element.focus();
  }

  /**
   * Blur button
   */
  blur(): void {
    this.element.blur();
  }

  /**
   * Click button programmatically
   */
  click(): void {
    this.element.click();
  }

  /**
   * Static factory method
   */
  static create(text: string, config?: Partial<ButtonConfig>): Button {
    const element = document.createElement('button');
    element.textContent = text;
    return new Button(element, { ...config, text });
  }

  /**
   * Initialize all buttons on page
   */
  static initAll(selector = '[data-monochrome="button"]'): Button[] {
    const buttons: Button[] = [];

    document.querySelectorAll<HTMLButtonElement>(selector).forEach(element => {
      const config: Partial<ButtonConfig> = {
        variant: element.dataset.variant as Variant,
        size: element.dataset.size as Size,
        loading: element.dataset.loading === 'true',
        disabled: element.hasAttribute('disabled'),
        fullWidth: element.dataset.fullWidth === 'true'
      };

      buttons.push(new Button(element, config));
    });

    return buttons;
  }
}

// Export for convenience
export default Button;
