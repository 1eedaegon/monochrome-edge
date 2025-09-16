/**
 * Enhanced Block Renderer with focus line syntax display and advanced features
 * Converts data model blocks to DOM elements with Obsidian-like features
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
            update: (element, block) => this.updateListBlock(element, block, false),
            focus: (element) => this.focusBlock(element)
        });

        this.register('number', {
            render: (block) => this.createListBlock(block, true),
            update: (element, block) => this.updateListBlock(element, block, true),
            focus: (element) => this.focusBlock(element)
        });

        this.register('checkbox', {
            render: (block) => this.createCheckboxBlock(block),
            update: (element, block) => this.updateCheckboxBlock(element, block),
            focus: (element) => this.focusBlock(element)
        });

        // Code Block with Prism.js support
        this.register('codeblock', {
            render: (block) => this.createCodeBlock(block),
            update: (element, block) => this.updateCodeBlock(element, block),
            focus: (element) => this.focusCodeBlock(element)
        });

        // Math with KaTeX
        this.register('math', {
            render: (block) => this.createMathBlock(block),
            update: (element, block) => this.updateMathBlock(element, block),
            focus: (element) => this.focusMathBlock(element)
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

    // Main render method
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

    // Enhanced editable block with focus syntax display
    createEditableBlock(tag, block, className) {
        const wrapper = document.createElement('div');
        wrapper.className = `editor-block-wrapper ${className}-wrapper`;

        // Syntax indicator (shown on focus, Obsidian-like)
        const syntaxIndicator = document.createElement('span');
        syntaxIndicator.className = 'syntax-indicator';
        syntaxIndicator.textContent = this.getSyntaxIndicator(block.type);

        const element = document.createElement(tag);
        element.className = `editor-block ${className}`;
        element.contentEditable = true;
        element.spellcheck = true;

        // Render content with inline styles
        if (block.content) {
            element.innerHTML = this.renderInlineStyles(block.content, block.styles);
        }

        if (!block.content || block.content === '') {
            element.setAttribute('data-placeholder', this.getPlaceholder(block.type));
        }

        // Apply indentation
        if (block.attributes?.indent) {
            wrapper.style.paddingLeft = `${block.attributes.indent * 24}px`;
        }

        wrapper.appendChild(syntaxIndicator);
        wrapper.appendChild(element);

        return wrapper;
    }

    updateEditableBlock(element, block) {
        const contentElement = element.querySelector('.editor-block') || element;

        const html = this.renderInlineStyles(block.content || '', block.styles);
        if (contentElement.innerHTML !== html) {
            // Save cursor position
            const selection = window.getSelection();
            const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
            const cursorPos = range ? range.startOffset : 0;

            contentElement.innerHTML = html;

            // Restore cursor
            if (range && contentElement.childNodes.length > 0) {
                try {
                    const newRange = document.createRange();
                    const textNode = contentElement.childNodes[0];
                    newRange.setStart(textNode, Math.min(cursorPos, textNode.length));
                    newRange.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                } catch (e) {
                    // Cursor restore failed, ignore
                }
            }
        }

        if (!block.content || block.content === '') {
            contentElement.setAttribute('data-placeholder', this.getPlaceholder(block.type));
        } else {
            contentElement.removeAttribute('data-placeholder');
        }

        // Update indentation
        if (block.attributes?.indent && element.classList.contains('editor-block-wrapper')) {
            element.style.paddingLeft = `${block.attributes.indent * 24}px`;
        }
    }

    // List blocks with proper indentation
    createListBlock(block, ordered) {
        const wrapper = document.createElement('div');
        wrapper.className = `editor-block-wrapper ${ordered ? 'block-number' : 'block-bullet'}-wrapper`;

        // Syntax indicator
        const syntaxIndicator = document.createElement('span');
        syntaxIndicator.className = 'syntax-indicator list-marker';
        syntaxIndicator.textContent = ordered ? `${block.attributes?.index || 1}.` : '•';

        const element = document.createElement('div');
        element.className = `editor-block ${ordered ? 'block-number' : 'block-bullet'}`;
        element.contentEditable = true;
        element.spellcheck = true;
        element.innerHTML = this.renderInlineStyles(block.content || '', block.styles);

        if (!block.content || block.content === '') {
            element.setAttribute('data-placeholder', 'List item');
        }

        // Apply indentation
        if (block.attributes?.indent) {
            wrapper.style.paddingLeft = `${block.attributes.indent * 24}px`;
        }

        wrapper.appendChild(syntaxIndicator);
        wrapper.appendChild(element);

        return wrapper;
    }

    updateListBlock(element, block, ordered) {
        const contentElement = element.querySelector('.editor-block');
        const markerElement = element.querySelector('.list-marker');

        if (contentElement) {
            const html = this.renderInlineStyles(block.content || '', block.styles);
            if (contentElement.innerHTML !== html) {
                contentElement.innerHTML = html;
            }
        }

        if (markerElement && ordered) {
            markerElement.textContent = `${block.attributes?.index || 1}.`;
        }

        // Update indentation
        if (element.classList.contains('editor-block-wrapper')) {
            element.style.paddingLeft = `${(block.attributes?.indent || 0) * 24}px`;
        }
    }

    // Checkbox block
    createCheckboxBlock(block) {
        const wrapper = document.createElement('div');
        wrapper.className = 'editor-block-wrapper block-checkbox-wrapper';
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
        content.className = 'editor-block checkbox-content';
        content.contentEditable = true;
        content.innerHTML = this.renderInlineStyles(block.content || '', block.styles);

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

        if (content) {
            const html = this.renderInlineStyles(block.content || '', block.styles);
            if (content.innerHTML !== html) {
                content.innerHTML = html;
            }
        }
    }

    // Enhanced code block with Prism.js
    createCodeBlock(block) {
        const wrapper = document.createElement('div');
        wrapper.className = 'editor-block-wrapper block-codeblock-wrapper';

        const header = document.createElement('div');
        header.className = 'code-header';

        const langSelector = document.createElement('select');
        langSelector.className = 'code-language';
        langSelector.innerHTML = `
            <option value="">Plain Text</option>
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="csharp">C#</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="sql">SQL</option>
            <option value="json">JSON</option>
            <option value="yaml">YAML</option>
            <option value="markdown">Markdown</option>
            <option value="bash">Bash</option>
        `;
        langSelector.value = block.attributes?.language || '';
        langSelector.onchange = () => {
            this.editor.dataModel.updateBlock(block.id, {
                attributes: { ...block.attributes, language: langSelector.value }
            });
            this.highlightCode(pre, langSelector.value);
        };

        const copyBtn = document.createElement('button');
        copyBtn.className = 'code-copy-btn';
        copyBtn.textContent = 'Copy';
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(block.content || '');
            copyBtn.textContent = 'Copied!';
            setTimeout(() => copyBtn.textContent = 'Copy', 2000);
        };

        header.appendChild(langSelector);
        header.appendChild(copyBtn);

        const pre = document.createElement('pre');
        pre.className = 'code-pre';
        const code = document.createElement('code');
        code.contentEditable = true;
        code.textContent = block.content || '';
        code.className = block.attributes?.language ? `language-${block.attributes.language}` : '';

        if (!block.content) {
            code.setAttribute('data-placeholder', 'Enter code...');
        }

        pre.appendChild(code);
        wrapper.appendChild(header);
        wrapper.appendChild(pre);

        // Apply syntax highlighting
        if (block.attributes?.language) {
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
        if (!code) return;

        code.className = language ? `language-${language}` : '';

        // Use Prism.js if available
        if (window.Prism && language) {
            // Store content
            const content = code.textContent;
            // Apply highlighting
            code.innerHTML = window.Prism.highlight(content, window.Prism.languages[language] || window.Prism.languages.plain, language);
        }
    }

    // Math block with KaTeX
    createMathBlock(block) {
        const wrapper = document.createElement('div');
        wrapper.className = 'editor-block-wrapper block-math-wrapper';

        const display = document.createElement('div');
        display.className = 'math-display';
        display.onclick = () => {
            display.style.display = 'none';
            input.style.display = 'block';
            input.focus();
        };

        const input = document.createElement('textarea');
        input.className = 'math-input editor-block';
        input.value = block.content || '';
        input.placeholder = 'Enter LaTeX expression (e.g., \\frac{1}{2})';
        input.style.display = 'none';

        input.onblur = () => {
            this.editor.dataModel.updateBlock(block.id, { content: input.value });
            this.renderMath(display, input.value);
            if (input.value) {
                input.style.display = 'none';
                display.style.display = 'block';
            }
        };

        input.onkeydown = (e) => {
            if (e.key === 'Escape') {
                input.blur();
            }
        };

        // Initial render
        if (block.content) {
            this.renderMath(display, block.content);
        } else {
            input.style.display = 'block';
            display.style.display = 'none';
        }

        wrapper.appendChild(display);
        wrapper.appendChild(input);

        return wrapper;
    }

    updateMathBlock(element, block) {
        const display = element.querySelector('.math-display');
        const input = element.querySelector('.math-input');

        if (input && input.value !== block.content) {
            input.value = block.content || '';
        }

        if (display && block.content) {
            this.renderMath(display, block.content);
        }
    }

    renderMath(display, latex) {
        if (!latex) {
            display.innerHTML = '<span style="color: var(--theme-text-secondary)">Click to add LaTeX expression</span>';
            return;
        }

        if (window.katex) {
            try {
                window.katex.render(latex, display, {
                    throwOnError: false,
                    displayMode: true
                });
            } catch (e) {
                display.innerHTML = `<span style="color: var(--theme-error)">Error: ${e.message}</span>`;
            }
        } else {
            // Fallback if KaTeX not loaded
            display.innerHTML = `<code>${latex}</code>`;
        }
    }

    focusMathBlock(element) {
        const input = element.querySelector('.math-input');
        if (input) {
            input.style.display = 'block';
            input.focus();
        }
    }

    // Enhanced table with better editing
    createTableBlock(block) {
        const wrapper = document.createElement('div');
        wrapper.className = 'editor-block-wrapper block-table-wrapper';

        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-container';

        const table = document.createElement('table');
        table.className = 'editor-table';

        const data = block.content || { rows: 3, cols: 3, cells: [] };

        // Create table
        for (let i = 0; i < data.rows; i++) {
            const row = table.insertRow();
            for (let j = 0; j < data.cols; j++) {
                const cell = i === 0 ? row.insertCell() : row.insertCell();
                const cellContent = document.createElement('div');
                cellContent.contentEditable = true;
                cellContent.className = 'table-cell-content';
                cellContent.innerHTML = this.renderInlineStyles(data.cells?.[i]?.[j] || '', null);
                cellContent.setAttribute('data-placeholder', i === 0 ? 'Header' : 'Cell');
                cellContent.dataset.row = i;
                cellContent.dataset.col = j;

                if (i === 0) {
                    cell.className = 'table-header';
                }

                cell.appendChild(cellContent);
            }
        }

        // Add table controls
        const controls = document.createElement('div');
        controls.className = 'table-controls';
        controls.innerHTML = `
            <button class="table-btn add-row">+ Row</button>
            <button class="table-btn add-col">+ Column</button>
            <button class="table-btn remove-row">- Row</button>
            <button class="table-btn remove-col">- Column</button>
        `;

        controls.querySelector('.add-row').onclick = () => this.addTableRow(block.id, table);
        controls.querySelector('.add-col').onclick = () => this.addTableColumn(block.id, table);
        controls.querySelector('.remove-row').onclick = () => this.removeTableRow(block.id, table);
        controls.querySelector('.remove-col').onclick = () => this.removeTableColumn(block.id, table);

        tableContainer.appendChild(table);
        wrapper.appendChild(tableContainer);
        wrapper.appendChild(controls);

        return wrapper;
    }

    updateTableBlock(element, block) {
        // For complex table updates, recreate the table
        const newWrapper = this.createTableBlock(block);
        element.replaceWith(newWrapper);
        this.blockElements.set(block.id, newWrapper);
        return newWrapper;
    }

    addTableRow(blockId, table) {
        const cols = table.rows[0]?.cells.length || 3;
        const row = table.insertRow();

        for (let j = 0; j < cols; j++) {
            const cell = row.insertCell();
            const cellContent = document.createElement('div');
            cellContent.contentEditable = true;
            cellContent.className = 'table-cell-content';
            cellContent.setAttribute('data-placeholder', 'Cell');
            cell.appendChild(cellContent);
        }

        this.saveTableData(blockId, table);
    }

    addTableColumn(blockId, table) {
        for (let i = 0; i < table.rows.length; i++) {
            const cell = table.rows[i].insertCell();
            const cellContent = document.createElement('div');
            cellContent.contentEditable = true;
            cellContent.className = 'table-cell-content';
            cellContent.setAttribute('data-placeholder', i === 0 ? 'Header' : 'Cell');
            if (i === 0) cell.className = 'table-header';
            cell.appendChild(cellContent);
        }

        this.saveTableData(blockId, table);
    }

    removeTableRow(blockId, table) {
        if (table.rows.length > 1) {
            table.deleteRow(-1);
            this.saveTableData(blockId, table);
        }
    }

    removeTableColumn(blockId, table) {
        if (table.rows[0]?.cells.length > 1) {
            for (let i = 0; i < table.rows.length; i++) {
                table.rows[i].deleteCell(-1);
            }
            this.saveTableData(blockId, table);
        }
    }

    saveTableData(blockId, table) {
        const data = {
            rows: table.rows.length,
            cols: table.rows[0]?.cells.length || 0,
            cells: []
        };

        for (let i = 0; i < data.rows; i++) {
            data.cells[i] = [];
            for (let j = 0; j < data.cols; j++) {
                const cellContent = table.rows[i].cells[j].querySelector('.table-cell-content');
                data.cells[i][j] = cellContent?.textContent || '';
            }
        }

        this.editor.dataModel.updateBlock(blockId, { content: data });
    }

    focusTableBlock(element) {
        const firstCell = element.querySelector('.table-cell-content');
        if (firstCell) {
            firstCell.focus();
        }
    }

    // Image block with preview
    createImageBlock(block) {
        const wrapper = document.createElement('div');
        wrapper.className = 'editor-block-wrapper block-image-wrapper';
        wrapper.contentEditable = false;

        const imgContainer = document.createElement('div');
        imgContainer.className = 'image-container';

        const img = document.createElement('img');
        img.src = block.content || '';
        img.alt = block.attributes?.alt || '';
        img.style.maxWidth = '100%';
        img.loading = 'lazy';

        const caption = document.createElement('div');
        caption.className = 'image-caption editor-block';
        caption.contentEditable = true;
        caption.innerHTML = this.renderInlineStyles(block.attributes?.caption || '', block.attributes?.captionStyles);
        caption.setAttribute('data-placeholder', 'Add a caption...');

        const sizeInfo = document.createElement('div');
        sizeInfo.className = 'image-size-info';
        sizeInfo.textContent = block.attributes?.size || '';

        imgContainer.appendChild(img);
        wrapper.appendChild(imgContainer);
        wrapper.appendChild(caption);
        wrapper.appendChild(sizeInfo);

        return wrapper;
    }

    updateImageBlock(element, block) {
        const img = element.querySelector('img');
        const caption = element.querySelector('.image-caption');

        if (img && img.src !== block.content) {
            img.src = block.content || '';
            img.alt = block.attributes?.alt || '';
        }

        if (caption) {
            const html = this.renderInlineStyles(block.attributes?.caption || '', block.attributes?.captionStyles);
            if (caption.innerHTML !== html) {
                caption.innerHTML = html;
            }
        }
    }

    // Divider block
    createDividerBlock(block) {
        const wrapper = document.createElement('div');
        wrapper.className = 'editor-block-wrapper block-divider-wrapper';
        wrapper.contentEditable = false;

        const hr = document.createElement('hr');
        hr.className = 'editor-divider';

        wrapper.appendChild(hr);
        return wrapper;
    }

    // Event handlers
    attachBlockListeners(element, block) {
        const contentElement = element.querySelector('[contenteditable="true"]') || element;

        // Focus/blur for syntax indicators
        contentElement.addEventListener('focus', (e) => {
            element.classList.add('focused');
            this.editor.emit('blockFocus', { blockId: block.id, element });
        });

        contentElement.addEventListener('blur', (e) => {
            element.classList.remove('focused');
            this.editor.emit('blockBlur', { blockId: block.id, element });
        });

        // Input handling
        contentElement.addEventListener('input', (e) => {
            this.handleBlockInput(contentElement, block, e);
        });

        // Keydown for special keys
        contentElement.addEventListener('keydown', (e) => {
            this.handleBlockKeydown(contentElement, block, e);
        });
    }

    handleBlockInput(element, block, event) {
        const content = element.innerHTML;
        const parsed = this.parseInlineStyles(content);

        this.editor.dataModel.updateBlock(block.id, {
            content: parsed.text,
            styles: parsed.styles
        });

        // Check for slash command
        if (parsed.text.endsWith('/') && this.editor.slashMenu) {
            this.editor.slashMenu.show(element);
        }

        // Check for markdown shortcuts
        this.checkMarkdownShortcuts(element, block, parsed.text);

        this.editor.emit('change');
    }

    handleBlockKeydown(element, block, event) {
        // Handled by InputHandler
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
            { pattern: /^\*\s$/, type: 'bullet' },
            { pattern: /^\d+\.\s$/, type: 'number' },
            { pattern: /^\[\]\s$/, type: 'checkbox' },
            { pattern: /^```$/, type: 'codeblock' },
            { pattern: /^---$/, type: 'divider' },
            { pattern: /^\$\$$/, type: 'math' }
        ];

        for (const shortcut of shortcuts) {
            if (shortcut.pattern.test(content)) {
                // Transform block
                this.editor.dataModel.updateBlock(block.id, {
                    type: shortcut.type,
                    content: content.replace(shortcut.pattern, '').trim()
                });

                // Re-render
                const newBlock = this.editor.dataModel.getBlock(block.id);
                const newElement = this.render(newBlock);
                element.closest('.editor-block-wrapper').replaceWith(newElement);
                this.focusBlock(newElement);

                break;
            }
        }
    }

    // Focus management
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

    // Helper methods
    getSyntaxIndicator(type) {
        switch(type) {
            case 'heading1': return '#';
            case 'heading2': return '##';
            case 'heading3': return '###';
            case 'heading4': return '####';
            case 'quote': return '>';
            case 'bullet': return '•';
            case 'number': return '1.';
            case 'checkbox': return '☐';
            case 'codeblock': return '```';
            case 'math': return '$$';
            default: return '';
        }
    }

    getPlaceholder(type) {
        switch(type) {
            case 'heading1': return 'Heading 1';
            case 'heading2': return 'Heading 2';
            case 'heading3': return 'Heading 3';
            case 'heading4': return 'Heading 4';
            case 'quote': return 'Quote';
            case 'bullet': return 'List item';
            case 'number': return 'List item';
            case 'checkbox': return 'Task';
            case 'codeblock': return 'Code';
            case 'math': return 'LaTeX expression';
            default: return 'Type something...';
        }
    }

    // Inline styles rendering and parsing
    renderInlineStyles(text, styles) {
        if (!text && !styles) return '';
        if (!styles || styles.length === 0) return this.escapeHtml(text || '');

        // Sort styles by position
        const sortedStyles = [...styles].sort((a, b) => a.offset - b.offset);

        let html = '';
        let lastOffset = 0;

        sortedStyles.forEach(style => {
            // Add text before this style
            if (style.offset > lastOffset) {
                html += this.escapeHtml(text.substring(lastOffset, style.offset));
            }

            // Apply style
            const styledText = this.escapeHtml(text.substring(style.offset, style.offset + style.length));

            switch(style.style) {
                case 'bold':
                    html += `<strong>${styledText}</strong>`;
                    break;
                case 'italic':
                    html += `<em>${styledText}</em>`;
                    break;
                case 'strikethrough':
                    html += `<del>${styledText}</del>`;
                    break;
                case 'code':
                    html += `<code>${styledText}</code>`;
                    break;
                case 'link':
                    html += `<a href="${style.href}" target="_blank" rel="noopener">${styledText}</a>`;
                    break;
                default:
                    html += styledText;
            }

            lastOffset = style.offset + style.length;
        });

        // Add remaining text
        if (lastOffset < text.length) {
            html += this.escapeHtml(text.substring(lastOffset));
        }

        return html;
    }

    parseInlineStyles(html) {
        // Parse HTML back to text and styles
        const div = document.createElement('div');
        div.innerHTML = html;

        let text = '';
        const styles = [];

        const processNode = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                text += node.textContent;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const startOffset = text.length;

                // Process children first
                Array.from(node.childNodes).forEach(processNode);

                const length = text.length - startOffset;
                if (length > 0) {
                    switch(node.tagName.toLowerCase()) {
                        case 'strong':
                        case 'b':
                            styles.push({ style: 'bold', offset: startOffset, length });
                            break;
                        case 'em':
                        case 'i':
                            styles.push({ style: 'italic', offset: startOffset, length });
                            break;
                        case 'del':
                        case 's':
                            styles.push({ style: 'strikethrough', offset: startOffset, length });
                            break;
                        case 'code':
                            styles.push({ style: 'code', offset: startOffset, length });
                            break;
                        case 'a':
                            styles.push({
                                style: 'link',
                                offset: startOffset,
                                length,
                                href: node.getAttribute('href')
                            });
                            break;
                    }
                }
            }
        };

        Array.from(div.childNodes).forEach(processNode);

        return { text, styles };
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Cleanup
    destroy() {
        this.blockElements.clear();
        this.blockComponents.clear();
    }
}