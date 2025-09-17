/**
 * Enhanced Slash Menu with Fuzzy Search
 * Command palette with fuzzy finding and templates
 */

export class SlashMenuCore {
    constructor(editor) {
        this.editor = editor;
        this.element = null;
        this.searchInput = null;
        this.visible = false;
        this.selectedIndex = 0;
        this.filteredCommands = [];
        this.currentQuery = '';
        this.triggerElement = null;
        this.templates = [];

        // Basic commands
        this.commands = [
            // Text formatting
            { id: 'heading1', icon: 'H1', name: 'Heading 1', description: 'Large heading', shortcut: '#', keywords: ['h1', 'title', 'header'] },
            { id: 'heading2', icon: 'H2', name: 'Heading 2', description: 'Medium heading', shortcut: '##', keywords: ['h2', 'subtitle'] },
            { id: 'heading3', icon: 'H3', name: 'Heading 3', description: 'Small heading', shortcut: '###', keywords: ['h3', 'section'] },
            { id: 'heading4', icon: 'H4', name: 'Heading 4', description: 'Tiny heading', shortcut: '####', keywords: ['h4', 'subsection'] },
            { id: 'paragraph', icon: '¶', name: 'Text', description: 'Plain text paragraph', keywords: ['p', 'text', 'paragraph'] },

            // Lists
            { id: 'bullet', icon: '•', name: 'Bullet List', description: 'Unordered list', shortcut: '-', keywords: ['ul', 'unordered', 'bullets'] },
            { id: 'number', icon: '1.', name: 'Numbered List', description: 'Ordered list', shortcut: '1.', keywords: ['ol', 'ordered', 'numbers'] },
            { id: 'checkbox', icon: '☐', name: 'Checkbox', description: 'Task list', shortcut: '[]', keywords: ['todo', 'task', 'checklist'] },

            // Blocks
            { id: 'quote', icon: '"', name: 'Quote', description: 'Blockquote', shortcut: '>', keywords: ['blockquote', 'citation'] },
            { id: 'codeblock', icon: '&lt;/&gt;', name: 'Code Block', description: 'Code with syntax highlighting', shortcut: '```', keywords: ['code', 'programming', 'snippet'] },
            { id: 'math', icon: '∑', name: 'Math Block', description: 'LaTeX mathematical expression', shortcut: '$$', keywords: ['latex', 'equation', 'formula'] },

            // Media
            { id: 'image', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>', name: 'Image', description: 'Upload or embed image', keywords: ['picture', 'photo', 'img'] },
            { id: 'table', icon: '⊞', name: 'Table', description: 'Insert table', keywords: ['grid', 'spreadsheet'] },
            { id: 'divider', icon: '—', name: 'Divider', description: 'Horizontal line', shortcut: '---', keywords: ['hr', 'separator', 'line'] },

            // Advanced
            { id: 'embed', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"></path></svg>', name: 'Embed', description: 'Embed external content', keywords: ['iframe', 'video', 'youtube'] },
            { id: 'callout', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>', name: 'Callout', description: 'Highlighted note or warning', keywords: ['note', 'warning', 'info', 'tip'] },
            { id: 'toggle', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>', name: 'Toggle', description: 'Collapsible content', keywords: ['collapse', 'accordion', 'details'] }
        ];

        this.create();
        this.attachListeners();
        this.loadTemplates();
    }

    create() {
        // Main container
        this.element = document.createElement('div');
        this.element.className = 'slash-menu-enhanced';
        this.element.style.cssText = `
            position: fixed;
            background: var(--theme-surface, #fff);
            border: 1px solid var(--theme-border, #e0e0e0);
            border-radius: 12px;
            box-shadow: var(--theme-shadow-lg, 0 8px 24px var(--theme-shadow-color));
            width: 400px;
            max-height: 450px;
            z-index: 10000;
            display: none;
            flex-direction: column;
            overflow: hidden;
        `;

        // Search input
        const searchContainer = document.createElement('div');
        searchContainer.style.cssText = `
            padding: 12px;
            border-bottom: 1px solid var(--theme-border, #e0e0e0);
        `;

        this.searchInput = document.createElement('input');
        this.searchInput.type = 'text';
        this.searchInput.placeholder = 'Search commands...';
        this.searchInput.className = 'slash-menu-search';
        this.searchInput.style.cssText = `
            width: 100%;
            padding: 8px 12px;
            border: 1px solid var(--theme-border, #e0e0e0);
            border-radius: 6px;
            font-size: 14px;
            outline: none;
            background: var(--theme-background, #fff);
        `;

        searchContainer.appendChild(this.searchInput);

        // Results container
        this.resultsContainer = document.createElement('div');
        this.resultsContainer.className = 'slash-menu-results';
        this.resultsContainer.style.cssText = `
            flex: 1;
            overflow-y: auto;
            padding: 8px;
        `;

        this.element.appendChild(searchContainer);
        this.element.appendChild(this.resultsContainer);

        document.body.appendChild(this.element);
    }

    attachListeners() {
        // Search input
        this.searchInput.addEventListener('input', (e) => {
            this.currentQuery = e.target.value;
            this.filter(this.currentQuery);
        });

        // Keyboard navigation
        this.searchInput.addEventListener('keydown', (e) => {
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
                case 'Tab':
                    e.preventDefault();
                    this.selectNext();
                    break;
            }
        });

        // Click handler
        this.resultsContainer.addEventListener('click', (e) => {
            const item = e.target.closest('.slash-menu-item');
            if (item) {
                const index = parseInt(item.dataset.index);
                this.selectedIndex = index;
                this.executeSelected();
            }
        });

        // Click outside to close
        document.addEventListener('click', (e) => {
            if (this.visible && !this.element.contains(e.target)) {
                this.hide();
            }
        });
    }

    show(element) {
        this.triggerElement = element;
        this.visible = true;
        this.selectedIndex = 0;
        this.currentQuery = '';
        this.searchInput.value = '';

        // Get all commands including templates
        this.filteredCommands = [...this.commands, ...this.templates];

        this.render();

        // Position menu
        const rect = element.getBoundingClientRect();
        this.element.style.display = 'flex';

        // Position below cursor with smart positioning
        let top = rect.bottom + 10;
        let left = rect.left;

        // Adjust if goes off screen
        const menuRect = this.element.getBoundingClientRect();
        if (top + menuRect.height > window.innerHeight - 20) {
            top = rect.top - menuRect.height - 10;
        }
        if (left + menuRect.width > window.innerWidth - 20) {
            left = window.innerWidth - menuRect.width - 20;
        }

        this.element.style.top = `${top}px`;
        this.element.style.left = `${left}px`;

        // Focus search input
        setTimeout(() => this.searchInput.focus(), 0);
    }

    hide() {
        this.visible = false;
        this.element.style.display = 'none';

        // Remove slash from editor if present
        if (this.triggerElement) {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const textNode = range.startContainer;
                if (textNode.nodeType === Node.TEXT_NODE) {
                    const text = textNode.textContent;
                    const slashIndex = text.lastIndexOf('/');
                    if (slashIndex !== -1) {
                        textNode.textContent = text.substring(0, slashIndex) + text.substring(slashIndex + 1);
                        // Restore cursor position
                        range.setStart(textNode, slashIndex);
                        range.collapse(true);
                    }
                }
            }
        }
    }

    filter(query) {
        if (!query) {
            this.filteredCommands = [...this.commands, ...this.templates];
        } else {
            // Fuzzy search implementation
            this.filteredCommands = this.fuzzySearch(query, [...this.commands, ...this.templates]);
        }

        this.selectedIndex = 0;
        this.render();
    }

    fuzzySearch(query, items) {
        const searchTerms = query.toLowerCase().split(' ').filter(t => t.length > 0);

        return items
            .map(item => {
                let score = 0;
                const name = item.name.toLowerCase();
                const description = (item.description || '').toLowerCase();
                const keywords = (item.keywords || []).join(' ').toLowerCase();
                const shortcut = (item.shortcut || '').toLowerCase();

                searchTerms.forEach(term => {
                    // Exact match in name
                    if (name.includes(term)) score += 10;
                    // Start of word in name
                    if (name.split(' ').some(word => word.startsWith(term))) score += 8;
                    // Match in keywords
                    if (keywords.includes(term)) score += 6;
                    // Match in description
                    if (description.includes(term)) score += 4;
                    // Match in shortcut
                    if (shortcut.includes(term)) score += 3;

                    // Fuzzy character matching
                    let charIndex = 0;
                    for (const char of term) {
                        const index = name.indexOf(char, charIndex);
                        if (index !== -1) {
                            score += 1;
                            charIndex = index + 1;
                        }
                    }
                });

                return { item, score };
            })
            .filter(result => result.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(result => result.item);
    }

    render() {
        this.resultsContainer.innerHTML = '';

        if (this.filteredCommands.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.style.cssText = `
                padding: 20px;
                text-align: center;
                color: var(--theme-text-secondary, #666);
            `;
            emptyMessage.textContent = 'No commands found';
            this.resultsContainer.appendChild(emptyMessage);
            return;
        }

        // Group commands by category
        const categories = {
            'Text': ['heading1', 'heading2', 'heading3', 'heading4', 'paragraph', 'quote'],
            'Lists': ['bullet', 'number', 'checkbox'],
            'Blocks': ['codeblock', 'math', 'table', 'callout', 'toggle'],
            'Media': ['image', 'embed', 'divider'],
            'Templates': []
        };

        // Add templates to their category
        this.filteredCommands.forEach(cmd => {
            if (cmd.isTemplate) {
                categories.Templates.push(cmd.id);
            }
        });

        // Render by category
        let globalIndex = 0;
        Object.entries(categories).forEach(([category, ids]) => {
            const categoryCommands = this.filteredCommands.filter(cmd =>
                ids.includes(cmd.id) || (category === 'Templates' && cmd.isTemplate)
            );

            if (categoryCommands.length === 0) return;

            // Category header
            const categoryHeader = document.createElement('div');
            categoryHeader.style.cssText = `
                padding: 4px 8px;
                font-size: 11px;
                font-weight: 600;
                color: var(--theme-text-secondary, #666);
                text-transform: uppercase;
                letter-spacing: 0.5px;
            `;
            categoryHeader.textContent = category;
            this.resultsContainer.appendChild(categoryHeader);

            // Commands in category
            categoryCommands.forEach(command => {
                const item = document.createElement('div');
                item.className = 'slash-menu-item';
                item.dataset.index = globalIndex;

                const isSelected = globalIndex === this.selectedIndex;
                item.style.cssText = `
                    display: flex;
                    align-items: center;
                    padding: 8px 12px;
                    cursor: pointer;
                    border-radius: 6px;
                    transition: background 0.15s;
                    background: ${isSelected ? 'var(--theme-accent-light, #f0f0f0)' : 'transparent'};
                `;

                // Icon
                const icon = document.createElement('div');
                icon.style.cssText = `
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    margin-right: 12px;
                    background: var(--theme-background, #fff);
                    border-radius: 6px;
                `;
                icon.innerHTML = command.icon;

                // Content
                const content = document.createElement('div');
                content.style.cssText = 'flex: 1;';

                const name = document.createElement('div');
                name.style.cssText = `
                    font-weight: 500;
                    color: var(--theme-text, #000);
                    margin-bottom: 2px;
                `;
                name.textContent = command.name;

                const description = document.createElement('div');
                description.style.cssText = `
                    font-size: 12px;
                    color: var(--theme-text-secondary, #666);
                `;
                description.textContent = command.description;

                content.appendChild(name);
                content.appendChild(description);

                // Shortcut
                if (command.shortcut) {
                    const shortcut = document.createElement('div');
                    shortcut.style.cssText = `
                        padding: 2px 6px;
                        background: var(--theme-background, #fff);
                        border: 1px solid var(--theme-border, #e0e0e0);
                        border-radius: 4px;
                        font-size: 11px;
                        color: var(--theme-text-secondary, #666);
                        font-family: monospace;
                    `;
                    shortcut.textContent = command.shortcut;
                    item.appendChild(shortcut);
                }

                item.appendChild(icon);
                item.appendChild(content);

                // Hover effect
                item.addEventListener('mouseenter', () => {
                    if (globalIndex !== this.selectedIndex) {
                        item.style.background = 'var(--theme-surface, #f8f8f8)';
                    }
                });

                item.addEventListener('mouseleave', () => {
                    if (globalIndex !== this.selectedIndex) {
                        item.style.background = 'transparent';
                    }
                });

                this.resultsContainer.appendChild(item);
                globalIndex++;
            });
        });

        // Ensure selected item is visible
        this.scrollToSelected();
    }

    selectNext() {
        if (this.filteredCommands.length === 0) return;
        this.selectedIndex = (this.selectedIndex + 1) % this.filteredCommands.length;
        this.render();
    }

    selectPrevious() {
        if (this.filteredCommands.length === 0) return;
        this.selectedIndex = (this.selectedIndex - 1 + this.filteredCommands.length) % this.filteredCommands.length;
        this.render();
    }

    scrollToSelected() {
        const selectedItem = this.resultsContainer.querySelector(`[data-index="${this.selectedIndex}"]`);
        if (selectedItem) {
            selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }

    executeSelected() {
        if (this.filteredCommands.length === 0) return;

        const command = this.filteredCommands[this.selectedIndex];
        this.hide();

        if (command.isTemplate) {
            this.insertTemplate(command);
        } else {
            this.executeCommand(command.id);
        }
    }

    executeCommand(commandId) {
        // Remove the slash from the current block
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const textNode = range.startContainer;

            if (textNode.nodeType === Node.TEXT_NODE) {
                const text = textNode.textContent;
                const slashIndex = text.lastIndexOf('/');

                if (slashIndex !== -1) {
                    // Remove slash and query
                    textNode.textContent = text.substring(0, slashIndex);
                }
            }
        }

        // Execute the command
        switch (commandId) {
            case 'image':
                this.editor.insertImage();
                break;
            case 'table':
                this.editor.insertTable();
                break;
            case 'divider':
                this.editor.insertDivider();
                break;
            case 'embed':
                this.insertEmbed();
                break;
            case 'callout':
                this.insertCallout();
                break;
            case 'toggle':
                this.insertToggle();
                break;
            default:
                // Transform current block
                this.editor.inputHandler.transformBlock(commandId);
                break;
        }
    }

    insertEmbed() {
        const url = prompt('Enter URL to embed (YouTube, Twitter, etc.):');
        if (url) {
            this.editor.insertBlock('embed', url, { url });
        }
    }

    insertCallout() {
        const types = ['info', 'warning', 'error', 'success'];
        const type = prompt('Callout type (info/warning/error/success):', 'info');
        if (types.includes(type)) {
            this.editor.insertBlock('callout', '', { type });
        }
    }

    insertToggle() {
        this.editor.insertBlock('toggle', '', { expanded: false });
    }

    insertTemplate(template) {
        // Insert template blocks
        template.blocks.forEach((block, index) => {
            if (index === 0) {
                // Transform current block
                this.editor.inputHandler.transformBlock(block.type);
                this.editor.dataModel.updateBlock(this.editor.currentBlockId, {
                    content: block.content,
                    attributes: block.attributes
                });
            } else {
                // Insert new blocks
                this.editor.insertBlock(block.type, block.content, block.attributes);
            }
        });
    }

    async loadTemplates() {
        // Load templates from storage
        try {
            const stored = await this.editor.storage.getTemplates();
            this.templates = stored.map(t => ({
                ...t,
                isTemplate: true,
                icon: '📄',
                keywords: ['template', ...t.keywords || []]
            }));
        } catch (e) {
            console.log('No templates found');
        }

        // Add default templates
        this.addDefaultTemplates();
    }

    addDefaultTemplates() {
        const defaultTemplates = [
            {
                id: 'template-meeting',
                name: 'Meeting Notes',
                description: 'Template for meeting notes',
                icon: '📝',
                isTemplate: true,
                keywords: ['meeting', 'notes', 'agenda'],
                blocks: [
                    { type: 'heading1', content: 'Meeting Notes' },
                    { type: 'heading2', content: 'Date & Attendees' },
                    { type: 'paragraph', content: 'Date: ' },
                    { type: 'paragraph', content: 'Attendees: ' },
                    { type: 'heading2', content: 'Agenda' },
                    { type: 'bullet', content: '' },
                    { type: 'heading2', content: 'Discussion' },
                    { type: 'paragraph', content: '' },
                    { type: 'heading2', content: 'Action Items' },
                    { type: 'checkbox', content: '' },
                    { type: 'heading2', content: 'Next Steps' },
                    { type: 'bullet', content: '' }
                ]
            },
            {
                id: 'template-project',
                name: 'Project Plan',
                description: 'Template for project planning',
                icon: '🎯',
                isTemplate: true,
                keywords: ['project', 'plan', 'planning'],
                blocks: [
                    { type: 'heading1', content: 'Project: [Name]' },
                    { type: 'heading2', content: 'Overview' },
                    { type: 'paragraph', content: '' },
                    { type: 'heading2', content: 'Goals' },
                    { type: 'bullet', content: '' },
                    { type: 'heading2', content: 'Timeline' },
                    { type: 'table', content: { rows: 3, cols: 3, cells: [['Phase', 'Duration', 'Status']] } },
                    { type: 'heading2', content: 'Resources' },
                    { type: 'bullet', content: '' },
                    { type: 'heading2', content: 'Risks' },
                    { type: 'bullet', content: '' }
                ]
            },
            {
                id: 'template-daily',
                name: 'Daily Journal',
                description: 'Template for daily journaling',
                icon: '📅',
                isTemplate: true,
                keywords: ['daily', 'journal', 'diary'],
                blocks: [
                    { type: 'heading1', content: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
                    { type: 'heading2', content: 'Today\'s Goals' },
                    { type: 'checkbox', content: '' },
                    { type: 'heading2', content: 'Notes' },
                    { type: 'paragraph', content: '' },
                    { type: 'heading2', content: 'Reflections' },
                    { type: 'paragraph', content: '' }
                ]
            }
        ];

        this.templates.push(...defaultTemplates);
    }

    destroy() {
        this.element?.remove();
    }
}