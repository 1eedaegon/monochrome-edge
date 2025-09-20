/**
 * @monochrome-edge/ui - Modern minimalist UI components
 * Main entry point for all exports
 */

// Core utilities
export const VERSION = '1.0.0';

// Components
import { Modal } from './components/Modal';
export { Modal };

// Theme management
export class ThemeManager {
  private currentTheme: 'warm' | 'cold' = 'warm';
  private currentMode: 'light' | 'dark' = 'light';

  constructor(theme?: 'warm' | 'cold', mode?: 'light' | 'dark') {
    if (theme) this.currentTheme = theme;
    if (mode) this.currentMode = mode;
    this.apply();
  }

  setTheme(theme: 'warm' | 'cold') {
    this.currentTheme = theme;
    this.apply();
  }

  setMode(mode: 'light' | 'dark') {
    this.currentMode = mode;
    this.apply();
  }

  toggle() {
    this.currentMode = this.currentMode === 'light' ? 'dark' : 'light';
    this.apply();
  }

  private apply() {
    const root = document.documentElement;
    root.setAttribute('data-theme', this.currentMode);
    root.setAttribute('data-theme-variant', this.currentTheme);
  }

  getTheme() {
    return { theme: this.currentTheme, mode: this.currentMode };
  }
}

// Component utilities
export function createButton(text: string, options: {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
} = {}) {
  const button = document.createElement('button');
  const { variant = 'primary', size = 'medium', onClick } = options;
  
  button.className = `btn btn-${variant}${size !== 'medium' ? ` btn-${size}` : ''}`;
  button.textContent = text;
  
  if (onClick) {
    button.addEventListener('click', onClick);
  }
  
  return button;
}

export function createCard(title: string, content: string | HTMLElement) {
  const card = document.createElement('div');
  card.className = 'card';
  
  const header = document.createElement('div');
  header.className = 'card-header';
  header.textContent = title;
  
  const body = document.createElement('div');
  body.className = 'card-body';
  
  if (typeof content === 'string') {
    body.textContent = content;
  } else {
    body.appendChild(content);
  }
  
  card.appendChild(header);
  card.appendChild(body);
  
  return card;
}

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Export everything as default as well
export default {
  VERSION,
  ThemeManager,
  Modal,
  createButton,
  createCard,
  showToast
};