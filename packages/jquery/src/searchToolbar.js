import '../../../ui/monochrome-edge.css';

(function($) {
  $.fn.searchToolbar = function(options) {
    const settings = $.extend({
      placeholder: 'Search...',
      autocomplete: [],
      filters: [],
      sortOptions: [],
      debounceMs: 300,
      onSearch: null
    }, options);

    return this.each(function() {
      const $container = $(this);
      let query = '';
      let selectedTags = new Set();
      let activeFilters = {};
      let activeSort = settings.sortOptions[0]?.value || '';
      let debounceTimer;

      // Initialize filters
      settings.filters.forEach(filter => {
        activeFilters[filter.id] = filter.default || filter.values[0]?.value || '';
      });

      // Build HTML
      const html = `
        <div class="search-toolbar">
          <div class="search-toolbar-main">
            <div class="search-toolbar-input-wrapper">
              <input type="text" class="search-toolbar-input" placeholder="${settings.placeholder}">
              <svg class="search-toolbar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <button class="search-toolbar-clear" style="display: none;">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          ${settings.filters.length > 0 || settings.sortOptions.length > 0 ? `
            <div class="search-toolbar-controls">
              ${settings.filters.map(filter => `
                <div class="search-toolbar-filter-group" data-filter-id="${filter.id}">
                  ${filter.values.map(value => `
                    <button class="search-toolbar-filter-btn ${activeFilters[filter.id] === value.value ? 'is-active' : ''}"
                            data-filter-value="${value.value}">
                      ${value.label}
                    </button>
                  `).join('')}
                </div>
              `).join('')}
              ${settings.sortOptions.length > 0 ? `
                <div class="search-toolbar-filter-group">
                  ${settings.sortOptions.map(option => `
                    <button class="search-toolbar-filter-btn ${activeSort === option.value ? 'is-active' : ''}"
                            data-sort-value="${option.value}">
                      ${option.label}
                    </button>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          ` : ''}
          <div class="search-toolbar-autocomplete"></div>
        </div>
      `;

      $container.html(html);

      const $input = $container.find('.search-toolbar-input');
      const $clear = $container.find('.search-toolbar-clear');

      // Input handler
      $input.on('input', function() {
        query = $(this).val();
        $clear.toggle(!!query);

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          if (settings.onSearch) {
            settings.onSearch(query, activeFilters, activeSort);
          }
        }, settings.debounceMs);
      });

      // Clear handler
      $clear.on('click', function() {
        $input.val('');
        query = '';
        $clear.hide();
        if (settings.onSearch) {
          settings.onSearch('', activeFilters, activeSort);
        }
      });

      // Filter handlers
      $container.on('click', '.search-toolbar-filter-btn[data-filter-value]', function() {
        const $btn = $(this);
        const $group = $btn.closest('[data-filter-id]');
        const filterId = $group.data('filter-id');
        const value = $btn.data('filter-value');

        $group.find('.search-toolbar-filter-btn').removeClass('is-active');
        $btn.addClass('is-active');
        activeFilters[filterId] = value;

        if (settings.onSearch) {
          settings.onSearch(query, activeFilters, activeSort);
        }
      });

      // Sort handlers
      $container.on('click', '.search-toolbar-filter-btn[data-sort-value]', function() {
        const $btn = $(this);
        const value = $btn.data('sort-value');

        $btn.siblings().removeClass('is-active');
        $btn.addClass('is-active');
        activeSort = value;

        if (settings.onSearch) {
          settings.onSearch(query, activeFilters, activeSort);
        }
      });
    });
  };
})(jQuery);
