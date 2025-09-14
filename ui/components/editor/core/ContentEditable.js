/**
 * ContentEditable Wrapper
 * Handles the contenteditable element and its events
 */

export class ContentEditable {
    constructor(element, options = {}) {
        this.element = element;
        this.options = options;
        
        // Make contenteditable
        this.element.contentEditable = 'true';
        this.element.spellcheck = options.spellcheck || false;
        this.element.dataset.placeholder = options.placeholder || '';
        
        // Add class
        this.element.classList.add('contenteditable-wrapper');
        
        // Attach event listeners
        this.attachListeners();
    }
    
    attachListeners() {
        // Input event
        this.element.addEventListener('input', (e) => {
            if (this.options.onInput) {
                this.options.onInput(e);
            }
            
            // Handle placeholder
            this.updatePlaceholder();
        });
        
        // Keydown event
        this.element.addEventListener('keydown', (e) => {
            if (this.options.onKeydown) {
                this.options.onKeydown(e);
            }
        });
        
        // Paste event
        this.element.addEventListener('paste', (e) => {
            if (this.options.onPaste) {
                this.options.onPaste(e);
            }
        });
        
        // Drop event
        if (this.options.onDrop) {
            this.element.addEventListener('dragover', (e) => {
                e.preventDefault();
                this.element.classList.add('dragover');
            });
            
            this.element.addEventListener('dragleave', (e) => {
                e.preventDefault();
                this.element.classList.remove('dragover');
            });
            
            this.element.addEventListener('drop', (e) => {
                e.preventDefault();
                this.element.classList.remove('dragover');
                this.options.onDrop(e);
            });
        }
        
        // Focus/Blur
        this.element.addEventListener('focus', () => {
            this.element.classList.add('focused');
        });
        
        this.element.addEventListener('blur', () => {
            this.element.classList.remove('focused');
        });
    }
    
    updatePlaceholder() {
        // Show/hide placeholder based on content
        if (this.element.textContent.trim() === '') {
            this.element.classList.add('empty');
        } else {
            this.element.classList.remove('empty');
        }
    }
    
    focus() {
        this.element.focus();
    }
    
    blur() {
        this.element.blur();
    }
    
    getContent() {
        return this.element.innerHTML;
    }
    
    setContent(html) {
        this.element.innerHTML = html;
        this.updatePlaceholder();
    }
    
    clear() {
        this.element.innerHTML = '';
        this.updatePlaceholder();
    }
    
    destroy() {
        this.element.contentEditable = 'false';
        this.element.classList.remove('contenteditable-wrapper', 'focused', 'empty');
    }
}

export default ContentEditable;