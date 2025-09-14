// Vanilla JavaScript CMS Editor Component
import { marked } from 'marked';

export class CMSEditor {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
      
    this.options = {
      initialContent: '',
      theme: 'warm',
      mode: 'light',
      viewMode: 'split',
      autoSaveInterval: 2000,
      onSave: null,
      onContentChange: null,
      ...options
    };
    
    this.content = this.options.initialContent;
    this.viewMode = this.options.viewMode;
    this.autoSaveTimer = null;
    
    this.init();
  }

  init() {
    this.render();
    this.attachEventListeners();
    this.updatePreview();
    this.updateStatus();
  }

  render() {
    this.container.innerHTML = `
      <div class="cms-editor-container" data-theme="${this.options.mode}" data-theme-variant="${this.options.theme}">
        <div class="editor-header">
          <div class="editor-title">
            <input type="text" placeholder="제목 없음" value="${this.options.title || ''}">
          </div>
          <div class="editor-actions">
            <div class="view-toggle btn-group">
              <button data-view="editor" class="${this.viewMode === 'editor' ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-ghost'}">Editor</button>
              <button data-view="preview" class="${this.viewMode === 'preview' ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-ghost'}">Preview</button>
              <button data-view="split" class="${this.viewMode === 'split' ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-ghost'}">Split</button>
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
        
        <div class="editor-content ${this.viewMode}-mode" id="editorContent">
          <div class="editor-pane">
            <textarea id="markdownEditor" placeholder="내용을 입력하세요...">${this.content}</textarea>
          </div>
          <div class="editor-divider"></div>
          <div class="preview-pane">
            <div class="markdown-preview" id="markdownPreview"></div>
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
    
    // Cache DOM elements
    this.elements = {
      editor: this.container.querySelector('#markdownEditor'),
      preview: this.container.querySelector('#markdownPreview'),
      editorContent: this.container.querySelector('#editorContent'),
      titleInput: this.container.querySelector('.editor-title input'),
      saveStatus: this.container.querySelector('#saveStatus'),
      autoSaveStatus: this.container.querySelector('#autoSaveStatus'),
      wordCount: this.container.querySelector('#wordCount'),
      charCount: this.container.querySelector('#charCount'),
      lineCount: this.container.querySelector('#lineCount')
    };
  }

  attachEventListeners() {
    // Editor input
    this.elements.editor.addEventListener('input', (e) => {
      this.content = e.target.value;
      this.updatePreview();
      this.updateStatus();
      this.handleAutoSave();
      
      if (this.options.onContentChange) {
        this.options.onContentChange(this.content);
      }
    });

    // Toolbar buttons
    this.container.querySelectorAll('[data-format]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.formatText(e.target.closest('[data-format]').dataset.format);
      });
    });

    // View mode buttons
    this.container.querySelectorAll('[data-view]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.setViewMode(e.target.dataset.view);
      });
    });

    // Save button
    const saveBtn = this.container.querySelector('[data-action="save"]');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.save());
    }

    // Keyboard shortcuts
    this.elements.editor.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            this.formatText('bold');
            break;
          case 'i':
            e.preventDefault();
            this.formatText('italic');
            break;
          case 'h':
            e.preventDefault();
            this.formatText('heading');
            break;
          case 's':
            e.preventDefault();
            this.save();
            break;
        }
      }
    });

    // Resizable divider
    const divider = this.container.querySelector('.editor-divider');
    if (divider) {
      let isResizing = false;
      
      divider.addEventListener('mousedown', (e) => {
        isResizing = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
      });
      
      document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        
        const containerRect = this.elements.editorContent.getBoundingClientRect();
        const percentage = ((e.clientX - containerRect.left) / containerRect.width) * 100;
        
        if (percentage > 20 && percentage < 80) {
          this.elements.editorContent.querySelector('.editor-pane').style.width = `${percentage}%`;
          this.elements.editorContent.querySelector('.preview-pane').style.width = `${100 - percentage}%`;
        }
      });
      
      document.addEventListener('mouseup', () => {
        isResizing = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      });
    }
  }

  formatText(format) {
    const start = this.elements.editor.selectionStart;
    const end = this.elements.editor.selectionEnd;
    const selectedText = this.content.substring(start, end);
    
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
    
    this.content = this.content.substring(0, start) + formatted + this.content.substring(end);
    this.elements.editor.value = this.content;
    this.updatePreview();
    this.updateStatus();
    
    // Restore cursor position
    const newPos = start + (selectedText ? formatted.length : cursorOffset);
    this.elements.editor.setSelectionRange(newPos, newPos);
    this.elements.editor.focus();
  }

  setViewMode(mode) {
    this.viewMode = mode;
    this.elements.editorContent.className = `editor-content ${mode}-mode`;
    
    // Update button states
    this.container.querySelectorAll('[data-view]').forEach(btn => {
      const isActive = btn.dataset.view === mode;
      btn.className = isActive ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-ghost';
    });
  }

  updatePreview() {
    if (this.elements.preview) {
      this.elements.preview.innerHTML = marked(this.content);
    }
  }

  updateStatus() {
    const text = this.content;
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    const chars = text.length;
    const lines = text.split('\n').length;
    
    this.elements.wordCount.textContent = `${words.length} 단어`;
    this.elements.charCount.textContent = `${chars} 문자`;
    this.elements.lineCount.textContent = `${lines} 줄`;
  }

  handleAutoSave() {
    clearTimeout(this.autoSaveTimer);
    this.elements.autoSaveStatus.textContent = '수정됨';
    
    this.autoSaveTimer = setTimeout(() => {
      this.save(true);
    }, this.options.autoSaveInterval);
  }

  save(isAutoSave = false) {
    const title = this.elements.titleInput.value;
    const data = {
      title,
      content: this.content,
      timestamp: new Date().toISOString()
    };
    
    if (this.options.onSave) {
      this.options.onSave(data);
    }
    
    // Update status
    if (isAutoSave) {
      this.elements.autoSaveStatus.textContent = '자동 저장됨';
    } else {
      this.elements.saveStatus.textContent = '저장됨';
      setTimeout(() => {
        this.elements.saveStatus.textContent = '저장';
      }, 2000);
    }
    
    // Save to localStorage as fallback
    localStorage.setItem('cms-editor-content', JSON.stringify(data));
  }

  // Public methods
  getContent() {
    return this.content;
  }

  setContent(content) {
    this.content = content;
    this.elements.editor.value = content;
    this.updatePreview();
    this.updateStatus();
  }

  getTitle() {
    return this.elements.titleInput.value;
  }

  setTitle(title) {
    this.elements.titleInput.value = title;
  }

  destroy() {
    clearTimeout(this.autoSaveTimer);
    this.container.innerHTML = '';
  }
}

export default CMSEditor;