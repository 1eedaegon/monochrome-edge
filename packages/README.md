# Monochrome Edge UI Components

A modern, TypeScript-first UI Components with warm and cold themes, built for production use across React, Vue, Web Components, and Vanilla JavaScript.

## Packages

### @monochrome-edge/core
The core library with all base components and utilities.

```bash
npm install @monochrome-edge/core
```

```typescript
import { ThemeManager, Button, Input, Modal, Toast } from '@monochrome-edge/core';

// Initialize theme
const theme = new ThemeManager({
  defaultTheme: 'warm',
  defaultMode: 'light'
});

// Create a button
const button = Button.create({
  variant: 'primary',
  text: 'Click me'
});

// Show a toast
Toast.success('Operation completed!');
```

### @monochrome-edge/react
React components and hooks for Monochrome.

```bash
npm install @monochrome-edge/react
```

```tsx
import { ThemeProvider, Button, Input, useToast } from '@monochrome-edge/react';

function App() {
  const toast = useToast();

  return (
    <ThemeProvider defaultTheme="warm" defaultMode="light">
      <Button
        variant="primary"
        onClick={() => toast.success('Hello!')}
      >
        Click me
      </Button>
      <Input
        type="email"
        placeholder="Enter email"
        onChange={(value) => console.log(value)}
      />
    </ThemeProvider>
  );
}
```

### @monochrome-edge/vue (Coming Soon)
Vue 3 components using Composition API.

```bash
npm install @monochrome-edge/vue
```

```vue
<template>
  <MonochromeProvider :theme="warm" :mode="light">
    <MButton variant="primary" @click="handleClick">
      Click me
    </MButton>
    <MInput
      type="email"
      placeholder="Enter email"
      v-model="email"
    />
  </MonochromeProvider>
</template>

<script setup>
import { ref } from 'vue';
import { MonochromeProvider, MButton, MInput, useToast } from '@monochrome-edge/vue';

const email = ref('');
const toast = useToast();

const handleClick = () => {
  toast.success('Hello from Vue!');
};
</script>
```

### @monochrome-edge/web (Coming Soon)
Web Components for use in any framework.

```bash
npm install @monochrome-edge/web
```

```html
<script type="module">
  import '@monochrome-edge/web';
</script>

<monochrome-button variant="primary">
  Click me
</monochrome-button>

<monochrome-input
  type="email"
  placeholder="Enter email"
></monochrome-input>
```

## Features

### 🎨 Dual Theme System
- **Warm Theme**: Subtle warm tones for content-focused applications
- **Cold Theme**: Cool professional tones for SaaS and dashboards
- Light and dark modes for each theme
- Smooth transitions between themes

### 🧩 Components
- **Base**: Button, Input, Card, Modal, Toast
- **Forms**: Form validation, field management
- **Tables**: Sortable, selectable, paginated tables
- **Layout**: Navigation, sidebars, containers
- **Typography**: Headings, text, code blocks

### 🛠 TypeScript First
- Full TypeScript support with strict types
- Comprehensive type definitions
- IntelliSense support in all major IDEs

### 📦 Production Ready
- Tree-shakeable builds
- Minimal bundle size
- CSS-in-JS with runtime theming
- SSR compatible

### ♿ Accessibility
- WCAG 2.1 compliant
- Keyboard navigation
- Screen reader support
- Focus management

## Quick Start

### 1. Install the core package
```bash
npm install @monochrome-edge/core
```

### 2. Import the CSS
```css
@import '@monochrome-edge/core/dist/monochrome-edge.css';
```

### 3. Initialize the theme
```javascript
import { ThemeManager } from '@monochrome-edge/core';

const theme = new ThemeManager();
theme.init();
```

### 4. Use components
```javascript
import { Button, Toast } from '@monochrome-edge/core';

// Create a button
const btn = Button.create({
  variant: 'primary',
  text: 'Click me',
  onClick: () => Toast.success('Clicked!')
});

document.body.appendChild(btn.getElement());
```

## Building from Source

```bash
# Clone the repository
git clone https://github.com/your-org/monochrome.git

# Install dependencies
cd packages
npm install

# Build all packages
npm run build

# Or build specific package
npm run build:core
npm run build:react
```

## Development

```bash
# Start development mode
npm run dev

# Type checking
npm run typecheck

# Clean build artifacts
npm run clean
```

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari 14+
- iOS Safari 14+
- Chrome for Android (latest)

## License

MIT

## Contributing

Contributions are welcome! Please read our contributing guide for details.

## Support

- Documentation: https://monochrome.design
- Issues: https://github.com/your-org/monochrome/issues
- Discord: https://discord.gg/monochrome
