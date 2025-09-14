// jQuery CMS Editor Plugin
(function($) {
  'use strict';
  
  $.fn.cmsEditor = function(options) {
    const settings = $.extend({
      initialContent: '',
      title: '',
      theme: 'warm',
      mode: 'light',
      viewMode: 'split',
      autoSaveInterval: 2000,
      onSave: null,
      onContentChange: null
    }, options);

    return this.each(function() {
      const $container = $(this);
      let content = settings.initialContent;
      let viewMode = settings.viewMode;
      let autoSaveTimer = null;

      // Initialize marked
      if (typeof marked === 'undefined') {
        console.error('marked.js is required for CMS Editor');
        return;
      }

      // Render editor HTML
      function render() {
        const html = `
          <div class="cms-editor-container" data-theme="${settings.mode}" data-theme-variant="${settings.theme}">
            <div class="editor-header">
              <div class="editor-title">
                <input type="text" placeholder="제목 없음" value="${settings.title || ''}">
              </div>
              <div class="editor-actions">
                <div class="view-toggle btn-group">
                  <button data-view="editor" class="${viewMode === 'editor' ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-ghost'}">Editor</button>
                  <button data-view="preview" class="${viewMode === 'preview' ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-ghost'}">Preview</button>
                  <button data-view="split" class="${viewMode === 'split' ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-ghost'}">Split</button>
                </div>
                <button class="btn btn-sm btn-primary" data-action="save">
                  <span id="saveStatus">저장</span>
                </button>
              </div>
            </div>
            
            <div class="editor-toolbar">
              <div class="toolbar-group">
                <button data-format="heading" title="Heading (Ctrl+H)">H</button>
                <button data-format="bold" title="Bold (Ctrl+B)">B</button>
                <button data-format="italic" title="Italic (Ctrl+I)">I</button>
                <button data-format="strike" title="Strikethrough">S</button>
              </div>
              <div class="toolbar-group">
                <button data-format="quote" title="Blockquote">"</button>
                <button data-format="code" title="Code">&lt;&gt;</button>
                <button data-format="codeblock" title="Code Block">{ }</button>
              </div>
              <div class="toolbar-group">
                <button data-format="ul" title="Unordered List">•</button>
                <button data-format="ol" title="Ordered List">1.</button>
                <button data-format="task" title="Task List">☐</button>
              </div>
              <div class="toolbar-group">
                <button data-format="link" title="Link">🔗</button>
                <button data-format="image" title="Image">📷</button>
                <button data-format="table" title="Table">⊞</button>
              </div>
            </div>
            
            <div class="editor-content ${viewMode}-mode" id="editorContent">
              <div class="editor-pane">
                <textarea class="markdown-editor" placeholder="내용을 입력하세요...">${content}</textarea>
              </div>
              <div class="editor-divider"></div>
              <div class="preview-pane">
                <div class="markdown-preview"></div>
              </div>
            </div>
            
            <div class="editor-status">
              <div class="status-left">
                <span id="wordCount">0 단어</span>
                <span id="charCount">0 문자</span>
                <span id="lineCount">1 줄</span>
              </div>
              <div class="status-right">
                <span id="autoSaveStatus">자동 저장됨</span>
              </div>
            </div>
          </div>
        `;
        $container.html(html);
      }

      // Update preview
      function updatePreview() {
        const $preview = $container.find('.markdown-preview');
        $preview.html(marked.parse(content));
      }

      // Update status
      function updateStatus() {
        const words = content.trim().split(/\s+/).filter(w => w.length > 0);
        const chars = content.length;
        const lines = content.split('\n').length;
        
        $container.find('#wordCount').text(`${words.length} 단어`);
        $container.find('#charCount').text(`${chars} 문자`);
        $container.find('#lineCount').text(`${lines} 줄`);
      }

      // Format selected text
      function formatText(format) {
        const textarea = $container.find('.markdown-editor')[0];
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);
        
        let formatted;
        let cursorOffset = 0;
        
        switch(format) {
          case 'bold':
            formatted = `**${selectedText}**`;
            cursorOffset = 2;
            break;
          case 'italic':
            formatted = `*${selectedText}*`;
            cursorOffset = 1;
            break;
          case 'strike':
            formatted = `~~${selectedText}~~`;
            cursorOffset = 2;
            break;
          case 'heading':
            formatted = `# ${selectedText}`;
            cursorOffset = 2;
            break;
          case 'quote':
            formatted = `> ${selectedText}`;
            cursorOffset = 2;
            break;
          case 'code':
            formatted = `\`${selectedText}\``;
            cursorOffset = 1;
            break;
          case 'codeblock':
            formatted = `\`\`\`\n${selectedText}\n\`\`\``;
            cursorOffset = 4;
            break;
          case 'ul':
            formatted = `- ${selectedText}`;
            cursorOffset = 2;
            break;
          case 'ol':
            formatted = `1. ${selectedText}`;
            cursorOffset = 3;
            break;
          case 'task':
            formatted = `- [ ] ${selectedText}`;
            cursorOffset = 6;
            break;
          case 'link':
            formatted = `[${selectedText}](url)`;
            cursorOffset = selectedText.length + 3;
            break;
          case 'image':
            formatted = `![${selectedText}](url)`;
            cursorOffset = selectedText.length + 4;
            break;
          case 'table':
            formatted = `| Header | Header |\n|--------|--------|\n| Cell   | Cell   |`;
            cursorOffset = 0;
            break;
          default:
            formatted = selectedText;
        }
        
        content = content.substring(0, start) + formatted + content.substring(end);
        $(textarea).val(content);
        updatePreview();
        updateStatus();
        
        // Restore cursor position
        const newPos = start + (selectedText ? formatted.length : cursorOffset);
        textarea.setSelectionRange(newPos, newPos);
        textarea.focus();
      }

      // Set view mode
      function setViewMode(mode) {
        viewMode = mode;
        $container.find('.editor-content')
          .removeClass('editor-mode preview-mode split-mode')
          .addClass(mode + '-mode');
        
        // Update button states
        $container.find('[data-view]').each(function() {
          const isActive = $(this).data('view') === mode;
          $(this).removeClass('btn-primary btn-ghost')
            .addClass(isActive ? 'btn-primary' : 'btn-ghost');
        });
      }

      // Handle auto-save
      function handleAutoSave() {
        clearTimeout(autoSaveTimer);
        $container.find('#autoSaveStatus').text('수정됨');
        
        autoSaveTimer = setTimeout(() => {
          save(true);
        }, settings.autoSaveInterval);
      }

      // Save function
      function save(isAutoSave = false) {
        const title = $container.find('.editor-title input').val();
        const data = {
          title,
          content,
          timestamp: new Date().toISOString()
        };
        
        if (settings.onSave) {
          settings.onSave(data);
        }
        
        // Update status
        if (isAutoSave) {
          $container.find('#autoSaveStatus').text('자동 저장됨');
        } else {
          $container.find('#saveStatus').text('저장됨');
          setTimeout(() => {
            $container.find('#saveStatus').text('저장');
          }, 2000);
        }
        
        // Save to localStorage as fallback
        localStorage.setItem('cms-editor-content', JSON.stringify(data));
      }

      // Initialize
      render();
      updatePreview();
      updateStatus();

      // Event listeners
      $container.on('input', '.markdown-editor', function() {
        content = $(this).val();
        updatePreview();
        updateStatus();
        handleAutoSave();
        
        if (settings.onContentChange) {
          settings.onContentChange(content);
        }
      });

      $container.on('click', '[data-format]', function(e) {
        e.preventDefault();
        formatText($(this).data('format'));
      });

      $container.on('click', '[data-view]', function(e) {
        e.preventDefault();
        setViewMode($(this).data('view'));
      });

      $container.on('click', '[data-action="save"]', function(e) {
        e.preventDefault();
        save();
      });

      // Keyboard shortcuts
      $container.on('keydown', '.markdown-editor', function(e) {
        if (e.ctrlKey || e.metaKey) {
          switch(e.key.toLowerCase()) {
            case 'b':
              e.preventDefault();
              formatText('bold');
              break;
            case 'i':
              e.preventDefault();
              formatText('italic');
              break;
            case 'h':
              e.preventDefault();
              formatText('heading');
              break;
            case 's':
              e.preventDefault();
              save();
              break;
          }
        }
      });

      // Resizable divider
      let isResizing = false;
      
      $container.on('mousedown', '.editor-divider', function(e) {
        isResizing = true;
        $('body').css({
          cursor: 'col-resize',
          userSelect: 'none'
        });
      });
      
      $(document).on('mousemove', function(e) {
        if (!isResizing) return;
        
        const $editorContent = $container.find('.editor-content');
        const containerRect = $editorContent[0].getBoundingClientRect();
        const percentage = ((e.clientX - containerRect.left) / containerRect.width) * 100;
        
        if (percentage > 20 && percentage < 80) {
          $editorContent.find('.editor-pane').css('width', `${percentage}%`);
          $editorContent.find('.preview-pane').css('width', `${100 - percentage}%`);
        }
      });
      
      $(document).on('mouseup', function() {
        if (isResizing) {
          isResizing = false;
          $('body').css({
            cursor: '',
            userSelect: ''
          });
        }
      });

      // Public methods
      $container.data('cmsEditor', {
        getContent: function() { 
          return content; 
        },
        setContent: function(newContent) {
          content = newContent;
          $container.find('.markdown-editor').val(content);
          updatePreview();
          updateStatus();
        },
        getTitle: function() {
          return $container.find('.editor-title input').val();
        },
        setTitle: function(title) {
          $container.find('.editor-title input').val(title);
        },
        save: function() {
          save();
        },
        destroy: function() {
          clearTimeout(autoSaveTimer);
          $container.empty();
        }
      });
    });
  };
})(jQuery);