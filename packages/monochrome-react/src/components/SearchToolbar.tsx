import React, { useState, useEffect, useRef, KeyboardEvent, ChangeEvent } from 'react';

export interface FilterOption {
  id: string;
  label: string;
  values: { value: string; label: string }[];
  default?: string;
}

export interface SortOption {
  value: string;
  label: string;
}

export interface AutocompleteItem {
  text: string;
  category?: string;
  meta?: string;
}

export interface SearchToolbarProps {
  placeholder?: string;
  autocomplete?: string[] | ((query: string) => Promise<string[] | AutocompleteItem[]>);
  filters?: FilterOption[];
  sortOptions?: SortOption[];
  onSearch?: (query: string, filters: Record<string, string>, sort: string) => void;
  debounceMs?: number;
  className?: string;
}

export const SearchToolbar: React.FC<SearchToolbarProps> = ({
  placeholder = 'Search...',
  autocomplete = [],
  filters = [],
  sortOptions = [],
  onSearch,
  debounceMs = 300,
  className = ''
}) => {
  const [query, setQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [activeSort, setActiveSort] = useState(sortOptions[0]?.value || '');
  const [autocompleteItems, setAutocompleteItems] = useState<AutocompleteItem[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Initialize filters
  useEffect(() => {
    const initialFilters: Record<string, string> = {};
    filters.forEach(filter => {
      initialFilters[filter.id] = filter.default || filter.values[0]?.value || '';
    });
    setActiveFilters(initialFilters);
  }, [filters]);

  // Debounced search
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      triggerSearch();
      updateAutocomplete();
    }, debounceMs);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, activeFilters, activeSort, selectedTags]);

  const triggerSearch = () => {
    if (onSearch) {
      onSearch(query, activeFilters, activeSort);
    }
  };

  const updateAutocomplete = async () => {
    if (!query.trim()) {
      setAutocompleteItems([]);
      setShowAutocomplete(false);
      return;
    }

    let items: string[] | AutocompleteItem[];

    if (typeof autocomplete === 'function') {
      items = await autocomplete(query);
    } else {
      items = autocomplete.filter(item =>
        item.toLowerCase().includes(query.toLowerCase())
      );
    }

    const normalized = items.map(item =>
      typeof item === 'string' ? { text: item } : item
    );

    setAutocompleteItems(normalized);
    setShowAutocomplete(normalized.length > 0);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showAutocomplete || autocompleteItems.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveItemIndex(prev =>
          Math.min(prev + 1, autocompleteItems.length - 1)
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveItemIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeItemIndex >= 0) {
          selectItem(activeItemIndex);
        } else {
          setShowAutocomplete(false);
        }
        break;
      case 'Escape':
        setShowAutocomplete(false);
        setActiveItemIndex(-1);
        break;
    }
  };

  const selectItem = (index: number) => {
    const item = autocompleteItems[index];
    if (item) {
      setSelectedTags(prev => new Set(prev).add(item.text));
      setQuery('');
      setShowAutocomplete(false);
      setActiveItemIndex(-1);
      inputRef.current?.focus();
    }
  };

  const removeTag = (tag: string) => {
    setSelectedTags(prev => {
      const newSet = new Set(prev);
      newSet.delete(tag);
      return newSet;
    });
  };

  const clearSearch = () => {
    setQuery('');
    setSelectedTags(new Set());
    setShowAutocomplete(false);
  };

  const setFilter = (filterId: string, value: string) => {
    setActiveFilters(prev => ({ ...prev, [filterId]: value }));
  };

  const highlightMatch = (text: string, query: string): React.ReactNode => {
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text;

    const before = text.slice(0, index);
    const match = text.slice(index, index + query.length);
    const after = text.slice(index + query.length);

    return (
      <>
        {before}
        <span className="search-toolbar-autocomplete-highlight">{match}</span>
        {after}
      </>
    );
  };

  const hasControls = filters.length > 0 || sortOptions.length > 0;

  return (
    <div className={`search-toolbar ${className}`}>
      <div className="search-toolbar-main">
        <div className="search-toolbar-input-wrapper">
          <input
            ref={inputRef}
            type="text"
            className="search-toolbar-input"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => query && updateAutocomplete()}
            onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
            aria-label="Search"
          />
          <svg className="search-toolbar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {query && (
            <button className="search-toolbar-clear" onClick={clearSearch} aria-label="Clear search" type="button">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {hasControls && (
        <div className="search-toolbar-controls">
          {filters.map(filter => (
            <div key={filter.id} className="search-toolbar-filter-group" data-filter-id={filter.id}>
              {filter.values.map(value => (
                <button
                  key={value.value}
                  className={`search-toolbar-filter-btn ${activeFilters[filter.id] === value.value ? 'is-active' : ''}`}
                  onClick={() => setFilter(filter.id, value.value)}
                >
                  {value.label}
                </button>
              ))}
            </div>
          ))}

          {filters.length > 0 && sortOptions.length > 0 && (
            <div className="search-toolbar-divider"></div>
          )}

          {sortOptions.length > 0 && (
            <div className="search-toolbar-filter-group" data-sort-group>
              {sortOptions.map(option => (
                <button
                  key={option.value}
                  className={`search-toolbar-filter-btn ${activeSort === option.value ? 'is-active' : ''}`}
                  onClick={() => setActiveSort(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Autocomplete dropdown */}
      {showAutocomplete && (
        <div className="search-toolbar-autocomplete is-visible">
          {autocompleteItems.map((item, index) => (
            <div
              key={index}
              className={`search-toolbar-autocomplete-item ${index === activeItemIndex ? 'is-active' : ''}`}
              onClick={() => selectItem(index)}
            >
              <div className="search-toolbar-autocomplete-text">
                {highlightMatch(item.text, query)}
              </div>
              {item.meta && (
                <div className="search-toolbar-autocomplete-meta">{item.meta}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Selected tags */}
      {selectedTags.size > 0 && (
        <div className="search-toolbar-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '1rem' }}>
          {Array.from(selectedTags).map(tag => (
            <div key={tag} className="search-toolbar-tag" data-tag={tag}>
              <span>{tag}</span>
              <button className="search-toolbar-tag-remove" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>
                <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

SearchToolbar.displayName = 'SearchToolbar';
