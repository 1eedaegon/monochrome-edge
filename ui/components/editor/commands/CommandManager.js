/**
 * Command Manager
 * Central command execution system
 */

export class CommandManager {
    constructor(editor) {
        this.editor = editor;
        this.commands = new Map();
        this.shortcuts = new Map();
    }
    
    register(id, command) {
        this.commands.set(id, {
            id,
            ...command
        });
        
        if (command.shortcut) {
            this.shortcuts.set(command.shortcut.toLowerCase(), id);
        }
    }
    
    registerDefaultCommands() {
        // Text formatting
        this.register('bold', {
            name: 'Bold',
            shortcut: 'ctrl+b',
            execute: () => this.execBold()
        });
        
        this.register('italic', {
            name: 'Italic',
            shortcut: 'ctrl+i',
            execute: () => this.execItalic()
        });
        
        this.register('strikethrough', {
            name: 'Strikethrough',
            shortcut: 'ctrl+shift+s',
            execute: () => this.execStrikethrough()
        });
        
        this.register('code', {
            name: 'Inline Code',
            shortcut: 'ctrl+e',
            execute: () => this.execInlineCode()
        });
        
        // Headings
        this.register('heading1', {
            name: 'Heading 1',
            shortcut: 'ctrl+alt+1',
            execute: () => this.convertBlock('heading1')
        });
        
        this.register('heading2', {
            name: 'Heading 2',
            shortcut: 'ctrl+alt+2',
            execute: () => this.convertBlock('heading2')
        });
        
        this.register('heading3', {
            name: 'Heading 3',
            shortcut: 'ctrl+alt+3',
            execute: () => this.convertBlock('heading3')
        });
        
        this.register('heading4', {
            name: 'Heading 4',
            shortcut: 'ctrl+alt+4',
            execute: () => this.convertBlock('heading4')
        });
        
        // Blocks
        this.register('quote', {
            name: 'Quote',
            shortcut: 'ctrl+shift+.',
            execute: () => this.convertBlock('quote')
        });
        
        this.register('bullet', {
            name: 'Bullet List',
            shortcut: 'ctrl+shift+8',
            execute: () => this.convertBlock('bullet')
        });
        
        this.register('number', {
            name: 'Numbered List',
            shortcut: 'ctrl+shift+7',
            execute: () => this.convertBlock('number')
        });
        
        this.register('checkbox', {
            name: 'Checkbox',
            shortcut: 'ctrl+shift+9',
            execute: () => this.convertBlock('checkbox')
        });
        
        this.register('codeblock', {
            name: 'Code Block',
            shortcut: 'ctrl+alt+c',
            execute: () => this.insertCodeBlock()
        });
        
        // Media
        this.register('link', {
            name: 'Link',
            shortcut: 'ctrl+k',
            execute: () => this.insertLink()
        });
        
        this.register('image', {
            name: 'Image',
            shortcut: 'ctrl+shift+i',
            execute: () => this.insertImage()
        });
        
        this.register('table', {
            name: 'Table',
            shortcut: 'ctrl+alt+t',
            execute: () => this.insertTable()
        });
        
        // History
        this.register('undo', {
            name: 'Undo',
            shortcut: 'ctrl+z',
            execute: () => this.editor.history.undo()
        });
        
        this.register('redo', {
            name: 'Redo',
            shortcut: 'ctrl+y',
            execute: () => this.editor.history.redo()
        });
        
        // Save
        this.register('save', {
            name: 'Save',
            shortcut: 'ctrl+s',
            execute: () => this.editor.save()
        });
    }
    
    execute(commandId, params = {}) {
        const command = this.commands.get(commandId);
        if (!command) {
            console.warn(`Command not found: ${commandId}`);
            return false;
        }
        
        return command.execute(params);
    }
    
    getByShortcut(shortcut) {
        const commandId = this.shortcuts.get(shortcut.toLowerCase());
        return commandId ? this.commands.get(commandId) : null;
    }
    
    // Command implementations
    execBold() {
        this.wrapSelection('strong');
    }
    
    execItalic() {
        this.wrapSelection('em');
    }
    
    execStrikethrough() {
        this.wrapSelection('del');
    }
    
    execInlineCode() {
        this.wrapSelection('code');
    }
    
    wrapSelection(tag) {
        const selection = window.getSelection();
        const text = selection.toString();
        
        if (text) {
            document.execCommand('insertHTML', false, `<${tag}>${text}</${tag}>`);
        }
    }
    
    convertBlock(type) {
        const block = this.editor.selection.getSelectedBlock();
        if (block) {
            this.editor.convertBlock(block.dataset.blockId, type);
        }
    }
    
    insertCodeBlock() {
        const currentBlock = this.editor.selection.getSelectedBlock();
        const newBlock = {
            id: this.editor.generateId(),
            type: 'codeblock',
            content: '',
            metadata: { language: 'javascript' }
        };
        
        if (currentBlock) {
            const index = this.editor.document.blocks.findIndex(
                b => b.id === currentBlock.dataset.blockId
            );
            this.editor.document.blocks.splice(index + 1, 0, newBlock);
        } else {
            this.editor.document.blocks.push(newBlock);
        }
        
        this.editor.renderDocument();
    }
    
    insertLink() {
        const text = this.editor.selection.getSelectedText() || 'Link text';
        const url = prompt('Enter URL:', 'https://');
        
        if (url) {
            document.execCommand('insertHTML', false, 
                `<a href="${url}" target="_blank">${text}</a>`);
        }
    }
    
    insertImage() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.editor.insertImage(file);
            }
        };
        input.click();
    }
    
    insertTable() {
        const rows = prompt('Number of rows:', '3');
        const cols = prompt('Number of columns:', '3');
        
        if (rows && cols) {
            const tableData = [];
            for (let i = 0; i < parseInt(rows); i++) {
                const row = [];
                for (let j = 0; j < parseInt(cols); j++) {
                    row.push(i === 0 ? `Header ${j + 1}` : 'Cell');
                }
                tableData.push(row);
            }
            
            const newBlock = {
                id: this.editor.generateId(),
                type: 'table',
                content: '',
                metadata: { rows: tableData }
            };
            
            const currentBlock = this.editor.selection.getSelectedBlock();
            if (currentBlock) {
                const index = this.editor.document.blocks.findIndex(
                    b => b.id === currentBlock.dataset.blockId
                );
                this.editor.document.blocks.splice(index + 1, 0, newBlock);
            } else {
                this.editor.document.blocks.push(newBlock);
            }
            
            this.editor.renderDocument();
        }
    }
}

export default CommandManager;