/**
 * SVG Icon Loader Utility
 * Loads SVG icons from files and caches them for performance
 */

class IconLoader {
    constructor(basePath = '/ui/assets/icons/') {
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
    async load(name, options = {}) {
        const { width = 16, height = 16, className = '' } = options;

        // Check cache
        if (this.cache.has(name)) {
            return this.formatSvg(this.cache.get(name), { width, height, className });
        }

        // Check if already loading
        if (this.loading.has(name)) {
            await this.loading.get(name);
            return this.formatSvg(this.cache.get(name), { width, height, className });
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
    loadSync(name, options = {}) {
        const { width = 16, height = 16, className = '' } = options;

        if (this.cache.has(name)) {
            return this.formatSvg(this.cache.get(name), { width, height, className });
        }

        // Load in background
        this.load(name, options).catch(() => {});

        // Return placeholder
        return this.getFallbackIcon(width, height);
    }

    /**
     * Fetch SVG from server
     */
    async fetchSvg(name) {
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
    formatSvg(svg, { width, height, className }) {
        // Parse SVG
        const parser = new DOMParser();
        const doc = parser.parseFromString(svg, 'image/svg+xml');
        const svgElement = doc.querySelector('svg');

        if (!svgElement) {
            return this.getFallbackIcon(width, height);
        }

        // Set attributes
        svgElement.setAttribute('width', width);
        svgElement.setAttribute('height', height);

        if (className) {
            svgElement.setAttribute('class', className);
        }

        // Serialize back to string
        return new XMLSerializer().serializeToString(svgElement);
    }

    /**
     * Get fallback icon (box)
     */
    getFallbackIcon(width, height) {
        return `<svg width="${width}" height="${height}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`;
    }

    /**
     * Preload multiple icons
     * @param {string[]} names - Array of icon names
     */
    async preload(names) {
        await Promise.all(names.map(name => this.load(name)));
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Get cache size
     */
    getCacheSize() {
        return this.cache.size;
    }
}

// Create singleton instance
const iconLoader = new IconLoader();

// Preload common icons
iconLoader.preload([
    'undo', 'redo', 'bold', 'italic', 'strikethrough', 'code',
    'list-ul', 'list-ol', 'checkbox', 'quote', 'code-block', 'divider',
    'link', 'image', 'table', 'math', 'export', 'fullscreen',
    'plus', 'close', 'menu', 'sun', 'moon', 'flame', 'snowflake'
]).catch(() => {});

export { iconLoader, IconLoader };
