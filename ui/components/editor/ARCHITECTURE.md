# Editor Component Architecture

## 🎯 Core Requirements

### 12 Essential Features
1. **Headers (H1-H4)** - Markdown: `#`, `##`, `###`, `####`
2. **Bold** - Markdown: `**text**`, Shortcut: `Ctrl+B`
3. **Italic** - Markdown: `*text*`, Shortcut: `Ctrl+I`
4. **Strikethrough** - Markdown: `~~text~~`, Shortcut: `Ctrl+Shift+S`
5. **Quote** - Markdown: `> quote`, Shortcut: `Ctrl+Shift+.`
6. **Link with Preview** - Markdown: `[text](url)`, Shortcut: `Ctrl+K`
7. **Image Upload** - Drag & Drop, Local storage
8. **Code Block** - Markdown: ` ``` `, Syntax highlighting
9. **LaTeX Math** - Inline: `$formula$`, Block: `$$formula$$`
10. **Lists** - Bullet: `-`, Numbered: `1.`, Checkbox: `[ ]`
11. **Table** - Grid editor with markdown support
12. **Document Link** - Local files, Dropbox integration

## 📁 Directory Structure

```
ui/components/editor/
├── index.js                 # Main export
├── ARCHITECTURE.md          # This file
├── README.md               # User documentation
│
├── core/                   # Core WYSIWYG engine
│   ├── Editor.js          # Main Editor class
│   └── ContentEditable.js # ContentEditable wrapper
│
├── blocks/                 # Block components
│   ├── Block.js           # Base block class
│   ├── Paragraph.js       # Paragraph block
│   ├── Heading.js         # H1-H4 blocks
│   ├── Quote.js           # Blockquote
│   ├── List.js            # Bullet/Number/Checkbox
│   ├── CodeBlock.js       # Code with highlighting
│   ├── MathBlock.js       # LaTeX math block
│   ├── Table.js           # Table editor
│   └── Image.js           # Image block
│
├── inline/                 # Inline formatting
│   ├── Bold.js            # Bold formatter
│   ├── Italic.js          # Italic formatter
│   ├── Strike.js          # Strikethrough
│   ├── Code.js            # Inline code
│   ├── Link.js            # Link with preview
│   └── Math.js            # Inline math
│
├── commands/              # Editor commands
│   ├── CommandManager.js  # Command registry
│   ├── TextCommands.js    # Text formatting
│   ├── BlockCommands.js   # Block operations
│   └── MediaCommands.js   # Image/Link/Document
│
├── storage/               # Local-first storage
│   ├── StorageManager.js  # Storage abstraction
│   ├── IndexedDB.js       # IndexedDB handler
│   ├── LocalStorage.js    # LocalStorage fallback
│   └── FileSystem.js      # File system access
│
├── ui/                    # UI components
│   ├── Toolbar.js         # Main toolbar
│   ├── FloatingToolbar.js # Selection toolbar
│   ├── SlashMenu.js       # Slash commands
│   ├── LinkPreview.js     # Link hover preview
│   └── DocumentSearch.js  # Document search UI
│
├── plugins/               # Optional plugins
│   ├── Dropbox.js         # Dropbox integration
│   ├── Markdown.js        # MD import/export
│   └── Collaboration.js   # Future: real-time collab
│
├── utils/                 # Utilities
│   ├── DOM.js             # DOM manipulation
│   ├── Markdown.js        # MD conversion
│   ├── Debounce.js        # Performance utils
│   └── Platform.js        # Platform detection
│
└── styles/               # Styles
    ├── editor.css        # Main styles
    ├── blocks.css        # Block styles
    ├── themes.css        # Theme variations
    └── mobile.css        # Mobile responsive
```

## 🏗️ Technical Architecture

### 1. **WYSIWYG Core**
- `contenteditable="true"` for direct editing
- Custom block system (not just divs)
- Virtual DOM-like diffing for performance

### 2. **Block System**
```javascript
class Block {
    constructor(type, content) {
        this.id = generateId();
        this.type = type;
        this.content = content;
        this.metadata = {};
    }
    
    render() {
        // Returns DOM element
    }
    
    toMarkdown() {
        // Convert to markdown
    }
    
    fromMarkdown(md) {
        // Parse from markdown
    }
}
```

### 3. **Local-First Storage**

#### Priority Order:
1. **IndexedDB** - Primary storage for documents
2. **LocalStorage** - Settings and recent edits
3. **File System API** - Direct file access (when available)

#### Data Structure:
```javascript
{
    documents: [
        {
            id: 'doc-uuid',
            title: 'Document Title',
            blocks: [...],
            metadata: {
                created: Date,
                modified: Date,
                tags: [],
                linkedDocs: []
            },
            attachments: [
                {
                    id: 'att-uuid',
                    type: 'image',
                    data: Blob,
                    url: 'blob:...'
                }
            ]
        }
    ],
    settings: {
        theme: 'warm',
        autoSave: true,
        ...
    }
}
```

### 4. **Command System**
```javascript
// Centralized command execution
editor.execute('bold');
editor.execute('insertImage', { src: '...' });
editor.execute('createLink', { url: '...', text: '...' });
```

### 5. **Event Flow**
1. User Input → 
2. Command Parser → 
3. Block Update → 
4. DOM Render → 
5. Storage Sync → 
6. UI Update

## 🔧 Implementation Strategy

### Phase 1: Core (Essential)
1. ContentEditable wrapper
2. Basic block system (paragraph, headings)
3. Selection management
4. Undo/Redo

### Phase 2: Formatting
1. Inline formatting (bold, italic, etc.)
2. Block formatting (quote, lists)
3. Markdown auto-conversion

### Phase 3: Media
1. Image upload with local storage
2. Link with preview
3. Document linking

### Phase 4: Advanced
1. Tables
2. LaTeX math
3. Code highlighting
4. Dropbox integration

### Phase 5: Polish
1. Mobile optimization
2. Keyboard shortcuts
3. Performance tuning
4. Accessibility

## 🚀 Key Features

### Local-First Benefits:
- **Offline-first**: Works without internet
- **Fast**: No network latency
- **Private**: Data stays on device
- **Reliable**: No server dependencies

### WYSIWYG Benefits:
- **Intuitive**: See exactly what you get
- **Direct manipulation**: Click and edit
- **Real-time preview**: No mode switching
- **Visual feedback**: Immediate response

## 📊 Performance Targets
- First paint: < 100ms
- Typing latency: < 16ms (60fps)
- Auto-save: < 50ms
- Document load: < 200ms
- Search: < 100ms for 1000 documents

## 🔐 Security
- XSS prevention in user content
- Sanitize pasted content
- Secure blob URLs for images
- Encrypted IndexedDB (optional)

## 🎨 Theming
- CSS variables for easy theming
- Dark/Light mode support
- Warm/Cold color variants
- Custom theme creation

## 📱 Mobile Support
- Touch-friendly toolbar
- Swipe gestures
- Responsive layout
- Virtual keyboard handling
- Native app feel