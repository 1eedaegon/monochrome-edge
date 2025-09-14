/**
 * Input Handler
 * Manages keyboard shortcuts, paste handling, and drag & drop
 */

export class InputHandler {
    constructor(editor) {
        this.editor = editor;
        this.isComposing = false;
        this.clipboard = null;
        
        this.shortcuts = new Map();
        this.registerDefaultShortcuts();
        this.attachListeners();
    }
    
    registerDefaultShortcuts() {
        // Text formatting
        this.register('mod+b', () => this.toggleFormat('bold'));
        this.register('mod+i', () => this.toggleFormat('italic'));
        this.register('mod+u', () => this.toggleFormat('underline'));
        this.register('mod+shift+s', () => this.toggleFormat('strikethrough'));
        this.register('mod+e', () => this.toggleFormat('code'));
        
        // Block formatting
        this.register('mod+alt+1', () => this.transformBlock('heading1'));
        this.register('mod+alt+2', () => this.transformBlock('heading2'));
        this.register('mod+alt+3', () => this.transformBlock('heading3'));
        this.register('mod+alt+4', () => this.transformBlock('heading4'));
        this.register('mod+alt+q', () => this.transformBlock('quote'));
        this.register('mod+alt+c', () => this.transformBlock('codeblock'));
        
        // Links
        this.register('mod+k', () => this.insertLink());
        
        // History
        this.register('mod+z', () => this.editor.undo());
        this.register('mod+shift+z', () => this.editor.redo());
        this.register('mod+y', () => this.editor.redo());
        
        // Save
        this.register('mod+s', (e) => {
            e.preventDefault();
            this.editor.save();
        });
        
        // Selection
        this.register('mod+a', () => this.selectAll());
        
        // Copy/Cut/Paste
        this.register('mod+c', () => this.copy());
        this.register('mod+x', () => this.cut());
        this.register('mod+v', () => this.paste());
    }
    
    register(shortcut, handler) {
        this.shortcuts.set(this.normalizeShortcut(shortcut), handler);
    }
    
    normalizeShortcut(shortcut) {
        return shortcut
            .toLowerCase()
            .replace('mod', navigator.platform.includes('Mac') ? 'meta' : 'ctrl')
            .split('+')
            .sort()
            .join('+');
    }
    
    attachListeners() {
        const container = this.editor.container;
        
        // Keyboard events
        container.addEventListener('keydown', this.handleKeyDown.bind(this));
        container.addEventListener('keyup', this.handleKeyUp.bind(this));
        
        // Composition events (for IME)
        container.addEventListener('compositionstart', () => this.isComposing = true);
        container.addEventListener('compositionend', () => this.isComposing = false);
        
        // Paste event
        container.addEventListener('paste', this.handlePaste.bind(this));
        
        // Drag & Drop
        container.addEventListener('dragover', this.handleDragOver.bind(this));
        container.addEventListener('drop', this.handleDrop.bind(this));
        
        // Cut/Copy
        container.addEventListener('cut', this.handleCut.bind(this));
        container.addEventListener('copy', this.handleCopy.bind(this));
    }
    
    handleKeyDown(e) {
        // Skip if composing (IME input)
        if (this.isComposing) return;
        
        // Build shortcut string
        const keys = [];
        if (e.ctrlKey) keys.push('ctrl');
        if (e.metaKey) keys.push('meta');
        if (e.altKey) keys.push('alt');
        if (e.shiftKey) keys.push('shift');
        
        // Add the actual key
        const key = e.key.toLowerCase();
        if (key !== 'control' && key !== 'meta' && key !== 'alt' && key !== 'shift') {
            keys.push(key);
        }
        
        const shortcut = keys.sort().join('+');
        const handler = this.shortcuts.get(shortcut);
        
        if (handler) {
            e.preventDefault();
            handler(e);
        }
    }
    
    handleKeyUp(e) {
        // Update UI state if needed
    }
    
    handlePaste(e) {
        e.preventDefault();
        
        const clipboardData = e.clipboardData || window.clipboardData;
        
        // Check for files (images)
        if (clipboardData.files && clipboardData.files.length > 0) {
            this.handleFilePaste(clipboardData.files);
            return;
        }
        
        // Check for HTML content
        const html = clipboardData.getData('text/html');
        if (html) {
            this.handleHtmlPaste(html);
            return;
        }
        
        // Default to plain text
        const text = clipboardData.getData('text/plain');
        if (text) {
            this.handleTextPaste(text);
        }
    }
    
    handleTextPaste(text) {
        const selection = this.editor.selectionManager.getSelection();
        if (!selection) return;
        
        const blockId = selection.blockId;
        const block = this.editor.dataModel.getBlock(blockId);
        if (!block) return;
        
        // Handle multi-line paste
        const lines = text.split('\n');
        
        if (lines.length === 1) {
            // Single line - insert into current block
            this.insertTextAtCursor(text);
        } else {
            // Multiple lines - create new blocks
            const currentIndex = this.editor.dataModel.findBlockIndex(blockId);
            
            lines.forEach((line, index) => {
                if (index === 0) {
                    // Insert first line into current block
                    this.insertTextAtCursor(line);
                } else {
                    // Create new blocks for remaining lines
                    const newBlock = this.editor.dataModel.createBlock('paragraph', line);
                    this.editor.dataModel.insertBlock(newBlock, currentIndex + index);
                }
            });
            
            // Re-render
            this.editor.render();
        }
    }
    
    handleHtmlPaste(html) {
        // Parse HTML and convert to blocks
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const blocks = this.parseHtmlToBlocks(doc.body);
        
        if (blocks.length === 0) return;
        
        const selection = this.editor.selectionManager.getSelection();
        if (!selection) return;
        
        const currentIndex = this.editor.dataModel.findBlockIndex(selection.blockId);
        
        // Insert parsed blocks
        blocks.forEach((block, index) => {
            this.editor.dataModel.insertBlock(block, currentIndex + index + 1);
        });
        
        // Re-render
        this.editor.render();
    }
    
    parseHtmlToBlocks(element) {
        const blocks = [];
        
        for (const child of element.children) {
            const tagName = child.tagName.toLowerCase();
            let block = null;
            
            switch (tagName) {
                case 'h1':
                    block = this.editor.dataModel.createBlock('heading1', child.textContent);
                    break;
                case 'h2':
                    block = this.editor.dataModel.createBlock('heading2', child.textContent);
                    break;
                case 'h3':
                    block = this.editor.dataModel.createBlock('heading3', child.textContent);
                    break;
                case 'h4':
                    block = this.editor.dataModel.createBlock('heading4', child.textContent);
                    break;
                case 'blockquote':
                    block = this.editor.dataModel.createBlock('quote', child.textContent);
                    break;
                case 'pre':
                    const code = child.querySelector('code');
                    block = this.editor.dataModel.createBlock('codeblock', code ? code.textContent : child.textContent);
                    break;
                case 'ul':
                    for (const li of child.querySelectorAll('li')) {
                        blocks.push(this.editor.dataModel.createBlock('bullet', li.textContent));
                    }
                    break;
                case 'ol':
                    let index = 1;
                    for (const li of child.querySelectorAll('li')) {
                        const numberedBlock = this.editor.dataModel.createBlock('number', li.textContent);
                        numberedBlock.attributes = { index: index++ };
                        blocks.push(numberedBlock);
                    }
                    break;
                case 'img':
                    block = this.editor.dataModel.createBlock('image', child.src);
                    block.attributes = { alt: child.alt };
                    break;
                case 'hr':
                    block = this.editor.dataModel.createBlock('divider');
                    break;
                case 'p':
                default:
                    block = this.editor.dataModel.createBlock('paragraph', child.textContent);
                    break;
            }
            
            if (block) {
                blocks.push(block);
            }
        }
        
        // If no children, treat as paragraph
        if (blocks.length === 0 && element.textContent) {
            blocks.push(this.editor.dataModel.createBlock('paragraph', element.textContent));
        }
        
        return blocks;
    }
    
    handleFilePaste(files) {
        for (const file of files) {
            if (file.type.startsWith('image/')) {
                this.handleImagePaste(file);
            }
        }
    }
    
    handleImagePaste(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            
            // Create image block
            const imageBlock = this.editor.dataModel.createBlock('image', dataUrl);
            imageBlock.attributes = { 
                alt: file.name,
                size: file.size,
                type: file.type 
            };
            
            // Insert after current block
            const selection = this.editor.selectionManager.getSelection();
            if (selection) {
                const currentIndex = this.editor.dataModel.findBlockIndex(selection.blockId);
                this.editor.dataModel.insertBlock(imageBlock, currentIndex + 1);
                this.editor.render();
            }
        };
        
        reader.readAsDataURL(file);
    }
    
    handleCut(e) {
        const selection = this.editor.selectionManager.getSelection();
        if (!selection || selection.isCollapsed) return;
        
        // Copy to clipboard
        this.copy();
        
        // Delete selected content
        document.execCommand('delete');
    }
    
    handleCopy(e) {
        const selection = this.editor.selectionManager.getSelection();
        if (!selection || selection.isCollapsed) return;
        
        const text = selection.text;
        
        // Store in internal clipboard
        this.clipboard = {
            text: text,
            html: this.selectionToHtml(selection)
        };
        
        // Copy to system clipboard if event provided
        if (e && e.clipboardData) {
            e.clipboardData.setData('text/plain', text);
            e.clipboardData.setData('text/html', this.clipboard.html);
            e.preventDefault();
        }
    }
    
    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        
        // Add visual feedback
        const editorContent = this.editor.contentElement || this.editor.container.querySelector('.editor-content');
        if (editorContent) {
            editorContent.classList.add('dragover');
            editorContent.style.outline = '2px dashed var(--theme-accent)';
            editorContent.style.outlineOffset = '-10px';
            editorContent.style.background = 'var(--theme-surface)';
        }
    }
    
    handleDrop(e) {
        e.preventDefault();
        
        // Remove visual feedback
        const editorContent = this.editor.contentElement || this.editor.container.querySelector('.editor-content');
        if (editorContent) {
            editorContent.classList.remove('dragover');
            editorContent.style.outline = '';
            editorContent.style.outlineOffset = '';
            editorContent.style.background = '';
        }
        
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            // Get drop position
            const dropY = e.clientY;
            const blocks = this.editor.container.querySelectorAll('.editor-block');
            let insertIndex = blocks.length;
            
            // Find the block to insert after
            for (let i = 0; i < blocks.length; i++) {
                const rect = blocks[i].getBoundingClientRect();
                if (dropY < rect.top + rect.height / 2) {
                    insertIndex = i;
                    break;
                }
            }
            
            this.handleFileDrop(files, insertIndex);
            return;
        }
        
        // Handle text/html drop
        const html = e.dataTransfer.getData('text/html');
        if (html) {
            this.handleHtmlPaste(html);
            return;
        }
        
        // Handle plain text
        const text = e.dataTransfer.getData('text/plain');
        if (text) {
            this.handleTextPaste(text);
        }
    }
    
    handleFileDrop(files, insertIndex) {
        Array.from(files).forEach((file, i) => {
            if (file.type.startsWith('image/')) {
                this.handleImageDrop(file, insertIndex + i);
            } else if (file.type === 'text/plain' || file.type === 'text/markdown') {
                this.handleTextFileDrop(file, insertIndex + i);
            }
        });
    }
    
    handleImageDrop(file, insertIndex) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            
            // Create image block
            const imageBlock = this.editor.dataModel.createBlock('image', dataUrl);
            imageBlock.attributes = { 
                alt: file.name,
                size: this.formatFileSize(file.size),
                type: file.type,
                caption: ''
            };
            
            // Insert at specific index
            this.editor.dataModel.insertBlock(imageBlock, insertIndex);
            
            // Re-render
            this.editor.render();
            
            // Show notification
            this.showNotification(`Image "${file.name}" uploaded`);
        };
        
        reader.readAsDataURL(file);
    }
    
    handleTextFileDrop(file, insertIndex) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const text = e.target.result;
            const lines = text.split('\n');
            
            // Create blocks for each line
            lines.forEach((line, i) => {
                if (line.trim()) {
                    const block = this.editor.dataModel.createBlock('paragraph', line);
                    this.editor.dataModel.insertBlock(block, insertIndex + i);
                }
            });
            
            // Re-render
            this.editor.render();
            
            // Show notification
            this.showNotification(`Text file "${file.name}" imported`);
        };
        
        reader.readAsText(file);
    }
    
    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
    
    showNotification(message) {
        if (this.editor.config.onNotification) {
            this.editor.config.onNotification(message);
        } else {
            console.log(message);
        }
    }
    
    // Formatting Methods
    toggleFormat(format) {
        const selection = this.editor.selectionManager.getSelection();
        if (!selection || selection.isCollapsed) return;
        
        const blockId = selection.blockId;
        const block = this.editor.dataModel.getBlock(blockId);
        if (!block) return;
        
        // Apply inline style
        const startOffset = Math.min(selection.anchorOffset, selection.focusOffset);
        const endOffset = Math.max(selection.anchorOffset, selection.focusOffset);
        const length = endOffset - startOffset;
        
        this.editor.dataModel.applyInlineStyle(blockId, startOffset, length, format);
        
        // Update rendering
        this.editor.renderer.update(blockId, block);
    }
    
    transformBlock(type) {
        const selection = this.editor.selectionManager.getSelection();
        if (!selection) return;
        
        const blockId = selection.blockId;
        this.editor.dataModel.updateBlock(blockId, { type });
        
        // Re-render block
        const block = this.editor.dataModel.getBlock(blockId);
        const element = this.editor.renderer.render(block);
        const oldElement = document.querySelector(`[data-block-id="${blockId}"]`);
        
        if (oldElement && element) {
            oldElement.replaceWith(element);
            this.editor.renderer.focusBlock(element);
        }
    }
    
    insertLink() {
        const selection = this.editor.selectionManager.getSelection();
        if (!selection || selection.isCollapsed) return;
        
        const url = prompt('Enter URL:');
        if (!url) return;
        
        const blockId = selection.blockId;
        const startOffset = Math.min(selection.anchorOffset, selection.focusOffset);
        const endOffset = Math.max(selection.anchorOffset, selection.focusOffset);
        const length = endOffset - startOffset;
        
        this.editor.dataModel.applyInlineStyle(blockId, startOffset, length, {
            style: 'link',
            href: url
        });
        
        // Update rendering
        const block = this.editor.dataModel.getBlock(blockId);
        this.editor.renderer.update(blockId, block);
    }
    
    selectAll() {
        this.editor.selectionManager.selectAll();
    }
    
    copy() {
        this.handleCopy();
    }
    
    cut() {
        this.handleCut();
    }
    
    paste() {
        if (this.clipboard) {
            this.handleTextPaste(this.clipboard.text);
        }
    }
    
    // Utility Methods
    insertTextAtCursor(text) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        const range = selection.getRangeAt(0);
        range.deleteContents();
        
        const textNode = document.createTextNode(text);
        range.insertNode(textNode);
        
        // Move cursor after inserted text
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Trigger input event to update data model
        const event = new Event('input', { bubbles: true });
        range.commonAncestorContainer.dispatchEvent(event);
    }
    
    selectionToHtml(selection) {
        // Convert selection to HTML for clipboard
        const blockId = selection.blockId;
        const block = this.editor.dataModel.getBlock(blockId);
        
        if (!block) return selection.text;
        
        // Generate HTML based on block type
        switch (block.type) {
            case 'heading1':
                return `<h1>${selection.text}</h1>`;
            case 'heading2':
                return `<h2>${selection.text}</h2>`;
            case 'heading3':
                return `<h3>${selection.text}</h3>`;
            case 'heading4':
                return `<h4>${selection.text}</h4>`;
            case 'quote':
                return `<blockquote>${selection.text}</blockquote>`;
            case 'codeblock':
                return `<pre><code>${selection.text}</code></pre>`;
            default:
                return `<p>${selection.text}</p>`;
        }
    }
    
    destroy() {
        this.shortcuts.clear();
    }
}