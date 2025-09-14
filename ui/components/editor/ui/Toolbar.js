/**
 * Main Toolbar Component
 */

export class Toolbar {
    constructor(container, editor) {
        this.container = container;
        this.editor = editor;
        this.render();
    }
    
    render() {
        this.container.innerHTML = `
            <div class="editor-toolbar">
                <div class="toolbar-group">
                    <button data-command="heading1" title="Heading 1">H1</button>
                    <button data-command="heading2" title="Heading 2">H2</button>
                    <button data-command="heading3" title="Heading 3">H3</button>
                    <button data-command="heading4" title="Heading 4">H4</button>
                </div>
                
                <div class="toolbar-divider"></div>
                
                <div class="toolbar-group">
                    <button data-command="bold" title="Bold (Ctrl+B)">B</button>
                    <button data-command="italic" title="Italic (Ctrl+I)">I</button>
                    <button data-command="strikethrough" title="Strikethrough">S</button>
                    <button data-command="code" title="Code">&lt;&gt;</button>
                </div>
                
                <div class="toolbar-divider"></div>
                
                <div class="toolbar-group">
                    <button data-command="bullet" title="Bullet List">•</button>
                    <button data-command="number" title="Numbered List">1.</button>
                    <button data-command="checkbox" title="Checkbox">☐</button>
                </div>
                
                <div class="toolbar-divider"></div>
                
                <div class="toolbar-group">
                    <button data-command="quote" title="Quote">"</button>
                    <button data-command="codeblock" title="Code Block">{}</button>
                    <button data-command="link" title="Link (Ctrl+K)">🔗</button>
                    <button data-command="image" title="Image">📷</button>
                    <button data-command="table" title="Table">⊞</button>
                </div>
                
                <div class="toolbar-spacer"></div>
                
                <div class="toolbar-group">
                    <button data-command="undo" title="Undo (Ctrl+Z)">↶</button>
                    <button data-command="redo" title="Redo (Ctrl+Y)">↷</button>
                </div>
            </div>
        `;
        
        // Attach event listeners
        this.container.addEventListener('click', (e) => {
            const button = e.target.closest('[data-command]');
            if (button) {
                const command = button.dataset.command;
                this.editor.executeCommand(command);
            }
        });
    }
    
    destroy() {
        this.container.innerHTML = '';
    }
}