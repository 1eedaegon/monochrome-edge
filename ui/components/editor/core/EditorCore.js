/**
 * Main Editor Core
 * Integrates all components into a unified WYSIWYG editor
 */

import { EditorDataModel } from './EditorDataModel.js';
import { BlockRenderer } from './BlockRenderer.js';
import { SelectionManager } from './SelectionManager.js';
import { InputHandler } from './InputHandler.js';
import { StorageCore } from '../storage/StorageCore.js';
import { FloatingToolbarCore } from '../ui/FloatingToolbarCore.js';
import { SlashMenuCore } from '../ui/SlashMenuCore.js';
import { ToolbarCore } from '../ui/ToolbarCore.js';

export class EditorCore {
    constructor(container, options = {}) {
        // Container setup
        if (typeof container === 'string') {
            this.container = document.querySelector(container);
        } else {
            this.container = container;
        }
        
        if (!this.container) {
            throw new Error('Editor container not found');
        }
        
        // Configuration
        this.config = {
            documentId: options.documentId || this.generateDocumentId(),
            placeholder: options.placeholder || 'Start typing or press "/" for commands...',
            autoSave: options.autoSave !== false,
            autoSaveInterval: options.autoSaveInterval || 2000,
            enableToolbar: options.enableToolbar !== false,
            enableFloatingToolbar: options.enableFloatingToolbar !== false,
            enableSlashMenu: options.enableSlashMenu !== false,
            enableShortcuts: options.enableShortcuts !== false,
            enableDragDrop: options.enableDragDrop !== false,
            enableMath: options.enableMath !== false,
            enableCodeHighlight: options.enableCodeHighlight !== false,
            ...options
        };
        
        // Event emitter
        this.listeners = new Map();
        
        // Initialize components
        this.initializeComponents();
        
        // Setup UI
        this.setupUI();
        
        // Load or create document
        this.loadDocument();
        
        // Start auto-save if enabled
        if (this.config.autoSave) {
            this.startAutoSave();
        }
        
        // Fire ready callback
        if (this.config.onReady) {
            setTimeout(() => this.config.onReady(), 0);
        }
    }
    
    initializeComponents() {
        // Core components
        this.dataModel = new EditorDataModel();
        this.renderer = new BlockRenderer(this);
        this.selectionManager = new SelectionManager(this);
        this.inputHandler = new InputHandler(this);
        this.storage = new StorageCore(this.config);
        
        // UI components
        if (this.config.enableFloatingToolbar) {
            this.floatingToolbar = new FloatingToolbarCore(this);
        }
        
        if (this.config.enableSlashMenu) {
            this.slashMenu = new SlashMenuCore(this);
        }
        
        // Listen to events
        this.setupEventListeners();
    }
    
    setupUI() {
        // Create editor structure
        this.container.innerHTML = '';
        this.container.className = 'editor-wrapper';
        
        // Create toolbar if enabled
        if (this.config.enableToolbar) {
            const toolbarContainer = document.createElement('div');
            toolbarContainer.className = 'editor-toolbar-container';
            this.container.appendChild(toolbarContainer);
            this.toolbar = new ToolbarCore(toolbarContainer, this);
        }
        
        // Create content wrapper
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'editor-content-wrapper';
        this.container.appendChild(contentWrapper);
        
        // Create editable content area
        this.contentElement = document.createElement('div');
        this.contentElement.className = 'editor-content';
        this.contentElement.setAttribute('data-placeholder', this.config.placeholder);
        contentWrapper.appendChild(this.contentElement);
        
        // Create status bar
        this.statusBar = document.createElement('div');
        this.statusBar.className = 'editor-status-bar';
        this.statusBar.innerHTML = `
            <div class="status-left">
                <span class="status-words">0 words</span>
                <span class="status-chars">0 characters</span>
            </div>
            <div class="status-right">
                <span class="status-saved">Saved</span>
            </div>
        `;
        this.container.appendChild(this.statusBar);
    }
    
    setupEventListeners() {
        // Data model events
        this.on('blockFocus', ({ blockId, element }) => {
            this.currentBlockId = blockId;
            this.currentBlockElement = element;
        });
        
        this.on('blockBlur', ({ blockId, element }) => {
            if (this.currentBlockId === blockId) {
                this.currentBlockId = null;
                this.currentBlockElement = null;
            }
        });
        
        // Selection events
        this.on('selectionChange', (selection) => {
            if (this.config.enableFloatingToolbar) {
                this.floatingToolbar.update();
            }
        });
        
        // Storage events
        this.on('save', () => {
            this.updateStatusBar('Saved');
        });
        
        this.on('change', () => {
            this.updateStatusBar('Unsaved changes');
            this.updateWordCount();
            
            if (this.config.onChange) {
                this.config.onChange(this.getDocument());
            }
        });
    }
    
    loadDocument() {
        // Try to load from storage
        this.storage.loadDocument(this.config.documentId).then(doc => {
            if (doc) {
                this.dataModel.fromJSON(JSON.stringify(doc));
                this.render();
            } else {
                // Create initial block
                this.createInitialContent();
            }
        }).catch(err => {
            console.error('Failed to load document:', err);
            this.createInitialContent();
        });
    }
    
    createInitialContent() {
        // Create initial paragraph block
        const initialBlock = this.dataModel.createBlock('paragraph', '');
        this.dataModel.insertBlock(initialBlock);
        this.render();
        
        // Focus first block
        setTimeout(() => {
            const firstBlock = this.contentElement.querySelector('.editor-block');
            if (firstBlock) {
                this.renderer.focusBlock(firstBlock);
            }
        }, 0);
    }
    
    render() {
        // Clear content
        this.contentElement.innerHTML = '';
        
        // Render all blocks
        this.dataModel.document.blocks.forEach(block => {
            const element = this.renderer.render(block);
            this.contentElement.appendChild(element);
        });
        
        // Update UI
        this.updateWordCount();
        
        // Check if empty
        if (this.dataModel.document.blocks.length === 0) {
            this.contentElement.classList.add('empty');
        } else {
            this.contentElement.classList.remove('empty');
        }
    }
    
    // Public API
    executeCommand(command) {
        switch (command) {
            // Text formatting
            case 'bold':
                this.inputHandler.toggleFormat('bold');
                break;
            case 'italic':
                this.inputHandler.toggleFormat('italic');
                break;
            case 'strikethrough':
                this.inputHandler.toggleFormat('strikethrough');
                break;
            case 'code':
                this.inputHandler.toggleFormat('code');
                break;
                
            // Block types
            case 'heading1':
            case 'heading2':
            case 'heading3':
            case 'heading4':
            case 'paragraph':
            case 'quote':
            case 'bullet':
            case 'number':
            case 'checkbox':
            case 'codeblock':
                this.inputHandler.transformBlock(command);
                break;
                
            // Special blocks
            case 'image':
                this.insertImage();
                break;
            case 'table':
                this.insertTable();
                break;
            case 'divider':
                this.insertDivider();
                break;
            case 'link':
                this.inputHandler.insertLink();
                break;
                
            // History
            case 'undo':
                this.undo();
                break;
            case 'redo':
                this.redo();
                break;
                
            default:
                console.warn(`Unknown command: ${command}`);
        }
    }
    
    insertBlock(type, content = '', attributes = {}) {
        const block = this.dataModel.createBlock(type, content, attributes);
        
        // Insert after current block
        let index = this.dataModel.document.blocks.length;
        if (this.currentBlockId) {
            const currentIndex = this.dataModel.findBlockIndex(this.currentBlockId);
            if (currentIndex !== -1) {
                index = currentIndex + 1;
            }
        }
        
        this.dataModel.insertBlock(block, index);
        
        // Render new block
        const element = this.renderer.render(block);
        
        if (this.currentBlockElement && this.currentBlockElement.nextSibling) {
            this.contentElement.insertBefore(element, this.currentBlockElement.nextSibling);
        } else {
            this.contentElement.appendChild(element);
        }
        
        // Focus new block
        this.renderer.focusBlock(element);
        
        this.emit('change');
        return block.id;
    }
    
    insertImage() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                this.insertBlock('image', e.target.result, {
                    alt: file.name,
                    size: file.size,
                    type: file.type
                });
            };
            reader.readAsDataURL(file);
        };
        
        input.click();
    }
    
    insertTable() {
        const rows = prompt('Number of rows:', '3');
        const cols = prompt('Number of columns:', '3');
        
        if (!rows || !cols) return;
        
        const tableData = {
            rows: parseInt(rows),
            cols: parseInt(cols),
            cells: []
        };
        
        // Initialize empty cells
        for (let i = 0; i < tableData.rows; i++) {
            tableData.cells[i] = [];
            for (let j = 0; j < tableData.cols; j++) {
                tableData.cells[i][j] = '';
            }
        }
        
        this.insertBlock('table', tableData);
    }
    
    insertDivider() {
        this.insertBlock('divider');
    }
    
    undo() {
        if (this.dataModel.undo()) {
            this.render();
            this.emit('change');
        }
    }
    
    redo() {
        if (this.dataModel.redo()) {
            this.render();
            this.emit('change');
        }
    }
    
    async save() {
        try {
            const document = this.getDocument();
            await this.storage.saveDocument(this.config.documentId, document);
            
            this.emit('save');
            
            if (this.config.onSave) {
                this.config.onSave(document);
            }
            
            return true;
        } catch (err) {
            console.error('Failed to save document:', err);
            
            if (this.config.onError) {
                this.config.onError(err);
            }
            
            return false;
        }
    }
    
    startAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            this.save();
        }, this.config.autoSaveInterval);
    }
    
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }
    
    getDocument() {
        return this.dataModel.document;
    }
    
    setContent(content) {
        if (typeof content === 'string') {
            // Parse markdown or plain text
            const blocks = this.parseContent(content);
            this.dataModel.document.blocks = blocks;
        } else if (content.blocks) {
            // Set blocks directly
            this.dataModel.document.blocks = content.blocks;
        }
        
        this.render();
        this.emit('change');
    }
    
    getContent() {
        return {
            json: this.dataModel.toJSON(),
            markdown: this.dataModel.toMarkdown(),
            blocks: this.dataModel.document.blocks
        };
    }
    
    parseContent(text) {
        const lines = text.split('\n');
        const blocks = [];
        
        lines.forEach(line => {
            let block = null;
            
            // Check for markdown patterns
            if (line.startsWith('# ')) {
                block = this.dataModel.createBlock('heading1', line.substring(2));
            } else if (line.startsWith('## ')) {
                block = this.dataModel.createBlock('heading2', line.substring(3));
            } else if (line.startsWith('### ')) {
                block = this.dataModel.createBlock('heading3', line.substring(4));
            } else if (line.startsWith('#### ')) {
                block = this.dataModel.createBlock('heading4', line.substring(5));
            } else if (line.startsWith('> ')) {
                block = this.dataModel.createBlock('quote', line.substring(2));
            } else if (line.startsWith('- ') || line.startsWith('* ')) {
                block = this.dataModel.createBlock('bullet', line.substring(2));
            } else if (/^\d+\.\s/.test(line)) {
                block = this.dataModel.createBlock('number', line.replace(/^\d+\.\s/, ''));
            } else if (line === '---' || line === '***') {
                block = this.dataModel.createBlock('divider');
            } else if (line.trim() !== '') {
                block = this.dataModel.createBlock('paragraph', line);
            }
            
            if (block) {
                blocks.push(block);
            }
        });
        
        // Add initial block if empty
        if (blocks.length === 0) {
            blocks.push(this.dataModel.createBlock('paragraph', ''));
        }
        
        return blocks;
    }
    
    updateWordCount() {
        const metadata = this.dataModel.document.metadata;
        
        if (this.statusBar) {
            const wordsElement = this.statusBar.querySelector('.status-words');
            const charsElement = this.statusBar.querySelector('.status-chars');
            
            if (wordsElement) {
                wordsElement.textContent = `${metadata.wordCount} words`;
            }
            
            if (charsElement) {
                charsElement.textContent = `${metadata.charCount} characters`;
            }
        }
    }
    
    updateStatusBar(status) {
        if (this.statusBar) {
            const savedElement = this.statusBar.querySelector('.status-saved');
            if (savedElement) {
                savedElement.textContent = status;
            }
        }
    }
    
    focus() {
        const firstBlock = this.contentElement.querySelector('.editor-block');
        if (firstBlock) {
            this.renderer.focusBlock(firstBlock);
        }
    }
    
    blur() {
        if (this.currentBlockElement) {
            this.currentBlockElement.blur();
        }
    }
    
    clear() {
        this.dataModel.document.blocks = [];
        this.dataModel.history = {
            operations: [],
            currentIndex: -1,
            maxSize: 100
        };
        
        this.createInitialContent();
        this.emit('change');
    }
    
    // Event Emitter
    on(event, handler) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(handler);
    }
    
    off(event, handler) {
        const handlers = this.listeners.get(event);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index !== -1) {
                handlers.splice(index, 1);
            }
        }
    }
    
    emit(event, data) {
        const handlers = this.listeners.get(event);
        if (handlers) {
            handlers.forEach(handler => handler(data));
        }
    }
    
    // Utility
    generateDocumentId() {
        return 'doc-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
    
    destroy() {
        // Stop auto-save
        this.stopAutoSave();
        
        // Clean up components
        this.renderer?.destroy();
        this.selectionManager?.destroy();
        this.inputHandler?.destroy();
        
        // Clear listeners
        this.listeners.clear();
        
        // Clear DOM
        this.container.innerHTML = '';
    }
}