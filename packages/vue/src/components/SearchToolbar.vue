<template>
  <div :class="['search-toolbar', className]" :style="style">
    <div class="search-toolbar-main">
      <div class="search-toolbar-input-wrapper">
        <input
          ref="inputRef"
          type="text"
          class="search-toolbar-input"
          :placeholder="placeholder"
          v-model="query"
          @keydown="handleKeyDown"
          @focus="() => query && updateAutocomplete()"
          @blur="() => setTimeout(() => (showAutocomplete = false), 200)"
          aria-label="Search"
        />
        <svg class="search-toolbar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <button
          v-if="query"
          class="search-toolbar-clear"
          @click="clearSearch"
          aria-label="Clear search"
          type="button"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <div v-if="hasControls" class="search-toolbar-controls">
      <div
        v-for="filter in filters"
        :key="filter.id"
        class="search-toolbar-filter-group"
        :data-filter-id="filter.id"
      >
        <button
          v-for="value in filter.values"
          :key="value.value"
          :class="['search-toolbar-filter-btn', { 'is-active': activeFilters[filter.id] === value.value }]"
          @click="() => setFilter(filter.id, value.value)"
        >
          {{ value.label }}
        </button>
      </div>

      <div v-if="filters.length > 0 && sortOptions.length > 0" class="search-toolbar-divider"></div>

      <div v-if="sortOptions.length > 0" class="search-toolbar-filter-group" data-sort-group>
        <button
          v-for="option in sortOptions"
          :key="option.value"
          :class="['search-toolbar-filter-btn', { 'is-active': activeSort === option.value }]"
          @click="() => (activeSort = option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <!-- Autocomplete dropdown -->
    <div v-if="showAutocomplete" class="search-toolbar-autocomplete is-visible">
      <div
        v-for="(item, index) in autocompleteItems"
        :key="index"
        :class="['search-toolbar-autocomplete-item', { 'is-active': index === activeItemIndex }]"
        @click="() => selectItem(index)"
      >
        <div class="search-toolbar-autocomplete-text">
          <span v-html="highlightMatch(item.text, query)"></span>
        </div>
        <div v-if="item.meta" class="search-toolbar-autocomplete-meta">{{ item.meta }}</div>
      </div>
    </div>

    <!-- Selected tags -->
    <div v-if="selectedTags.size > 0" class="search-toolbar-tags" style="display: flex; flex-wrap: wrap; gap: 0.375rem; margin-top: 1rem">
      <div v-for="tag in Array.from(selectedTags)" :key="tag" class="search-toolbar-tag" :data-tag="tag">
        <span>{{ tag }}</span>
        <button class="search-toolbar-tag-remove" @click="() => removeTag(tag)" :aria-label="`Remove ${tag}`">
          <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

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

interface Props {
  placeholder?: string;
  autocomplete?: string[] | ((query: string) => Promise<string[] | AutocompleteItem[]>);
  filters?: FilterOption[];
  sortOptions?: SortOption[];
  debounceMs?: number;
  className?: string;
  style?: Record<string, any>;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search...',
  autocomplete: () => [],
  filters: () => [],
  sortOptions: () => [],
  debounceMs: 300,
  className: '',
  style: () => ({})
});

const emit = defineEmits<{
  search: [query: string, filters: Record<string, string>, sort: string];
}>();

const inputRef = ref<HTMLInputElement>();
const query = ref('');
const selectedTags = ref<Set<string>>(new Set());
const activeFilters = ref<Record<string, string>>({});
const activeSort = ref(props.sortOptions[0]?.value || '');
const autocompleteItems = ref<AutocompleteItem[]>([]);
const showAutocomplete = ref(false);
const activeItemIndex = ref(-1);
let debounceTimer: NodeJS.Timeout;

const hasControls = computed(() => props.filters.length > 0 || props.sortOptions.length > 0);

// Initialize filters
props.filters.forEach(filter => {
  activeFilters.value[filter.id] = filter.default || filter.values[0]?.value || '';
});

// Watch for changes
watch([query, activeFilters, activeSort, selectedTags], () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    triggerSearch();
    updateAutocomplete();
  }, props.debounceMs);
}, { deep: true });

const triggerSearch = () => {
  emit('search', query.value, activeFilters.value, activeSort.value);
};

const updateAutocomplete = async () => {
  if (!query.value.trim()) {
    autocompleteItems.value = [];
    showAutocomplete.value = false;
    return;
  }

  let items: string[] | AutocompleteItem[];

  if (typeof props.autocomplete === 'function') {
    items = await props.autocomplete(query.value);
  } else {
    items = props.autocomplete.filter(item =>
      item.toLowerCase().includes(query.value.toLowerCase())
    );
  }

  autocompleteItems.value = items.map(item =>
    typeof item === 'string' ? { text: item } : item
  );

  showAutocomplete.value = autocompleteItems.value.length > 0;
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (!showAutocomplete.value || autocompleteItems.value.length === 0) return;

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      activeItemIndex.value = Math.min(activeItemIndex.value + 1, autocompleteItems.value.length - 1);
      break;
    case 'ArrowUp':
      e.preventDefault();
      activeItemIndex.value = Math.max(activeItemIndex.value - 1, -1);
      break;
    case 'Enter':
      e.preventDefault();
      if (activeItemIndex.value >= 0) {
        selectItem(activeItemIndex.value);
      } else {
        showAutocomplete.value = false;
      }
      break;
    case 'Escape':
      showAutocomplete.value = false;
      break;
  }
};

const selectItem = (index: number) => {
  const item = autocompleteItems.value[index];
  if (item) {
    selectedTags.value.add(item.text);
    query.value = '';
    showAutocomplete.value = false;
    activeItemIndex.value = -1;
    inputRef.value?.focus();
  }
};

const removeTag = (tag: string) => {
  selectedTags.value.delete(tag);
  selectedTags.value = new Set(selectedTags.value);
};

const clearSearch = () => {
  query.value = '';
  selectedTags.value.clear();
  showAutocomplete.value = false;
};

const setFilter = (filterId: string, value: string) => {
  activeFilters.value[filterId] = value;
};

const highlightMatch = (text: string, queryText: string): string => {
  const index = text.toLowerCase().indexOf(queryText.toLowerCase());
  if (index === -1) return text;

  const before = text.slice(0, index);
  const match = text.slice(index, index + queryText.length);
  const after = text.slice(index + queryText.length);

  return `${before}<span class="search-toolbar-autocomplete-highlight">${match}</span>${after}`;
};
</script>
