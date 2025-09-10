# @monochrome

Monochrome Edge UI Components - A modern, minimalist UI Components with warm and cold themes.

## Installation

```bash
yarn add @monochrome
```

## Usage

### 1. Import CSS (Required)

```tsx
// In your root component or index file
import '@monochrome-edge/styles';  // Base styles
import '@monochrome-edge/styles/cold';  // or '@monochrome-edge/styles/warm'
```

### 2. Use Components (React/TSX)

```tsx
import { Button, Card, CardBody, useTheme } from '@monochrome-edge';

function App() {
  const { theme, mode, toggleTheme, toggleMode } = useTheme();

  return (
    <Card>
      <CardBody>
        <h1>My App</h1>
        <Button variant="primary" onClick={toggleTheme}>
          Switch to {theme === 'warm' ? 'Cold' : 'Warm'} Theme
        </Button>
        <Button variant="secondary" onClick={toggleMode}>
          Toggle {mode === 'light' ? 'Dark' : 'Light'} Mode
        </Button>
      </CardBody>
    </Card>
  );
}
```

### 3. HTML Structure Setup

Add theme attribute to your HTML:

```html
<html data-theme="light">
  <!-- Your app -->
</html>
```

## Features

- 🎨 Two distinct themes: Warm (content-focused) and Cold (professional)
- 🌓 Built-in dark mode support
- 📦 Tree-shakeable components
- 🔧 TypeScript support
- ⚡ Zero runtime dependencies (CSS-based)
- 🎯 Pretendard and Noto Sans KR fonts

## Components

- **Button**: Primary, Secondary, Ghost, Outline variants
- **Card**: Container with Header, Body, Footer sections
- **Form**: Input, Label, FormGroup, Select, Textarea
- **Table**: Data tables with sorting and responsive design
- **Modal**: Dialog component
- **Badge**: Status indicators
- **And more...**

## Framework Support

For other frameworks, install the specific package:

- Vue: `yarn add @monochrome-edge/vue`
- Vanilla JS: `yarn add @monochrome-edge/vanilla`
- jQuery: `yarn add @monochrome-edge/jquery`
- Web Components: `yarn add @monochrome-edge/wc`

## License

MIT
