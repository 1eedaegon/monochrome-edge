/**
 * Floating Toolbar Component
 * Shows formatting options when text is selected
 */

export class FloatingToolbarCore {
    constructor(editor) {
        this.editor = editor;
        this.element = null;
        this.visible = false;
        this.buttons = [
            { command: 'bold', icon: 'B', title: 'Bold (Ctrl+B)' },
            { command: 'italic', icon: 'I', title: 'Italic (Ctrl+I)' },
            { command: 'strikethrough', icon: 'S', title: 'Strikethrough' },
            { command: 'code', icon: '&lt;&gt;', title: 'Code' },
            { command: 'link', icon: '🔗', title: 'Link (Ctrl+K)' },
            { type: 'divider' },
            { command: 'heading1', icon: 'H1', title: 'Heading 1' },
            { command: 'heading2', icon: 'H2', title: 'Heading 2' },
            { command: 'heading3', icon: 'H3', title: 'Heading 3' }
        ];
        
        this.create();
        this.attachListeners();
    }
    
    create() {
        this.element = document.createElement('div');
        this.element.className = 'floating-toolbar';
        this.element.style.cssText = `
            position: fixed;
            background: var(--theme-surface, #fff);
            border: 1px solid var(--theme-border, #e0e0e0);
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            padding: 4px;
            display: none;
            z-index: 1000;
            gap: 2px;
            align-items: center;
        `;
        
        this.renderButtons();
        document.body.appendChild(this.element);
    }
    
    renderButtons() {
        this.element.innerHTML = '';
        
        this.buttons.forEach(button => {
            if (button.type === 'divider') {
                const divider = document.createElement('div');
                divider.style.cssText = `
                    width: 1px;
                    height: 20px;
                    background: var(--theme-border, #e0e0e0);
                    margin: 0 4px;
                `;
                this.element.appendChild(divider);
            } else {
                const btn = document.createElement('button');
                btn.innerHTML = button.icon;
                btn.title = button.title;
                btn.setAttribute('data-command', button.command);
                btn.style.cssText = `
                    width: 28px;
                    height: 28px;
                    border: none;
                    background: transparent;
                    color: var(--theme-text-secondary, #666);
                    border-radius: 4px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    font-size: 12px;
                    transition: all 0.2s;
                `;
                
                btn.onmouseover = () => {
                    btn.style.background = 'var(--theme-bg, #f5f5f5)';
                    btn.style.color = 'var(--theme-text-primary, #000)';
                };
                
                btn.onmouseout = () => {
                    btn.style.background = 'transparent';
                    btn.style.color = 'var(--theme-text-secondary, #666)';
                };
                
                btn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.executeCommand(button.command);
                };
                
                this.element.appendChild(btn);
            }
        });
    }
    
    attachListeners() {
        // Hide on click outside
        document.addEventListener('mousedown', (e) => {
            if (!this.element.contains(e.target)) {
                this.hide();
            }
        });
        
        // Hide on scroll
        document.addEventListener('scroll', () => {
            if (this.visible) {
                this.hide();
            }
        }, true);
        
        // Update position on selection change
        document.addEventListener('selectionchange', () => {
            if (this.shouldShow()) {
                this.update();
            } else {
                this.hide();
            }
        });
    }
    
    shouldShow() {
        const selection = window.getSelection();
        
        if (!selection || selection.isCollapsed || !selection.toString().trim()) {
            return false;
        }
        
        // Check if selection is within editor
        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;
        const editorElement = this.editor.container;
        
        if (!editorElement) return false;
        
        let node = container.nodeType === Node.TEXT_NODE ? container.parentElement : container;
        
        while (node && node !== document.body) {
            if (node === editorElement) {
                return true;
            }
            node = node.parentElement;
        }
        
        return false;
    }
    
    update() {
        if (!this.shouldShow()) {
            this.hide();
            return;
        }
        
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        // Show and position toolbar
        this.show(rect);
    }
    
    show(rect) {
        this.element.style.display = 'flex';
        
        // Calculate position
        const toolbarWidth = this.element.offsetWidth;
        const toolbarHeight = this.element.offsetHeight;
        
        let top = rect.top - toolbarHeight - 10;
        let left = rect.left + (rect.width / 2) - (toolbarWidth / 2);
        
        // Keep within viewport
        if (top < 10) {
            top = rect.bottom + 10;
        }
        
        if (left < 10) {
            left = 10;
        } else if (left + toolbarWidth > window.innerWidth - 10) {
            left = window.innerWidth - toolbarWidth - 10;
        }
        
        this.element.style.top = `${top}px`;
        this.element.style.left = `${left}px`;
        
        // Add active class with animation
        setTimeout(() => {
            this.element.classList.add('active');
        }, 10);
        
        this.visible = true;
    }
    
    hide() {
        this.element.style.display = 'none';
        this.element.classList.remove('active');
        this.visible = false;
    }
    
    executeCommand(command) {
        // Save selection before executing command
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        
        // Execute command through editor
        this.editor.executeCommand(command);
        
        // Hide toolbar after command
        setTimeout(() => {
            this.hide();
        }, 100);
    }
    
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}