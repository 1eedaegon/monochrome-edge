/**
 * Block Manager
 * Manages all block types and their rendering
 */

export class BlockManager {
    constructor(editor) {
        this.editor = editor;
        this.blockTypes = new Map();
        
        // Register default block types
        this.registerDefaultBlocks();
    }
    
    registerDefaultBlocks() {
        // Text blocks
        this.register('paragraph', {
            render: (data) => this.renderParagraph(data),
            toMarkdown: (data) => data.content + '\n\n',
            fromMarkdown: (text) => ({ type: 'paragraph', content: text })
        });
        
        this.register('heading1', {
            render: (data) => this.renderHeading(data, 1),
            toMarkdown: (data) => `# ${data.content}\n\n`,
            fromMarkdown: (text) => ({ type: 'heading1', content: text.replace(/^#\s/, '') })
        });
        
        this.register('heading2', {
            render: (data) => this.renderHeading(data, 2),
            toMarkdown: (data) => `## ${data.content}\n\n`,
            fromMarkdown: (text) => ({ type: 'heading2', content: text.replace(/^##\s/, '') })
        });
        
        this.register('heading3', {
            render: (data) => this.renderHeading(data, 3),
            toMarkdown: (data) => `### ${data.content}\n\n`,
            fromMarkdown: (text) => ({ type: 'heading3', content: text.replace(/^###\s/, '') })
        });
        
        this.register('heading4', {
            render: (data) => this.renderHeading(data, 4),
            toMarkdown: (data) => `#### ${data.content}\n\n`,
            fromMarkdown: (text) => ({ type: 'heading4', content: text.replace(/^####\s/, '') })
        });
        
        this.register('quote', {
            render: (data) => this.renderQuote(data),
            toMarkdown: (data) => `> ${data.content}\n\n`,
            fromMarkdown: (text) => ({ type: 'quote', content: text.replace(/^>\s/, '') })
        });
        
        // Lists
        this.register('bullet', {
            render: (data) => this.renderList(data, 'bullet'),
            toMarkdown: (data) => `- ${data.content}\n`,
            fromMarkdown: (text) => ({ type: 'bullet', content: text.replace(/^[-*]\s/, '') })
        });
        
        this.register('number', {
            render: (data) => this.renderList(data, 'number'),
            toMarkdown: (data) => `${data.metadata?.number || 1}. ${data.content}\n`,
            fromMarkdown: (text) => ({ type: 'number', content: text.replace(/^\d+\.\s/, '') })
        });
        
        this.register('checkbox', {
            render: (data) => this.renderCheckbox(data),
            toMarkdown: (data) => `- [${data.metadata?.checked ? 'x' : ' '}] ${data.content}\n`,
            fromMarkdown: (text) => ({ 
                type: 'checkbox', 
                content: text.replace(/^-\s\[[x\s]\]\s/, ''),
                metadata: { checked: text.includes('[x]') }
            })
        });
        
        // Code
        this.register('codeblock', {
            render: (data) => this.renderCodeBlock(data),
            toMarkdown: (data) => `\`\`\`${data.metadata?.language || ''}\n${data.content}\n\`\`\`\n\n`,
            fromMarkdown: (text) => ({ 
                type: 'codeblock', 
                content: text.replace(/^```.*\n/, '').replace(/\n```$/, ''),
                metadata: { language: text.match(/^```(\w+)/)?.[1] || '' }
            })
        });
        
        // Media
        this.register('image', {
            render: (data) => this.renderImage(data),
            toMarkdown: (data) => `![${data.metadata?.alt || ''}](${data.metadata?.src || ''})\n\n`,
            fromMarkdown: (text) => {
                const match = text.match(/!\[(.*?)\]\((.*?)\)/);
                return {
                    type: 'image',
                    content: '',
                    metadata: { alt: match?.[1] || '', src: match?.[2] || '' }
                };
            }
        });
        
        // Math
        this.register('math', {
            render: (data) => this.renderMath(data),
            toMarkdown: (data) => `$$\n${data.content}\n$$\n\n`,
            fromMarkdown: (text) => ({ 
                type: 'math', 
                content: text.replace(/^\$\$\n/, '').replace(/\n\$\$$/, '')
            })
        });
        
        // Table
        this.register('table', {
            render: (data) => this.renderTable(data),
            toMarkdown: (data) => this.tableToMarkdown(data),
            fromMarkdown: (text) => this.markdownToTable(text)
        });
    }
    
    register(type, handler) {
        this.blockTypes.set(type, handler);
    }
    
    createBlock(data) {
        const handler = this.blockTypes.get(data.type) || this.blockTypes.get('paragraph');
        return handler.render(data);
    }
    
    // Render methods
    renderParagraph(data) {
        const block = document.createElement('div');
        block.className = 'editor-block block-paragraph';
        block.dataset.blockId = data.id;
        block.dataset.blockType = 'paragraph';
        block.contentEditable = 'true';
        block.textContent = data.content || '';
        
        if (!data.content) {
            block.dataset.placeholder = this.editor.config.placeholder;
        }
        
        return block;
    }
    
    renderHeading(data, level) {
        const block = document.createElement(`h${level}`);
        block.className = `editor-block block-heading${level}`;
        block.dataset.blockId = data.id;
        block.dataset.blockType = `heading${level}`;
        block.contentEditable = 'true';
        block.textContent = data.content || '';
        return block;
    }
    
    renderQuote(data) {
        const block = document.createElement('blockquote');
        block.className = 'editor-block block-quote';
        block.dataset.blockId = data.id;
        block.dataset.blockType = 'quote';
        block.contentEditable = 'true';
        block.textContent = data.content || '';
        return block;
    }
    
    renderList(data, type) {
        const block = document.createElement('div');
        block.className = `editor-block block-${type}`;
        block.dataset.blockId = data.id;
        block.dataset.blockType = type;
        block.contentEditable = 'true';
        block.textContent = data.content || '';
        
        if (type === 'number') {
            block.dataset.number = data.metadata?.number || 1;
        }
        
        return block;
    }
    
    renderCheckbox(data) {
        const block = document.createElement('div');
        block.className = 'editor-block block-checkbox';
        block.dataset.blockId = data.id;
        block.dataset.blockType = 'checkbox';
        block.dataset.checked = data.metadata?.checked || false;
        block.contentEditable = 'true';
        block.textContent = data.content || '';
        return block;
    }
    
    renderCodeBlock(data) {
        const block = document.createElement('div');
        block.className = 'editor-block block-codeblock';
        block.dataset.blockId = data.id;
        block.dataset.blockType = 'codeblock';
        
        const pre = document.createElement('pre');
        const code = document.createElement('code');
        code.className = `language-${data.metadata?.language || 'plaintext'}`;
        code.contentEditable = 'true';
        code.textContent = data.content || '';
        
        pre.appendChild(code);
        block.appendChild(pre);
        
        // Highlight if library is available
        if (window.hljs) {
            window.hljs.highlightElement(code);
        }
        
        return block;
    }
    
    renderImage(data) {
        const block = document.createElement('div');
        block.className = 'editor-block block-image';
        block.dataset.blockId = data.id;
        block.dataset.blockType = 'image';
        
        if (data.metadata?.attachmentId) {
            // Load from IndexedDB
            this.editor.storage.getAttachment(data.metadata.attachmentId).then(attachment => {
                if (attachment) {
                    const img = document.createElement('img');
                    img.src = attachment.url;
                    img.alt = data.metadata?.alt || '';
                    block.appendChild(img);
                }
            });
        } else if (data.metadata?.src) {
            const img = document.createElement('img');
            img.src = data.metadata.src;
            img.alt = data.metadata?.alt || '';
            block.appendChild(img);
        }
        
        return block;
    }
    
    renderMath(data) {
        const block = document.createElement('div');
        block.className = 'editor-block block-math';
        block.dataset.blockId = data.id;
        block.dataset.blockType = 'math';
        block.contentEditable = 'true';
        
        // Render with KaTeX if available
        if (window.katex) {
            try {
                katex.render(data.content || '', block, {
                    displayMode: true,
                    throwOnError: false
                });
            } catch (e) {
                block.textContent = data.content || '';
            }
        } else {
            block.textContent = data.content || '';
        }
        
        // Make editable on click
        block.addEventListener('click', () => {
            if (block.contentEditable === 'false') {
                block.contentEditable = 'true';
                block.textContent = data.content;
                block.focus();
            }
        });
        
        block.addEventListener('blur', () => {
            data.content = block.textContent;
            if (window.katex) {
                block.contentEditable = 'false';
                try {
                    katex.render(data.content, block, {
                        displayMode: true,
                        throwOnError: false
                    });
                } catch (e) {
                    block.textContent = data.content;
                }
            }
        });
        
        return block;
    }
    
    renderTable(data) {
        const block = document.createElement('div');
        block.className = 'editor-block block-table';
        block.dataset.blockId = data.id;
        block.dataset.blockType = 'table';
        
        const table = document.createElement('table');
        table.className = 'editor-table';
        
        // Create table from data
        if (data.metadata?.rows) {
            data.metadata.rows.forEach((row, i) => {
                const tr = document.createElement('tr');
                row.forEach(cell => {
                    const td = i === 0 ? document.createElement('th') : document.createElement('td');
                    td.contentEditable = 'true';
                    td.textContent = cell;
                    tr.appendChild(td);
                });
                table.appendChild(tr);
            });
        } else {
            // Default 3x3 table
            for (let i = 0; i < 3; i++) {
                const tr = document.createElement('tr');
                for (let j = 0; j < 3; j++) {
                    const td = i === 0 ? document.createElement('th') : document.createElement('td');
                    td.contentEditable = 'true';
                    td.textContent = i === 0 ? `Header ${j + 1}` : 'Cell';
                    tr.appendChild(td);
                }
                table.appendChild(tr);
            }
        }
        
        block.appendChild(table);
        return block;
    }
    
    // Markdown conversion
    async toMarkdown(blocks) {
        let markdown = '';
        
        for (const block of blocks) {
            const handler = this.blockTypes.get(block.type);
            if (handler && handler.toMarkdown) {
                markdown += handler.toMarkdown(block);
            } else {
                markdown += block.content + '\n\n';
            }
        }
        
        return markdown;
    }
    
    async fromMarkdown(markdown) {
        const blocks = [];
        const lines = markdown.split('\n');
        
        let currentBlock = null;
        let inCodeBlock = false;
        let inMathBlock = false;
        
        for (const line of lines) {
            // Code block
            if (line.startsWith('```')) {
                if (!inCodeBlock) {
                    inCodeBlock = true;
                    currentBlock = {
                        id: this.generateId(),
                        type: 'codeblock',
                        content: '',
                        metadata: { language: line.replace('```', '').trim() }
                    };
                } else {
                    inCodeBlock = false;
                    blocks.push(currentBlock);
                    currentBlock = null;
                }
                continue;
            }
            
            if (inCodeBlock && currentBlock) {
                currentBlock.content += (currentBlock.content ? '\n' : '') + line;
                continue;
            }
            
            // Math block
            if (line === '$$') {
                if (!inMathBlock) {
                    inMathBlock = true;
                    currentBlock = {
                        id: this.generateId(),
                        type: 'math',
                        content: ''
                    };
                } else {
                    inMathBlock = false;
                    blocks.push(currentBlock);
                    currentBlock = null;
                }
                continue;
            }
            
            if (inMathBlock && currentBlock) {
                currentBlock.content += (currentBlock.content ? '\n' : '') + line;
                continue;
            }
            
            // Parse line patterns
            const patterns = [
                { regex: /^####\s(.*)/, type: 'heading4' },
                { regex: /^###\s(.*)/, type: 'heading3' },
                { regex: /^##\s(.*)/, type: 'heading2' },
                { regex: /^#\s(.*)/, type: 'heading1' },
                { regex: /^>\s(.*)/, type: 'quote' },
                { regex: /^[-*]\s\[[x\s]\]\s(.*)/, type: 'checkbox' },
                { regex: /^[-*]\s(.*)/, type: 'bullet' },
                { regex: /^\d+\.\s(.*)/, type: 'number' },
                { regex: /^!\[(.*?)\]\((.*?)\)/, type: 'image' }
            ];
            
            let matched = false;
            for (const pattern of patterns) {
                const match = line.match(pattern.regex);
                if (match) {
                    const handler = this.blockTypes.get(pattern.type);
                    if (handler && handler.fromMarkdown) {
                        blocks.push({
                            id: this.generateId(),
                            ...handler.fromMarkdown(line)
                        });
                    }
                    matched = true;
                    break;
                }
            }
            
            if (!matched && line.trim()) {
                blocks.push({
                    id: this.generateId(),
                    type: 'paragraph',
                    content: line
                });
            }
        }
        
        return blocks;
    }
    
    tableToMarkdown(data) {
        if (!data.metadata?.rows) return '';
        
        let markdown = '';
        data.metadata.rows.forEach((row, i) => {
            markdown += '| ' + row.join(' | ') + ' |\n';
            if (i === 0) {
                markdown += '|' + row.map(() => '---').join('|') + '|\n';
            }
        });
        
        return markdown + '\n';
    }
    
    markdownToTable(text) {
        const lines = text.trim().split('\n');
        const rows = [];
        
        for (const line of lines) {
            if (line.includes('|') && !line.match(/^\|[\s-]+\|/)) {
                const cells = line.split('|').map(c => c.trim()).filter(c => c);
                rows.push(cells);
            }
        }
        
        return {
            type: 'table',
            content: '',
            metadata: { rows }
        };
    }
    
    generateId() {
        return 'block-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
}

export default BlockManager;