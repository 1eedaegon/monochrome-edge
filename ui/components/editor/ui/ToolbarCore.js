/**
 * Main Toolbar Component
 * Provides all editing tools and formatting options
 */

export class ToolbarCore {
    constructor(container, editor) {
        this.container = container;
        this.editor = editor;
        this.activeFormats = new Set();
        
        this.groups = [
            {
                name: 'history',
                items: [
                    { command: 'undo', icon: this.getIcon('undo'), title: 'Undo (Ctrl+Z)' },
                    { command: 'redo', icon: this.getIcon('redo'), title: 'Redo (Ctrl+Y)' }
                ]
            },
            {
                name: 'headings',
                items: [
                    { command: 'paragraph', text: 'P', title: 'Paragraph' },
                    { command: 'heading1', text: 'H1', title: 'Heading 1' },
                    { command: 'heading2', text: 'H2', title: 'Heading 2' },
                    { command: 'heading3', text: 'H3', title: 'Heading 3' }
                ]
            },
            {
                name: 'formatting',
                items: [
                    { command: 'bold', icon: this.getIcon('bold'), title: 'Bold (Ctrl+B)' },
                    { command: 'italic', icon: this.getIcon('italic'), title: 'Italic (Ctrl+I)' },
                    { command: 'strikethrough', icon: this.getIcon('strikethrough'), title: 'Strikethrough' },
                    { command: 'code', icon: this.getIcon('code'), title: 'Inline Code' }
                ]
            },
            {
                name: 'lists',
                items: [
                    { command: 'bullet', icon: this.getIcon('bullet'), title: 'Bullet List' },
                    { command: 'number', icon: this.getIcon('number'), title: 'Numbered List' },
                    { command: 'checkbox', icon: this.getIcon('checkbox'), title: 'Checkbox' }
                ]
            },
            {
                name: 'blocks',
                items: [
                    { command: 'quote', icon: this.getIcon('quote'), title: 'Quote' },
                    { command: 'codeblock', icon: this.getIcon('codeblock'), title: 'Code Block' },
                    { command: 'divider', icon: this.getIcon('divider'), title: 'Divider' }
                ]
            },
            {
                name: 'insert',
                items: [
                    { command: 'link', icon: this.getIcon('link'), title: 'Link (Ctrl+K)' },
                    { command: 'image', icon: this.getIcon('image'), title: 'Image' },
                    { command: 'table', icon: this.getIcon('table'), title: 'Table' },
                    { command: 'math', icon: this.getIcon('math'), title: 'Math Equation' }
                ]
            },
            {
                name: 'tools',
                items: [
                    { command: 'export', icon: this.getIcon('export'), title: 'Export' },
                    { command: 'fullscreen', icon: this.getIcon('fullscreen'), title: 'Fullscreen' }
                ]
            }
        ];
        
        this.render();
        this.attachListeners();
    }
    
    render() {
        this.container.innerHTML = '';
        this.container.className = 'editor-toolbar';
        this.container.style.cssText = `
            background: var(--theme-surface);
            border-bottom: 1px solid var(--theme-border);
            padding: 0.5rem 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            overflow-x: auto;
            flex-shrink: 0;
        `;
        
        this.groups.forEach((group, index) => {
            // Create group container
            const groupEl = document.createElement('div');
            groupEl.className = 'toolbar-group';
            groupEl.style.cssText = `
                display: flex;
                gap: 0.25rem;
            `;
            
            // Add buttons
            group.items.forEach(item => {
                const button = this.createButton(item);
                groupEl.appendChild(button);
            });
            
            this.container.appendChild(groupEl);
            
            // Add divider after group (except last)
            if (index < this.groups.length - 1) {
                const divider = document.createElement('div');
                divider.className = 'toolbar-divider';
                divider.style.cssText = `
                    width: 1px;
                    height: 24px;
                    background: var(--theme-border);
                    margin: 0 0.5rem;
                `;
                this.container.appendChild(divider);
            }
        });
    }
    
    createButton(item) {
        const button = document.createElement('button');
        button.className = 'toolbar-button';
        button.title = item.title;
        button.setAttribute('data-command', item.command);
        
        // Set content (icon or text)
        if (item.icon) {
            button.innerHTML = item.icon;
        } else if (item.text) {
            button.textContent = item.text;
        }
        
        button.style.cssText = `
            min-width: 32px;
            height: 32px;
            border: none;
            background: transparent;
            color: var(--theme-text-secondary);
            border-radius: var(--border-radius-sm);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 14px;
            transition: all 0.2s;
            padding: 0 8px;
        `;
        
        // Hover effect
        button.onmouseover = () => {
            if (!button.classList.contains('active')) {
                button.style.background = 'var(--theme-bg)';
                button.style.color = 'var(--theme-text-primary)';
            }
        };
        
        button.onmouseout = () => {
            if (!button.classList.contains('active')) {
                button.style.background = 'transparent';
                button.style.color = 'var(--theme-text-secondary)';
            }
        };
        
        // Click handler
        button.onclick = (e) => {
            e.preventDefault();
            this.handleCommand(item.command);
        };
        
        return button;
    }
    
    handleCommand(command) {
        switch (command) {
            case 'export':
                this.showExportMenu();
                break;
            case 'fullscreen':
                this.toggleFullscreen();
                break;
            case 'math':
                this.insertMath();
                break;
            default:
                this.editor.executeCommand(command);
                break;
        }
        
        // Update active states
        this.updateActiveStates();
    }
    
    attachListeners() {
        // Update toolbar on selection change
        this.editor.on('selectionChange', () => {
            this.updateActiveStates();
        });
        
        // Update on block change
        this.editor.on('blockFocus', () => {
            this.updateActiveStates();
        });
    }
    
    updateActiveStates() {
        // Get current block type
        const selection = this.editor.selectionManager?.getSelection();
        if (!selection) return;
        
        const block = this.editor.dataModel?.getBlock(selection.blockId);
        if (!block) return;
        
        // Update block type buttons
        const buttons = this.container.querySelectorAll('[data-command]');
        buttons.forEach(button => {
            const command = button.getAttribute('data-command');
            
            if (command === block.type || 
                (command === 'paragraph' && block.type === 'paragraph')) {
                button.classList.add('active');
                button.style.background = 'var(--theme-accent)';
                button.style.color = 'white';
            } else {
                button.classList.remove('active');
                button.style.background = 'transparent';
                button.style.color = 'var(--theme-text-secondary)';
            }
        });
    }
    
    showExportMenu() {
        const menu = document.createElement('div');
        menu.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--theme-surface);
            border: 1px solid var(--theme-border);
            border-radius: var(--border-radius);
            padding: 1.5rem;
            box-shadow: var(--theme-shadow-xl, 0 10px 40px var(--theme-shadow-color));
            z-index: 2000;
            min-width: 300px;
        `;
        
        menu.innerHTML = `
            <h3 style="margin: 0 0 1rem 0; color: var(--theme-text-primary);">Export Document</h3>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                <button class="export-btn" data-format="markdown">Export as Markdown</button>
                <button class="export-btn" data-format="html">Export as HTML</button>
                <button class="export-btn" data-format="json">Export as JSON</button>
                <button class="export-btn" data-format="cancel" style="margin-top: 0.5rem;">Cancel</button>
            </div>
        `;
        
        // Style buttons
        menu.querySelectorAll('.export-btn').forEach(btn => {
            btn.style.cssText = `
                padding: 0.75rem;
                border: 1px solid var(--theme-border);
                background: var(--theme-bg);
                color: var(--theme-text-primary);
                border-radius: var(--border-radius-sm);
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s;
            `;
            
            btn.onmouseover = () => {
                btn.style.background = 'var(--theme-accent)';
                btn.style.color = 'white';
            };
            
            btn.onmouseout = () => {
                btn.style.background = 'var(--theme-bg)';
                btn.style.color = 'var(--theme-text-primary)';
            };
            
            btn.onclick = () => {
                const format = btn.getAttribute('data-format');
                if (format !== 'cancel') {
                    this.exportDocument(format);
                }
                document.body.removeChild(menu);
            };
        });
        
        document.body.appendChild(menu);
    }
    
    exportDocument(format) {
        const content = this.editor.getContent();
        let data, filename, mimeType;
        
        switch (format) {
            case 'markdown':
                data = content.markdown;
                filename = 'document.md';
                mimeType = 'text/markdown';
                break;
            case 'html':
                data = this.generateHTML(content.blocks);
                filename = 'document.html';
                mimeType = 'text/html';
                break;
            case 'json':
                data = content.json;
                filename = 'document.json';
                mimeType = 'application/json';
                break;
        }
        
        // Download file
        const blob = new Blob([data], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        
        // Show notification
        this.showNotification(`Document exported as ${format.toUpperCase()}`);
    }
    
    generateHTML(blocks) {
        let html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Exported Document</title>
    <style>
        body { font-family: -apple-system, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
        blockquote { border-left: 4px solid #ddd; padding-left: 1rem; color: #666; }
        code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; }
        pre { background: #f5f5f5; padding: 1rem; border-radius: 6px; overflow-x: auto; }
        img { max-width: 100%; height: auto; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    </style>
</head>
<body>
`;
        
        blocks.forEach(block => {
            const text = typeof block.content === 'string' ? block.content : block.content?.text || '';
            
            switch (block.type) {
                case 'heading1':
                    html += `<h1>${text}</h1>\n`;
                    break;
                case 'heading2':
                    html += `<h2>${text}</h2>\n`;
                    break;
                case 'heading3':
                    html += `<h3>${text}</h3>\n`;
                    break;
                case 'heading4':
                    html += `<h4>${text}</h4>\n`;
                    break;
                case 'paragraph':
                    html += `<p>${text}</p>\n`;
                    break;
                case 'quote':
                    html += `<blockquote>${text}</blockquote>\n`;
                    break;
                case 'bullet':
                    html += `<ul><li>${text}</li></ul>\n`;
                    break;
                case 'number':
                    html += `<ol><li>${text}</li></ol>\n`;
                    break;
                case 'codeblock':
                    html += `<pre><code>${text}</code></pre>\n`;
                    break;
                case 'divider':
                    html += `<hr>\n`;
                    break;
                case 'image':
                    html += `<img src="${block.content}" alt="${block.attributes?.alt || ''}">\n`;
                    break;
            }
        });
        
        html += `</body></html>`;
        return html;
    }
    
    insertMath() {
        const latex = prompt('Enter LaTeX expression:', 'E = mc^2');
        if (latex) {
            this.editor.insertBlock('math', latex);
        }
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.editor.container.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
    
    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--theme-success, #4caf50);
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            box-shadow: var(--theme-shadow-md, 0 2px 10px var(--theme-shadow-color));
            z-index: 9999;
            font-size: 14px;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }
    
    getIcon(name) {
        const icons = {
            undo: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"></path></svg>',
            redo: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 7v6h-6"></path><path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7"></path></svg>',
            bold: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z"></path><path d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z"></path></svg>',
            italic: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line></svg>',
            strikethrough: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4H9a3 3 0 00-2.83 4"></path><path d="M14 12a4 4 0 010 8H6"></path><line x1="4" y1="12" x2="20" y2="12"></line></svg>',
            code: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>',
            bullet: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="9" y1="6" x2="20" y2="6"></line><line x1="9" y1="12" x2="20" y2="12"></line><line x1="9" y1="18" x2="20" y2="18"></line><circle cx="4" cy="6" r="1" fill="currentColor"></circle><circle cx="4" cy="12" r="1" fill="currentColor"></circle><circle cx="4" cy="18" r="1" fill="currentColor"></circle></svg>',
            number: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path></svg>',
            checkbox: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M9 12l2 2 4-4"></path></svg>',
            quote: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path></svg>',
            codeblock: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M8 12h8"></path><path d="M12 8v8"></path></svg>',
            divider: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line></svg>',
            link: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"></path></svg>',
            image: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>',
            table: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="12" y1="3" x2="12" y2="21"></line></svg>',
            math: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="12" y1="3" x2="12" y2="21"></line></svg>',
            export: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>',
            fullscreen: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"></path></svg>'
        };
        
        return icons[name] || '';
    }
    
    destroy() {
        this.container.innerHTML = '';
    }
}