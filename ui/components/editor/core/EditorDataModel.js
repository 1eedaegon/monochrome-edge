/**
 * WYSIWYG Editor Data Model
 * Block-based document structure with operations history
 */

export class EditorDataModel {
    constructor() {
        this.document = {
            id: this.generateId(),
            version: 1,
            blocks: [],
            metadata: {
                created: new Date().toISOString(),
                modified: new Date().toISOString(),
                wordCount: 0,
                charCount: 0
            }
        };
        
        this.history = {
            operations: [],
            currentIndex: -1,
            maxSize: 100
        };
        
        this.selection = {
            blockId: null,
            offset: 0,
            length: 0
        };
    }
    
    /**
     * Block structure:
     * {
     *   id: string,
     *   type: 'paragraph' | 'heading1-4' | 'quote' | 'list' | 'code' | 'table' | 'image' | 'math',
     *   content: string | object,
     *   attributes: object,
     *   children: array (for nested blocks like lists)
     * }
     */
    
    // Block Operations
    createBlock(type = 'paragraph', content = '', attributes = {}) {
        return {
            id: this.generateId(),
            type,
            content,
            attributes,
            children: []
        };
    }
    
    insertBlock(block, index = null) {
        const operation = {
            type: 'insert',
            blockId: block.id,
            block: JSON.parse(JSON.stringify(block)),
            index: index !== null ? index : this.document.blocks.length,
            timestamp: Date.now()
        };
        
        this.applyOperation(operation);
        return block.id;
    }
    
    updateBlock(blockId, updates) {
        const blockIndex = this.findBlockIndex(blockId);
        if (blockIndex === -1) return false;
        
        const oldBlock = JSON.parse(JSON.stringify(this.document.blocks[blockIndex]));
        const operation = {
            type: 'update',
            blockId,
            oldBlock,
            updates,
            timestamp: Date.now()
        };
        
        this.applyOperation(operation);
        return true;
    }
    
    deleteBlock(blockId) {
        const blockIndex = this.findBlockIndex(blockId);
        if (blockIndex === -1) return false;
        
        const block = this.document.blocks[blockIndex];
        const operation = {
            type: 'delete',
            blockId,
            block: JSON.parse(JSON.stringify(block)),
            index: blockIndex,
            timestamp: Date.now()
        };
        
        this.applyOperation(operation);
        return true;
    }
    
    moveBlock(blockId, newIndex) {
        const oldIndex = this.findBlockIndex(blockId);
        if (oldIndex === -1) return false;
        
        const operation = {
            type: 'move',
            blockId,
            oldIndex,
            newIndex,
            timestamp: Date.now()
        };
        
        this.applyOperation(operation);
        return true;
    }
    
    // Inline Operations
    applyInlineStyle(blockId, offset, length, style) {
        const block = this.getBlock(blockId);
        if (!block) return false;
        
        const operation = {
            type: 'style',
            blockId,
            offset,
            length,
            style,
            timestamp: Date.now()
        };
        
        this.applyOperation(operation);
        return true;
    }
    
    // Operation Management
    applyOperation(operation) {
        // Clear redo history when new operation is applied
        if (this.history.currentIndex < this.history.operations.length - 1) {
            this.history.operations = this.history.operations.slice(0, this.history.currentIndex + 1);
        }
        
        // Execute operation
        this.executeOperation(operation);
        
        // Add to history
        this.history.operations.push(operation);
        this.history.currentIndex++;
        
        // Limit history size
        if (this.history.operations.length > this.history.maxSize) {
            this.history.operations.shift();
            this.history.currentIndex--;
        }
        
        // Update metadata
        this.updateMetadata();
    }
    
    executeOperation(operation) {
        switch (operation.type) {
            case 'insert':
                this.document.blocks.splice(operation.index, 0, operation.block);
                break;
                
            case 'update':
                const updateIndex = this.findBlockIndex(operation.blockId);
                if (updateIndex !== -1) {
                    Object.assign(this.document.blocks[updateIndex], operation.updates);
                }
                break;
                
            case 'delete':
                const deleteIndex = this.findBlockIndex(operation.blockId);
                if (deleteIndex !== -1) {
                    this.document.blocks.splice(deleteIndex, 1);
                }
                break;
                
            case 'move':
                const block = this.document.blocks[operation.oldIndex];
                this.document.blocks.splice(operation.oldIndex, 1);
                this.document.blocks.splice(operation.newIndex, 0, block);
                break;
                
            case 'style':
                const styleBlock = this.getBlock(operation.blockId);
                if (styleBlock) {
                    this.applyInlineStyleToContent(styleBlock, operation);
                }
                break;
        }
    }
    
    applyInlineStyleToContent(block, operation) {
        // Convert content to rich text format if needed
        if (typeof block.content === 'string') {
            block.content = {
                text: block.content,
                styles: []
            };
        }
        
        // Add style range
        block.content.styles.push({
            offset: operation.offset,
            length: operation.length,
            style: operation.style
        });
        
        // Merge overlapping styles
        this.mergeStyles(block.content.styles);
    }
    
    mergeStyles(styles) {
        // Sort by offset
        styles.sort((a, b) => a.offset - b.offset);
        
        // Merge overlapping ranges with same style
        for (let i = 0; i < styles.length - 1; i++) {
            const current = styles[i];
            const next = styles[i + 1];
            
            if (current.style === next.style) {
                const currentEnd = current.offset + current.length;
                const nextEnd = next.offset + next.length;
                
                if (currentEnd >= next.offset) {
                    current.length = Math.max(currentEnd, nextEnd) - current.offset;
                    styles.splice(i + 1, 1);
                    i--;
                }
            }
        }
    }
    
    // Undo/Redo
    undo() {
        if (this.history.currentIndex < 0) return false;
        
        const operation = this.history.operations[this.history.currentIndex];
        this.reverseOperation(operation);
        this.history.currentIndex--;
        
        this.updateMetadata();
        return true;
    }
    
    redo() {
        if (this.history.currentIndex >= this.history.operations.length - 1) return false;
        
        this.history.currentIndex++;
        const operation = this.history.operations[this.history.currentIndex];
        this.executeOperation(operation);
        
        this.updateMetadata();
        return true;
    }
    
    reverseOperation(operation) {
        switch (operation.type) {
            case 'insert':
                const insertIndex = this.findBlockIndex(operation.blockId);
                if (insertIndex !== -1) {
                    this.document.blocks.splice(insertIndex, 1);
                }
                break;
                
            case 'update':
                const updateIndex = this.findBlockIndex(operation.blockId);
                if (updateIndex !== -1) {
                    this.document.blocks[updateIndex] = JSON.parse(JSON.stringify(operation.oldBlock));
                }
                break;
                
            case 'delete':
                this.document.blocks.splice(operation.index, 0, operation.block);
                break;
                
            case 'move':
                const block = this.document.blocks[operation.newIndex];
                this.document.blocks.splice(operation.newIndex, 1);
                this.document.blocks.splice(operation.oldIndex, 0, block);
                break;
                
            case 'style':
                // Remove style from block
                const styleBlock = this.getBlock(operation.blockId);
                if (styleBlock && styleBlock.content.styles) {
                    styleBlock.content.styles = styleBlock.content.styles.filter(
                        s => !(s.offset === operation.offset && 
                               s.length === operation.length && 
                               s.style === operation.style)
                    );
                }
                break;
        }
    }
    
    // Utility Methods
    findBlockIndex(blockId) {
        return this.document.blocks.findIndex(b => b.id === blockId);
    }
    
    getBlock(blockId) {
        return this.document.blocks.find(b => b.id === blockId);
    }
    
    generateId() {
        return 'block-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
    
    updateMetadata() {
        this.document.modified = new Date().toISOString();
        this.document.version++;
        
        // Calculate word and character counts
        let wordCount = 0;
        let charCount = 0;
        
        this.document.blocks.forEach(block => {
            const text = this.getPlainText(block);
            charCount += text.length;
            wordCount += text.split(/\s+/).filter(w => w.length > 0).length;
        });
        
        this.document.metadata.wordCount = wordCount;
        this.document.metadata.charCount = charCount;
        this.document.metadata.modified = this.document.modified;
    }
    
    getPlainText(block) {
        if (typeof block.content === 'string') {
            return block.content;
        } else if (block.content && block.content.text) {
            return block.content.text;
        }
        return '';
    }
    
    // Export/Import
    toJSON() {
        return JSON.stringify(this.document, null, 2);
    }
    
    fromJSON(json) {
        try {
            const data = JSON.parse(json);
            this.document = data;
            this.history = {
                operations: [],
                currentIndex: -1,
                maxSize: 100
            };
            return true;
        } catch (e) {
            console.error('Failed to parse JSON:', e);
            return false;
        }
    }
    
    toMarkdown() {
        let markdown = '';
        
        this.document.blocks.forEach(block => {
            switch (block.type) {
                case 'heading1':
                    markdown += `# ${this.getPlainText(block)}\n\n`;
                    break;
                case 'heading2':
                    markdown += `## ${this.getPlainText(block)}\n\n`;
                    break;
                case 'heading3':
                    markdown += `### ${this.getPlainText(block)}\n\n`;
                    break;
                case 'heading4':
                    markdown += `#### ${this.getPlainText(block)}\n\n`;
                    break;
                case 'quote':
                    markdown += `> ${this.getPlainText(block)}\n\n`;
                    break;
                case 'code':
                    const lang = block.attributes.language || '';
                    markdown += `\`\`\`${lang}\n${this.getPlainText(block)}\n\`\`\`\n\n`;
                    break;
                case 'list':
                    const bullet = block.attributes.ordered ? '1.' : '-';
                    markdown += `${bullet} ${this.getPlainText(block)}\n`;
                    break;
                case 'image':
                    markdown += `![${block.attributes.alt || ''}](${block.content})\n\n`;
                    break;
                case 'paragraph':
                default:
                    const text = this.formatInlineStyles(block);
                    if (text) markdown += `${text}\n\n`;
                    break;
            }
        });
        
        return markdown.trim();
    }
    
    formatInlineStyles(block) {
        const text = this.getPlainText(block);
        if (!block.content || !block.content.styles || block.content.styles.length === 0) {
            return text;
        }
        
        // Apply styles to text
        let result = text;
        const styles = [...block.content.styles].sort((a, b) => b.offset - a.offset);
        
        styles.forEach(style => {
            const before = result.substring(0, style.offset);
            const styled = result.substring(style.offset, style.offset + style.length);
            const after = result.substring(style.offset + style.length);
            
            let formatted = styled;
            switch (style.style) {
                case 'bold':
                    formatted = `**${styled}**`;
                    break;
                case 'italic':
                    formatted = `*${styled}*`;
                    break;
                case 'code':
                    formatted = `\`${styled}\``;
                    break;
                case 'strikethrough':
                    formatted = `~~${styled}~~`;
                    break;
            }
            
            result = before + formatted + after;
        });
        
        return result;
    }
}