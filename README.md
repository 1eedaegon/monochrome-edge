# Monochrome Edge

A modern, minimalist UI component library with dual-theme system for web applications.

## Overview

Monochrome Edge provides a comprehensive set of UI components built with pure CSS and optional JavaScript enhancements. The library features a sophisticated dual-theme system (Warm/Cold) with automatic light/dark mode support.

## Installation

### NPM

```bash
npm install @monochrome-edge/ui
```

### CDN (jsDelivr)

```html
<!-- Latest version -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@monochrome-edge/ui/dist/monochrome.min.css">
<script src="https://cdn.jsdelivr.net/npm/@monochrome-edge/ui/dist/index.js"></script>
```

## Quick Start

### CSS Import

```html
<!-- CDN -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@monochrome-edge/ui/dist/monochrome.min.css">

<!-- Or use specific version -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@monochrome-edge/ui@0.3.1/dist/monochrome.min.css">
```

### JavaScript Import

```javascript
// ES6 Modules from CDN
import { Button, Modal, Toast } from 'https://cdn.jsdelivr.net/npm/@monochrome-edge/ui/dist/index.esm.js'

// Or from npm package
import { Button, Modal, Toast } from '@monochrome-edge/ui'
```

### Framework Support

```javascript
// React
import { Button, Card } from '@monochrome-edge/ui/react'

// Vue
import { Button, Card } from '@monochrome-edge/ui/vue'

// jQuery
import '@monochrome-edge/ui/jquery'
```

### CDN Usage

```html
<!DOCTYPE html>
<html data-theme-variant="warm">
<head>
  <!-- Monochrome Edge from jsDelivr -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@monochrome-edge/ui/dist/monochrome.min.css">
</head>
<body>
  <button class="btn btn-primary">Click me</button>

  <!-- Optional: JavaScript components -->
  <script src="https://cdn.jsdelivr.net/npm/@monochrome-edge/ui/dist/index.js"></script>
  <script>
    // Components are available globally
    const modal = new MonochromeEdge.Modal({
      title: 'Hello World'
    })
  </script>
</body>
</html>
```

## Theme System

### Setting Theme Variant

```html
<!-- Warm theme (default) -->
<html data-theme-variant="warm">

<!-- Cold theme -->
<html data-theme-variant="cold">
```

### Dark Mode

```html
<!-- Light mode (default) -->
<html data-theme="light">

<!-- Dark mode -->
<html data-theme="dark">

<!-- System preference -->
<html data-theme="auto">
```

## Component Structure

### Atomic Design System

```
atoms/          Basic building blocks
├── button      Interactive elements
├── input       Form controls
├── badge       Status indicators
└── typography  Text styles

molecules/      Composite components
├── card        Content containers
├── dropdown    Select menus
├── form-group  Input groups
└── search-bar  Search interface

organisms/      Complex UI sections
├── header      Page headers
├── sidebar     Navigation panels
├── modal       Dialog windows
└── data-table  Data grids

templates/      Page layouts
├── dashboard   Admin layouts
├── landing     Marketing pages
└── app         Application shells
```

## Usage Examples

### Button

```html
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-outline">Outline</button>
```

### Card

```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Title</h3>
  </div>
  <div class="card-body">
    Content goes here
  </div>
</div>
```

### Modal

```javascript
const modal = new Modal({
  title: 'Confirm Action',
  content: 'Are you sure?',
  onConfirm: () => console.log('Confirmed')
})

modal.show()
```

## CSS Variables

### Core Tokens

```css
:root {
  /* Colors */
  --theme-bg: /* Dynamic based on theme */
  --theme-surface: /* Dynamic based on theme */
  --theme-accent: /* Dynamic based on theme */

  /* Typography */
  --font-family-sans: system-ui, -apple-system, sans-serif
  --font-size-base: 16px

  /* Spacing */
  --spacing-xs: 0.25rem
  --spacing-sm: 0.5rem
  --spacing-md: 1rem
  --spacing-lg: 1.5rem
  --spacing-xl: 2rem

  /* Borders */
  --border-radius-sm: 4px
  --border-radius-md: 8px
  --border-radius-lg: 12px
}
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Build from Source

```bash
# Clone repository
git clone https://github.com/1eedaegon/monochrome-edge.git

# Install dependencies
npm install

# Development server
npm run dev

# Build production
npm run build
```

## API Reference

### Button Component

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| variant | `string` | `primary` | Button style variant |
| size | `string` | `md` | Button size |
| disabled | `boolean` | `false` | Disable state |
| loading | `boolean` | `false` | Loading state |

### Modal Component

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| show() | - | `void` | Display modal |
| hide() | - | `void` | Hide modal |
| destroy() | - | `void` | Remove from DOM |
| setContent() | `string\|HTMLElement` | `void` | Update content |

### Toast Component

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| success() | `message, options` | `Toast` | Success notification |
| error() | `message, options` | `Toast` | Error notification |
| info() | `message, options` | `Toast` | Info notification |
| warning() | `message, options` | `Toast` | Warning notification |

## Configuration

### Global Options

```javascript
import { configure } from '@monochrome-edge/ui'

configure({
  theme: 'warm',
  darkMode: 'auto',
  animations: true,
  rtl: false
})
```

### Component Options

```javascript
// Set defaults for all modals
Modal.defaults = {
  backdrop: true,
  keyboard: true,
  focus: true
}

// Set defaults for all toasts
Toast.defaults = {
  duration: 3000,
  position: 'top-right'
}
```

## TypeScript

Full TypeScript support with type definitions included.

```typescript
import { Button, ButtonProps } from '@monochrome-edge/ui'

const props: ButtonProps = {
  variant: 'primary',
  size: 'lg',
  onClick: () => console.log('clicked')
}
```

## License

[MIT](LICENSE)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## Links

- [Documentation](DEVELOPMENT.md)
- [GitHub](https://github.com/1eedaegon/monochrome-edge)
- [npm](https://www.npmjs.com/package/@monochrome-edge/ui)
- [jsDelivr CDN](https://www.jsdelivr.com/package/npm/@monochrome-edge/ui)
