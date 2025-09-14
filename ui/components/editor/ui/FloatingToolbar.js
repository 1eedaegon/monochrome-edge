/**
 * Floating Toolbar Component
 * Shows when text is selected
 */

export class FloatingToolbar {
    constructor(editor) {
        this.editor = editor;
        this.element = null;
        this.create();
    }
    
    create() {
        this.element = document.createElement('div');
        this.element.className = 'floating-toolbar';
        this.element.innerHTML = `
            <button data-command="bold" title="Bold">B</button>
            <button data-command="italic" title="Italic">I</button>
            <button data-command="strikethrough" title="Strikethrough">S</button>
            <button data-command="code" title="Code">&lt;&gt;</button>
            <div class="toolbar-divider"></div>
            <button data-command="link" title="Link">🔗</button>
            <button data-command="heading1" title="H1">H1</button>
            <button data-command="heading2" title="H2">H2</button>
            <button data-command="heading3" title="H3">H3</button>
        `;
        
        document.body.appendChild(this.element);
        
        // Event listeners
        this.element.addEventListener('click', (e) => {
            const button = e.target.closest('[data-command]');
            if (button) {
                e.preventDefault();
                e.stopPropagation();
                this.editor.executeCommand(button.dataset.command);
                this.hide();
            }
        });
    }
    
    update() {
        const selection = window.getSelection();
        
        if (selection.isCollapsed || !selection.toString().trim()) {
            this.hide();
            return;
        }
        
        // Check if selection is within editor
        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;
        const editorElement = this.editor.editorElement;
        
        const isInEditor = editorElement.contains(
            container.nodeType === Node.TEXT_NODE ? container.parentElement : container
        );
        
        if (!isInEditor) {
            this.hide();
            return;
        }
        
        // Position toolbar
        const rect = range.getBoundingClientRect();
        this.show(rect);
    }
    
    show(rect) {
        this.element.style.display = 'flex';
        this.element.style.top = `${rect.top - 50}px`;
        this.element.style.left = `${rect.left + (rect.width / 2) - 100}px`;
        this.element.classList.add('active');
    }
    
    hide() {
        this.element.style.display = 'none';
        this.element.classList.remove('active');
    }
    
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}