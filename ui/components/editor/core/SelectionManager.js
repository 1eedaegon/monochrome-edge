/**
 * Selection and Cursor Management
 * Handles text selection, cursor position, and range operations
 */

export class SelectionManager {
    constructor(editor) {
        this.editor = editor;
        this.selection = null;
        this.savedRanges = [];
        this.isSelecting = false;
        
        this.init();
    }
    
    init() {
        // Listen for selection changes
        document.addEventListener('selectionchange', this.handleSelectionChange.bind(this));
        
        // Mouse events for selection
        this.editor.container.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.editor.container.addEventListener('mouseup', this.handleMouseUp.bind(this));
        
        // Keyboard navigation
        this.editor.container.addEventListener('keydown', this.handleKeyDown.bind(this));
    }
    
    handleSelectionChange() {
        const selection = window.getSelection();
        
        if (!selection.rangeCount) {
            this.selection = null;
            return;
        }
        
        const range = selection.getRangeAt(0);
        
        // Check if selection is within editor
        if (!this.isWithinEditor(range)) {
            this.selection = null;
            return;
        }
        
        // Update selection state
        this.selection = {
            range: range,
            text: selection.toString(),
            isCollapsed: selection.isCollapsed,
            anchorNode: selection.anchorNode,
            anchorOffset: selection.anchorOffset,
            focusNode: selection.focusNode,
            focusOffset: selection.focusOffset,
            blockId: this.getBlockIdFromNode(selection.anchorNode)
        };
        
        // Emit selection change event
        this.editor.emit('selectionChange', this.selection);
    }
    
    handleMouseDown(e) {
        this.isSelecting = true;
    }
    
    handleMouseUp(e) {
        this.isSelecting = false;
        
        // Update floating toolbar if text is selected
        if (this.selection && !this.selection.isCollapsed) {
            this.editor.floatingToolbar?.update();
        }
    }
    
    handleKeyDown(e) {
        // Handle cursor movement with arrow keys
        if (e.key.startsWith('Arrow')) {
            this.handleArrowKey(e);
        }
        
        // Handle selection with Shift + Arrow
        if (e.shiftKey && e.key.startsWith('Arrow')) {
            this.handleSelectionKey(e);
        }
        
        // Ctrl/Cmd + A to select all
        if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
            this.selectAll();
            e.preventDefault();
        }
    }
    
    handleArrowKey(e) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        const range = selection.getRangeAt(0);
        const blockElement = this.getBlockElement(range.startContainer);
        if (!blockElement) return;
        
        switch (e.key) {
            case 'ArrowUp':
                if (this.isAtBlockStart(range, blockElement)) {
                    this.moveToPreviousBlock(blockElement);
                    e.preventDefault();
                }
                break;
                
            case 'ArrowDown':
                if (this.isAtBlockEnd(range, blockElement)) {
                    this.moveToNextBlock(blockElement);
                    e.preventDefault();
                }
                break;
                
            case 'ArrowLeft':
                if (e.ctrlKey || e.metaKey) {
                    this.moveWordLeft();
                    e.preventDefault();
                }
                break;
                
            case 'ArrowRight':
                if (e.ctrlKey || e.metaKey) {
                    this.moveWordRight();
                    e.preventDefault();
                }
                break;
        }
    }
    
    handleSelectionKey(e) {
        // Extended selection logic
        e.preventDefault();
        
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        const range = selection.getRangeAt(0);
        
        switch (e.key) {
            case 'ArrowLeft':
                this.extendSelectionLeft(e.ctrlKey || e.metaKey);
                break;
            case 'ArrowRight':
                this.extendSelectionRight(e.ctrlKey || e.metaKey);
                break;
            case 'ArrowUp':
                this.extendSelectionUp();
                break;
            case 'ArrowDown':
                this.extendSelectionDown();
                break;
        }
    }
    
    // Selection Methods
    setSelection(blockId, start, end = start) {
        const blockElement = document.querySelector(`[data-block-id="${blockId}"]`);
        if (!blockElement) return false;
        
        const textNode = this.getTextNode(blockElement);
        if (!textNode) return false;
        
        const range = document.createRange();
        const selection = window.getSelection();
        
        try {
            range.setStart(textNode, Math.min(start, textNode.length));
            range.setEnd(textNode, Math.min(end, textNode.length));
            
            selection.removeAllRanges();
            selection.addRange(range);
            
            return true;
        } catch (e) {
            console.error('Failed to set selection:', e);
            return false;
        }
    }
    
    getSelection() {
        return this.selection;
    }
    
    getSelectedText() {
        return this.selection?.text || '';
    }
    
    saveSelection() {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            this.savedRanges.push(selection.getRangeAt(0).cloneRange());
        }
    }
    
    restoreSelection() {
        const range = this.savedRanges.pop();
        if (range) {
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
    
    clearSelection() {
        window.getSelection().removeAllRanges();
        this.selection = null;
    }
    
    selectAll() {
        const editorContent = this.editor.container.querySelector('.editor-content');
        if (!editorContent) return;
        
        const range = document.createRange();
        range.selectNodeContents(editorContent);
        
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }
    
    selectBlock(blockId) {
        const blockElement = document.querySelector(`[data-block-id="${blockId}"]`);
        if (!blockElement) return false;
        
        const range = document.createRange();
        range.selectNodeContents(blockElement);
        
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        
        return true;
    }
    
    // Cursor Movement
    moveToPreviousBlock(currentBlock) {
        const prevBlock = currentBlock.previousElementSibling;
        if (!prevBlock || !prevBlock.hasAttribute('data-block-id')) return;
        
        const textNode = this.getTextNode(prevBlock);
        if (!textNode) return;
        
        const range = document.createRange();
        range.setStart(textNode, textNode.length);
        range.setEnd(textNode, textNode.length);
        
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }
    
    moveToNextBlock(currentBlock) {
        const nextBlock = currentBlock.nextElementSibling;
        if (!nextBlock || !nextBlock.hasAttribute('data-block-id')) return;
        
        const textNode = this.getTextNode(nextBlock);
        if (!textNode) return;
        
        const range = document.createRange();
        range.setStart(textNode, 0);
        range.setEnd(textNode, 0);
        
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }
    
    moveWordLeft() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        const range = selection.getRangeAt(0);
        const text = range.startContainer.textContent;
        const offset = range.startOffset;
        
        // Find previous word boundary
        let newOffset = offset - 1;
        while (newOffset > 0 && /\s/.test(text[newOffset])) {
            newOffset--;
        }
        while (newOffset > 0 && !/\s/.test(text[newOffset - 1])) {
            newOffset--;
        }
        
        range.setStart(range.startContainer, newOffset);
        range.setEnd(range.startContainer, newOffset);
        selection.removeAllRanges();
        selection.addRange(range);
    }
    
    moveWordRight() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        const range = selection.getRangeAt(0);
        const text = range.startContainer.textContent;
        const offset = range.startOffset;
        
        // Find next word boundary
        let newOffset = offset;
        while (newOffset < text.length && !/\s/.test(text[newOffset])) {
            newOffset++;
        }
        while (newOffset < text.length && /\s/.test(text[newOffset])) {
            newOffset++;
        }
        
        range.setStart(range.startContainer, newOffset);
        range.setEnd(range.startContainer, newOffset);
        selection.removeAllRanges();
        selection.addRange(range);
    }
    
    // Extended Selection
    extendSelectionLeft(byWord = false) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        const range = selection.getRangeAt(0);
        const text = range.startContainer.textContent;
        let newOffset = range.startOffset;
        
        if (byWord) {
            // Move by word
            newOffset--;
            while (newOffset > 0 && /\s/.test(text[newOffset])) {
                newOffset--;
            }
            while (newOffset > 0 && !/\s/.test(text[newOffset - 1])) {
                newOffset--;
            }
        } else {
            // Move by character
            newOffset = Math.max(0, newOffset - 1);
        }
        
        range.setStart(range.startContainer, newOffset);
        selection.removeAllRanges();
        selection.addRange(range);
    }
    
    extendSelectionRight(byWord = false) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        const range = selection.getRangeAt(0);
        const text = range.endContainer.textContent;
        let newOffset = range.endOffset;
        
        if (byWord) {
            // Move by word
            while (newOffset < text.length && !/\s/.test(text[newOffset])) {
                newOffset++;
            }
            while (newOffset < text.length && /\s/.test(text[newOffset])) {
                newOffset++;
            }
        } else {
            // Move by character
            newOffset = Math.min(text.length, newOffset + 1);
        }
        
        range.setEnd(range.endContainer, newOffset);
        selection.removeAllRanges();
        selection.addRange(range);
    }
    
    extendSelectionUp() {
        // Extend selection to previous line
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        selection.modify('extend', 'backward', 'line');
    }
    
    extendSelectionDown() {
        // Extend selection to next line
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        selection.modify('extend', 'forward', 'line');
    }
    
    // Utility Methods
    isWithinEditor(range) {
        const editorContent = this.editor.container.querySelector('.editor-content');
        if (!editorContent) return false;
        
        return editorContent.contains(range.commonAncestorContainer);
    }
    
    getBlockElement(node) {
        while (node && node !== this.editor.container) {
            if (node.nodeType === Node.ELEMENT_NODE && node.hasAttribute('data-block-id')) {
                return node;
            }
            node = node.parentNode;
        }
        return null;
    }
    
    getBlockIdFromNode(node) {
        const blockElement = this.getBlockElement(node);
        return blockElement?.getAttribute('data-block-id') || null;
    }
    
    getTextNode(element) {
        // Find first text node in element
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        return walker.nextNode();
    }
    
    isAtBlockStart(range, blockElement) {
        if (!range.collapsed) return false;
        
        const textNode = this.getTextNode(blockElement);
        return textNode === range.startContainer && range.startOffset === 0;
    }
    
    isAtBlockEnd(range, blockElement) {
        if (!range.collapsed) return false;
        
        const textNode = this.getTextNode(blockElement);
        return textNode === range.endContainer && range.endOffset === textNode.length;
    }
    
    // Range Operations
    getRangeRect() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return null;
        
        const range = selection.getRangeAt(0);
        return range.getBoundingClientRect();
    }
    
    insertAtCursor(content) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return false;
        
        const range = selection.getRangeAt(0);
        range.deleteContents();
        
        if (typeof content === 'string') {
            const textNode = document.createTextNode(content);
            range.insertNode(textNode);
            range.setStartAfter(textNode);
            range.setEndAfter(textNode);
        } else {
            range.insertNode(content);
            range.setStartAfter(content);
            range.setEndAfter(content);
        }
        
        selection.removeAllRanges();
        selection.addRange(range);
        
        return true;
    }
    
    replaceSelection(content) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return false;
        
        const range = selection.getRangeAt(0);
        range.deleteContents();
        
        if (typeof content === 'string') {
            const textNode = document.createTextNode(content);
            range.insertNode(textNode);
        } else {
            range.insertNode(content);
        }
        
        return true;
    }
    
    destroy() {
        document.removeEventListener('selectionchange', this.handleSelectionChange);
    }
}