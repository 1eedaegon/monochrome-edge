export class MonoTabs extends HTMLElement {
  private activeTab: string = '';
  private tabs: Array<{ id: string; label: string; content: string }> = [];

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    this.parseTabs();
    this.render();
  }

  private parseTabs(): void {
    const tabElements = this.querySelectorAll('[slot^="tab-"]');
    this.tabs = Array.from(tabElements).map((el) => {
      const slot = el.getAttribute('slot') || '';
      const id = slot.replace('tab-', '');
      const label = el.getAttribute('data-label') || id;
      return { id, label, content: el.innerHTML };
    });
    if (this.tabs.length > 0 && !this.activeTab) {
      this.activeTab = this.tabs[0].id;
    }
  }

  private render(): void {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="/ui/monochrome-edge.css">
      <style>
        :host {
          display: block;
        }
      </style>
      <div class="tabs">
        <div class="tabs-header" role="tablist">
          ${this.tabs.map(tab => `
            <button
              class="tab-btn ${this.activeTab === tab.id ? 'is-active' : ''}"
              data-tab="${tab.id}"
              role="tab"
              aria-selected="${this.activeTab === tab.id}"
            >
              ${tab.label}
            </button>
          `).join('')}
        </div>
        <div class="tabs-content">
          ${this.tabs.map(tab => `
            <div
              class="tab-panel ${this.activeTab === tab.id ? 'is-active' : ''}"
              role="tabpanel"
              ${this.activeTab !== tab.id ? 'hidden' : ''}
            >
              <slot name="tab-${tab.id}">${tab.content}</slot>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    this.attachTabListeners();
  }

  private attachTabListeners(): void {
    const buttons = this.shadowRoot?.querySelectorAll('.tab-btn');
    buttons?.forEach(button => {
      button.addEventListener('click', () => {
        const tabId = button.getAttribute('data-tab');
        if (tabId) {
          this.activeTab = tabId;
          this.render();
          this.dispatchEvent(new CustomEvent('tab-change', {
            detail: { tabId },
            bubbles: true,
            composed: true
          }));
        }
      });
    });
  }
}

customElements.define('mono-tabs', MonoTabs);
