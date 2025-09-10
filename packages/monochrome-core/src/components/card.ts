/**
 * Card component for Monochrome Edge UI Components
 */

import { BaseComponent, ComponentConfig } from './base';
import { CardProps } from '../types';
import { cx } from '../utils';

export interface CardConfig extends ComponentConfig, CardProps {}

export class Card extends BaseComponent<HTMLElement, CardConfig> {
  private headerElement?: HTMLElement;
  private bodyElement?: HTMLElement;
  private footerElement?: HTMLElement;

  protected getDefaultConfig(): Partial<CardConfig> {
    return {
      variant: 'elevated',
      padding: 'medium',
      clickable: false
    };
  }

  protected init(): void {
    // Create card structure
    this.createStructure();

    // Set initial properties
    this.render();

    // Bind events if clickable
    if (this.config.clickable) {
      this.bindEvents();
    }
  }

  private createStructure(): void {
    // Add card class
    this.addClass('card');

    // Create header if provided
    if (this.config.header) {
      this.headerElement = document.createElement('div');
      this.headerElement.className = 'card-header';

      if (typeof this.config.header === 'string') {
        this.headerElement.textContent = this.config.header;
      } else {
        this.headerElement.appendChild(this.config.header);
      }

      this.element.appendChild(this.headerElement);
    }

    // Create body
    this.bodyElement = document.createElement('div');
    this.bodyElement.className = 'card-body';

    // Move existing content to body
    while (this.element.firstChild && this.element.firstChild !== this.headerElement) {
      this.bodyElement.appendChild(this.element.firstChild);
    }

    this.element.appendChild(this.bodyElement);

    // Create footer if provided
    if (this.config.footer) {
      this.footerElement = document.createElement('div');
      this.footerElement.className = 'card-footer';

      if (typeof this.config.footer === 'string') {
        this.footerElement.textContent = this.config.footer;
      } else {
        this.footerElement.appendChild(this.config.footer);
      }

      this.element.appendChild(this.footerElement);
    }
  }

  protected render(): void {
    const {
      variant,
      padding,
      clickable,
      onClick,
      className
    } = this.config;

    // Build class names
    const classes = cx(
      'card',
      variant && `card-${variant}`,
      padding && padding !== 'medium' && `card-padding-${padding}`,
      clickable && 'card-clickable',
      className
    );

    // Apply classes
    this.element.className = classes;

    // Set attributes
    if (clickable) {
      this.element.setAttribute('role', 'button');
      this.element.setAttribute('tabindex', '0');
      this.element.style.cursor = 'pointer';
    }
  }

  private bindEvents(): void {
    this.on('click', this.handleClick.bind(this));
    this.on('keydown', this.handleKeyDown.bind(this));
  }

  private handleClick(event: MouseEvent): void {
    if (this.config.onClick) {
      this.config.onClick(event);
    }

    // Emit custom event
    this.emit('monochrome:card-click', { card: this, originalEvent: event });
  }

  private handleKeyDown(event: KeyboardEvent): void {
    // Handle Enter and Space for accessibility
    if (this.config.clickable && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      this.element.click();
    }
  }

  /**
   * Set card header
   */
  setHeader(content: string | HTMLElement): void {
    if (!this.headerElement) {
      this.headerElement = document.createElement('div');
      this.headerElement.className = 'card-header';
      this.element.insertBefore(this.headerElement, this.bodyElement);
    }

    if (typeof content === 'string') {
      this.headerElement.textContent = content;
    } else {
      this.headerElement.innerHTML = '';
      this.headerElement.appendChild(content);
    }

    this.config.header = content;
  }

  /**
   * Set card body
   */
  setBody(content: string | HTMLElement): void {
    if (!this.bodyElement) return;

    if (typeof content === 'string') {
      this.bodyElement.innerHTML = content;
    } else {
      this.bodyElement.innerHTML = '';
      this.bodyElement.appendChild(content);
    }
  }

  /**
   * Set card footer
   */
  setFooter(content: string | HTMLElement): void {
    if (!this.footerElement) {
      this.footerElement = document.createElement('div');
      this.footerElement.className = 'card-footer';
      this.element.appendChild(this.footerElement);
    }

    if (typeof content === 'string') {
      this.footerElement.textContent = content;
    } else {
      this.footerElement.innerHTML = '';
      this.footerElement.appendChild(content);
    }

    this.config.footer = content;
  }

  /**
   * Static factory method
   */
  static create(config?: Partial<CardConfig>): Card {
    const element = document.createElement('div');
    return new Card(element, config || {});
  }

  /**
   * Initialize all cards on page
   */
  static initAll(selector = '[data-monochrome="card"]'): Card[] {
    const cards: Card[] = [];

    document.querySelectorAll<HTMLElement>(selector).forEach(element => {
      const config: Partial<CardConfig> = {
        variant: element.dataset.variant as CardProps['variant'],
        padding: element.dataset.padding as CardProps['padding'],
        clickable: element.dataset.clickable === 'true'
      };

      cards.push(new Card(element, config));
    });

    return cards;
  }
}

export default Card;
