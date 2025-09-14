/**
 * Slash Menu Component
 * Command palette that appears when typing '/'
 */

export class SlashMenuCore {
    constructor(editor) {
        this.editor = editor;
        this.element = null;
        this.visible = false;
        this.selectedIndex = 0;
        this.filteredCommands = [];
        this.currentQuery = '';
        this.triggerElement = null;
        
        this.commands = [
            { id: 'heading1', icon: 'H1', name: 'Heading 1', description: 'Large heading', shortcut: '#' },
            { id: 'heading2', icon: 'H2', name: 'Heading 2', description: 'Medium heading', shortcut: '##' },
            { id: 'heading3', icon: 'H3', name: 'Heading 3', description: 'Small heading', shortcut: '###' },
            { id: 'quote', icon: '"', name: 'Quote', description: 'Blockquote', shortcut: '>' },
            { id: 'bullet', icon: '•', name: 'Bullet List', description: 'Unordered list', shortcut: '-' },
            { id: 'number', icon: '1.', name: 'Numbered List', description: 'Ordered list', shortcut: '1.' },
            { id: 'checkbox', icon: '☐', name: 'Checkbox', description: 'Task list', shortcut: '[]' },
            { id: 'codeblock', icon: '{}', name: 'Code Block', description: 'Code snippet', shortcut: '```' },
            { id: 'table', icon: '⊞', name: 'Table', description: 'Insert table' },
            { id: 'image', icon: '📷', name: 'Image', description: 'Upload image' },
            { id: 'divider', icon: '—', name: 'Divider', description: 'Horizontal line', shortcut: '---' },
            { id: 'math', icon: '∑', name: 'Math', description: 'LaTeX expression', shortcut: '$$' }
        ];
        
        this.create();
        this.attachListeners();
    }
    
    create() {
        this.element = document.createElement('div');
        this.element.className = 'slash-menu';
        this.element.style.cssText = `
            position: fixed;
            background: var(--theme-surface, #fff);
            border: 1px solid var(--theme-border, #e0e0e0);
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            padding: 8px;
            min-width: 250px;
            max-width: 350px;
            max-height: 400px;
            overflow-y: auto;
            z-index: 1001;
            display: none;
        `;
        
        document.body.appendChild(this.element);
    }
    
    attachListeners() {
        // Handle keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.visible) return;
            
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    this.selectNext();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.selectPrevious();
                    break;
                case 'Enter':
                    e.preventDefault();
                    this.executeSelected();
                    break;
                case 'Escape':
                    e.preventDefault();
                    this.hide();
                    break;
                case 'Backspace':
                    if (this.currentQuery === '') {
                        this.hide();
                    }
                    break;
            }
        });
        
        // Click handler
        this.element.addEventListener('click', (e) => {
            const item = e.target.closest('.slash-item');
            if (item) {
                const index = parseInt(item.dataset.index);
                this.selectedIndex = index;
                this.executeSelected();
            }
        });
        
        // Input handler for filtering
        document.addEventListener('input', (e) => {
            if (!this.visible) return;
            
            const selection = window.getSelection();
            if (!selection.rangeCount) return;
            
            const range = selection.getRangeAt(0);
            const textNode = range.startContainer;
            
            if (textNode.nodeType === Node.TEXT_NODE) {
                const text = textNode.textContent;
                const cursorPos = range.startOffset;
                const beforeCursor = text.substring(0, cursorPos);
                
                // Check if we're still in slash command mode
                const slashMatch = beforeCursor.match(/\/(\w*)$/);
                if (slashMatch) {
                    this.currentQuery = slashMatch[1];
                    this.filter(this.currentQuery);
                } else if (this.visible) {
                    this.hide();
                }
            }
        });
    }
    
    show(element) {
        this.triggerElement = element;
        this.visible = true;
        this.selectedIndex = 0;
        this.currentQuery = '';
        this.filteredCommands = this.commands;
        
        this.render();
        
        // Position menu below the current line
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        this.element.style.display = 'block';
        this.element.style.top = `${rect.bottom + 5}px`;
        this.element.style.left = `${rect.left}px`;
        
        // Keep within viewport
        const menuRect = this.element.getBoundingClientRect();
        if (menuRect.right > window.innerWidth - 10) {
            this.element.style.left = `${window.innerWidth - menuRect.width - 10}px`;
        }
        if (menuRect.bottom > window.innerHeight - 10) {
            this.element.style.top = `${rect.top - menuRect.height - 5}px`;
        }
    }
    
    hide() {
        this.visible = false;
        this.element.style.display = 'none';
        this.triggerElement = null;
        this.currentQuery = '';
    }
    
    render() {
        this.element.innerHTML = '';
        
        if (this.filteredCommands.length === 0) {
            const noResults = document.createElement('div');
            noResults.style.cssText = `
                padding: 12px;
                color: var(--theme-text-muted, #999);
                text-align: center;
                font-size: 14px;
            `;
            noResults.textContent = 'No commands found';
            this.element.appendChild(noResults);
            return;
        }
        
        this.filteredCommands.forEach((cmd, index) => {
            const item = document.createElement('div');
            item.className = 'slash-item';
            item.dataset.index = index;
            
            if (index === this.selectedIndex) {
                item.classList.add('selected');
            }
            
            item.style.cssText = `
                padding: 8px 12px;
                border-radius: 6px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 12px;
                transition: background 0.2s;
                ${index === this.selectedIndex ? 'background: var(--theme-bg, #f5f5f5);' : ''}
            `;
            
            item.onmouseover = () => {
                this.selectedIndex = index;
                this.updateSelection();
            };
            
            item.innerHTML = `
                <div style="
                    width: 28px;
                    height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    color: var(--theme-text-secondary, #666);
                ">${cmd.icon}</div>
                <div style="flex: 1;">
                    <div style="
                        font-size: 14px;
                        font-weight: 500;
                        color: var(--theme-text-primary, #000);
                    ">${cmd.name}</div>
                    <div style="
                        font-size: 12px;
                        color: var(--theme-text-muted, #999);
                    ">${cmd.description}</div>
                </div>
                ${cmd.shortcut ? `
                    <div style="
                        font-size: 11px;
                        color: var(--theme-text-muted, #999);
                        background: var(--theme-bg, #f5f5f5);
                        padding: 2px 6px;
                        border-radius: 4px;
                        font-family: monospace;
                    ">${cmd.shortcut}</div>
                ` : ''}
            `;
            
            this.element.appendChild(item);
        });
    }
    
    filter(query) {
        if (!query) {
            this.filteredCommands = this.commands;
        } else {
            this.filteredCommands = this.commands.filter(cmd =>
                cmd.name.toLowerCase().includes(query.toLowerCase()) ||
                cmd.description.toLowerCase().includes(query.toLowerCase()) ||
                (cmd.shortcut && cmd.shortcut.includes(query))
            );
        }
        
        this.selectedIndex = 0;
        this.render();
    }
    
    selectNext() {
        if (this.selectedIndex < this.filteredCommands.length - 1) {
            this.selectedIndex++;
            this.updateSelection();
        }
    }
    
    selectPrevious() {
        if (this.selectedIndex > 0) {
            this.selectedIndex--;
            this.updateSelection();
        }
    }
    
    updateSelection() {
        const items = this.element.querySelectorAll('.slash-item');
        items.forEach((item, index) => {
            if (index === this.selectedIndex) {
                item.style.background = 'var(--theme-bg, #f5f5f5)';
            } else {
                item.style.background = 'transparent';
            }
        });
    }
    
    executeSelected() {
        if (this.filteredCommands.length === 0) return;
        
        const command = this.filteredCommands[this.selectedIndex];
        
        // Remove the slash and query from the text
        this.removeSlashCommand();
        
        // Execute the command
        this.editor.executeCommand(command.id);
        
        // Hide menu
        this.hide();
    }
    
    removeSlashCommand() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        const range = selection.getRangeAt(0);
        const textNode = range.startContainer;
        
        if (textNode.nodeType === Node.TEXT_NODE) {
            const text = textNode.textContent;
            const cursorPos = range.startOffset;
            const beforeCursor = text.substring(0, cursorPos);
            
            // Find the slash position
            const slashMatch = beforeCursor.match(/\/\w*$/);
            if (slashMatch) {
                const slashIndex = beforeCursor.length - slashMatch[0].length;
                
                // Remove slash and query
                textNode.textContent = text.substring(0, slashIndex) + text.substring(cursorPos);
                
                // Reset cursor position
                range.setStart(textNode, slashIndex);
                range.setEnd(textNode, slashIndex);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
    }
    
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}