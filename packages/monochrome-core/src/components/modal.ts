/**
 * Modal component for Monochrome Edge UI Components
 */

import { BaseComponent, ComponentConfig } from './base';
import { ModalProps } from '../types';
import { cx } from '../utils';

export interface ModalConfig extends ComponentConfig, ModalProps {}

export class Modal extends BaseComponent<HTMLElement, ModalConfig> {
  private overlayElement?: HTMLElement;
  private containerElement?: HTMLElement;
  private headerElement?: HTMLElement;
  private bodyElement?: HTMLElement;
  private footerElement?: HTMLElement;
  private closeButton?: HTMLButtonElement;
  private isOpen = false;
  private previousActiveElement?: HTMLElement;

  protected getDefaultConfig(): Partial<ModalConfig> {
    return {
      size: 'medium',
      closable: true,
      closeOnOverlay: true,
      closeOnEscape: true,
      animated: true,
      centered: true
    };
  }

  protected init(): void {
    // Create modal structure
    this.createStructure();

    // Set initial properties
    this.render();

    // Bind events
    this.bindEvents();

    // Auto-open if specified
    if (this.config.open) {
      this.open();
    }
  }

  private createStructure(): void {
    // Create overlay
    this.overlayElement = document.createElement('div');
    this.overlayElement.className = 'modal-overlay';

    // Create container
    this.containerElement = document.createElement('div');
    this.containerElement.className = 'modal-container';
    this.containerElement.setAttribute('role', 'dialog');
    this.containerElement.setAttribute('aria-modal', 'true');

    // Create header
    this.headerElement = document.createElement('div');
    this.headerElement.className = 'modal-header';

    // Add title if provided
    if (this.config.title) {
      const titleElement = document.createElement('h2');
      titleElement.className = 'modal-title';
      titleElement.textContent = this.config.title;
      this.headerElement.appendChild(titleElement);
    }

    // Add close button if closable
    if (this.config.closable) {
      this.closeButton = document.createElement('button');
      this.closeButton.className = 'modal-close';
      this.closeButton.setAttribute('aria-label', 'Close modal');
      this.closeButton.innerHTML = '×';
      this.headerElement.appendChild(this.closeButton);
    }

    // Create body
    this.bodyElement = document.createElement('div');
    this.bodyElement.className = 'modal-body';

    // Add content if provided
    if (this.config.content) {
      if (typeof this.config.content === 'string') {
        this.bodyElement.innerHTML = this.config.content;
      } else {
        this.bodyElement.appendChild(this.config.content);
      }
    }

    // Create footer if provided
    if (this.config.footer) {
      this.footerElement = document.createElement('div');
      this.footerElement.className = 'modal-footer';

      if (typeof this.config.footer === 'string') {
        this.footerElement.innerHTML = this.config.footer;
      } else {
        this.footerElement.appendChild(this.config.footer);
      }
    }

    // Assemble modal
    this.containerElement.appendChild(this.headerElement);
    this.containerElement.appendChild(this.bodyElement);
    if (this.footerElement) {
      this.containerElement.appendChild(this.footerElement);
    }

    this.overlayElement.appendChild(this.containerElement);
    this.element.appendChild(this.overlayElement);

    // Hide initially
    this.element.style.display = 'none';
  }

  protected render(): void {
    const {
      size,
      centered,
      animated,
      className
    } = this.config;

    // Build class names
    const overlayClasses = cx(
      'modal-overlay',
      centered && 'modal-centered',
      animated && 'modal-animated'
    );

    const containerClasses = cx(
      'modal-container',
      size && `modal-${size}`,
      className
    );

    // Apply classes
    if (this.overlayElement) {
      this.overlayElement.className = overlayClasses;
    }

    if (this.containerElement) {
      this.containerElement.className = containerClasses;
    }
  }

  private bindEvents(): void {
    // Close button
    if (this.closeButton) {
      this.closeButton.addEventListener('click', () => this.close());
    }

    // Overlay click
    if (this.config.closeOnOverlay && this.overlayElement) {
      this.overlayElement.addEventListener('click', (e) => {
        if (e.target === this.overlayElement) {
          this.close();
        }
      });
    }

    // Escape key
    if (this.config.closeOnEscape) {
      this.handleEscape = this.handleEscape.bind(this);
    }
  }

  private handleEscape(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isOpen) {
      this.close();
    }
  }

  /**
   * Open modal
   */
  open(): void {
    if (this.isOpen) return;

    // Store current focus
    this.previousActiveElement = document.activeElement as HTMLElement;

    // Show modal
    this.element.style.display = 'block';
    this.isOpen = true;

    // Add escape listener
    if (this.config.closeOnEscape) {
      document.addEventListener('keydown', this.handleEscape);
    }

    // Focus management
    setTimeout(() => {
      if (this.containerElement) {
        const focusable = this.containerElement.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable) {
          focusable.focus();
        } else {
          this.containerElement.focus();
        }
      }
    }, 100);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Emit event
    this.emit('monochrome:modal-open', { modal: this });

    // Call callback
    if (this.config.onOpen) {
      this.config.onOpen();
    }
  }

  /**
   * Close modal
   */
  close(): void {
    if (!this.isOpen) return;

    // Hide modal
    this.element.style.display = 'none';
    this.isOpen = false;

    // Remove escape listener
    if (this.config.closeOnEscape) {
      document.removeEventListener('keydown', this.handleEscape);
    }

    // Restore focus
    if (this.previousActiveElement) {
      this.previousActiveElement.focus();
      this.previousActiveElement = undefined;
    }

    // Restore body scroll
    document.body.style.overflow = '';

    // Emit event
    this.emit('monochrome:modal-close', { modal: this });

    // Call callback
    if (this.config.onClose) {
      this.config.onClose();
    }
  }

  /**
   * Toggle modal
   */
  toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Check if modal is open
   */
  isModalOpen(): boolean {
    return this.isOpen;
  }

  /**
   * Set modal title
   */
  setTitle(title: string): void {
    this.config.title = title;

    const titleElement = this.headerElement?.querySelector('.modal-title');
    if (titleElement) {
      titleElement.textContent = title;
    } else if (this.headerElement) {
      const newTitle = document.createElement('h2');
      newTitle.className = 'modal-title';
      newTitle.textContent = title;
      this.headerElement.insertBefore(newTitle, this.closeButton);
    }
  }

  /**
   * Set modal content
   */
  setContent(content: string | HTMLElement): void {
    this.config.content = content;

    if (!this.bodyElement) return;

    if (typeof content === 'string') {
      this.bodyElement.innerHTML = content;
    } else {
      this.bodyElement.innerHTML = '';
      this.bodyElement.appendChild(content);
    }
  }

  /**
   * Set modal footer
   */
  setFooter(footer: string | HTMLElement): void {
    this.config.footer = footer;

    if (!this.footerElement) {
      this.footerElement = document.createElement('div');
      this.footerElement.className = 'modal-footer';
      this.containerElement?.appendChild(this.footerElement);
    }

    if (typeof footer === 'string') {
      this.footerElement.innerHTML = footer;
    } else {
      this.footerElement.innerHTML = '';
      this.footerElement.appendChild(footer);
    }
  }

  /**
   * Static factory method
   */
  static create(config?: Partial<ModalConfig>): Modal {
    const element = document.createElement('div');
    element.className = 'modal';
    document.body.appendChild(element);
    return new Modal(element, config || {});
  }

  /**
   * Confirm dialog
   */
  static confirm(message: string, onConfirm: () => void, onCancel?: () => void): Modal {
    const modal = Modal.create({
      title: 'Confirm',
      content: message,
      closable: false,
      closeOnOverlay: false,
      closeOnEscape: false
    });

    // Create buttons
    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'btn btn-primary';
    confirmBtn.textContent = 'Confirm';
    confirmBtn.onclick = () => {
      modal.close();
      onConfirm();
    };

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn-ghost';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.onclick = () => {
      modal.close();
      if (onCancel) onCancel();
    };

    const footer = document.createElement('div');
    footer.className = 'modal-footer-buttons';
    footer.appendChild(cancelBtn);
    footer.appendChild(confirmBtn);

    modal.setFooter(footer);
    modal.open();

    return modal;
  }

  /**
   * Alert dialog
   */
  static alert(message: string, onClose?: () => void): Modal {
    const modal = Modal.create({
      title: 'Alert',
      content: message,
      closable: true,
      closeOnOverlay: true,
      closeOnEscape: true
    });

    if (onClose) {
      modal.config.onClose = onClose;
    }

    modal.open();

    return modal;
  }

  protected onDestroy(): void {
    // Close modal if open
    if (this.isOpen) {
      this.close();
    }

    // Remove from DOM
    this.element.remove();
  }
}

export default Modal;
