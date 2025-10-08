/**
 * Math Renderer Component
 * Renders LaTeX equations using KaTeX
 */

export interface MathRendererOptions {
  container: HTMLElement | string;
  displayMode?: boolean;
  throwOnError?: boolean;
  errorColor?: string;
  macros?: Record<string, string>;
}

export class MathRenderer {
  private container: HTMLElement;
  private options: Required<Omit<MathRendererOptions, 'container'>>;

  constructor(options: MathRendererOptions) {
    // Get container element
    if (typeof options.container === 'string') {
      const element = document.querySelector(options.container);
      if (!element) {
        throw new Error(`Container not found: ${options.container}`);
      }
      this.container = element as HTMLElement;
    } else {
      this.container = options.container;
    }

    // Set default options
    this.options = {
      displayMode: options.displayMode ?? false,
      throwOnError: options.throwOnError ?? false,
      errorColor: options.errorColor ?? '#cc0000',
      macros: options.macros ?? {},
    };

    this.init();
  }

  private init(): void {
    // Check if KaTeX is loaded
    if (typeof window === 'undefined' || !(window as any).katex) {
      console.warn('KaTeX not loaded. Please include KaTeX library.');
      return;
    }

    this.render();
  }

  /**
   * Render the LaTeX equation
   */
  public render(latex?: string): void {
    const latexString = latex || this.container.textContent || '';

    try {
      (window as any).katex.render(latexString, this.container, {
        displayMode: this.options.displayMode,
        throwOnError: this.options.throwOnError,
        errorColor: this.options.errorColor,
        macros: this.options.macros,
      });
    } catch (error) {
      console.error('KaTeX render error:', error);
      if (this.options.throwOnError) {
        throw error;
      }
    }
  }

  /**
   * Update the equation
   */
  public update(latex: string): void {
    this.render(latex);
  }

  /**
   * Destroy the renderer
   */
  public destroy(): void {
    this.container.innerHTML = '';
  }
}

/**
 * Render all math elements in the document
 */
export function renderAllMath(options?: {
  inlineSelector?: string;
  displaySelector?: string;
}): void {
  const inlineSelector = options?.inlineSelector ?? '.math-inline';
  const displaySelector = options?.displaySelector ?? '.math-display';

  // Render inline math
  document.querySelectorAll(inlineSelector).forEach((el) => {
    new MathRenderer({
      container: el as HTMLElement,
      displayMode: false,
    });
  });

  // Render display math
  document.querySelectorAll(displaySelector).forEach((el) => {
    new MathRenderer({
      container: el as HTMLElement,
      displayMode: true,
    });
  });
}
