export class MonoSearchToolbar extends HTMLElement {
  private autocompleteFunction: ((query: string) => Promise<string[]>) | null = null;
  private filters: any[] = [];
  private sortOptions: any[] = [];
  private selectedTags: Set<string> = new Set();
  private query: string = '';

  static get observedAttributes(): string[] {
    return ['placeholder'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    this.render();
    this.attachEventListeners();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  setAutocomplete(fn: (query: string) => Promise<string[]>): void {
    this.autocompleteFunction = fn;
  }

  setFilters(filters: any[]): void {
    this.filters = filters;
    this.render();
  }

  setSortOptions(options: any[]): void {
    this.sortOptions = options;
    this.render();
  }

  private render(): void {
    if (!this.shadowRoot) return;

    const placeholder = this.getAttribute('placeholder') || 'Search...';

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="/ui/monochrome-edge.css">
      <style>
        :host {
          display: block;
          width: 100%;
        }
      </style>
      <div class="search-toolbar">
        <div class="search-toolbar-main">
          <div class="search-toolbar-input-wrapper">
            <input
              type="text"
              class="search-toolbar-input"
              placeholder="${placeholder}"
              aria-label="Search"
            />
            <svg class="search-toolbar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <button class="search-toolbar-clear" style="display: none;" aria-label="Clear search" type="button">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div class="search-toolbar-autocomplete"></div>
      </div>
    `;
  }

  private attachEventListeners(): void {
    const input = this.shadowRoot?.querySelector('.search-toolbar-input') as HTMLInputElement;
    const clearBtn = this.shadowRoot?.querySelector('.search-toolbar-clear') as HTMLButtonElement;

    if (input) {
      input.addEventListener('input', (e) => {
        this.query = (e.target as HTMLInputElement).value;
        clearBtn.style.display = this.query ? 'block' : 'none';
        this.handleSearch();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (input) input.value = '';
        this.query = '';
        clearBtn.style.display = 'none';
        this.handleSearch();
      });
    }
  }

  private handleSearch(): void {
    this.dispatchEvent(new CustomEvent('search', {
      detail: {
        query: this.query,
        tags: Array.from(this.selectedTags)
      },
      bubbles: true,
      composed: true
    }));
  }
}

customElements.define('mono-search-toolbar', MonoSearchToolbar);
