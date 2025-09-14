/**
 * Slash Commands Menu
 * Shows when user types '/'
 */

export class SlashMenu {
    constructor(editor) {
        this.editor = editor;
        this.element = null;
        this.selectedIndex = 0;
        this.visible = false;
        this.commands = [
            { id: 'heading1', icon: 'H1', name: 'Heading 1', description: 'Large heading' },
            { id: 'heading2', icon: 'H2', name: 'Heading 2', description: 'Medium heading' },
            { id: 'heading3', icon: 'H3', name: 'Heading 3', description: 'Small heading' },
            { id: 'quote', icon: '"', name: 'Quote', description: 'Blockquote' },
            { id: 'bullet', icon: '•', name: 'Bullet List', description: 'Unordered list' },
            { id: 'number', icon: '1.', name: 'Numbered List', description: 'Ordered list' },
            { id: 'checkbox', icon: '☐', name: 'Checkbox', description: 'Task list' },
            { id: 'codeblock', icon: '{}', name: 'Code Block', description: 'Code snippet' },
            { id: 'table', icon: '⊞', name: 'Table', description: 'Insert table' },
            { id: 'image', icon: '📷', name: 'Image', description: 'Upload image' },
            { id: 'divider', icon: '—', name: 'Divider', description: 'Horizontal line' }
        ];
        
        this.create();
        this.attachListeners();
    }
    
    create() {
        this.element = document.createElement('div');
        this.element.className = 'slash-menu';
        this.element.style.display = 'none';
        document.body.appendChild(this.element);
    }
    
    attachListeners() {
        // Listen for slash command
        this.editor.editorElement.addEventListener('input', (e) => {
            const selection = window.getSelection();
            if (selection.rangeCount === 0) return;
            
            const range = selection.getRangeAt(0);
            const textNode = range.startContainer;
            
            if (textNode.nodeType === Node.TEXT_NODE) {
                const text = textNode.textContent;
                const cursorPos = range.startOffset;
                
                // Check for slash at beginning of line or after space
                const beforeCursor = text.substring(0, cursorPos);
                const lastChar = beforeCursor[beforeCursor.length - 1];
                const secondLastChar = beforeCursor[beforeCursor.length - 2];
                
                if (lastChar === '/' && (!secondLastChar || secondLastChar === ' ' || secondLastChar === '\n')) {
                    this.show(range);
                } else if (this.visible) {
                    // Check if still typing after slash
                    const slashIndex = beforeCursor.lastIndexOf('/');
                    if (slashIndex !== -1 && slashIndex === beforeCursor.length - 1 - (cursorPos - slashIndex - 1)) {
                        const query = beforeCursor.substring(slashIndex + 1);
                        this.filter(query);
                    } else {
                        this.hide();
                    }
                }
            }
        });
        
        // Keyboard navigation
        this.editor.editorElement.addEventListener('keydown', (e) => {
            if (!this.visible) return;
            
            switch(e.key) {
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
                    this.hide();
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
    }
    
    show(range) {
        this.visible = true;
        this.selectedIndex = 0;
        this.render();
        
        // Position menu
        const rect = range.getBoundingClientRect();
        this.element.style.display = 'block';
        this.element.style.top = `${rect.bottom + 5}px`;
        this.element.style.left = `${rect.left}px`;
    }
    
    hide() {
        this.visible = false;
        this.element.style.display = 'none';
    }
    
    render(commands = this.commands) {
        this.element.innerHTML = commands.map((cmd, index) => `
            <div class="slash-item ${index === this.selectedIndex ? 'selected' : ''}" data-index="${index}">
                <div class="slash-item-icon">${cmd.icon}</div>
                <div class="slash-item-content">
                    <div class="slash-item-title">${cmd.name}</div>
                    <div class="slash-item-desc">${cmd.description}</div>
                </div>
            </div>
        `).join('');
    }
    
    filter(query) {
        const filtered = this.commands.filter(cmd => 
            cmd.name.toLowerCase().includes(query.toLowerCase()) ||
            cmd.description.toLowerCase().includes(query.toLowerCase())
        );
        
        if (filtered.length > 0) {
            this.render(filtered);
        } else {
            this.hide();
        }
    }
    
    selectNext() {
        const items = this.element.querySelectorAll('.slash-item');
        if (this.selectedIndex < items.length - 1) {
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
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }
    
    executeSelected() {
        const items = this.element.querySelectorAll('.slash-item');
        const selectedItem = items[this.selectedIndex];
        
        if (selectedItem) {
            const index = parseInt(selectedItem.dataset.index);
            const command = this.commands[index];
            
            // Remove slash from text
            this.removeSlashCommand();
            
            // Execute command
            if (command.id === 'divider') {
                this.insertDivider();
            } else {
                this.editor.executeCommand(command.id);
            }
            
            this.hide();
        }
    }
    
    removeSlashCommand() {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const textNode = range.startContainer;
        
        if (textNode.nodeType === Node.TEXT_NODE) {
            const text = textNode.textContent;
            const slashIndex = text.lastIndexOf('/');
            
            if (slashIndex !== -1) {
                textNode.textContent = text.substring(0, slashIndex) + text.substring(range.startOffset);
                
                // Reset cursor position
                range.setStart(textNode, slashIndex);
                range.setEnd(textNode, slashIndex);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
    }
    
    insertDivider() {
        document.execCommand('insertHTML', false, '<hr>');
    }
    
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}