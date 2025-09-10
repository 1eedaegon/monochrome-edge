/**
 * Form component for Monochrome Edge UI Components
 */

import { BaseComponent, ComponentConfig } from './base';
import { FormProps } from '../types';
import { cx } from '../utils';
import { Input } from './input';

export interface FormConfig extends ComponentConfig, FormProps {}

export interface FormField {
  name: string;
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  component?: Input | any;
  validators?: Array<(value: any) => string | null>;
  required?: boolean;
}

export class Form extends BaseComponent<HTMLFormElement, FormConfig> {
  private fields: Map<string, FormField> = new Map();
  private errors: Map<string, string> = new Map();
  private submitButton?: HTMLButtonElement;
  private isSubmitting = false;

  protected getDefaultConfig(): Partial<FormConfig> {
    return {
      validateOnSubmit: true,
      validateOnChange: false,
      validateOnBlur: true,
      preventDefault: true,
      disabled: false
    };
  }

  protected init(): void {
    // Ensure we have a form element
    if (this.element.tagName !== 'FORM') {
      const form = document.createElement('form');
      form.innerHTML = this.element.innerHTML;
      this.element.parentNode?.replaceChild(form, this.element);
      this.element = form;
    }

    // Set initial properties
    this.render();

    // Register fields
    this.registerFields();

    // Bind events
    this.bindEvents();
  }

  protected render(): void {
    const {
      action,
      method,
      enctype,
      novalidate,
      disabled,
      className
    } = this.config;

    // Build class names
    const classes = cx(
      'form',
      disabled && 'form-disabled',
      className
    );

    // Apply classes
    this.element.className = classes;

    // Set attributes
    if (action) this.element.action = action;
    if (method) this.element.method = method;
    if (enctype) this.element.enctype = enctype;
    this.element.noValidate = !!novalidate;

    if (disabled) {
      this.setDisabled(true);
    }
  }

  private registerFields(): void {
    // Find all form fields
    const inputs = this.element.querySelectorAll<HTMLInputElement>('input');
    const textareas = this.element.querySelectorAll<HTMLTextAreaElement>('textarea');
    const selects = this.element.querySelectorAll<HTMLSelectElement>('select');

    // Register inputs
    inputs.forEach(input => {
      if (input.name) {
        this.fields.set(input.name, {
          name: input.name,
          element: input,
          required: input.required
        });
      }
    });

    // Register textareas
    textareas.forEach(textarea => {
      if (textarea.name) {
        this.fields.set(textarea.name, {
          name: textarea.name,
          element: textarea,
          required: textarea.required
        });
      }
    });

    // Register selects
    selects.forEach(select => {
      if (select.name) {
        this.fields.set(select.name, {
          name: select.name,
          element: select,
          required: select.required
        });
      }
    });

    // Find submit button
    this.submitButton = this.element.querySelector<HTMLButtonElement>('button[type="submit"]') || undefined;
  }

  private bindEvents(): void {
    // Form submit
    this.on('submit', this.handleSubmit.bind(this));

    // Field validation
    this.fields.forEach(field => {
      if (this.config.validateOnChange) {
        field.element.addEventListener('input', () => this.validateField(field));
      }

      if (this.config.validateOnBlur) {
        field.element.addEventListener('blur', () => this.validateField(field));
      }
    });
  }

  private async handleSubmit(event: Event): Promise<void> {
    if (this.config.preventDefault) {
      event.preventDefault();
    }

    if (this.isSubmitting || this.config.disabled) {
      return;
    }

    // Validate all fields
    if (this.config.validateOnSubmit) {
      const isValid = this.validate();
      if (!isValid) {
        this.focusFirstError();
        return;
      }
    }

    // Set submitting state
    this.setSubmitting(true);

    // Get form data
    const formData = this.getFormData();

    // Emit submit event
    this.emit('monochrome:form-submit', {
      form: this,
      data: formData,
      formData: new FormData(this.element)
    });

    // Call onSubmit handler
    if (this.config.onSubmit) {
      try {
        await this.config.onSubmit(formData, this);
      } catch (error) {
        console.error('Form submission error:', error);

        // Emit error event
        this.emit('monochrome:form-error', {
          form: this,
          error
        });

        // Call onError handler
        if (this.config.onError) {
          this.config.onError(error);
        }
      } finally {
        this.setSubmitting(false);
      }
    } else {
      this.setSubmitting(false);
    }
  }

  /**
   * Validate all fields
   */
  validate(): boolean {
    let isValid = true;

    this.fields.forEach(field => {
      const fieldValid = this.validateField(field);
      if (!fieldValid) {
        isValid = false;
      }
    });

    return isValid;
  }

  /**
   * Validate single field
   */
  validateField(field: FormField): boolean {
    const value = this.getFieldValue(field);
    let error: string | null = null;

    // Required validation
    if (field.required && !value) {
      error = 'This field is required';
    }

    // Custom validators
    if (!error && field.validators) {
      for (const validator of field.validators) {
        error = validator(value);
        if (error) break;
      }
    }

    // Update error state
    if (error) {
      this.setFieldError(field.name, error);
      return false;
    } else {
      this.clearFieldError(field.name);
      return true;
    }
  }

  /**
   * Get field value
   */
  private getFieldValue(field: FormField): any {
    const element = field.element;

    if (element instanceof HTMLInputElement) {
      if (element.type === 'checkbox') {
        return element.checked;
      } else if (element.type === 'radio') {
        return element.checked ? element.value : null;
      } else if (element.type === 'number') {
        return element.valueAsNumber;
      } else if (element.type === 'date' || element.type === 'datetime-local') {
        return element.valueAsDate;
      }
    }

    return element.value;
  }

  /**
   * Set field error
   */
  setFieldError(fieldName: string, error: string): void {
    this.errors.set(fieldName, error);

    const field = this.fields.get(fieldName);
    if (field) {
      // Add error class
      field.element.classList.add('input-error');
      field.element.setAttribute('aria-invalid', 'true');

      // Update error message
      const errorElement = this.element.querySelector(`[data-error-for="${fieldName}"]`);
      if (errorElement) {
        errorElement.textContent = error;
        errorElement.classList.add('show');
      }

      // Update component if exists
      if (field.component && field.component.setError) {
        field.component.setError(true, error);
      }
    }

    // Emit event
    this.emit('monochrome:form-field-error', {
      form: this,
      field: fieldName,
      error
    });
  }

  /**
   * Clear field error
   */
  clearFieldError(fieldName: string): void {
    this.errors.delete(fieldName);

    const field = this.fields.get(fieldName);
    if (field) {
      // Remove error class
      field.element.classList.remove('input-error');
      field.element.removeAttribute('aria-invalid');

      // Clear error message
      const errorElement = this.element.querySelector(`[data-error-for="${fieldName}"]`);
      if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('show');
      }

      // Update component if exists
      if (field.component && field.component.setError) {
        field.component.setError(false);
      }
    }
  }

  /**
   * Clear all errors
   */
  clearErrors(): void {
    this.errors.clear();

    this.fields.forEach((field, name) => {
      this.clearFieldError(name);
    });
  }

  /**
   * Focus first error field
   */
  focusFirstError(): void {
    for (const [fieldName] of this.errors) {
      const field = this.fields.get(fieldName);
      if (field) {
        field.element.focus();
        break;
      }
    }
  }

  /**
   * Get form data as object
   */
  getFormData(): Record<string, any> {
    const data: Record<string, any> = {};

    this.fields.forEach(field => {
      data[field.name] = this.getFieldValue(field);
    });

    return data;
  }

  /**
   * Set form data
   */
  setFormData(data: Record<string, any>): void {
    Object.entries(data).forEach(([name, value]) => {
      const field = this.fields.get(name);
      if (field) {
        this.setFieldValue(field, value);
      }
    });
  }

  /**
   * Set field value
   */
  private setFieldValue(field: FormField, value: any): void {
    const element = field.element;

    if (element instanceof HTMLInputElement) {
      if (element.type === 'checkbox') {
        element.checked = !!value;
      } else if (element.type === 'radio') {
        element.checked = element.value === value;
      } else {
        element.value = String(value || '');
      }
    } else {
      element.value = String(value || '');
    }

    // Update component if exists
    if (field.component && field.component.setValue) {
      field.component.setValue(value);
    }
  }

  /**
   * Reset form
   */
  reset(): void {
    this.element.reset();
    this.clearErrors();

    // Emit event
    this.emit('monochrome:form-reset', { form: this });
  }

  /**
   * Set submitting state
   */
  private setSubmitting(submitting: boolean): void {
    this.isSubmitting = submitting;

    // Update submit button
    if (this.submitButton) {
      this.submitButton.disabled = submitting;

      if (submitting) {
        this.submitButton.classList.add('loading');
        this.submitButton.setAttribute('aria-busy', 'true');
      } else {
        this.submitButton.classList.remove('loading');
        this.submitButton.removeAttribute('aria-busy');
      }
    }

    // Update form
    this.toggleClass('form-submitting', submitting);
  }

  /**
   * Set disabled state
   */
  setDisabled(disabled: boolean): void {
    this.config.disabled = disabled;

    // Disable all fields
    this.fields.forEach(field => {
      field.element.disabled = disabled;
    });

    // Disable submit button
    if (this.submitButton) {
      this.submitButton.disabled = disabled;
    }

    // Update form class
    this.toggleClass('form-disabled', disabled);
  }

  /**
   * Add field validator
   */
  addValidator(fieldName: string, validator: (value: any) => string | null): void {
    const field = this.fields.get(fieldName);
    if (field) {
      if (!field.validators) {
        field.validators = [];
      }
      field.validators.push(validator);
    }
  }

  /**
   * Register field component
   */
  registerFieldComponent(fieldName: string, component: any): void {
    const field = this.fields.get(fieldName);
    if (field) {
      field.component = component;
    }
  }

  /**
   * Static factory method
   */
  static create(config?: Partial<FormConfig>): Form {
    const element = document.createElement('form');
    return new Form(element, config || {});
  }

  /**
   * Initialize all forms on page
   */
  static initAll(selector = '[data-monochrome="form"]'): Form[] {
    const forms: Form[] = [];

    document.querySelectorAll<HTMLFormElement>(selector).forEach(element => {
      const config: Partial<FormConfig> = {
        validateOnSubmit: element.dataset.validateOnSubmit !== 'false',
        validateOnChange: element.dataset.validateOnChange === 'true',
        validateOnBlur: element.dataset.validateOnBlur !== 'false',
        preventDefault: element.dataset.preventDefault !== 'false'
      };

      forms.push(new Form(element, config));
    });

    return forms;
  }
}

export default Form;
