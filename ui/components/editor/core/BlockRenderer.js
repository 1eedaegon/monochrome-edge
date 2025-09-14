/**
 * Block Renderer
 * Converts data model blocks to DOM elements and handles updates
 */

export class BlockRenderer {
    constructor(editor) {
        this.editor = editor;
        this.blockComponents = new Map();
        this.blockElements = new Map();
        
        this.registerDefaultComponents();
    }
    
    registerDefaultComponents() {
        // Paragraph
        this.register('paragraph', {
            render: (block) => this.createEditableBlock('div', block, 'block-paragraph'),
            update: (element, block) => this.updateEditableBlock(element, block),
            focus: (element) => this.focusBlock(element)
        });
        
        // Headings
        ['heading1', 'heading2', 'heading3', 'heading4'].forEach((type, index) => {
            this.register(type, {
                render: (block) => this.createEditableBlock(`h${index + 1}`, block, `block-${type}`),
                update: (element, block) => this.updateEditableBlock(element, block),
                focus: (element) => this.focusBlock(element)
            });
        });
        
        // Quote
        this.register('quote', {
            render: (block) => this.createEditableBlock('blockquote', block, 'block-quote'),
            update: (element, block) => this.updateEditableBlock(element, block),
            focus: (element) => this.focusBlock(element)
        });
        
        // Lists
        this.register('bullet', {
            render: (block) => this.createListBlock(block, false),
            update: (element, block) => this.updateEditableBlock(element, block),
            focus: (element) => this.focusBlock(element)
        });
        
        this.register('number', {
            render: (block) => this.createListBlock(block, true),
            update: (element, block) => this.updateEditableBlock(element, block),
            focus: (element) => this.focusBlock(element)
        });
        
        this.register('checkbox', {
            render: (block) => this.createCheckboxBlock(block),
            update: (element, block) => this.updateCheckboxBlock(element, block),
            focus: (element) => this.focusBlock(element)
        });
        
        // Code Block
        this.register('codeblock', {
            render: (block) => this.createCodeBlock(block),
            update: (element, block) => this.updateCodeBlock(element, block),
            focus: (element) => this.focusCodeBlock(element)
        });
        
        // Image
        this.register('image', {
            render: (block) => this.createImageBlock(block),
            update: (element, block) => this.updateImageBlock(element, block),
            focus: (element) => element.focus()
        });
        
        // Table
        this.register('table', {
            render: (block) => this.createTableBlock(block),
            update: (element, block) => this.updateTableBlock(element, block),
            focus: (element) => this.focusTableBlock(element)
        });
        
        // Math
        this.register('math', {
            render: (block) => this.createMathBlock(block),
            update: (element, block) => this.updateMathBlock(element, block),
            focus: (element) => this.focusMathBlock(element)
        });
        
        // Divider
        this.register('divider', {
            render: (block) => this.createDividerBlock(block),
            update: (element, block) => element,
            focus: (element) => element.focus()
        });
    }
    
    register(type, component) {
        this.blockComponents.set(type, component);
    }
    
    // Render Methods
    render(block) {
        const component = this.blockComponents.get(block.type);
        if (!component) {
            console.warn(`No renderer for block type: ${block.type}`);
            return this.createEditableBlock('div', block, 'block-unknown');
        }
        
        const element = component.render(block);
        element.setAttribute('data-block-id', block.id);
        element.setAttribute('data-block-type', block.type);
        
        // Store reference
        this.blockElements.set(block.id, element);
        
        // Add event listeners
        this.attachBlockListeners(element, block);
        
        return element;
    }
    
    update(blockId, block) {
        const element = this.blockElements.get(blockId);
        if (!element) return null;
        
        const component = this.blockComponents.get(block.type);
        if (!component) return null;
        
        component.update(element, block);
        return element;
    }
    
    // Basic Block Creation
    createEditableBlock(tag, block, className) {
        const element = document.createElement(tag);
        element.className = `editor-block ${className}`;
        element.contentEditable = true;
        element.spellcheck = true;
        
        if (block.content) {
            if (typeof block.content === 'string') {
                element.textContent = block.content;
            } else if (block.content.text) {
                element.innerHTML = this.renderInlineStyles(block.content);
            }
        }
        
        if (!block.content || block.content === '') {
            element.setAttribute('data-placeholder', this.getPlaceholder(block.type));
        }
        
        return element;
    }
    
    updateEditableBlock(element, block) {
        if (typeof block.content === 'string') {
            if (element.textContent !== block.content) {
                element.textContent = block.content;
            }
        } else if (block.content.text) {
            const html = this.renderInlineStyles(block.content);
            if (element.innerHTML !== html) {
                element.innerHTML = html;
            }
        }
        
        if (!block.content || block.content === '') {
            element.setAttribute('data-placeholder', this.getPlaceholder(block.type));
        } else {
            element.removeAttribute('data-placeholder');
        }
    }
    
    // List Blocks
    createListBlock(block, ordered) {
        const element = this.createEditableBlock('li', block, ordered ? 'block-number' : 'block-bullet');
        
        if (ordered) {
            element.setAttribute('data-number', block.attributes?.index || 1);
        }
        
        return element;
    }
    
    // Checkbox Block
    createCheckboxBlock(block) {
        const wrapper = document.createElement('div');
        wrapper.className = 'editor-block block-checkbox';
        wrapper.setAttribute('data-checked', block.attributes?.checked || false);
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = block.attributes?.checked || false;
        checkbox.className = 'checkbox-input';
        checkbox.onclick = (e) => {
            e.stopPropagation();
            this.editor.dataModel.updateBlock(block.id, {
                attributes: { ...block.attributes, checked: checkbox.checked }
            });
            wrapper.setAttribute('data-checked', checkbox.checked);
        };
        
        const content = document.createElement('div');
        content.className = 'checkbox-content';
        content.contentEditable = true;
        content.textContent = block.content || '';
        
        if (!block.content) {
            content.setAttribute('data-placeholder', 'Task');
        }
        
        wrapper.appendChild(checkbox);
        wrapper.appendChild(content);
        
        return wrapper;
    }
    
    updateCheckboxBlock(element, block) {
        const checkbox = element.querySelector('.checkbox-input');
        const content = element.querySelector('.checkbox-content');
        
        if (checkbox) {
            checkbox.checked = block.attributes?.checked || false;
            element.setAttribute('data-checked', checkbox.checked);
        }
        
        if (content && content.textContent !== block.content) {
            content.textContent = block.content || '';
        }
    }
    
    // Code Block
    createCodeBlock(block) {
        const wrapper = document.createElement('div');
        wrapper.className = 'editor-block block-codeblock';
        
        const langSelector = document.createElement('select');
        langSelector.className = 'code-language';
        langSelector.innerHTML = `
            <option value="">Plain Text</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="sql">SQL</option>
            <option value="json">JSON</option>
            <option value="markdown">Markdown</option>
        `;
        langSelector.value = block.attributes?.language || '';
        langSelector.onchange = () => {
            this.editor.dataModel.updateBlock(block.id, {
                attributes: { ...block.attributes, language: langSelector.value }
            });
            this.highlightCode(pre, langSelector.value);
        };
        
        const pre = document.createElement('pre');
        const code = document.createElement('code');
        code.contentEditable = true;
        code.textContent = block.content || '';
        code.className = block.attributes?.language ? `language-${block.attributes.language}` : '';
        
        if (!block.content) {
            code.setAttribute('data-placeholder', 'Enter code...');
        }
        
        pre.appendChild(code);
        wrapper.appendChild(langSelector);
        wrapper.appendChild(pre);
        
        // Syntax highlighting
        if (block.attributes?.language && window.hljs) {
            this.highlightCode(pre, block.attributes.language);
        }
        
        return wrapper;
    }
    
    updateCodeBlock(element, block) {
        const code = element.querySelector('code');
        const langSelector = element.querySelector('.code-language');
        
        if (code && code.textContent !== block.content) {
            code.textContent = block.content || '';
        }
        
        if (langSelector && langSelector.value !== block.attributes?.language) {
            langSelector.value = block.attributes?.language || '';
            this.highlightCode(element.querySelector('pre'), block.attributes?.language);
        }
    }
    
    highlightCode(pre, language) {
        const code = pre.querySelector('code');
        if (!code || !window.hljs) return;
        
        code.className = language ? `language-${language}` : '';
        
        if (language) {
            window.hljs.highlightElement(code);
        }
    }
    
    // Image Block
    createImageBlock(block) {
        const wrapper = document.createElement('div');
        wrapper.className = 'editor-block block-image';
        wrapper.contentEditable = false;
        
        const img = document.createElement('img');
        img.src = block.content || '';
        img.alt = block.attributes?.alt || '';
        img.style.maxWidth = '100%';
        
        const caption = document.createElement('div');
        caption.className = 'image-caption';
        caption.contentEditable = true;
        caption.textContent = block.attributes?.caption || '';
        caption.setAttribute('data-placeholder', 'Add a caption...');
        
        wrapper.appendChild(img);
        wrapper.appendChild(caption);
        
        return wrapper;
    }
    
    updateImageBlock(element, block) {
        const img = element.querySelector('img');
        const caption = element.querySelector('.image-caption');
        
        if (img && img.src !== block.content) {
            img.src = block.content || '';
            img.alt = block.attributes?.alt || '';
        }
        
        if (caption && caption.textContent !== block.attributes?.caption) {
            caption.textContent = block.attributes?.caption || '';
        }
    }
    
    // Table Block
    createTableBlock(block) {
        const wrapper = document.createElement('div');
        wrapper.className = 'editor-block block-table';
        
        const table = document.createElement('table');
        table.className = 'editor-table';
        
        const data = block.content || { rows: 3, cols: 3, cells: [] };
        
        for (let i = 0; i < data.rows; i++) {
            const row = table.insertRow();
            for (let j = 0; j < data.cols; j++) {
                const cell = row.insertCell();
                cell.contentEditable = true;
                cell.textContent = data.cells?.[i]?.[j] || '';
                cell.setAttribute('data-placeholder', i === 0 ? 'Header' : 'Cell');
                
                if (i === 0) {
                    cell.style.fontWeight = 'bold';
                    cell.style.background = 'var(--theme-surface)';
                }
            }
        }
        
        wrapper.appendChild(table);
        return wrapper;
    }
    
    updateTableBlock(element, block) {
        // Complex table update logic
        // For now, recreate the table
        const wrapper = this.createTableBlock(block);
        element.replaceWith(wrapper);
        this.blockElements.set(block.id, wrapper);
        return wrapper;
    }
    
    // Math Block
    createMathBlock(block) {
        const wrapper = document.createElement('div');
        wrapper.className = 'editor-block block-math';
        
        const display = document.createElement('div');
        display.className = 'math-display';
        
        const input = document.createElement('textarea');
        input.className = 'math-input';
        input.value = block.content || '';
        input.placeholder = 'Enter LaTeX math expression...';
        input.style.display = 'none';
        
        // Render math
        if (block.content && window.katex) {
            try {
                window.katex.render(block.content, display, {
                    throwOnError: false,
                    displayMode: true
                });
            } catch (e) {
                display.textContent = 'Invalid LaTeX expression';
            }
        } else {
            display.textContent = 'Click to add math';
        }
        
        // Toggle edit mode
        wrapper.onclick = () => {
            if (input.style.display === 'none') {
                input.style.display = 'block';
                display.style.display = 'none';
                input.focus();
            }
        };
        
        input.onblur = () => {
            input.style.display = 'none';
            display.style.display = 'block';
            
            if (window.katex) {
                try {
                    window.katex.render(input.value, display, {
                        throwOnError: false,
                        displayMode: true
                    });
                } catch (e) {
                    display.textContent = 'Invalid LaTeX expression';
                }
            }
            
            this.editor.dataModel.updateBlock(block.id, {
                content: input.value
            });
        };
        
        wrapper.appendChild(display);
        wrapper.appendChild(input);
        
        return wrapper;
    }
    
    updateMathBlock(element, block) {
        const display = element.querySelector('.math-display');
        const input = element.querySelector('.math-input');
        
        if (input) {
            input.value = block.content || '';
        }
        
        if (display && window.katex) {
            try {
                window.katex.render(block.content || '', display, {
                    throwOnError: false,
                    displayMode: true
                });
            } catch (e) {
                display.textContent = 'Invalid LaTeX expression';
            }
        }
    }
    
    focusMathBlock(element) {
        const input = element.querySelector('.math-input');
        if (input) {
            input.style.display = 'block';
            element.querySelector('.math-display').style.display = 'none';
            input.focus();
        }
    }
    
    // Divider Block
    createDividerBlock(block) {
        const hr = document.createElement('hr');
        hr.className = 'editor-block block-divider';
        hr.contentEditable = false;
        return hr;
    }
    
    // Focus Management
    focusBlock(element) {
        const editable = element.querySelector('[contenteditable="true"]') || element;
        if (editable.contentEditable === 'true') {
            editable.focus();
            
            // Place cursor at end
            const range = document.createRange();
            const selection = window.getSelection();
            range.selectNodeContents(editable);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
    
    focusCodeBlock(element) {
        const code = element.querySelector('code');
        if (code) {
            code.focus();
        }
    }
    
    focusTableBlock(element) {
        const firstCell = element.querySelector('td');
        if (firstCell) {
            firstCell.focus();
        }
    }
    
    // Inline Styles Rendering
    renderInlineStyles(content) {
        if (!content.styles || content.styles.length === 0) {
            return this.escapeHtml(content.text);
        }
        
        let html = content.text;
        const styles = [...content.styles].sort((a, b) => b.offset - a.offset);
        
        styles.forEach(style => {
            const before = html.substring(0, style.offset);
            const styled = html.substring(style.offset, style.offset + style.length);
            const after = html.substring(style.offset + style.length);
            
            let wrapped = styled;
            switch (style.style) {
                case 'bold':
                    wrapped = `<strong>${styled}</strong>`;
                    break;
                case 'italic':
                    wrapped = `<em>${styled}</em>`;
                    break;
                case 'strikethrough':
                    wrapped = `<del>${styled}</del>`;
                    break;
                case 'code':
                    wrapped = `<code>${styled}</code>`;
                    break;
                case 'link':
                    wrapped = `<a href="${style.href || '#'}">${styled}</a>`;
                    break;
            }
            
            html = before + wrapped + after;
        });
        
        return html;
    }
    
    // Event Handlers
    attachBlockListeners(element, block) {
        // Input handling
        element.addEventListener('input', (e) => {
            this.handleBlockInput(element, block, e);
        });
        
        // Key handling
        element.addEventListener('keydown', (e) => {
            this.handleBlockKeydown(element, block, e);
        });
        
        // Focus/blur
        element.addEventListener('focus', (e) => {
            this.editor.emit('blockFocus', { blockId: block.id, element });
        });
        
        element.addEventListener('blur', (e) => {
            this.editor.emit('blockBlur', { blockId: block.id, element });
        });
    }
    
    handleBlockInput(element, block, event) {
        const content = this.extractContent(element, block.type);
        
        this.editor.dataModel.updateBlock(block.id, {
            content: content
        });
        
        // Check for slash command
        if (typeof content === 'string' && content.endsWith('/') && this.editor.slashMenu) {
            this.editor.slashMenu.show(element);
        }
        
        // Check for markdown shortcuts
        this.checkMarkdownShortcuts(element, block, content);
    }
    
    handleBlockKeydown(element, block, event) {
        switch (event.key) {
            case 'Enter':
                if (!event.shiftKey) {
                    event.preventDefault();
                    this.handleEnterKey(element, block);
                }
                break;
                
            case 'Backspace':
                if (this.isBlockEmpty(element)) {
                    event.preventDefault();
                    this.handleBackspaceOnEmptyBlock(element, block);
                }
                break;
                
            case 'Tab':
                event.preventDefault();
                this.handleTabKey(element, block, event.shiftKey);
                break;
                
            case '/':
                // Slash menu will be triggered by input event
                break;
        }
    }
    
    handleEnterKey(element, block) {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        
        // Get content before and after cursor
        const fullContent = this.extractContent(element, block.type);
        const beforeContent = this.getContentBeforeCursor(element, range);
        const afterContent = this.getContentAfterCursor(element, range);
        
        // Update current block with content before cursor
        this.editor.dataModel.updateBlock(block.id, {
            content: beforeContent
        });
        
        // Create new block with content after cursor
        const newBlock = this.editor.dataModel.createBlock('paragraph', afterContent);
        const blockIndex = this.editor.dataModel.findBlockIndex(block.id);
        this.editor.dataModel.insertBlock(newBlock, blockIndex + 1);
        
        // Render and focus new block
        setTimeout(() => {
            const newElement = this.render(newBlock);
            element.parentNode.insertBefore(newElement, element.nextSibling);
            this.focusBlock(newElement);
        }, 0);
    }
    
    handleBackspaceOnEmptyBlock(element, block) {
        const blockIndex = this.editor.dataModel.findBlockIndex(block.id);
        
        if (blockIndex > 0) {
            // Focus previous block
            const prevBlock = this.editor.dataModel.document.blocks[blockIndex - 1];
            const prevElement = this.blockElements.get(prevBlock.id);
            
            if (prevElement) {
                this.focusBlock(prevElement);
            }
            
            // Delete current block
            this.editor.dataModel.deleteBlock(block.id);
            element.remove();
        } else if (block.type !== 'paragraph') {
            // Convert to paragraph
            this.editor.dataModel.updateBlock(block.id, {
                type: 'paragraph',
                content: ''
            });
            
            // Re-render as paragraph
            const newElement = this.render({ ...block, type: 'paragraph' });
            element.replaceWith(newElement);
            this.focusBlock(newElement);
        }
    }
    
    handleTabKey(element, block, isShiftTab) {
        // Handle indentation for lists
        if (block.type === 'bullet' || block.type === 'number') {
            const indent = block.attributes?.indent || 0;
            const newIndent = isShiftTab ? Math.max(0, indent - 1) : indent + 1;
            
            this.editor.dataModel.updateBlock(block.id, {
                attributes: { ...block.attributes, indent: newIndent }
            });
            
            element.style.paddingLeft = `${newIndent * 2 + 2}rem`;
        }
    }
    
    checkMarkdownShortcuts(element, block, content) {
        if (typeof content !== 'string') return;
        
        const shortcuts = [
            { pattern: /^#\s$/, type: 'heading1' },
            { pattern: /^##\s$/, type: 'heading2' },
            { pattern: /^###\s$/, type: 'heading3' },
            { pattern: /^####\s$/, type: 'heading4' },
            { pattern: /^>\s$/, type: 'quote' },
            { pattern: /^-\s$/, type: 'bullet' },
            { pattern: /^\d+\.\s$/, type: 'number' },
            { pattern: /^\[\]\s$/, type: 'checkbox' },
            { pattern: /^```$/, type: 'codeblock' }
        ];
        
        for (const shortcut of shortcuts) {
            if (shortcut.pattern.test(content)) {
                // Transform block
                this.editor.dataModel.updateBlock(block.id, {
                    type: shortcut.type,
                    content: ''
                });
                
                // Re-render
                const newElement = this.render({ ...block, type: shortcut.type, content: '' });
                element.replaceWith(newElement);
                this.focusBlock(newElement);
                
                break;
            }
        }
    }
    
    // Utility Methods
    extractContent(element, blockType) {
        if (blockType === 'checkbox') {
            const content = element.querySelector('.checkbox-content');
            return content ? content.textContent : '';
        } else if (blockType === 'codeblock') {
            const code = element.querySelector('code');
            return code ? code.textContent : '';
        } else if (blockType === 'table') {
            // Extract table data
            const table = element.querySelector('table');
            const data = { rows: 0, cols: 0, cells: [] };
            
            if (table) {
                data.rows = table.rows.length;
                data.cols = table.rows[0]?.cells.length || 0;
                
                for (let i = 0; i < data.rows; i++) {
                    data.cells[i] = [];
                    for (let j = 0; j < data.cols; j++) {
                        data.cells[i][j] = table.rows[i].cells[j].textContent;
                    }
                }
            }
            
            return data;
        } else {
            return element.textContent || '';
        }
    }
    
    isBlockEmpty(element) {
        const content = element.textContent || '';
        return content.trim() === '' || content === '\n';
    }
    
    getContentBeforeCursor(element, range) {
        const preRange = range.cloneRange();
        preRange.selectNodeContents(element);
        preRange.setEnd(range.startContainer, range.startOffset);
        return preRange.toString();
    }
    
    getContentAfterCursor(element, range) {
        const postRange = range.cloneRange();
        postRange.selectNodeContents(element);
        postRange.setStart(range.endContainer, range.endOffset);
        return postRange.toString();
    }
    
    getPlaceholder(type) {
        const placeholders = {
            paragraph: 'Type something...',
            heading1: 'Heading 1',
            heading2: 'Heading 2', 
            heading3: 'Heading 3',
            heading4: 'Heading 4',
            quote: 'Quote',
            bullet: 'List item',
            number: 'List item',
            checkbox: 'Task',
            codeblock: 'Code',
            table: 'Table'
        };
        
        return placeholders[type] || 'Type something...';
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    destroy() {
        this.blockElements.clear();
        this.blockComponents.clear();
    }
}