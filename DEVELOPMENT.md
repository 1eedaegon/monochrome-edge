# Development Guide

This guide covers the development workflow for contributing to Monochrome Edge UI library.

## Prerequisites

- Node.js 24.0.0 or higher
- npm 10.0.0 or higher
- Git

## Getting Started

### Fork and Clone

```bash
# Fork the repository on GitHub first
git clone https://github.com/1eedaegon/monochrome-edge.git
cd monochrome-edge
npm install
```

### Development Setup

```bash
# Start development server with hot reload
npm run dev

# Open http://localhost:3000
```

## Project Structure

```
monochrome-edge/
├── src/                    # Source code for JavaScript modules
│   ├── index.ts           # Main entry point
│   ├── react.tsx          # React components
│   └── vue.ts             # Vue components
│
├── ui/                     # CSS source files
│   ├── atoms/             # Basic elements
│   ├── molecules/         # Composite components
│   ├── organisms/         # Complex sections
│   ├── templates/         # Page layouts
│   ├── tokens/            # Design tokens
│   └── monochrome-edge.css # Main CSS bundle
│
├── dist/                   # Build output (gitignored)
├── tests/                  # Test files
└── scripts/               # Build and utility scripts
```

## Development Workflow

### 1. CSS Development

CSS follows Atomic Design principles:

```css
/* atoms/button.css */
.btn {
  /* Use CSS variables for theming */
  background: var(--theme-accent);
  color: var(--theme-text-on-accent);

  /* Use design tokens */
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
}
```

### 2. Component Development

For JavaScript components:

```typescript
// src/components/Modal.ts
export class Modal {
  constructor(options: ModalOptions) {
    // Implementation
  }
}
```

### 3. Testing Components

Use the library from CDN in test files:

```html
<!DOCTYPE html>
<html data-theme-variant="warm">
<head>
  <!-- Use jsDelivr for testing -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@monochrome-edge/ui@latest/dist/monochrome.min.css">
</head>
<body>
  <!-- Your test components -->

  <script type="module">
    import { Modal } from 'https://cdn.jsdelivr.net/npm/@monochrome-edge/ui@latest/dist/index.esm.js'

    // Test your changes
  </script>
</body>
</html>
```

## Building

### Build Commands

```bash
# Full build
npm run build

# CSS only
npm run build:css

# JavaScript only
npm run build:js

# Clean build directory
npm run clean
```

### Build Output

```
dist/
├── monochrome.min.css      # Main CSS bundle
├── warm-theme.min.css      # Warm theme only
├── cold-theme.min.css      # Cold theme only
├── index.js                # CommonJS bundle
├── index.esm.js            # ES Module bundle
├── index.d.ts              # TypeScript definitions
├── react.js                # React components
├── vue.js                  # Vue components
└── jquery.js               # jQuery plugins
```

## Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --grep "Button"
```

### Integration Testing

Create HTML test files using CDN imports:

```html
<!-- test-button.html -->
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@monochrome-edge/ui/dist/monochrome.min.css">
</head>
<body>
  <button class="btn btn-primary">Test Button</button>

  <script src="https://cdn.jsdelivr.net/npm/@monochrome-edge/ui/dist/index.js"></script>
  <script>
    // Test interactions
  </script>
</body>
</html>
```

### Visual Testing

```bash
# Run Playwright tests
npx playwright test

# Open Playwright UI
npx playwright test --ui
```

## Code Style

### CSS Guidelines

- Use CSS variables for all colors
- Follow BEM naming when applicable
- Mobile-first responsive design
- Maintain specificity below 0,3,0

```css
/* Good */
.card {
  background: var(--theme-surface);
}

.card__header {
  padding: var(--spacing-md);
}

/* Avoid */
div.card > .header {
  background: #ffffff;
  padding: 16px;
}
```

### JavaScript Guidelines

- TypeScript for all source files
- ES6+ syntax
- JSDoc comments for public APIs
- No external dependencies in core

```typescript
/**
 * Creates a modal instance
 * @param options - Modal configuration
 * @returns Modal instance
 */
export function createModal(options: ModalOptions): Modal {
  return new Modal(options)
}
```

## Commit Convention

Follow Conventional Commits:

```bash
# Features (minor version bump)
git commit -m "feat: add toast notifications"

# Fixes (patch version bump)
git commit -m "fix: button hover state in dark mode"

# Breaking changes (major version bump)
git commit -m "feat!: redesign modal API"

# Other types
git commit -m "docs: update button examples"
git commit -m "style: format CSS files"
git commit -m "refactor: simplify theme engine"
git commit -m "perf: optimize CSS bundle size"
git commit -m "test: add modal tests"
git commit -m "chore: update dependencies"
```

## Version Management

Versions are automatically managed by CI:

- `feat:` commits → Minor version (0.X.0)
- `fix:` commits → Patch version (0.0.X)
- `feat!:` or `BREAKING CHANGE:` → Major version (X.0.0)

## Pull Request Process

### 1. Create Feature Branch

```bash
git checkout -b feature/your-feature
```

### 2. Develop and Test

```bash
# Make changes
npm run dev

# Test your changes
npm test

# Build to verify
npm run build
```

### 3. Create Test Demo

Create a demo HTML file using CDN:

```html
<!-- demos/your-feature.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Feature Demo</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@monochrome-edge/ui/dist/monochrome.min.css">
</head>
<body>
  <!-- Demo your feature -->
</body>
</html>
```

### 4. Submit PR

- Use descriptive PR title following commit convention
- Include screenshots for visual changes
- Link related issues
- Add test cases

## Using Development Version

### From npm

```bash
# Install development version
npm install @monochrome-edge/ui@next
```

### From jsDelivr

```html
<!-- Use specific commit or branch -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/1eedaegon/monochrome-edge@main/dist/monochrome.min.css">

<!-- Use latest pre-release -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@monochrome-edge/ui@next/dist/monochrome.min.css">
```

## Framework Integration Development

### React Components

```typescript
// src/react.tsx
import React from 'react'

export const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  return <button className="btn" {...props}>{children}</button>
}
```

### Vue Components

```typescript
// src/vue.ts
import { defineComponent } from 'vue'

export const Button = defineComponent({
  name: 'MonochromeButton',
  props: ['variant', 'size'],
  template: `<button :class="classes"><slot /></button>`
})
```

## Theme Development

### Creating New Theme Variant

```css
/* ui/tokens/new-theme.css */
[data-theme-variant="new"] {
  /* Color system */
  --theme-accent: #yourcolor;
  --theme-accent-hover: #yourcolor;

  /* Surface colors */
  --theme-surface: #yourcolor;
  --theme-surface-hover: #yourcolor;

  /* Text colors */
  --theme-text-primary: #yourcolor;
  --theme-text-secondary: #yourcolor;
}
```

### Testing Theme

```html
<html data-theme-variant="new">
  <!-- Test your theme -->
</html>
```

## Performance Guidelines

### CSS Optimization

- Minimize selector complexity
- Use CSS containment when possible
- Avoid expensive properties in animations

### Bundle Size

- Keep core CSS under 50KB minified
- Separate optional features
- Use CSS custom properties for variations

## Release Process

Releases are automated via GitHub Actions:

1. Merge PR to main
2. CI analyzes commits
3. Version bumped automatically
4. Published to npm
5. Available on jsDelivr within minutes

## Debugging

### Development Server

```bash
# Enable verbose logging
DEBUG=* npm run dev

# Specific port
PORT=8080 npm run dev
```

### Build Issues

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Verify Node version
node --version  # Should be >=24.0.0
```

## Resources

- [Design System Documentation](https://monochrome-edge.dev)
- [jsDelivr Package](https://www.jsdelivr.com/package/npm/@monochrome-edge/ui)
- [npm Package](https://www.npmjs.com/package/@monochrome-edge/ui)
- [GitHub Discussions](https://github.com/1eedaegon/monochrome-edge/discussions)

## Getting Help

- GitHub Issues for bugs
- Discussions for questions
- Pull Requests for contributions

## License

MIT - See LICENSE file for details
