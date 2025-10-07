# Monochrome Edge Logo Guidelines

## Logo Variants

The Monochrome Edge design system includes two logo variants:

### Primary Logo (Symbol + Wordmark)
- **Dimensions**: 220×40px
- **Usage**: Main branding, headers, documentation
- **Components**: Slash symbol + "MONOCHROME EDGE" text

### Secondary Logo (Symbol Only)
- **Dimensions**: 40×40px
- **Usage**: Favicons, mobile headers, compact spaces
- **Components**: Slash symbol only

## Color Specifications

### Warm Theme
- **Light Mode**
  - Symbol: `#8a8784` (Warm Gray 400)
  - Text: `#1c1a18` (Warm Gray 900)
- **Dark Mode**
  - Symbol: `#a8a29e` (Warm Gray 300)
  - Text: `#e7e5e4` (Warm Gray 100)

### Cold Theme
- **Light Mode**
  - Symbol: `#6b7280` (Cool Gray 500)
  - Text: `#18181b` (Cool Gray 900)
- **Dark Mode**
  - Symbol: `#9ca3af` (Cool Gray 400)
  - Text: `#e4e4e7` (Cool Gray 200)

## File Structure

```
ui/assets/
├── logo-primary-warm-light.svg   # Primary logo - Warm theme, Light mode
├── logo-primary-warm-dark.svg    # Primary logo - Warm theme, Dark mode
├── logo-primary-cold-light.svg   # Primary logo - Cold theme, Light mode
├── logo-primary-cold-dark.svg    # Primary logo - Cold theme, Dark mode
├── logo-secondary-warm-light.svg # Symbol only - Warm theme, Light mode
├── logo-secondary-warm-dark.svg  # Symbol only - Warm theme, Dark mode
├── logo-secondary-cold-light.svg # Symbol only - Cold theme, Light mode
└── logo-secondary-cold-dark.svg  # Symbol only - Cold theme, Dark mode
```

## Usage Examples

### HTML (Static)
```html
<!-- Primary Logo - Warm Light -->
<img src="ui/assets/logo-primary-warm-light.svg" alt="Monochrome Edge" width="220" height="40">

<!-- Secondary Logo - Warm Light -->
<img src="ui/assets/logo-secondary-warm-light.svg" alt="Monochrome Edge" width="40" height="40">
```

### React
```jsx
import LogoPrimary from './ui/assets/logo-primary-warm-light.svg';
import LogoSecondary from './ui/assets/logo-secondary-warm-light.svg';

function Header() {
  return (
    <header>
      <img src={LogoPrimary} alt="Monochrome Edge" width={220} height={40} />
    </header>
  );
}
```

### Vue
```vue
<template>
  <header>
    <img src="@/assets/logo-primary-warm-light.svg" alt="Monochrome Edge" width="220" height="40" />
  </header>
</template>
```

### Inline SVG (Recommended for dynamic theming)
```html
<svg width="220" height="40" viewBox="0 0 220 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <line x1="10" y1="35" x2="30" y2="5" stroke="#8a8784" stroke-width="3" stroke-linecap="square"/>
  <line x1="18" y1="35" x2="38" y2="5" stroke="#8a8784" stroke-width="3" stroke-linecap="square"/>
  <text x="54" y="25" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" letter-spacing="0.8" fill="#1c1a18">MONOCHROME EDGE</text>
</svg>
```

## Dynamic Theming

For applications that support theme switching, use inline SVG with JavaScript to update colors dynamically:

```javascript
function updateLogoColors() {
  const theme = document.documentElement.getAttribute('data-theme-variant') || 'warm';
  const mode = document.documentElement.getAttribute('data-theme') || 'light';
  
  let slashColor, textColor;
  
  if (theme === 'warm') {
    slashColor = mode === 'light' ? '#8a8784' : '#a8a29e';
    textColor = mode === 'light' ? '#1c1a18' : '#e7e5e4';
  } else {
    slashColor = mode === 'light' ? '#6b7280' : '#9ca3af';
    textColor = mode === 'light' ? '#18181b' : '#e4e4e7';
  }
  
  document.querySelectorAll('.logo-slash-line').forEach(line => {
    line.setAttribute('stroke', slashColor);
  });
  
  document.querySelectorAll('.logo-text').forEach(text => {
    text.setAttribute('fill', textColor);
  });
}
```

## Clear Space & Minimum Size

### Clear Space
Maintain a minimum clear space around the logo equal to the height of one slash (approximately 30px).

### Minimum Sizes
- **Primary Logo**: Minimum width 110px (50% scale)
- **Secondary Logo**: Minimum size 24×24px

## Don'ts

❌ Don't change the logo colors outside the specified palette  
❌ Don't distort or stretch the logo  
❌ Don't rotate the logo  
❌ Don't add effects (shadows, gradients, outlines)  
❌ Don't place logo on busy backgrounds without proper contrast  
❌ Don't alter the spacing between symbol and wordmark  

## Symbol Design

The Monochrome Edge symbol consists of two parallel diagonal slashes:
- **First slash**: Positioned at x1=10, y1=35 to x2=30, y2=5
- **Second slash**: Positioned at x1=18, y1=35 to x2=38, y2=5
- **Stroke width**: 3px
- **Stroke linecap**: Square
- **Spacing**: 8px horizontal offset between slashes

This creates a distinctive "//" symbol representing forward momentum and modern development.

## Typography

**Wordmark Font Specifications:**
- Font Family: `system-ui, -apple-system, sans-serif`
- Font Size: 14px
- Font Weight: 700 (Bold)
- Letter Spacing: 0.8px
- Text Transform: Uppercase

## License

These logo assets are part of the Monochrome Edge design system and are subject to the project's license terms.
