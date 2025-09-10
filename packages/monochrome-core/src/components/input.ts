/**
 * Input component for Monochrome Edge UI Components
 */

import { BaseComponent, ComponentConfig } from './base';
import { InputProps, Size } from '../types';
import { cx, validateEmail, validatePhone, validateUrl } from '../utils';

export interface InputConfig extends ComponentConfig, InputProps {
  label?: string;
}

export class Input extends BaseComponent<HTMLInputElement, InputConfig> {
  private labelElement?: HTMLLabelElement;
  private helperElement?: HTMLElement;
  private containerElement?: HTMLElement;

  protected getDefaultConfig(): Partial<InputConfig> {
    return {
      type: 'text',
      size: 'medium',
      disabled: false,
      readOnly: false,
      required: false,
      error: false
    };
  }

  protected init(): void {
    // Ensure we have an input element
    if (this.element.tagName !== 'INPUT') {
      const input = document.createElement('input');
      this.element.parentNode?.replaceChild(input, this.element);
      this.element = input;
    }

    // Create container structure
    this.createContainer();

    // Set initial properties
    this.render();

    // Bind events
    this.bindEvents();
  }

  private createContainer(): void {
    // Create container
    this.containerElement = document.createElement('div');
    this.containerElement.className = 'form-group';

    // Move input to container
    this.element.parentNode?.insertBefore(this.containerElement, this.element);
    this.containerElement.appendChild(this.element);

    // Create label if provided
    if (this.config.label) {
      this.labelElement = document.createElement('label');
      this.labelElement.className = 'label';
      this.labelElement.textContent = this.config.label;
      this.containerElement.insertBefore(this.labelElement, this.element);

      // Set label for attribute
      if (!this.element.id) {
        this.element.id = `input-${Date.now()}`;
      }
      this.labelElement.setAttribute('for', this.element.id);
    }

    // Create helper text element
    if (this.config.helperText) {
      this.helperElement = document.createElement('span');
      this.helperElement.className = 'helper-text';
      this.helperElement.textContent = this.config.helperText;
      this.containerElement.appendChild(this.helperElement);
    }
  }

  protected render(): void {
    const {
      type,
      placeholder,
      value,
      defaultValue,
      disabled,
      readOnly,
      required,
      error,
      size,
      className
    } = this.config;

    // Build class names
    const classes = cx(
      'input',
      size && size !== 'medium' && `input-${size}`,
      error && 'input-error',
      className
    );

    // Apply classes
    this.element.className = classes;

    // Set attributes
    if (type) this.element.type = type;
    if (placeholder) this.element.placeholder = placeholder;
    if (value !== undefined) this.element.value = String(value);
    if (defaultValue !== undefined && !value) this.element.value = String(defaultValue);
    this.element.disabled = !!disabled;
    this.element.readOnly = !!readOnly;
    this.element.required = !!required;

    if (error) {
      this.element.setAttribute('aria-invalid', 'true');
      if (this.helperElement) {
        this.helperElement.classList.add('error');
      }
    } else {
      this.element.removeAttribute('aria-invalid');
      if (this.helperElement) {
        this.helperElement.classList.remove('error');
      }
    }
  }

  private bindEvents(): void {
    this.on('input', this.handleInput.bind(this));
    this.on('change', this.handleChange.bind(this));
    this.on('blur', this.handleBlur.bind(this));
    this.on('focus', this.handleFocus.bind(this));
  }

  private handleInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    // Call onChange handler if provided
    if (this.config.onChange) {
      this.config.onChange(value);
    }

    // Emit custom event
    this.emit('monochrome:input', { input: this, value });
  }

  private handleChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    // Validate input
    this.validate();

    // Emit custom event
    this.emit('monochrome:change', { input: this, value });
  }

  private handleBlur(event: FocusEvent): void {
    // Validate on blur
    this.validate();

    // Call onBlur handler if provided
    if (this.config.onBlur) {
      this.config.onBlur(event);
    }

    // Emit custom event
    this.emit('monochrome:blur', { input: this });
  }

  private handleFocus(event: FocusEvent): void {
    // Call onFocus handler if provided
    if (this.config.onFocus) {
      this.config.onFocus(event);
    }

    // Emit custom event
    this.emit('monochrome:focus', { input: this });
  }

  /**
   * Validate input value
   */
  validate(): boolean {
    const value = this.element.value;
    let isValid = true;
    let errorMessage = '';

    // Required validation
    if (this.config.required && !value) {
      isValid = false;
      errorMessage = 'This field is required';
    }

    // Type-specific validation
    if (value && isValid) {
      switch (this.config.type) {
        case 'email':
          if (!validateEmail(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
          }
          break;
        case 'tel':
          if (!validatePhone(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid phone number';
          }
          break;
        case 'url':
          if (!validateUrl(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid URL';
          }
          break;
      }
    }

    // Update error state
    this.setError(!isValid, errorMessage);

    return isValid;
  }

  /**
   * Set input value
   */
  setValue(value: string): void {
    this.element.value = value;
    this.config.value = value;
  }

  /**
   * Get input value
   */
  getValue(): string {
    return this.element.value;
  }

  /**
   * Set error state
   */
  setError(error: boolean, message?: string): void {
    this.config.error = error;

    if (error) {
      this.addClass('input-error');
      this.element.setAttribute('aria-invalid', 'true');

      if (message && this.helperElement) {
        this.helperElement.textContent = message;
        this.helperElement.classList.add('error');
      }
    } else {
      this.removeClass('input-error');
      this.element.removeAttribute('aria-invalid');

      if (this.helperElement) {
        this.helperElement.textContent = this.config.helperText || '';
        this.helperElement.classList.remove('error');
      }
    }
  }

  /**
   * Set disabled state
   */
  setDisabled(disabled: boolean): void {
    this.config.disabled = disabled;
    this.element.disabled = disabled;
  }

  /**
   * Set readonly state
   */
  setReadOnly(readOnly: boolean): void {
    this.config.readOnly = readOnly;
    this.element.readOnly = readOnly;
  }

  /**
   * Focus input
   */
  focus(): void {
    this.element.focus();
  }

  /**
   * Blur input
   */
  blur(): void {
    this.element.blur();
  }

  /**
   * Select input text
   */
  select(): void {
    this.element.select();
  }

  /**
   * Clear input value
   */
  clear(): void {
    this.setValue('');
  }

  /**
   * Static factory method
   */
  static create(config?: Partial<InputConfig>): Input {
    const element = document.createElement('input');
    return new Input(element, config || {});
  }

  /**
   * Initialize all inputs on page
   */
  static initAll(selector = '[data-monochrome="input"]'): Input[] {
    const inputs: Input[] = [];

    document.querySelectorAll<HTMLInputElement>(selector).forEach(element => {
      const config: Partial<InputConfig> = {
        type: element.type as InputProps['type'],
        placeholder: element.placeholder,
        value: element.value,
        disabled: element.disabled,
        readOnly: element.readOnly,
        required: element.required,
        size: element.dataset.size as Size
      };

      inputs.push(new Input(element, config));
    });

    return inputs;
  }
}

export default Input;
