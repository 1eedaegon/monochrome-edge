import '../../../ui/monochrome-edge.css';

(function($) {
  $.fn.tabs = function(options) {
    const settings = $.extend({
      defaultActiveId: null,
      onChange: null
    }, options);

    return this.each(function() {
      const $container = $(this);
      const tabs = [];

      // Parse tab data
      $container.find('[data-tab-id]').each(function() {
        tabs.push({
          id: $(this).data('tab-id'),
          label: $(this).data('tab-label'),
          content: $(this).html()
        });
      });

      const activeTab = settings.defaultActiveId || tabs[0]?.id;

      const html = `
        <div class="tabs">
          <div class="tabs-header" role="tablist">
            ${tabs.map(tab => `
              <button class="tab-btn ${activeTab === tab.id ? 'is-active' : ''}"
                      data-tab="${tab.id}" role="tab">
                ${tab.label}
              </button>
            `).join('')}
          </div>
          <div class="tabs-content">
            ${tabs.map(tab => `
              <div class="tab-panel ${activeTab === tab.id ? 'is-active' : ''}"
                   data-tab-panel="${tab.id}" role="tabpanel" ${activeTab !== tab.id ? 'hidden' : ''}>
                ${tab.content}
              </div>
            `).join('')}
          </div>
        </div>
      `;

      $container.html(html);

      $container.on('click', '.tab-btn', function() {
        const tabId = $(this).data('tab');

        $container.find('.tab-btn').removeClass('is-active');
        $(this).addClass('is-active');

        $container.find('.tab-panel').removeClass('is-active').attr('hidden', true);
        $container.find(`[data-tab-panel="${tabId}"]`).addClass('is-active').removeAttr('hidden');

        if (settings.onChange) {
          settings.onChange(tabId);
        }
      });
    });
  };
})(jQuery);
