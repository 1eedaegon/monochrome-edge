/**
 * Base component class for all Monochrome components
 */

import { BaseComponentProps } from '../types';
import { cx, createElement } from '../utils';

export interface ComponentConfig extends BaseComponentProps {
  [key: string]: any;
}

export abstract class BaseComponent<
  T extends HTMLElement = HTMLElement,
  C extends ComponentConfig = ComponentConfig
> {
  protected element: T;
  protected config: C;
  protected originalElement?: T;
  protected eventListeners: Map<string, EventListener> = new Map();
  protected children: BaseComponent[] = [];
  protected parent?: BaseComponent;
  private _mounted = false;
  private _destroyed = false;

  constructor(element: T | string, config: C) {
    // Handle element selection
    if (typeof element === 'string') {
      const el = document.querySelector<T>(element);
      if (!el) {
        throw new Error(`Element not found: ${element}`);
      }
      this.element = el;
    } else {
      this.element = element;
    }

    // Store original element for restoration
    this.originalElement = this.element.cloneNode(true) as T;

    // Store configuration
    this.config = { ...this.getDefaultConfig(), ...config };

    // Initialize component
    this.init();
  }

  /**
   * Get default configuration
   */
  protected abstract getDefaultConfig(): Partial<C>;

  /**
   * Initialize component
   */
  protected abstract init(): void;

  /**
   * Render component
   */
  protected abstract render(): void;

  /**
   * Mount component to DOM
   */
  mount(parent?: HTMLElement): void {
    if (this._mounted) return;

    if (parent) {
      parent.appendChild(this.element);
    }

    this._mounted = true;
    this.onMount();
  }

  /**
   * Unmount component from DOM
   */
  unmount(): void {
    if (!this._mounted) return;

    this.element.remove();
    this._mounted = false;
    this.onUnmount();
  }

  /**
   * Lifecycle hook - called after mount
   */
  protected onMount(): void {
    // Override in child classes
  }

  /**
   * Lifecycle hook - called after unmount
   */
  protected onUnmount(): void {
    // Override in child classes
  }

  /**
   * Update component configuration
   */
  update(config: Partial<C>): void {
    this.config = { ...this.config, ...config };
    this.render();
    this.onUpdate();
  }

  /**
   * Lifecycle hook - called after update
   */
  protected onUpdate(): void {
    // Override in child classes
  }

  /**
   * Add CSS classes to element
   */
  protected addClass(...classes: string[]): void {
    this.element.classList.add(...classes.filter(Boolean));
  }

  /**
   * Remove CSS classes from element
   */
  protected removeClass(...classes: string[]): void {
    this.element.classList.remove(...classes);
  }

  /**
   * Toggle CSS class on element
   */
  protected toggleClass(className: string, force?: boolean): void {
    this.element.classList.toggle(className, force);
  }

  /**
   * Check if element has CSS class
   */
  protected hasClass(className: string): boolean {
    return this.element.classList.contains(className);
  }

  /**
   * Set element attribute
   */
  protected setAttribute(name: string, value: string | number | boolean): void {
    this.element.setAttribute(name, String(value));
  }

  /**
   * Get element attribute
   */
  protected getAttribute(name: string): string | null {
    return this.element.getAttribute(name);
  }

  /**
   * Remove element attribute
   */
  protected removeAttribute(name: string): void {
    return this.element.removeAttribute(name);
  }

  /**
   * Add event listener
   */
  protected on<K extends keyof HTMLElementEventMap>(
    event: K,
    handler: (this: T, ev: HTMLElementEventMap[K]) => void,
    options?: AddEventListenerOptions
  ): void {
    const boundHandler = handler.bind(this.element);
    const key = `${event}-${handler.toString()}`;

    this.eventListeners.set(key, boundHandler as EventListener);
    this.element.addEventListener(event, boundHandler as EventListener, options);
  }

  /**
   * Remove event listener
   */
  protected off<K extends keyof HTMLElementEventMap>(
    event: K,
    handler: (this: T, ev: HTMLElementEventMap[K]) => void
  ): void {
    const key = `${event}-${handler.toString()}`;
    const boundHandler = this.eventListeners.get(key);

    if (boundHandler) {
      this.element.removeEventListener(event, boundHandler);
      this.eventListeners.delete(key);
    }
  }

  /**
   * Emit custom event
   */
  protected emit(eventName: string, detail?: any): void {
    const event = new CustomEvent(eventName, {
      detail,
      bubbles: true,
      cancelable: true
    });
    this.element.dispatchEvent(event);
  }

  /**
   * Find child element
   */
  protected find<E extends HTMLElement>(selector: string): E | null {
    return this.element.querySelector<E>(selector);
  }

  /**
   * Find all child elements
   */
  protected findAll<E extends HTMLElement>(selector: string): NodeListOf<E> {
    return this.element.querySelectorAll<E>(selector);
  }

  /**
   * Create child element
   */
  protected createElement<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    attributes?: Record<string, any>,
    children?: (Node | string)[]
  ): HTMLElementTagNameMap[K] {
    return createElement(tag, attributes, children);
  }

  /**
   * Append child component
   */
  protected appendChild(child: BaseComponent | HTMLElement): void {
    if (child instanceof BaseComponent) {
      child.parent = this;
      this.children.push(child);
      this.element.appendChild(child.getElement());
    } else {
      this.element.appendChild(child);
    }
  }

  /**
   * Remove child component
   */
  protected removeChild(child: BaseComponent | HTMLElement): void {
    if (child instanceof BaseComponent) {
      const index = this.children.indexOf(child);
      if (index > -1) {
        this.children.splice(index, 1);
        child.parent = undefined;
        child.destroy();
      }
    } else {
      child.remove();
    }
  }

  /**
   * Clear all children
   */
  protected clearChildren(): void {
    this.children.forEach(child => child.destroy());
    this.children = [];
    this.element.innerHTML = '';
  }

  /**
   * Get component element
   */
  getElement(): T {
    return this.element;
  }

  /**
   * Get component configuration
   */
  getConfig(): C {
    return { ...this.config };
  }

  /**
   * Check if component is mounted
   */
  isMounted(): boolean {
    return this._mounted;
  }

  /**
   * Check if component is destroyed
   */
  isDestroyed(): boolean {
    return this._destroyed;
  }

  /**
   * Destroy component
   */
  destroy(): void {
    if (this._destroyed) return;

    // Call lifecycle hook
    this.onDestroy();

    // Remove event listeners
    this.eventListeners.forEach((handler, key) => {
      const [event] = key.split('-');
      this.element.removeEventListener(event, handler);
    });
    this.eventListeners.clear();

    // Destroy children
    this.children.forEach(child => child.destroy());
    this.children = [];

    // Unmount if mounted
    if (this._mounted) {
      this.unmount();
    }

    // Clear parent reference
    this.parent = undefined;

    // Mark as destroyed
    this._destroyed = true;
  }

  /**
   * Lifecycle hook - called before destroy
   */
  protected onDestroy(): void {
    // Override in child classes
  }

  /**
   * Restore original element
   */
  restore(): void {
    if (this.originalElement && this.element.parentNode) {
      this.element.parentNode.replaceChild(
        this.originalElement.cloneNode(true),
        this.element
      );
    }
  }

  /**
   * Static factory method
   */
  static create<T extends BaseComponent>(
    this: new (element: HTMLElement, config: any) => T,
    config: any
  ): T {
    const element = document.createElement('div');
    return new this(element, config);
  }
}
