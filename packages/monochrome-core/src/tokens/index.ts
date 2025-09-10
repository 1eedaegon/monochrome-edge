/**
 * Design tokens for Monochrome Edge UI Components
 */

// Color tokens
export const Colors = {
  warm: {
    light: {
      bg: '#FAFAF9',
      text: {
        primary: '#1A1918',
        secondary: '#6B6966'
      },
      accent: {
        primary: '#8B8680',
        secondary: '#A8A29E'
      },
      border: '#E7E5E4',
      surface: '#FFFFFF',
      highlight: '#D4A574'
    },
    dark: {
      bg: '#1C1B1A',
      text: {
        primary: 'rgba(255, 255, 255, 0.95)',
        secondary: '#B8B2AE'
      },
      accent: {
        primary: '#A8A29E',
        secondary: '#78716C'
      },
      border: '#3A3836',
      surface: '#262524',
      highlight: '#F4E4D4'
    }
  },
  cold: {
    light: {
      bg: '#FAFBFC',
      text: {
        primary: '#18181B',
        secondary: '#71717A'
      },
      accent: {
        primary: '#6B7280',
        secondary: '#9CA3AF'
      },
      border: '#E4E4E7',
      surface: '#FFFFFF',
      highlight: '#93BBFE'
    },
    dark: {
      bg: '#18181B',
      text: {
        primary: 'rgba(255, 255, 255, 0.95)',
        secondary: '#B1B1BA'
      },
      accent: {
        primary: '#9CA3AF',
        secondary: '#6B7280'
      },
      border: '#3A3A3F',
      surface: '#212127',
      highlight: '#B3D3FF'
    }
  },
  semantic: {
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6'
  }
} as const;

// Typography tokens
export const Typography = {
  fontFamily: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace"
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem'     // 48px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2
  },
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em'
  }
} as const;

// Spacing tokens
export const Spacing = {
  0: '0',
  px: '1px',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
  36: '9rem',       // 144px
  40: '10rem',      // 160px
  44: '11rem',      // 176px
  48: '12rem',      // 192px
  52: '13rem',      // 208px
  56: '14rem',      // 224px
  60: '15rem',      // 240px
  64: '16rem',      // 256px
  72: '18rem',      // 288px
  80: '20rem',      // 320px
  96: '24rem'       // 384px
} as const;

// Border radius tokens
export const BorderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px'
} as const;

// Shadow tokens
export const Shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  'inner-md': 'inset 0 4px 6px -1px rgba(0, 0, 0, 0.1)'
} as const;

// Animation tokens
export const Animation = {
  duration: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms'
  },
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }
} as const;

// Breakpoints
export const Breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const;

// Z-index tokens
export const ZIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  backdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080
} as const;

// Export type-safe token getters
export function getColor(theme: 'warm' | 'cold', mode: 'light' | 'dark', path: string): string {
  const colors = Colors[theme][mode];
  return path.split('.').reduce((obj, key) => obj[key], colors as any) || '';
}

export function getSpacing(size: keyof typeof Spacing): string {
  return Spacing[size];
}

export function getBorderRadius(size: keyof typeof BorderRadius): string {
  return BorderRadius[size];
}

export function getShadow(size: keyof typeof Shadows): string {
  return Shadows[size];
}

export function getFontSize(size: keyof typeof Typography.fontSize): string {
  return Typography.fontSize[size];
}

export function getFontWeight(weight: keyof typeof Typography.fontWeight): number {
  return Typography.fontWeight[weight];
}
