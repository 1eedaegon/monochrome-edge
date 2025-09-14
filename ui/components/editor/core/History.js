/**
 * History Manager
 * Implements undo/redo functionality
 */

export class History {
    constructor(editor, maxSize = 100) {
        this.editor = editor;
        this.maxSize = maxSize;
        this.stack = [];
        this.currentIndex = -1;
        this.isRestoring = false;
    }
    
    save() {
        if (this.isRestoring) return;
        
        // Get current state
        const state = {
            blocks: JSON.parse(JSON.stringify(this.editor.document.blocks)),
            timestamp: Date.now()
        };
        
        // Remove any states after current index
        this.stack = this.stack.slice(0, this.currentIndex + 1);
        
        // Add new state
        this.stack.push(state);
        this.currentIndex++;
        
        // Limit stack size
        if (this.stack.length > this.maxSize) {
            this.stack.shift();
            this.currentIndex--;
        }
    }
    
    undo() {
        if (!this.canUndo()) return false;
        
        this.currentIndex--;
        this.restore(this.stack[this.currentIndex]);
        return true;
    }
    
    redo() {
        if (!this.canRedo()) return false;
        
        this.currentIndex++;
        this.restore(this.stack[this.currentIndex]);
        return true;
    }
    
    canUndo() {
        return this.currentIndex > 0;
    }
    
    canRedo() {
        return this.currentIndex < this.stack.length - 1;
    }
    
    restore(state) {
        this.isRestoring = true;
        
        // Update document
        this.editor.document.blocks = JSON.parse(JSON.stringify(state.blocks));
        
        // Re-render
        this.editor.renderDocument();
        
        this.isRestoring = false;
    }
    
    clear() {
        this.stack = [];
        this.currentIndex = -1;
    }
    
    getSize() {
        return this.stack.length;
    }
}