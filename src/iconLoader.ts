/**
 * SVG Icon Loader Utility
 * Loads SVG icons from files and caches them for performance
 */

interface IconOptions {
  width?: number;
  height?: number;
  className?: string;
}

class IconLoader {
  private basePath: string;
  private cache: Map<string, string>;
  private loading: Map<string, Promise<string>>;

  constructor(basePath?: string) {
    // Auto-detect base path if not provided
    if (!basePath) {
      if (typeof window !== "undefined") {
        const isLocal =
          window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1" ||
          window.location.hostname === "";

        if (isLocal) {
          basePath = "/ui/assets/icons/";
        } else if (window.location.hostname.includes("github.io")) {
          // GitHub Pages
          const repoPath = window.location.pathname.split("/")[1];
          basePath = `/${repoPath}/ui/assets/icons/`;
        } else {
          // CDN fallback
          basePath =
            "https://cdn.jsdelivr.net/npm/@monochrome-edge/ui@latest/dist/ui/assets/icons/";
        }
      } else {
        // SSR fallback
        basePath = "/ui/assets/icons/";
      }
    }

    this.basePath = basePath;
    this.cache = new Map();
    this.loading = new Map();
  }

  /**
   * Load an SVG icon
   * @param {string} name - Icon name (without .svg extension)
   * @param {Object} options - Icon options
   * @param {number} options.width - Icon width (default: 16)
   * @param {number} options.height - Icon height (default: 16)
   * @param {string} options.className - Additional CSS class
   * @returns {Promise<string>} SVG string
   */
  async load(name: string, options: IconOptions = {}): Promise<string> {
    const { width = 16, height = 16, className = "" } = options;

    // Check cache
    if (this.cache.has(name)) {
      return this.formatSvg(this.cache.get(name)!, {
        width,
        height,
        className,
      });
    }

    // Check if already loading
    if (this.loading.has(name)) {
      await this.loading.get(name);
      return this.formatSvg(this.cache.get(name)!, {
        width,
        height,
        className,
      });
    }

    // Load SVG
    const loadPromise = this.fetchSvg(name);
    this.loading.set(name, loadPromise);

    try {
      const svg = await loadPromise;
      this.cache.set(name, svg);
      this.loading.delete(name);
      return this.formatSvg(svg, { width, height, className });
    } catch (error) {
      this.loading.delete(name);
      console.error(`Failed to load icon: ${name}`, error);
      return this.getFallbackIcon(width, height);
    }
  }

  /**
   * Load SVG synchronously (uses cached version or returns placeholder)
   * @param {string} name - Icon name
   * @param {Object} options - Icon options
   * @returns {string} SVG string
   */
  loadSync(name: string, options: IconOptions = {}): string {
    const { width = 16, height = 16, className = "" } = options;

    if (this.cache.has(name)) {
      return this.formatSvg(this.cache.get(name)!, {
        width,
        height,
        className,
      });
    }

    // Load in background
    this.load(name, options).catch(() => {});

    // Return placeholder
    return this.getFallbackIcon(width, height);
  }

  /**
   * Fetch SVG from server
   */
  async fetchSvg(name: string): Promise<string> {
    const url = `${this.basePath}${name}.svg`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.text();
  }

  /**
   * Format SVG with custom attributes
   */
  formatSvg(
    svg: string,
    { width, height, className }: Required<IconOptions>,
  ): string {
    // Parse SVG
    const parser = new DOMParser();
    const doc = parser.parseFromString(svg, "image/svg+xml");
    const svgElement = doc.querySelector("svg");

    if (!svgElement) {
      return this.getFallbackIcon(width, height);
    }

    // Set attributes
    svgElement.setAttribute("width", String(width));
    svgElement.setAttribute("height", String(height));

    if (className) {
      svgElement.setAttribute("class", className);
    }

    // Serialize back to string
    return new XMLSerializer().serializeToString(svgElement);
  }

  /**
   * Get fallback icon (box)
   */
  getFallbackIcon(width: number, height: number): string {
    return `<svg width="${width}" height="${height}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`;
  }

  /**
   * Preload multiple icons
   * @param {string[]} names - Array of icon names
   */
  async preload(names: string[]): Promise<void> {
    await Promise.all(names.map((name: string) => this.load(name)));
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.cache.size;
  }
}

// Create singleton instance
const iconLoader = new IconLoader();

// Preload common icons
iconLoader
  .preload([
    "undo",
    "redo",
    "bold",
    "italic",
    "strikethrough",
    "code",
    "list-ul",
    "list-ol",
    "checkbox",
    "quote",
    "code-block",
    "divider",
    "link",
    "image",
    "table",
    "math",
    "export",
    "fullscreen",
    "plus",
    "close",
    "menu",
    "sun",
    "moon",
    "flame",
    "snowflake",
  ])
  .catch(() => {});

export { iconLoader, IconLoader };
