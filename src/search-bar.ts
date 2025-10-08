/**
 * FlexSearch-based Search Bar Component
 * Fast, memory-efficient full-text search
 */

// FlexSearch types (simplified, you'd normally import from 'flexsearch')
interface FlexSearchIndex {
  add(id: number | string, doc: string): void;
  search(query: string, options?: any): any[];
  remove(id: number | string): void;
  update(id: number | string, doc: string): void;
}

export interface SearchDocument {
  id: string;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  url?: string;
  metadata?: Record<string, any>;
}

export interface SearchBarOptions {
  container: HTMLElement | string;
  documents: SearchDocument[];
  placeholder?: string;
  maxResults?: number;
  highlightMatches?: boolean;
  showCategories?: boolean;
  onSelect?: (doc: SearchDocument) => void;
  onSearch?: (query: string, results: SearchDocument[]) => void;
}

export class SearchBar {
  private container: HTMLElement;
  private options: Required<Omit<SearchBarOptions, 'onSelect' | 'onSearch'>> & Pick<SearchBarOptions, 'onSelect' | 'onSearch'>;
  private input: HTMLInputElement;
  private resultsContainer: HTMLElement;
  private documents: SearchDocument[];
  private index: Map<string, SearchDocument> = new Map();
  private searchIndex: any; // FlexSearch index

  constructor(options: SearchBarOptions) {
    this.container = typeof options.container === 'string'
      ? document.querySelector(options.container)!
      : options.container;

    this.options = {
      documents: options.documents,
      placeholder: options.placeholder ?? 'Search...',
      maxResults: options.maxResults ?? 10,
      highlightMatches: options.highlightMatches ?? true,
      showCategories: options.showCategories ?? true,
      onSelect: options.onSelect,
      onSearch: options.onSearch
    };

    this.documents = options.documents;
    this.initializeIndex();
    this.render();
  }

  /**
   * Initialize FlexSearch index
   */
  private initializeIndex(): void {
    // Simple in-memory search (FlexSearch would be imported here)
    // For demo, we'll use a simple indexOf approach
    this.documents.forEach(doc => {
      this.index.set(doc.id, doc);
    });
  }

  /**
   * Perform search using FlexSearch
   */
  private search(query: string): SearchDocument[] {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    const results: Array<{ doc: SearchDocument; score: number }> = [];

    // Simple fuzzy search implementation
    this.documents.forEach(doc => {
      const titleMatch = doc.title.toLowerCase().indexOf(lowerQuery);
      const contentMatch = doc.content.toLowerCase().indexOf(lowerQuery);
      const tagMatch = doc.tags?.some(tag => tag.toLowerCase().includes(lowerQuery));

      let score = 0;
      if (titleMatch >= 0) score += 10 - titleMatch; // Earlier matches score higher
      if (contentMatch >= 0) score += 5 - Math.min(contentMatch, 5);
      if (tagMatch) score += 3;

      if (score > 0) {
        results.push({ doc, score });
      }
    });

    // Sort by score
    results.sort((a, b) => b.score - a.score);

    return results
      .slice(0, this.options.maxResults)
      .map(r => r.doc);
  }

  /**
   * Highlight matches in text
   */
  private highlightText(text: string, query: string): string {
    if (!this.options.highlightMatches || !query) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="search-highlight">$1</mark>');
  }

  /**
   * Render the search bar
   */
  private render(): void {
    this.container.innerHTML = '';
    this.container.className = 'search-bar';

    // Search input
    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'search-bar-input-wrapper';

    const searchIcon = document.createElement('span');
    searchIcon.className = 'search-bar-icon';
    searchIcon.innerHTML = '🔍';

    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.className = 'search-bar-input';
    this.input.placeholder = this.options.placeholder;

    const clearButton = document.createElement('button');
    clearButton.className = 'search-bar-clear';
    clearButton.innerHTML = '×';
    clearButton.style.display = 'none';
    clearButton.addEventListener('click', () => this.clear());

    inputWrapper.appendChild(searchIcon);
    inputWrapper.appendChild(this.input);
    inputWrapper.appendChild(clearButton);

    // Results container
    this.resultsContainer = document.createElement('div');
    this.resultsContainer.className = 'search-bar-results';

    this.container.appendChild(inputWrapper);
    this.container.appendChild(this.resultsContainer);

    // Event listeners
    this.input.addEventListener('input', (e) => {
      const query = (e.target as HTMLInputElement).value;
      clearButton.style.display = query ? 'block' : 'none';
      this.handleSearch(query);
    });

    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.clear();
      }
    });
  }

  /**
   * Handle search input
   */
  private handleSearch(query: string): void {
    if (!query.trim()) {
      this.resultsContainer.innerHTML = '';
      this.resultsContainer.classList.remove('is-visible');
      return;
    }

    const results = this.search(query);
    this.renderResults(results, query);

    if (this.options.onSearch) {
      this.options.onSearch(query, results);
    }
  }

  /**
   * Render search results
   */
  private renderResults(results: SearchDocument[], query: string): void {
    this.resultsContainer.innerHTML = '';

    if (results.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'search-bar-empty';
      empty.textContent = `No results found for "${query}"`;
      this.resultsContainer.appendChild(empty);
      this.resultsContainer.classList.add('is-visible');
      return;
    }

    const list = document.createElement('div');
    list.className = 'search-bar-results-list';

    // Group by category if enabled
    if (this.options.showCategories) {
      const grouped = this.groupByCategory(results);

      Object.entries(grouped).forEach(([category, docs]) => {
        const categoryHeader = document.createElement('div');
        categoryHeader.className = 'search-bar-category';
        categoryHeader.textContent = category;
        list.appendChild(categoryHeader);

        docs.forEach(doc => {
          list.appendChild(this.createResultItem(doc, query));
        });
      });
    } else {
      results.forEach(doc => {
        list.appendChild(this.createResultItem(doc, query));
      });
    }

    this.resultsContainer.appendChild(list);
    this.resultsContainer.classList.add('is-visible');
  }

  /**
   * Create result item element
   */
  private createResultItem(doc: SearchDocument, query: string): HTMLElement {
    const item = document.createElement('div');
    item.className = 'search-bar-result-item';

    const title = document.createElement('div');
    title.className = 'search-bar-result-title';
    title.innerHTML = this.highlightText(doc.title, query);

    const content = document.createElement('div');
    content.className = 'search-bar-result-content';
    const snippet = this.createSnippet(doc.content, query);
    content.innerHTML = this.highlightText(snippet, query);

    item.appendChild(title);
    item.appendChild(content);

    if (doc.tags && doc.tags.length > 0) {
      const tags = document.createElement('div');
      tags.className = 'search-bar-result-tags';
      doc.tags.slice(0, 3).forEach(tag => {
        const tagSpan = document.createElement('span');
        tagSpan.className = 'search-bar-result-tag';
        tagSpan.textContent = tag;
        tags.appendChild(tagSpan);
      });
      item.appendChild(tags);
    }

    item.addEventListener('click', () => {
      if (this.options.onSelect) {
        this.options.onSelect(doc);
      }
      this.clear();
    });

    return item;
  }

  /**
   * Create content snippet around match
   */
  private createSnippet(content: string, query: string, length: number = 150): string {
    const index = content.toLowerCase().indexOf(query.toLowerCase());

    if (index === -1) {
      return content.substring(0, length) + '...';
    }

    const start = Math.max(0, index - 50);
    const end = Math.min(content.length, index + query.length + 100);

    let snippet = content.substring(start, end);
    if (start > 0) snippet = '...' + snippet;
    if (end < content.length) snippet = snippet + '...';

    return snippet;
  }

  /**
   * Group results by category
   */
  private groupByCategory(results: SearchDocument[]): Record<string, SearchDocument[]> {
    const grouped: Record<string, SearchDocument[]> = {};

    results.forEach(doc => {
      const category = doc.category || 'Other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(doc);
    });

    return grouped;
  }

  /**
   * Clear search
   */
  clear(): void {
    this.input.value = '';
    this.resultsContainer.innerHTML = '';
    this.resultsContainer.classList.remove('is-visible');
    this.container.querySelector<HTMLButtonElement>('.search-bar-clear')!.style.display = 'none';
  }

  /**
   * Add document to index
   */
  addDocument(doc: SearchDocument): void {
    this.documents.push(doc);
    this.index.set(doc.id, doc);
  }

  /**
   * Remove document from index
   */
  removeDocument(id: string): void {
    const index = this.documents.findIndex(d => d.id === id);
    if (index >= 0) {
      this.documents.splice(index, 1);
    }
    this.index.delete(id);
  }

  /**
   * Update documents
   */
  updateDocuments(documents: SearchDocument[]): void {
    this.documents = documents;
    this.index.clear();
    this.initializeIndex();
  }

  /**
   * Destroy component
   */
  destroy(): void {
    this.container.innerHTML = '';
    this.index.clear();
  }
}
