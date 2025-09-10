/**
 * Theme management for Monochrome Edge UI Components
 */

import { Theme, Mode } from '../types';
import { getStorageItem, setStorageItem } from '../utils';
import { Colors } from '../tokens';

export interface ThemeConfig {
  theme: Theme;
  mode: Mode;
  persist?: boolean;
}

export class ThemeManager {
  private static instance: ThemeManager;
  private currentTheme: Theme = 'warm';
  private currentMode: Mode = 'light';
  private listeners: Set<(config: ThemeConfig) => void> = new Set();
  private readonly STORAGE_KEY = 'monochrome-theme';

  private constructor() {
    this.loadFromStorage();
    this.applyTheme();
    this.setupSystemThemeListener();
  }

  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  private loadFromStorage(): void {
    const stored = getStorageItem<ThemeConfig | null>(this.STORAGE_KEY, null);
    if (stored) {
      this.currentTheme = stored.theme;
      this.currentMode = stored.mode;
    } else {
      // Detect system preference
      this.currentMode = this.detectSystemTheme();
    }
  }

  private detectSystemTheme(): Mode {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }

  private setupSystemThemeListener(): void {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        const mode = e.matches ? 'dark' : 'light';
        this.setMode(mode);
      });
    }
  }

  private applyTheme(): void {
    const root = document.documentElement;
    root.setAttribute('data-theme', this.currentMode);
    root.setAttribute('data-monochrome-theme', this.currentTheme);

    // Apply CSS variables
    const colors = Colors[this.currentTheme][this.currentMode];
    const cssVars = this.generateCSSVariables(colors);

    let styleElement = document.getElementById('monochrome-theme-vars');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'monochrome-theme-vars';
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = `:root { ${cssVars} }`;

    // Update theme link if exists
    const themeLink = document.getElementById('theme-link') as HTMLLinkElement;
    if (themeLink) {
      themeLink.href = `/ui/tokens/${this.currentTheme}-theme.css`;
    }
  }

  private generateCSSVariables(colors: any, prefix = '--monochrome'): string {
    const vars: string[] = [];

    const processObject = (obj: any, path: string[] = []) => {
      Object.entries(obj).forEach(([key, value]) => {
        const varPath = [...path, key];
        if (typeof value === 'object' && value !== null) {
          processObject(value, varPath);
        } else {
          const varName = `${prefix}-${varPath.join('-')}`;
          vars.push(`${varName}: ${value};`);
        }
      });
    };

    processObject(colors);
    return vars.join(' ');
  }

  getTheme(): Theme {
    return this.currentTheme;
  }

  getMode(): Mode {
    return this.currentMode;
  }

  getConfig(): ThemeConfig {
    return {
      theme: this.currentTheme,
      mode: this.currentMode
    };
  }

  setTheme(theme: Theme, persist = true): void {
    if (this.currentTheme !== theme) {
      this.currentTheme = theme;
      this.applyTheme();

      if (persist) {
        this.saveToStorage();
      }

      this.notifyListeners();
    }
  }

  setMode(mode: Mode, persist = true): void {
    if (this.currentMode !== mode) {
      this.currentMode = mode;
      this.applyTheme();

      if (persist) {
        this.saveToStorage();
      }

      this.notifyListeners();
    }
  }

  setConfig(config: ThemeConfig): void {
    const changed = this.currentTheme !== config.theme || this.currentMode !== config.mode;

    if (changed) {
      this.currentTheme = config.theme;
      this.currentMode = config.mode;
      this.applyTheme();

      if (config.persist !== false) {
        this.saveToStorage();
      }

      this.notifyListeners();
    }
  }

  toggleTheme(): void {
    this.setTheme(this.currentTheme === 'warm' ? 'cold' : 'warm');
  }

  toggleMode(): void {
    this.setMode(this.currentMode === 'light' ? 'dark' : 'light');
  }

  private saveToStorage(): void {
    setStorageItem(this.STORAGE_KEY, {
      theme: this.currentTheme,
      mode: this.currentMode
    });
  }

  subscribe(listener: (config: ThemeConfig) => void): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const config = this.getConfig();
    this.listeners.forEach(listener => listener(config));
  }

  reset(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.currentTheme = 'warm';
    this.currentMode = this.detectSystemTheme();
    this.applyTheme();
    this.notifyListeners();
  }

  // Static helper methods
  static getColors(theme: Theme, mode: Mode) {
    return Colors[theme][mode];
  }

  static getCSSVariable(name: string): string {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(`--monochrome-${name}`)
      .trim();
  }
}

// Export singleton instance
export const themeManager = ThemeManager.getInstance();

// Export convenience functions
export function initTheme(config?: Partial<ThemeConfig>): ThemeManager {
  const manager = ThemeManager.getInstance();
  if (config) {
    manager.setConfig({
      theme: config.theme || manager.getTheme(),
      mode: config.mode || manager.getMode(),
      persist: config.persist
    });
  }
  return manager;
}

export function getTheme(): Theme {
  return ThemeManager.getInstance().getTheme();
}

export function getMode(): Mode {
  return ThemeManager.getInstance().getMode();
}

export function setTheme(theme: Theme): void {
  ThemeManager.getInstance().setTheme(theme);
}

export function setMode(mode: Mode): void {
  ThemeManager.getInstance().setMode(mode);
}

export function toggleTheme(): void {
  ThemeManager.getInstance().toggleTheme();
}

export function toggleMode(): void {
  ThemeManager.getInstance().toggleMode();
}

export function subscribeToTheme(listener: (config: ThemeConfig) => void): () => void {
  return ThemeManager.getInstance().subscribe(listener);
}
