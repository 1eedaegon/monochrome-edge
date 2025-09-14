# Monochrome Edge Editor Component

A powerful WYSIWYG markdown editor with advanced features like LaTeX support, drag & drop, and document linking.

## Features

### 📝 Text Formatting
| Feature | Markdown | Shortcut | Description |
|---------|----------|----------|-------------|
| **Heading 1** | `#` | `Ctrl+Alt+1` | Large heading |
| **Heading 2** | `##` | `Ctrl+Alt+2` | Medium heading |
| **Heading 3** | `###` | `Ctrl+Alt+3` | Small heading |
| **Heading 4** | `####` | `Ctrl+Alt+4` | Tiny heading |
| **Bold** | `**text**` | `Ctrl+B` | Bold text |
| **Italic** | `*text*` | `Ctrl+I` | Italic text |
| **Strikethrough** | `~~text~~` | `Ctrl+Shift+S` | Strikethrough text |
| **Inline Code** | `` `code` `` | `Ctrl+E` | Inline code |

### 📋 Lists
| Feature | Markdown | Shortcut | Description |
|---------|----------|----------|-------------|
| **Bullet List** | `- item` | `Ctrl+Shift+8` | Unordered list |
| **Numbered List** | `1. item` | `Ctrl+Shift+7` | Ordered list |
| **Checkbox** | `[ ] task` | `Ctrl+Shift+9` | Task list with checkbox |

### 🎨 Blocks
| Feature | Markdown | Shortcut | Description |
|---------|----------|----------|-------------|
| **Quote** | `> quote` | `Ctrl+Shift+.` | Blockquote |
| **Code Block** | ` ``` ` | `Ctrl+Alt+C` | Multi-line code block |
| **Math Formula** | `$$formula$$` | `Ctrl+Alt+M` | LaTeX math formula |
| **Divider** | `---` | - | Horizontal rule |

### 🔗 Links & Media
| Feature | Markdown | Shortcut | Description |
|---------|----------|----------|-------------|
| **Link** | `[text](url)` | `Ctrl+K` | External link with preview |
| **Image** | `![alt](url)` | `Ctrl+Shift+I` | Image upload/embed |
| **Document Link** | `[[document]]` | `Ctrl+Shift+K` | Internal document link |
| **Table** | `\|header\|` | `Ctrl+Alt+T` | Table insertion |

### ⚡ Additional Shortcuts
| Action | Shortcut | Description |
|--------|----------|-------------|
| **Undo** | `Ctrl+Z` | Undo last action |
| **Redo** | `Ctrl+Y` | Redo last undone action |
| **Save** | `Ctrl+S` | Save document |
| **Slash Commands** | `/` | Open command menu |

## Usage

### Basic Setup
```javascript
import { Editor } from '@monochrome-edge/ui/editor';
import '@monochrome-edge/ui/editor/editor.css';

const editor = new Editor('#editor-container', {
    placeholder: 'Start writing...',
    theme: 'warm',
    mode: 'light',
    autoSave: true,
    onSave: (content) => {
        console.log('Saving:', content);
    }
});
```

### React Component
```jsx
import React, { useRef, useEffect } from 'react';
import { Editor } from '@monochrome-edge/ui/editor';

function EditorComponent({ initialContent, onSave }) {
    const editorRef = useRef(null);
    const editorInstance = useRef(null);
    
    useEffect(() => {
        if (editorRef.current) {
            editorInstance.current = new Editor(editorRef.current, {
                initialContent,
                onSave,
                onImageUpload: async (file, callback) => {
                    // Upload to server
                    const url = await uploadImage(file);
                    callback(url);
                }
            });
        }
        
        return () => {
            editorInstance.current?.destroy();
        };
    }, []);
    
    return <div ref={editorRef} />;
}
```

### Vue Component
```vue
<template>
    <div ref="editor"></div>
</template>

<script>
import { Editor } from '@monochrome-edge/ui/editor';

export default {
    mounted() {
        this.editor = new Editor(this.$refs.editor, {
            onSave: this.handleSave,
            enableMath: true,
            enableDragDrop: true
        });
    },
    
    beforeUnmount() {
        this.editor?.destroy();
    },
    
    methods: {
        handleSave(content) {
            this.$emit('save', content);
        }
    }
};
</script>
```

## Configuration Options

```javascript
{
    // Basic
    placeholder: 'Start writing...',
    theme: 'warm', // 'warm' | 'cold'
    mode: 'light', // 'light' | 'dark'
    
    // Features
    autoSave: true,
    autoSaveInterval: 2000,
    enableMath: true,
    enableDragDrop: true,
    enableSlashCommands: true,
    enableFloatingToolbar: true,
    enableShortcuts: true,
    
    // Callbacks
    onSave: (content) => {},
    onChange: (content) => {},
    onImageUpload: (file, callback) => {},
    onDocumentLink: (query, callback) => {}
}
```

## Auto-Conversion Patterns

The editor automatically converts markdown patterns as you type:

- Type `##` + space → Converts to Heading 2
- Type `-` + space → Converts to bullet list
- Type `1.` + space → Converts to numbered list
- Type `>` + space → Converts to quote
- Type ` ``` ` + enter → Converts to code block
- Type `[]` + space → Converts to checkbox
- Type `---` + enter → Inserts divider

## Document Linking

The editor supports internal document linking with `[[document]]` syntax:

```javascript
editor.options.onDocumentLink = (query, callback) => {
    // Search for documents
    const documents = searchDocuments(query);
    
    // Return results
    callback(documents.map(doc => ({
        id: doc.id,
        title: doc.title,
        path: doc.path,
        icon: '📄'
    })));
};
```

## Image Upload

Custom image upload handler:

```javascript
editor.options.onImageUpload = async (file, callback) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
    });
    
    const { url } = await response.json();
    callback(url);
};
```

## API Methods

```javascript
// Get content
const content = editor.getContent();
// Returns: { html, markdown, text }

// Set content
editor.setContent('<h1>Hello World</h1>');
// or
editor.setContent({ html: '<h1>Hello</h1>' });

// Execute command
editor.executeCommand('bold');

// Save manually
editor.save();

// Destroy editor
editor.destroy();
```

## Styling

The editor uses CSS variables from the Monochrome Edge theme system:

```css
/* Custom styling */
.editor-wrapper {
    --editor-max-width: 900px;
    --editor-font-size: 16px;
    --editor-line-height: 1.7;
}

/* Dark mode */
[data-theme="dark"] .editor-wrapper {
    background: var(--theme-bg);
    color: var(--theme-text-primary);
}
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT