/**
 * WYSIWYG Editor Core
 * Local-first, contenteditable-based editor
 */

import { ContentEditable } from './ContentEditable.js';
import { SelectionManager } from './Selection.js';
import { History } from './History.js';
import { StorageManager } from '../storage/StorageManager.js';
import { CommandManager } from '../commands/CommandManager.js';
import { BlockManager } from '../blocks/BlockManager.js';
import { Toolbar } from '../ui/Toolbar.js';
import { FloatingToolbar } from '../ui/FloatingToolbar.js';
import { SlashMenu } from '../ui/SlashMenu.js';

export class Editor {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;
            
        if (!this.container) {
            throw new Error('Editor container not found');
        }
        
        // Configuration
        this.config = {
            documentId: options.documentId || this.generateId(),
            placeholder: '텍스트를 입력하거나 \'/\'를 눌러 시작하세요...',
            autoSave: true,
            autoSaveInterval: 2000,
            theme: 'warm',
            mode: 'light',
            enableToolbar: true,
            enableFloatingToolbar: true,
            enableSlashMenu: true,
            enableShortcuts: true,
            enableDragDrop: true,
            enableMath: true,
            enableCodeHighlight: true,
            localStorageKey: 'editor-document',
            ...options
        };
        
        // Core components
        this.storage = new StorageManager(this.config);
        this.commands = new CommandManager(this);
        this.blocks = new BlockManager(this);
        this.history = new History(this);
        this.selection = new SelectionManager(this);
        
        // State
        this.document = null;
        this.isInitialized = false;
        this.autoSaveTimer = null;
        
        // Initialize
        this.init();
    }
    
    async init() {
        try {
            // Setup DOM structure
            this.setupDOM();
            
            // Initialize storage
            await this.storage.init();
            
            // Load or create document
            await this.loadDocument();
            
            // Initialize UI components
            this.initializeUI();
            
            // Setup contenteditable
            this.contentEditable = new ContentEditable(this.editorElement, {
                placeholder: this.config.placeholder,
                onInput: this.handleInput.bind(this),
                onKeydown: this.handleKeydown.bind(this),
                onPaste: this.handlePaste.bind(this),
                onDrop: this.handleDrop.bind(this)
            });
            
            // Register commands
            this.commands.registerDefaultCommands();
            
            // Setup event listeners
            this.attachEventListeners();
            
            // Mark as initialized
            this.isInitialized = true;
            
            // Trigger ready event
            this.emit('ready');
            
        } catch (error) {
            console.error('Editor initialization failed:', error);
            this.emit('error', error);
        }
    }
    
    setupDOM() {
        this.container.innerHTML = `
            <div class="editor-wrapper" data-theme="${this.config.mode}" data-theme-variant="${this.config.theme}">
                ${this.config.enableToolbar ? '<div class="editor-toolbar-container"></div>' : ''}
                <div class="editor-content-wrapper">
                    <div class="editor-content" id="editor-${this.config.documentId}"></div>
                </div>
                <div class="editor-status-bar">
                    <span class="status-left">
                        <span id="wordCount">0 words</span>
                        <span id="charCount">0 characters</span>
                    </span>
                    <span class="status-right">
                        <span id="saveStatus">Ready</span>
                    </span>
                </div>
            </div>
        `;
        
        // Cache DOM elements
        this.elements = {
            wrapper: this.container.querySelector('.editor-wrapper'),
            toolbar: this.container.querySelector('.editor-toolbar-container'),
            content: this.container.querySelector('.editor-content-wrapper'),
            editor: this.container.querySelector('.editor-content'),
            statusBar: this.container.querySelector('.editor-status-bar'),
            wordCount: this.container.querySelector('#wordCount'),
            charCount: this.container.querySelector('#charCount'),
            saveStatus: this.container.querySelector('#saveStatus')
        };
        
        this.editorElement = this.elements.editor;
    }
    
    initializeUI() {
        // Main toolbar
        if (this.config.enableToolbar && this.elements.toolbar) {
            this.toolbar = new Toolbar(this.elements.toolbar, this);
        }
        
        // Floating toolbar
        if (this.config.enableFloatingToolbar) {
            this.floatingToolbar = new FloatingToolbar(this);
        }
        
        // Slash menu
        if (this.config.enableSlashMenu) {
            this.slashMenu = new SlashMenu(this);
        }
    }
    
    async loadDocument() {
        // Try to load existing document
        this.document = await this.storage.loadDocument(this.config.documentId);
        
        if (!this.document) {
            // Create new document
            this.document = {
                id: this.config.documentId,
                title: 'Untitled',
                blocks: [
                    {
                        id: this.generateId(),
                        type: 'paragraph',
                        content: ''
                    }
                ],
                metadata: {
                    created: Date.now(),
                    modified: Date.now(),
                    version: 1
                },
                attachments: []
            };
            
            // Save initial document
            await this.storage.saveDocument(this.document);
        }
        
        // Render blocks
        this.renderDocument();
    }
    
    renderDocument() {
        if (!this.document || !this.editorElement) return;
        
        // Clear editor
        this.editorElement.innerHTML = '';
        
        // Render each block
        this.document.blocks.forEach(blockData => {
            const blockElement = this.blocks.createBlock(blockData);
            this.editorElement.appendChild(blockElement);
        });
        
        // Focus first block if empty
        if (this.document.blocks.length === 1 && !this.document.blocks[0].content) {
            const firstBlock = this.editorElement.firstElementChild;
            if (firstBlock) {
                firstBlock.focus();
            }
        }
        
        // Update status
        this.updateStatus();
    }
    
    attachEventListeners() {
        // Selection change
        document.addEventListener('selectionchange', () => {
            this.selection.update();
            
            if (this.floatingToolbar) {
                this.floatingToolbar.update();
            }
        });
        
        // Keyboard shortcuts
        if (this.config.enableShortcuts) {
            this.editorElement.addEventListener('keydown', (e) => {
                this.handleShortcut(e);
            });
        }
        
        // Auto-save
        if (this.config.autoSave) {
            this.editorElement.addEventListener('input', () => {
                this.scheduleAutoSave();
            });
        }
        
        // Click handlers
        this.editorElement.addEventListener('click', (e) => {
            this.handleClick(e);
        });
    }
    
    handleInput(e) {
        const block = e.target.closest('[data-block-id]');
        if (!block) return;
        
        const blockId = block.dataset.blockId;
        const blockData = this.getBlockById(blockId);
        
        if (blockData) {
            // Update block content
            blockData.content = block.textContent;
            blockData.metadata.modified = Date.now();
            
            // Check for auto-conversions
            this.checkAutoConversions(block, blockData);
            
            // Update status
            this.updateStatus();
            
            // Emit change event
            this.emit('change', this.document);
        }
    }
    
    handleKeydown(e) {
        // Enter key
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.handleEnter(e);
            return;
        }
        
        // Backspace at beginning of block
        if (e.key === 'Backspace') {
            const selection = window.getSelection();
            if (selection.isCollapsed && selection.anchorOffset === 0) {
                this.handleBackspaceAtStart(e);
            }
        }
        
        // Tab key
        if (e.key === 'Tab') {
            e.preventDefault();
            this.handleTab(e);
        }
    }
    
    handleEnter(e) {
        const block = e.target.closest('[data-block-id]');
        if (!block) return;
        
        const blockId = block.dataset.blockId;
        const blockIndex = this.document.blocks.findIndex(b => b.id === blockId);
        
        // Create new block after current
        const newBlock = {
            id: this.generateId(),
            type: 'paragraph',
            content: ''
        };
        
        // Insert into document
        this.document.blocks.splice(blockIndex + 1, 0, newBlock);
        
        // Create DOM element
        const newBlockElement = this.blocks.createBlock(newBlock);
        block.after(newBlockElement);
        
        // Focus new block
        newBlockElement.focus();
        
        // Save
        this.scheduleAutoSave();
    }
    
    handleBackspaceAtStart(e) {
        const block = e.target.closest('[data-block-id]');
        if (!block) return;
        
        const blockId = block.dataset.blockId;
        const blockData = this.getBlockById(blockId);
        
        // Convert to paragraph if it's a special block
        if (blockData && blockData.type !== 'paragraph') {
            e.preventDefault();
            this.convertBlock(blockId, 'paragraph');
        }
    }
    
    handleTab(e) {
        const block = e.target.closest('[data-block-id]');
        if (!block) return;
        
        const blockData = this.getBlockById(block.dataset.blockId);
        
        // Indent list items
        if (blockData && (blockData.type === 'bullet' || blockData.type === 'number')) {
            if (e.shiftKey) {
                this.outdentBlock(blockData.id);
            } else {
                this.indentBlock(blockData.id);
            }
        } else {
            // Insert tab character
            document.execCommand('insertText', false, '\t');
        }
    }
    
    handlePaste(e) {
        e.preventDefault();
        
        // Get pasted data
        const clipboardData = e.clipboardData || window.clipboardData;
        const pastedText = clipboardData.getData('text/plain');
        const pastedHTML = clipboardData.getData('text/html');
        
        // Check for images
        const items = clipboardData.items;
        for (let item of items) {
            if (item.type.indexOf('image') !== -1) {
                const blob = item.getAsFile();
                this.handleImagePaste(blob);
                return;
            }
        }
        
        // Insert text
        if (pastedText) {
            // Check if it's markdown
            if (this.looksLikeMarkdown(pastedText)) {
                this.insertMarkdown(pastedText);
            } else {
                document.execCommand('insertText', false, pastedText);
            }
        }
    }
    
    handleDrop(e) {
        e.preventDefault();
        
        const files = Array.from(e.dataTransfer.files);
        const imageFiles = files.filter(f => f.type.startsWith('image/'));
        
        imageFiles.forEach(file => {
            this.insertImage(file);
        });
    }
    
    handleClick(e) {
        const block = e.target.closest('[data-block-id]');
        if (!block) return;
        
        const blockData = this.getBlockById(block.dataset.blockId);
        
        // Handle checkbox clicks
        if (blockData && blockData.type === 'checkbox') {
            const rect = block.getBoundingClientRect();
            const x = e.clientX - rect.left;
            
            if (x < 30) { // Click on checkbox
                blockData.metadata.checked = !blockData.metadata.checked;
                block.dataset.checked = blockData.metadata.checked;
                this.scheduleAutoSave();
            }
        }
    }
    
    handleShortcut(e) {
        const key = e.key.toLowerCase();
        const ctrl = e.ctrlKey || e.metaKey;
        const shift = e.shiftKey;
        const alt = e.altKey;
        
        // Build shortcut string
        let shortcut = '';
        if (ctrl) shortcut += 'ctrl+';
        if (alt) shortcut += 'alt+';
        if (shift) shortcut += 'shift+';
        shortcut += key;
        
        // Execute command
        const command = this.commands.getByShortcut(shortcut);
        if (command) {
            e.preventDefault();
            this.executeCommand(command.id);
        }
    }
    
    checkAutoConversions(block, blockData) {
        const text = blockData.content;
        
        // Markdown patterns
        const patterns = [
            { regex: /^#\s(.*)/, type: 'heading1' },
            { regex: /^##\s(.*)/, type: 'heading2' },
            { regex: /^###\s(.*)/, type: 'heading3' },
            { regex: /^####\s(.*)/, type: 'heading4' },
            { regex: /^>\s(.*)/, type: 'quote' },
            { regex: /^[-*]\s(.*)/, type: 'bullet' },
            { regex: /^\d+\.\s(.*)/, type: 'number' },
            { regex: /^\[\s?\]\s(.*)/, type: 'checkbox' },
            { regex: /^```(.*)/, type: 'codeblock' }
        ];
        
        for (const pattern of patterns) {
            const match = text.match(pattern.regex);
            if (match) {
                // Convert block type
                blockData.type = pattern.type;
                blockData.content = match[1] || '';
                
                // Re-render block
                const newBlockElement = this.blocks.createBlock(blockData);
                block.replaceWith(newBlockElement);
                
                // Restore cursor
                const selection = window.getSelection();
                const range = document.createRange();
                range.selectNodeContents(newBlockElement);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
                
                break;
            }
        }
    }
    
    executeCommand(commandId, params = {}) {
        // Save state for undo
        this.history.save();
        
        // Execute command
        const result = this.commands.execute(commandId, params);
        
        // Update UI
        this.updateStatus();
        
        // Schedule save
        this.scheduleAutoSave();
        
        return result;
    }
    
    convertBlock(blockId, newType) {
        const blockData = this.getBlockById(blockId);
        if (!blockData) return;
        
        blockData.type = newType;
        blockData.metadata.modified = Date.now();
        
        // Re-render block
        const oldBlock = this.editorElement.querySelector(`[data-block-id="${blockId}"]`);
        const newBlock = this.blocks.createBlock(blockData);
        oldBlock.replaceWith(newBlock);
        
        // Focus
        newBlock.focus();
    }
    
    async insertImage(file) {
        // Create image block
        const imageBlock = {
            id: this.generateId(),
            type: 'image',
            content: '',
            metadata: {
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type
            }
        };
        
        // Store image in IndexedDB
        const imageId = await this.storage.storeAttachment(file);
        imageBlock.metadata.attachmentId = imageId;
        
        // Get current block index
        const selection = window.getSelection();
        const currentBlock = selection.anchorNode?.parentElement?.closest('[data-block-id]');
        const currentIndex = currentBlock 
            ? this.document.blocks.findIndex(b => b.id === currentBlock.dataset.blockId)
            : this.document.blocks.length - 1;
        
        // Insert after current block
        this.document.blocks.splice(currentIndex + 1, 0, imageBlock);
        
        // Render
        const imageElement = this.blocks.createBlock(imageBlock);
        if (currentBlock) {
            currentBlock.after(imageElement);
        } else {
            this.editorElement.appendChild(imageElement);
        }
        
        // Save
        this.scheduleAutoSave();
    }
    
    getBlockById(id) {
        return this.document.blocks.find(b => b.id === id);
    }
    
    updateStatus() {
        if (!this.elements.wordCount || !this.elements.charCount) return;
        
        const text = this.editorElement.textContent;
        const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
        const chars = text.length;
        
        this.elements.wordCount.textContent = `${words} words`;
        this.elements.charCount.textContent = `${chars} characters`;
    }
    
    scheduleAutoSave() {
        if (!this.config.autoSave) return;
        
        clearTimeout(this.autoSaveTimer);
        this.elements.saveStatus.textContent = 'Saving...';
        
        this.autoSaveTimer = setTimeout(async () => {
            await this.save();
            this.elements.saveStatus.textContent = 'Saved';
            
            setTimeout(() => {
                this.elements.saveStatus.textContent = 'Ready';
            }, 2000);
        }, this.config.autoSaveInterval);
    }
    
    async save() {
        if (!this.document) return;
        
        this.document.metadata.modified = Date.now();
        await this.storage.saveDocument(this.document);
        
        this.emit('save', this.document);
    }
    
    generateId() {
        return 'block-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
    
    looksLikeMarkdown(text) {
        const patterns = [/^#/, /^\*\*/, /^-\s/, /^\d+\.\s/, /^>/];
        return patterns.some(p => p.test(text));
    }
    
    emit(event, data) {
        if (this.config[`on${event.charAt(0).toUpperCase() + event.slice(1)}`]) {
            this.config[`on${event.charAt(0).toUpperCase() + event.slice(1)}`](data);
        }
    }
    
    // Public API
    async getContent() {
        return {
            document: this.document,
            html: this.editorElement.innerHTML,
            markdown: await this.blocks.toMarkdown(this.document.blocks),
            text: this.editorElement.textContent
        };
    }
    
    async setContent(content) {
        if (typeof content === 'string') {
            // Parse as markdown
            this.document.blocks = await this.blocks.fromMarkdown(content);
        } else if (content.blocks) {
            this.document.blocks = content.blocks;
        }
        
        this.renderDocument();
        await this.save();
    }
    
    destroy() {
        clearTimeout(this.autoSaveTimer);
        this.contentEditable?.destroy();
        this.toolbar?.destroy();
        this.floatingToolbar?.destroy();
        this.slashMenu?.destroy();
        this.container.innerHTML = '';
    }
}

export default Editor;