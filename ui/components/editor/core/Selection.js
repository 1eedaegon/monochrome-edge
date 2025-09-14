/**
 * Selection Manager
 * Handles text selection and range operations
 */

export class SelectionManager {
    constructor(editor) {
        this.editor = editor;
        this.currentRange = null;
        this.savedRanges = new Map();
    }
    
    update() {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            this.currentRange = selection.getRangeAt(0);
        }
    }
    
    save(id = 'default') {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            this.savedRanges.set(id, selection.getRangeAt(0).cloneRange());
        }
    }
    
    restore(id = 'default') {
        const range = this.savedRanges.get(id);
        if (range) {
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
    
    getSelectedText() {
        const selection = window.getSelection();
        return selection.toString();
    }
    
    getSelectedBlock() {
        if (!this.currentRange) return null;
        
        const element = this.currentRange.commonAncestorContainer;
        const blockElement = element.nodeType === Node.TEXT_NODE
            ? element.parentElement.closest('[data-block-id]')
            : element.closest('[data-block-id]');
            
        return blockElement;
    }
    
    isCollapsed() {
        const selection = window.getSelection();
        return selection.isCollapsed;
    }
    
    collapseToEnd() {
        const selection = window.getSelection();
        selection.collapseToEnd();
    }
    
    selectBlock(blockElement) {
        const range = document.createRange();
        range.selectNodeContents(blockElement);
        
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }
    
    setCursorPosition(element, position = 'end') {
        const range = document.createRange();
        const selection = window.getSelection();
        
        if (position === 'end') {
            range.selectNodeContents(element);
            range.collapse(false);
        } else if (position === 'start') {
            range.setStart(element, 0);
            range.setEnd(element, 0);
        } else if (typeof position === 'number') {
            const textNode = element.firstChild || element;
            const offset = Math.min(position, textNode.textContent?.length || 0);
            range.setStart(textNode, offset);
            range.setEnd(textNode, offset);
        }
        
        selection.removeAllRanges();
        selection.addRange(range);
    }
    
    wrapSelection(tagName, attributes = {}) {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return;
        
        const range = selection.getRangeAt(0);
        const wrapper = document.createElement(tagName);
        
        // Set attributes
        Object.entries(attributes).forEach(([key, value]) => {
            wrapper.setAttribute(key, value);
        });
        
        try {
            range.surroundContents(wrapper);
        } catch (e) {
            // If surroundContents fails, use alternative method
            wrapper.appendChild(range.extractContents());
            range.insertNode(wrapper);
        }
        
        // Restore selection
        range.selectNodeContents(wrapper);
        selection.removeAllRanges();
        selection.addRange(range);
        
        return wrapper;
    }
    
    unwrapSelection() {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return;
        
        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;
        
        // Find wrapped element
        const wrapped = container.nodeType === Node.TEXT_NODE
            ? container.parentElement
            : container;
            
        if (wrapped && wrapped.parentElement) {
            // Extract contents
            const fragment = document.createDocumentFragment();
            while (wrapped.firstChild) {
                fragment.appendChild(wrapped.firstChild);
            }
            
            // Replace wrapped element with contents
            wrapped.parentElement.replaceChild(fragment, wrapped);
        }
    }
    
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
    
    insertText(text) {
        document.execCommand('insertText', false, text);
    }
}

export default SelectionManager;