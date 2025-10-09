import '../../../ui/monochrome-edge.css';

(function($) {
  $.fn.accordion = function(options) {
    const settings = $.extend({
      allowMultiple: false,
      defaultExpandedIds: [],
      onChange: null
    }, options);

    return this.each(function() {
      const $container = $(this);
      const items = [];

      $container.find('[data-accordion-id]').each(function() {
        items.push({
          id: $(this).data('accordion-id'),
          title: $(this).data('accordion-title'),
          content: $(this).html()
        });
      });

      const html = `
        <div class="accordion">
          ${items.map(item => {
            const isExpanded = settings.defaultExpandedIds.includes(item.id);
            return `
              <div class="accordion-item ${isExpanded ? 'is-expanded' : ''}" data-item-id="${item.id}">
                <button class="accordion-header" aria-expanded="${isExpanded}">
                  <span class="accordion-title">${item.title}</span>
                  <svg class="accordion-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor">
                    <path d="M4 6L8 10L12 6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </button>
                <div class="accordion-content" style="max-height: ${isExpanded ? '1000px' : '0'}">
                  <div class="accordion-body">${item.content}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      $container.html(html);

      $container.on('click', '.accordion-header', function() {
        const $item = $(this).closest('.accordion-item');
        const itemId = $item.data('item-id');
        const isExpanded = $item.hasClass('is-expanded');

        if (!settings.allowMultiple) {
          $container.find('.accordion-item').removeClass('is-expanded');
          $container.find('.accordion-content').css('max-height', '0');
        }

        if (isExpanded) {
          $item.removeClass('is-expanded');
          $item.find('.accordion-content').css('max-height', '0');
        } else {
          $item.addClass('is-expanded');
          $item.find('.accordion-content').css('max-height', '1000px');
        }

        if (settings.onChange) {
          const expandedIds = $container.find('.accordion-item.is-expanded').map(function() {
            return $(this).data('item-id');
          }).get();
          settings.onChange(expandedIds);
        }
      });
    });
  };
})(jQuery);
