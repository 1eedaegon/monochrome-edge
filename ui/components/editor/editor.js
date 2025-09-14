/**
 * Monochrome Edge Editor Component
 * A modern WYSIWYG markdown editor with advanced features
 */

export class Editor {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;
        
        this.options = {
            placeholder: '텍스트를 입력하거나 \'/\'를 눌러 명령어를 사용하세요...',
            theme: 'warm',
            mode: 'light',
            autoSave: true,
            autoSaveInterval: 2000,
            enableMath: true,
            enableDragDrop: true,
            enableSlashCommands: true,
            enableFloatingToolbar: true,
            enableShortcuts: true,
            onSave: null,
            onChange: null,
            onImageUpload: null,
            onDocumentLink: null,
            ...options
        };
        
        // Editor state
        this.blocks = [];
        this.currentBlock = null;
        this.history = [];
        this.historyIndex = -1;
        this.autoSaveTimer = null;
        
        // Command definitions
        this.commands = this.defineCommands();
        this.shortcuts = this.defineShortcuts();
        
        this.init();
    }
    
    /**
     * Define all available editor commands
     */
    defineCommands() {
        return {
            // Headers
            heading1: {
                name: '제목 1',
                icon: 'H1',
                markdown: '#',
                shortcut: 'Ctrl+Alt+1',
                action: () => this.convertBlock('heading1')
            },
            heading2: {
                name: '제목 2',
                icon: 'H2',
                markdown: '##',
                shortcut: 'Ctrl+Alt+2',
                action: () => this.convertBlock('heading2')
            },
            heading3: {
                name: '제목 3',
                icon: 'H3',
                markdown: '###',
                shortcut: 'Ctrl+Alt+3',
                action: () => this.convertBlock('heading3')
            },
            heading4: {
                name: '제목 4',
                icon: 'H4',
                markdown: '####',
                shortcut: 'Ctrl+Alt+4',
                action: () => this.convertBlock('heading4')
            },
            
            // Text formatting
            bold: {
                name: '굵게',
                icon: 'B',
                markdown: '**',
                shortcut: 'Ctrl+B',
                inline: true,
                action: () => this.wrapSelection('**', '**')
            },
            italic: {
                name: '기울임',
                icon: 'I',
                markdown: '*',
                shortcut: 'Ctrl+I',
                inline: true,
                action: () => this.wrapSelection('*', '*')
            },
            strikethrough: {
                name: '취소선',
                icon: 'S',
                markdown: '~~',
                shortcut: 'Ctrl+Shift+S',
                inline: true,
                action: () => this.wrapSelection('~~', '~~')
            },
            code: {
                name: '인라인 코드',
                icon: '`',
                markdown: '`',
                shortcut: 'Ctrl+E',
                inline: true,
                action: () => this.wrapSelection('`', '`')
            },
            
            // Blocks
            quote: {
                name: '인용문',
                icon: '"',
                markdown: '>',
                shortcut: 'Ctrl+Shift+.',
                action: () => this.convertBlock('quote')
            },
            codeblock: {
                name: '코드 블록',
                icon: '{}',
                markdown: '```',
                shortcut: 'Ctrl+Alt+C',
                action: () => this.insertCodeBlock()
            },
            math: {
                name: '수식',
                icon: '∑',
                markdown: '$$',
                shortcut: 'Ctrl+Alt+M',
                action: () => this.insertMathBlock()
            },
            
            // Lists
            bulletList: {
                name: '글머리 기호',
                icon: '•',
                markdown: '-',
                shortcut: 'Ctrl+Shift+8',
                action: () => this.convertBlock('bullet')
            },
            numberedList: {
                name: '번호 목록',
                icon: '1.',
                markdown: '1.',
                shortcut: 'Ctrl+Shift+7',
                action: () => this.convertBlock('number')
            },
            checkList: {
                name: '체크박스',
                icon: '☐',
                markdown: '[]',
                shortcut: 'Ctrl+Shift+9',
                action: () => this.convertBlock('checkbox')
            },
            
            // Media & Links
            link: {
                name: '링크',
                icon: '🔗',
                markdown: '[]()',
                shortcut: 'Ctrl+K',
                action: () => this.insertLink()
            },
            image: {
                name: '이미지',
                icon: '📷',
                markdown: '![]()',
                shortcut: 'Ctrl+Shift+I',
                action: () => this.insertImage()
            },
            documentLink: {
                name: '문서 링크',
                icon: '📄',
                markdown: '[[]]',
                shortcut: 'Ctrl+Shift+K',
                action: () => this.insertDocumentLink()
            },
            
            // Table
            table: {
                name: '표',
                icon: '⊞',
                markdown: '|',
                shortcut: 'Ctrl+Alt+T',
                action: () => this.insertTable()
            },
            
            // Utilities
            divider: {
                name: '구분선',
                icon: '—',
                markdown: '---',
                shortcut: null,
                action: () => this.insertDivider()
            },
            undo: {
                name: '실행 취소',
                icon: '↶',
                shortcut: 'Ctrl+Z',
                action: () => this.undo()
            },
            redo: {
                name: '다시 실행',
                icon: '↷',
                shortcut: 'Ctrl+Y',
                action: () => this.redo()
            }
        };
    }
    
    /**
     * Define keyboard shortcuts
     */
    defineShortcuts() {
        const shortcuts = {};
        
        // Build shortcuts map from commands
        Object.entries(this.commands).forEach(([key, command]) => {
            if (command.shortcut) {
                shortcuts[command.shortcut] = command.action;
            }
        });
        
        // Additional shortcuts
        shortcuts['Enter'] = (e) => this.handleEnter(e);
        shortcuts['Tab'] = (e) => this.handleTab(e);
        shortcuts['Shift+Tab'] = (e) => this.handleShiftTab(e);
        shortcuts['Backspace'] = (e) => this.handleBackspace(e);
        shortcuts['/'] = (e) => this.showSlashMenu(e);
        
        return shortcuts;
    }
    
    /**
     * Initialize editor
     */
    init() {
        this.render();
        this.attachEventListeners();
        this.createFirstBlock();
        
        if (this.options.enableMath) {
            this.loadMathLibrary();
        }
    }
    
    /**
     * Render editor UI
     */
    render() {
        this.container.innerHTML = `
            <div class="editor-wrapper" data-theme="${this.options.mode}" data-theme-variant="${this.options.theme}">
                <!-- Toolbar -->
                <div class="editor-toolbar">
                    <div class="toolbar-group">
                        <button data-command="heading1" title="제목 1 (${this.getShortcutDisplay('heading1')})">H1</button>
                        <button data-command="heading2" title="제목 2 (${this.getShortcutDisplay('heading2')})">H2</button>
                        <button data-command="heading3" title="제목 3 (${this.getShortcutDisplay('heading3')})">H3</button>
                    </div>
                    
                    <div class="toolbar-divider"></div>
                    
                    <div class="toolbar-group">
                        <button data-command="bold" title="굵게 (${this.getShortcutDisplay('bold')})">B</button>
                        <button data-command="italic" title="기울임 (${this.getShortcutDisplay('italic')})">I</button>
                        <button data-command="strikethrough" title="취소선 (${this.getShortcutDisplay('strikethrough')})">S</button>
                        <button data-command="code" title="코드 (${this.getShortcutDisplay('code')})">&lt;&gt;</button>
                    </div>
                    
                    <div class="toolbar-divider"></div>
                    
                    <div class="toolbar-group">
                        <button data-command="bulletList" title="글머리 기호 (${this.getShortcutDisplay('bulletList')})">•</button>
                        <button data-command="numberedList" title="번호 목록 (${this.getShortcutDisplay('numberedList')})">1.</button>
                        <button data-command="checkList" title="체크박스 (${this.getShortcutDisplay('checkList')})">☐</button>
                    </div>
                    
                    <div class="toolbar-divider"></div>
                    
                    <div class="toolbar-group">
                        <button data-command="quote" title="인용문 (${this.getShortcutDisplay('quote')})">"</button>
                        <button data-command="codeblock" title="코드 블록 (${this.getShortcutDisplay('codeblock')})">{}</button>
                        <button data-command="math" title="수식 (${this.getShortcutDisplay('math')})">∑</button>
                    </div>
                    
                    <div class="toolbar-divider"></div>
                    
                    <div class="toolbar-group">
                        <button data-command="link" title="링크 (${this.getShortcutDisplay('link')})">🔗</button>
                        <button data-command="image" title="이미지 (${this.getShortcutDisplay('image')})">📷</button>
                        <button data-command="documentLink" title="문서 링크 (${this.getShortcutDisplay('documentLink')})">📄</button>
                        <button data-command="table" title="표 (${this.getShortcutDisplay('table')})">⊞</button>
                    </div>
                    
                    <div class="toolbar-spacer"></div>
                    
                    <div class="toolbar-group">
                        <button data-command="undo" title="실행 취소 (${this.getShortcutDisplay('undo')})">↶</button>
                        <button data-command="redo" title="다시 실행 (${this.getShortcutDisplay('redo')})">↷</button>
                    </div>
                </div>
                
                <!-- Editor Content -->
                <div class="editor-content" id="editorContent"></div>
                
                <!-- Floating Toolbar -->
                ${this.options.enableFloatingToolbar ? `
                <div class="floating-toolbar" id="floatingToolbar">
                    <button data-command="bold">B</button>
                    <button data-command="italic">I</button>
                    <button data-command="strikethrough">S</button>
                    <button data-command="code">&lt;&gt;</button>
                    <div class="toolbar-divider"></div>
                    <button data-command="link">🔗</button>
                    <button data-command="heading1">H1</button>
                    <button data-command="heading2">H2</button>
                    <button data-command="heading3">H3</button>
                </div>
                ` : ''}
                
                <!-- Slash Commands Menu -->
                ${this.options.enableSlashCommands ? `
                <div class="slash-menu" id="slashMenu">
                    ${this.renderSlashMenu()}
                </div>
                ` : ''}
                
                <!-- Document Link Popup -->
                <div class="document-link-popup" id="documentLinkPopup">
                    <input type="text" placeholder="문서 검색..." id="documentSearch">
                    <div class="document-list" id="documentList"></div>
                </div>
            </div>
        `;
        
        // Cache DOM elements
        this.elements = {
            content: this.container.querySelector('#editorContent'),
            toolbar: this.container.querySelector('.editor-toolbar'),
            floatingToolbar: this.container.querySelector('#floatingToolbar'),
            slashMenu: this.container.querySelector('#slashMenu'),
            documentLinkPopup: this.container.querySelector('#documentLinkPopup')
        };
    }
    
    /**
     * Render slash commands menu
     */
    renderSlashMenu() {
        const menuItems = [
            { command: 'heading1', category: 'text' },
            { command: 'heading2', category: 'text' },
            { command: 'heading3', category: 'text' },
            { command: 'heading4', category: 'text' },
            { command: 'quote', category: 'text' },
            { command: 'bulletList', category: 'list' },
            { command: 'numberedList', category: 'list' },
            { command: 'checkList', category: 'list' },
            { command: 'codeblock', category: 'code' },
            { command: 'math', category: 'code' },
            { command: 'link', category: 'media' },
            { command: 'image', category: 'media' },
            { command: 'documentLink', category: 'media' },
            { command: 'table', category: 'other' },
            { command: 'divider', category: 'other' }
        ];
        
        return menuItems.map(item => {
            const cmd = this.commands[item.command];
            return `
                <div class="slash-item" data-command="${item.command}" data-category="${item.category}">
                    <div class="slash-item-icon">${cmd.icon}</div>
                    <div class="slash-item-content">
                        <div class="slash-item-title">${cmd.name}</div>
                        <div class="slash-item-shortcut">${cmd.shortcut || cmd.markdown}</div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Toolbar buttons
        this.elements.toolbar.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-command]');
            if (btn) {
                const command = btn.dataset.command;
                this.executeCommand(command);
            }
        });
        
        // Content editing
        this.elements.content.addEventListener('input', this.handleInput.bind(this));
        this.elements.content.addEventListener('keydown', this.handleKeydown.bind(this));
        this.elements.content.addEventListener('paste', this.handlePaste.bind(this));
        
        // Selection change for floating toolbar
        if (this.options.enableFloatingToolbar) {
            document.addEventListener('selectionchange', this.handleSelectionChange.bind(this));
        }
        
        // Drag & Drop
        if (this.options.enableDragDrop) {
            this.elements.content.addEventListener('dragover', this.handleDragOver.bind(this));
            this.elements.content.addEventListener('drop', this.handleDrop.bind(this));
        }
        
        // Slash menu
        if (this.options.enableSlashCommands && this.elements.slashMenu) {
            this.elements.slashMenu.addEventListener('click', (e) => {
                const item = e.target.closest('.slash-item');
                if (item) {
                    this.executeCommand(item.dataset.command);
                    this.hideSlashMenu();
                }
            });
        }
    }
    
    /**
     * Handle input event
     */
    handleInput(e) {
        const block = e.target.closest('.editor-block');
        if (!block) return;
        
        const text = block.textContent;
        
        // Auto-conversion patterns
        this.checkAutoConversion(block, text);
        
        // Slash commands
        if (this.options.enableSlashCommands && text.includes('/')) {
            this.checkSlashCommand(block, text);
        }
        
        // Trigger onChange
        if (this.options.onChange) {
            this.options.onChange(this.getContent());
        }
        
        // Auto-save
        if (this.options.autoSave) {
            this.scheduleAutoSave();
        }
    }
    
    /**
     * Handle keydown event
     */
    handleKeydown(e) {
        if (!this.options.enableShortcuts) return;
        
        // Build shortcut string
        let shortcut = '';
        if (e.ctrlKey || e.metaKey) shortcut += 'Ctrl+';
        if (e.altKey) shortcut += 'Alt+';
        if (e.shiftKey) shortcut += 'Shift+';
        
        // Special keys
        const keyMap = {
            'Enter': 'Enter',
            'Tab': 'Tab',
            'Backspace': 'Backspace',
            '/': '/'
        };
        
        shortcut += keyMap[e.key] || e.key.toUpperCase();
        
        // Execute shortcut
        if (this.shortcuts[shortcut]) {
            e.preventDefault();
            this.shortcuts[shortcut](e);
        }
    }
    
    /**
     * Check for auto-conversion patterns
     */
    checkAutoConversion(block, text) {
        const patterns = [
            // Headers
            { regex: /^#\s$/, type: 'heading1', replace: '#' },
            { regex: /^##\s$/, type: 'heading2', replace: '##' },
            { regex: /^###\s$/, type: 'heading3', replace: '###' },
            { regex: /^####\s$/, type: 'heading4', replace: '####' },
            
            // Lists
            { regex: /^[-*]\s$/, type: 'bullet', replace: /^[-*]/ },
            { regex: /^\d+\.\s$/, type: 'number', replace: /^\d+\./ },
            { regex: /^\[\]\s$|^\[\s\]\s$/, type: 'checkbox', replace: /^\[\s?\]/ },
            
            // Others
            { regex: /^>\s$/, type: 'quote', replace: '>' },
            { regex: /^```$/, type: 'codeblock', replace: '```' },
            { regex: /^---$/, type: 'divider', replace: '---' }
        ];
        
        for (const pattern of patterns) {
            if (pattern.regex.test(text)) {
                this.convertBlockWithPattern(block, pattern);
                break;
            }
        }
        
        // Inline conversions
        this.checkInlineConversions(block, text);
    }
    
    /**
     * Check for inline markdown conversions
     */
    checkInlineConversions(block, text) {
        // Skip if block is code
        if (block.dataset.type === 'codeblock') return;
        
        let html = text;
        
        // Bold: **text** or __text__
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
        
        // Italic: *text* or _text_
        html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
        html = html.replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, '<em>$1</em>');
        
        // Strikethrough: ~~text~~
        html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');
        
        // Code: `text`
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Link: [text](url)
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
        
        // Document link: [[document]]
        html = html.replace(/\[\[([^\]]+)\]\]/g, '<span class="document-link" data-doc="$1">📄 $1</span>');
        
        if (html !== text && html !== block.innerHTML) {
            this.updateBlockHTML(block, html);
        }
    }
    
    /**
     * Execute editor command
     */
    executeCommand(commandName) {
        const command = this.commands[commandName];
        if (command && command.action) {
            this.saveHistory();
            command.action();
        }
    }
    
    /**
     * Convert block type
     */
    convertBlock(type) {
        const block = this.getCurrentBlock();
        if (!block) return;
        
        block.dataset.type = type;
        block.className = `editor-block block-${type}`;
        
        // Special handling for different types
        switch(type) {
            case 'checkbox':
                if (!block.dataset.checked) {
                    block.dataset.checked = 'false';
                }
                break;
            case 'number':
                this.updateNumberedLists();
                break;
        }
        
        this.focusBlock(block);
    }
    
    /**
     * Insert code block
     */
    insertCodeBlock() {
        const block = this.createBlock('codeblock');
        block.innerHTML = '<code contenteditable="true" data-language="javascript">// Enter code here</code>';
        this.insertBlock(block);
    }
    
    /**
     * Insert math block
     */
    insertMathBlock() {
        const block = this.createBlock('math');
        block.innerHTML = '<div class="math-content" contenteditable="true">E = mc^2</div>';
        this.insertBlock(block);
        
        // Render with KaTeX if available
        if (window.katex) {
            this.renderMath(block);
        }
    }
    
    /**
     * Insert link
     */
    insertLink() {
        const selection = window.getSelection();
        const text = selection.toString() || 'Link text';
        const url = prompt('Enter URL:', 'https://');
        
        if (url) {
            this.insertHTML(`<a href="${url}" target="_blank">${text}</a>`);
        }
    }
    
    /**
     * Insert image
     */
    insertImage() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.uploadImage(file);
            }
        };
        input.click();
    }
    
    /**
     * Insert document link
     */
    insertDocumentLink() {
        const popup = this.elements.documentLinkPopup;
        if (!popup) return;
        
        // Position popup
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            
            popup.style.top = `${rect.bottom + 10}px`;
            popup.style.left = `${rect.left}px`;
            popup.classList.add('active');
            
            // Focus search input
            const searchInput = popup.querySelector('#documentSearch');
            searchInput.focus();
            
            // Load documents
            this.loadDocuments();
        }
    }
    
    /**
     * Insert table
     */
    insertTable() {
        const rows = prompt('Number of rows:', '3');
        const cols = prompt('Number of columns:', '3');
        
        if (rows && cols) {
            const table = this.createTable(parseInt(rows), parseInt(cols));
            this.insertHTML(table);
        }
    }
    
    /**
     * Create table HTML
     */
    createTable(rows, cols) {
        let html = '<table class="editor-table"><thead><tr>';
        
        // Header
        for (let i = 0; i < cols; i++) {
            html += `<th contenteditable="true">Header ${i + 1}</th>`;
        }
        html += '</tr></thead><tbody>';
        
        // Body
        for (let i = 0; i < rows - 1; i++) {
            html += '<tr>';
            for (let j = 0; j < cols; j++) {
                html += '<td contenteditable="true">Cell</td>';
            }
            html += '</tr>';
        }
        
        html += '</tbody></table>';
        return html;
    }
    
    /**
     * Handle image upload
     */
    uploadImage(file) {
        if (this.options.onImageUpload) {
            // Custom upload handler
            this.options.onImageUpload(file, (url) => {
                this.insertHTML(`<img src="${url}" alt="${file.name}">`);
            });
        } else {
            // Default: convert to base64
            const reader = new FileReader();
            reader.onload = (e) => {
                this.insertHTML(`<img src="${e.target.result}" alt="${file.name}">`);
            };
            reader.readAsDataURL(file);
        }
    }
    
    /**
     * Get shortcut display string
     */
    getShortcutDisplay(commandName) {
        const command = this.commands[commandName];
        if (!command || !command.shortcut) return '';
        
        return command.shortcut
            .replace('Ctrl', '⌘')
            .replace('Alt', '⌥')
            .replace('Shift', '⇧');
    }
    
    /**
     * Create first block
     */
    createFirstBlock() {
        const block = this.createBlock('paragraph');
        this.elements.content.appendChild(block);
        this.focusBlock(block);
    }
    
    /**
     * Create new block element
     */
    createBlock(type = 'paragraph') {
        const block = document.createElement('div');
        block.className = `editor-block block-${type}`;
        block.dataset.type = type;
        block.contentEditable = 'true';
        block.dataset.placeholder = this.options.placeholder;
        return block;
    }
    
    /**
     * Get current block
     */
    getCurrentBlock() {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return null;
        
        const range = selection.getRangeAt(0);
        const element = range.commonAncestorContainer;
        
        return element.nodeType === Node.TEXT_NODE
            ? element.parentElement.closest('.editor-block')
            : element.closest('.editor-block');
    }
    
    /**
     * Focus block
     */
    focusBlock(block, position = 'end') {
        const range = document.createRange();
        const selection = window.getSelection();
        
        if (position === 'end') {
            range.selectNodeContents(block);
            range.collapse(false);
        } else {
            range.setStart(block, 0);
            range.setEnd(block, 0);
        }
        
        selection.removeAllRanges();
        selection.addRange(range);
        block.focus();
    }
    
    /**
     * Insert block after current
     */
    insertBlock(block) {
        const current = this.getCurrentBlock();
        if (current) {
            current.after(block);
        } else {
            this.elements.content.appendChild(block);
        }
        this.focusBlock(block);
    }
    
    /**
     * Insert HTML at cursor
     */
    insertHTML(html) {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return;
        
        const range = selection.getRangeAt(0);
        range.deleteContents();
        
        const div = document.createElement('div');
        div.innerHTML = html;
        
        const fragment = document.createDocumentFragment();
        while (div.firstChild) {
            fragment.appendChild(div.firstChild);
        }
        
        range.insertNode(fragment);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    }
    
    /**
     * Wrap selection with markers
     */
    wrapSelection(before, after) {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return;
        
        const range = selection.getRangeAt(0);
        const text = range.toString();
        
        if (text) {
            range.deleteContents();
            range.insertNode(document.createTextNode(before + text + after));
            
            // Trigger inline conversion
            const block = this.getCurrentBlock();
            if (block) {
                this.checkInlineConversions(block, block.textContent);
            }
        }
    }
    
    /**
     * Update block HTML
     */
    updateBlockHTML(block, html) {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const offset = range.startOffset;
        
        block.innerHTML = html;
        
        // Try to restore cursor position
        try {
            const newRange = document.createRange();
            const textNode = block.firstChild || block;
            newRange.setStart(textNode, Math.min(offset, textNode.textContent?.length || 0));
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
        } catch (e) {
            this.focusBlock(block);
        }
    }
    
    /**
     * Save current state to history
     */
    saveHistory() {
        const content = this.elements.content.innerHTML;
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(content);
        this.historyIndex++;
        
        // Limit history size
        if (this.history.length > 50) {
            this.history.shift();
            this.historyIndex--;
        }
    }
    
    /**
     * Undo last action
     */
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.elements.content.innerHTML = this.history[this.historyIndex];
        }
    }
    
    /**
     * Redo last undone action
     */
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.elements.content.innerHTML = this.history[this.historyIndex];
        }
    }
    
    /**
     * Get editor content
     */
    getContent() {
        return {
            html: this.elements.content.innerHTML,
            markdown: this.convertToMarkdown(this.elements.content),
            text: this.elements.content.textContent
        };
    }
    
    /**
     * Set editor content
     */
    setContent(content) {
        if (typeof content === 'string') {
            this.elements.content.innerHTML = content;
        } else if (content.html) {
            this.elements.content.innerHTML = content.html;
        }
        
        this.saveHistory();
    }
    
    /**
     * Convert to markdown
     */
    convertToMarkdown(element) {
        // Simplified markdown conversion
        // In production, use a proper HTML to Markdown library
        let markdown = '';
        
        const blocks = element.querySelectorAll('.editor-block');
        blocks.forEach(block => {
            const type = block.dataset.type;
            const text = block.textContent;
            
            switch(type) {
                case 'heading1':
                    markdown += `# ${text}\n\n`;
                    break;
                case 'heading2':
                    markdown += `## ${text}\n\n`;
                    break;
                case 'heading3':
                    markdown += `### ${text}\n\n`;
                    break;
                case 'heading4':
                    markdown += `#### ${text}\n\n`;
                    break;
                case 'quote':
                    markdown += `> ${text}\n\n`;
                    break;
                case 'bullet':
                    markdown += `- ${text}\n`;
                    break;
                case 'number':
                    markdown += `${block.dataset.number || '1'}. ${text}\n`;
                    break;
                case 'checkbox':
                    const checked = block.dataset.checked === 'true' ? 'x' : ' ';
                    markdown += `- [${checked}] ${text}\n`;
                    break;
                case 'codeblock':
                    const lang = block.querySelector('code')?.dataset.language || '';
                    markdown += `\`\`\`${lang}\n${text}\n\`\`\`\n\n`;
                    break;
                default:
                    markdown += `${text}\n\n`;
            }
        });
        
        return markdown;
    }
    
    /**
     * Schedule auto-save
     */
    scheduleAutoSave() {
        clearTimeout(this.autoSaveTimer);
        this.autoSaveTimer = setTimeout(() => {
            this.save();
        }, this.options.autoSaveInterval);
    }
    
    /**
     * Save content
     */
    save() {
        if (this.options.onSave) {
            this.options.onSave(this.getContent());
        }
    }
    
    /**
     * Destroy editor
     */
    destroy() {
        clearTimeout(this.autoSaveTimer);
        this.container.innerHTML = '';
    }
}

export default Editor;