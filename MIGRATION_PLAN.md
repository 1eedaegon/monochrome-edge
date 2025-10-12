# 옵션 1 구조 개선 계획: src/ → ui/ 마이그레이션 + CSS 컴포넌트 JS 추가

## 📋 현재 상황 분석

### src/ 파일 분류 (총 15개 파일, 6,787줄)

**1. 독립 컴포넌트 (ui/로 이동 대상)**
- `search-bar.ts` (363줄) - 검색바 컴포넌트
- `search-toolbar.ts` (562줄) - 검색 도구모음
- `tree-view.ts` (287줄) - 트리뷰
- `graph-view.ts` (288줄) - 그래프 뷰 (main)
- `graph-builder.ts` (228줄) - 그래프 빌더
- `canvas-renderer.ts` (489줄) - 캔버스 렌더러
- `barnes-hut-layout.ts` (220줄) - 레이아웃 알고리즘
- `quad-tree.ts` (200줄) - 쿼드트리 유틸
- `math-renderer.ts` (112줄) - 수식 렌더러
- `iconLoader.ts` (221줄) - 아이콘 로더

**2. 프레임워크 래퍼 (src/ 유지)**
- `react.tsx` (931줄)
- `vue.ts` (1,241줄)
- `jquery.ts` (527줄)
- `web-components.ts` (770줄)

**3. 유틸리티 (src/ 유지, 정리 필요)**
- `index.ts` (348줄) - ThemeManager, createButton, createCard 등

### ui/components/ 현재 상태

**JS가 있는 컴포넌트:**
- ✅ `stepper/` - `stepper-unified.js` (TypeScript 전환 필요)
- ✅ `editor/` - 많은 `.js` 파일들 (유지)

**CSS만 있지만 JS가 필요한 컴포넌트 (문서에서 JS 태그 확인):**
- ⚠️ `accordion/` - accordion.css만 (JS 추가 필요)
- ⚠️ `modal/` - modal.css만 (JS 추가 필요)
- ⚠️ `tabs/` - tabs.css, file-tabs.css만 (JS 추가 필요)
- ⚠️ `dropdown.css` - (JS 추가 필요)
- ⚠️ `toast/` - toast.css만 (JS 추가 필요)

**순수 CSS 컴포넌트 (JS 불필요):**
- ✅ `button.css` - 순수 CSS
- ✅ `form.css` - 순수 CSS
- ✅ `progress/` - 순수 CSS
- ✅ `tree/` - 순수 CSS (tree-view와 다름)
- ✅ `command/` - 순수 CSS

---

## 🎯 목표

1. **명확한 책임 분리**
   - `ui/` = 모든 핵심 컴포넌트 (TypeScript → CDN용 JS 빌드)
   - `src/` = 프레임워크 래퍼만 (React, Vue, jQuery, Web Components)

2. **CDN + TypeScript 지원**
   - CDN: 빌드된 JS 파일로 UMD 포맷 제공
   - npm: TypeScript 타입 정의 (.d.ts) 제공

3. **일관된 사용자 경험**
   - 모든 인터랙티브 컴포넌트가 CDN과 npm 양쪽에서 사용 가능
   - 명확한 import 경로

---

## 📁 새로운 디렉토리 구조

```
ui/
├── components/
│   ├── search-bar/
│   │   ├── search-bar.ts       ← src/에서 이동
│   │   └── search-bar.css      ← 추가
│   ├── search-toolbar/
│   │   ├── search-toolbar.ts   ← src/에서 이동
│   │   └── search-toolbar.css  ← 추가
│   ├── tree-view/
│   │   ├── tree-view.ts        ← src/에서 이동
│   │   └── tree-view.css       ← 추가
│   ├── graph-view/
│   │   ├── graph-view.ts       ← src/에서 이동 (main)
│   │   ├── graph-builder.ts    ← src/에서 이동
│   │   ├── canvas-renderer.ts  ← src/에서 이동
│   │   ├── barnes-hut-layout.ts ← src/에서 이동
│   │   ├── quad-tree.ts        ← src/에서 이동
│   │   └── graph-view.css      ← 추가
│   ├── math-renderer/
│   │   ├── math-renderer.ts    ← src/에서 이동
│   │   └── math-renderer.css   ← 추가 (필요시)
│   ├── stepper/
│   │   ├── stepper.ts          ← stepper-unified.js를 TypeScript로 전환
│   │   └── stepper-unified.css ← 유지
│   ├── accordion/
│   │   ├── accordion.ts        ← 새로 작성
│   │   └── accordion.css       ← 기존 유지
│   ├── modal/
│   │   ├── modal.ts            ← 새로 작성
│   │   └── modal.css           ← 기존 유지
│   ├── tabs/
│   │   ├── tabs.ts             ← 새로 작성
│   │   ├── tabs.css            ← 기존 유지
│   │   └── file-tabs.css       ← 기존 유지
│   ├── toast/
│   │   ├── toast.ts            ← 새로 작성
│   │   └── toast.css           ← 기존 유지
│   ├── dropdown/
│   │   ├── dropdown.ts         ← 새로 작성
│   │   └── dropdown.css        ← 기존 파일 이동
│   └── editor/                 ← 기존 유지
│       └── ... (이미 .js로 구현됨, 향후 TS 전환)
├── utils/
│   ├── theme-manager.ts        ← src/index.ts에서 분리
│   ├── icon-loader.ts          ← src/에서 이동
│   └── dom-helpers.ts          ← createButton, createCard 등 분리
└── index.ts                    ← 전체 export

src/ (프레임워크 래퍼만)
├── react.tsx                   ← 유지, import 경로 수정
├── vue.ts                      ← 유지, import 경로 수정
├── jquery.ts                   ← 유지, import 경로 수정
├── web-components.ts           ← 유지, import 경로 수정
└── index.ts                    ← 래퍼들 re-export만
```

---

## 🔨 작업 단계

### Phase 1: 디렉토리 생성 및 파일 이동 (30분)

**1.1 ui/components/ 하위 디렉토리 생성**
```bash
mkdir -p ui/components/{search-bar,search-toolbar,tree-view,graph-view,math-renderer,dropdown,toast}
mkdir -p ui/utils
```

**1.2 파일 이동 (src/ → ui/)**
```bash
# Search 컴포넌트
mv src/search-bar.ts ui/components/search-bar/search-bar.ts
mv src/search-toolbar.ts ui/components/search-toolbar/search-toolbar.ts

# Tree View
mv src/tree-view.ts ui/components/tree-view/tree-view.ts

# Graph View (5개 파일)
mv src/graph-view.ts ui/components/graph-view/graph-view.ts
mv src/graph-builder.ts ui/components/graph-view/graph-builder.ts
mv src/canvas-renderer.ts ui/components/graph-view/canvas-renderer.ts
mv src/barnes-hut-layout.ts ui/components/graph-view/barnes-hut-layout.ts
mv src/quad-tree.ts ui/components/graph-view/quad-tree.ts

# Math Renderer
mv src/math-renderer.ts ui/components/math-renderer/math-renderer.ts

# Utils
mv src/iconLoader.ts ui/utils/icon-loader.ts
```

**1.3 기존 파일 정리**
```bash
# Dropdown CSS 파일 이동
mv ui/components/dropdown.css ui/components/dropdown/dropdown.css
```

**1.4 기존 Vanilla JS를 TypeScript로 전환**
```bash
# Stepper를 TS로 전환 (파일명만 변경, 내용은 나중에)
mv ui/components/stepper/stepper-unified.js ui/components/stepper/stepper.ts
```

---

### Phase 2: import 경로 수정 (30분)

**2.1 이동한 파일들의 내부 import 경로 수정**

**graph-view.ts 내부 (경로 변경 불필요, 같은 디렉토리):**
```typescript
// 같은 디렉토리이므로 상대 경로 유지
import { DocumentGraph } from './graph-builder';
import { BarnesHutLayout } from './barnes-hut-layout';
import { CanvasRenderer } from './canvas-renderer';
```

**2.2 src/ 프레임워크 래퍼 파일들의 import 경로 수정**

**src/react.tsx:**
```typescript
// Before
// (현재는 ui 컴포넌트 직접 import 안 함)

// After
import { SearchBar } from '../ui/components/search-bar/search-bar';
import { Stepper } from '../ui/components/stepper/stepper';
import { Modal } from '../ui/components/modal/modal';
// 필요한 것만 import
```

**src/vue.ts, jquery.ts, web-components.ts 동일하게 수정**

**2.3 src/index.ts 대폭 축소**
```typescript
// Before: 많은 유틸리티 함수들과 컴포넌트 export

// After: 프레임워크 래퍼만 re-export
export const VERSION = "2.0.0";

// Note: 사용자는 개별 entry point 사용
// @monochrome-edge/ui/react
// @monochrome-edge/ui/vue
// 등
```

**2.4 ui/index.ts 생성 (새로운 메인 entry)**
```typescript
// ui/index.ts - 모든 UI 컴포넌트 export
export * from './components/search-bar/search-bar';
export * from './components/search-toolbar/search-toolbar';
export * from './components/tree-view/tree-view';
export * from './components/graph-view/graph-view';
export * from './components/math-renderer/math-renderer';
export * from './components/stepper/stepper';
export * from './components/accordion/accordion';
export * from './components/modal/modal';
export * from './components/tabs/tabs';
export * from './components/toast/toast';
export * from './components/dropdown/dropdown';
export * from './utils/theme-manager';
export * from './utils/icon-loader';
export * from './utils/dom-helpers';
```

**2.5 ui/utils/ 파일 생성**

**ui/utils/theme-manager.ts** (src/index.ts에서 ThemeManager 클래스 분리)
```typescript
export class ThemeManager {
  private currentTheme: "warm" | "cold" = "warm";
  private currentMode: "light" | "dark" = "light";

  constructor(theme?: "warm" | "cold", mode?: "light" | "dark") {
    if (theme) this.currentTheme = theme;
    if (mode) this.currentMode = mode;
    this.apply();
  }

  setTheme(theme: "warm" | "cold") {
    this.currentTheme = theme;
    this.apply();
  }

  setMode(mode: "light" | "dark") {
    this.currentMode = mode;
    this.apply();
  }

  toggle() {
    this.currentMode = this.currentMode === "light" ? "dark" : "light";
    this.apply();
  }

  private apply() {
    const root = document.documentElement;
    root.setAttribute("data-theme", this.currentMode);
    root.setAttribute("data-theme-variant", this.currentTheme);
  }

  getTheme() {
    return { theme: this.currentTheme, mode: this.currentMode };
  }
}
```

**ui/utils/dom-helpers.ts** (src/index.ts에서 createButton, createCard 등 분리)
```typescript
export function createButton(
  text: string,
  options: {
    variant?: "primary" | "secondary" | "ghost" | "danger";
    size?: "small" | "medium" | "large";
    onClick?: () => void;
  } = {},
): HTMLButtonElement {
  const button = document.createElement("button");
  const { variant = "primary", size = "medium", onClick } = options;

  button.className = `btn btn-${variant}${size !== "medium" ? ` btn-${size}` : ""}`;
  button.textContent = text;

  if (onClick) {
    button.addEventListener("click", onClick);
  }

  return button;
}

export function createCard(title: string, content: string | HTMLElement): HTMLElement {
  const card = document.createElement("div");
  card.className = "card";

  const header = document.createElement("div");
  header.className = "card-header";
  header.textContent = title;

  const body = document.createElement("div");
  body.className = "card-body";

  if (typeof content === "string") {
    body.textContent = content;
  } else {
    body.appendChild(content);
  }

  card.appendChild(header);
  card.appendChild(body);

  return card;
}

export function showToast(
  message: string,
  type: "success" | "error" | "info" = "info",
): void {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
```

---

### Phase 3: 새로운 JS 컴포넌트 작성 (2시간)

**3.1 Accordion 컴포넌트 작성**

**ui/components/accordion/accordion.ts:**
```typescript
export interface AccordionOptions {
  allowMultiple?: boolean;
  defaultOpen?: number[];
}

export class Accordion {
  private container: HTMLElement;
  private options: AccordionOptions;
  private items: HTMLElement[];

  constructor(container: HTMLElement | string, options: AccordionOptions = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container)!
      : container;

    this.options = {
      allowMultiple: false,
      defaultOpen: [],
      ...options,
    };

    this.items = Array.from(this.container.querySelectorAll('.accordion-item'));
    this.init();
  }

  private init(): void {
    this.items.forEach((item, index) => {
      const header = item.querySelector('.accordion-header');
      if (!header) return;

      header.addEventListener('click', () => this.toggle(index));

      // Default open
      if (this.options.defaultOpen?.includes(index)) {
        item.classList.add('is-open');
      }
    });
  }

  toggle(index: number): void {
    const item = this.items[index];
    if (!item) return;

    const isOpen = item.classList.contains('is-open');

    if (!this.options.allowMultiple) {
      // Close all others
      this.items.forEach(i => i.classList.remove('is-open'));
    }

    if (isOpen) {
      item.classList.remove('is-open');
    } else {
      item.classList.add('is-open');
    }
  }

  open(index: number): void {
    const item = this.items[index];
    if (!item) return;
    item.classList.add('is-open');
  }

  close(index: number): void {
    const item = this.items[index];
    if (!item) return;
    item.classList.remove('is-open');
  }

  closeAll(): void {
    this.items.forEach(item => item.classList.remove('is-open'));
  }
}
```

**3.2 Modal 컴포넌트 작성**

**ui/components/modal/modal.ts:**
```typescript
export interface ModalOptions {
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

export class Modal {
  private container: HTMLElement;
  private options: ModalOptions;
  private isOpen: boolean = false;

  constructor(container: HTMLElement | string, options: ModalOptions = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container)!
      : container;

    this.options = {
      closeOnBackdrop: true,
      closeOnEscape: true,
      ...options,
    };

    this.init();
  }

  private init(): void {
    // Backdrop click
    if (this.options.closeOnBackdrop) {
      this.container.addEventListener('click', (e) => {
        if (e.target === this.container) {
          this.close();
        }
      });
    }

    // Escape key
    if (this.options.closeOnEscape) {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });
    }

    // Close button
    const closeBtn = this.container.querySelector('[data-modal-close]');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }
  }

  open(): void {
    if (this.isOpen) return;

    this.container.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    this.isOpen = true;

    this.options.onOpen?.();
  }

  close(): void {
    if (!this.isOpen) return;

    this.container.classList.remove('is-open');
    document.body.style.overflow = '';
    this.isOpen = false;

    this.options.onClose?.();
  }

  toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
}
```

**3.3 Tabs 컴포넌트 작성**

**ui/components/tabs/tabs.ts:**
```typescript
export interface TabsOptions {
  defaultTab?: number;
  onChange?: (index: number) => void;
}

export class Tabs {
  private container: HTMLElement;
  private options: TabsOptions;
  private tabButtons: HTMLElement[];
  private tabPanels: HTMLElement[];
  private currentIndex: number;

  constructor(container: HTMLElement | string, options: TabsOptions = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container)!
      : container;

    this.options = {
      defaultTab: 0,
      ...options,
    };

    this.tabButtons = Array.from(this.container.querySelectorAll('.tab'));
    this.tabPanels = Array.from(this.container.querySelectorAll('.tab-panel'));
    this.currentIndex = this.options.defaultTab || 0;

    this.init();
  }

  private init(): void {
    this.tabButtons.forEach((button, index) => {
      button.addEventListener('click', () => this.switchTo(index));
    });

    this.switchTo(this.currentIndex);
  }

  switchTo(index: number): void {
    if (index < 0 || index >= this.tabButtons.length) return;

    // Remove active class from all
    this.tabButtons.forEach(btn => btn.classList.remove('active'));
    this.tabPanels.forEach(panel => panel.classList.remove('active'));

    // Add active class to selected
    this.tabButtons[index]?.classList.add('active');
    this.tabPanels[index]?.classList.add('active');

    this.currentIndex = index;
    this.options.onChange?.(index);
  }

  next(): void {
    const nextIndex = (this.currentIndex + 1) % this.tabButtons.length;
    this.switchTo(nextIndex);
  }

  prev(): void {
    const prevIndex = (this.currentIndex - 1 + this.tabButtons.length) % this.tabButtons.length;
    this.switchTo(prevIndex);
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }
}
```

**3.4 Toast 컴포넌트 작성**

**ui/components/toast/toast.ts:**
```typescript
export interface ToastOptions {
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  type?: 'success' | 'error' | 'info' | 'warning';
}

export class Toast {
  private static container: HTMLElement | null = null;

  private static getContainer(position: string): HTMLElement {
    if (!Toast.container || Toast.container.dataset.position !== position) {
      Toast.container = document.querySelector(`.toast-container[data-position="${position}"]`);

      if (!Toast.container) {
        Toast.container = document.createElement('div');
        Toast.container.className = 'toast-container';
        Toast.container.dataset.position = position;
        document.body.appendChild(Toast.container);
      }
    }

    return Toast.container;
  }

  static show(message: string, options: ToastOptions = {}): void {
    const {
      duration = 3000,
      position = 'top-right',
      type = 'info',
    } = options;

    const container = Toast.getContainer(position);

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('toast-show'), 10);

    // Auto dismiss
    if (duration > 0) {
      setTimeout(() => {
        toast.classList.remove('toast-show');
        setTimeout(() => toast.remove(), 300);
      }, duration);
    }
  }

  static success(message: string, options: Omit<ToastOptions, 'type'> = {}): void {
    Toast.show(message, { ...options, type: 'success' });
  }

  static error(message: string, options: Omit<ToastOptions, 'type'> = {}): void {
    Toast.show(message, { ...options, type: 'error' });
  }

  static info(message: string, options: Omit<ToastOptions, 'type'> = {}): void {
    Toast.show(message, { ...options, type: 'info' });
  }

  static warning(message: string, options: Omit<ToastOptions, 'type'> = {}): void {
    Toast.show(message, { ...options, type: 'warning' });
  }
}
```

**3.5 Dropdown 컴포넌트 작성**

**ui/components/dropdown/dropdown.ts:**
```typescript
export interface DropdownOptions {
  closeOnSelect?: boolean;
  placement?: 'bottom' | 'top' | 'left' | 'right';
  offset?: number;
}

export class Dropdown {
  private trigger: HTMLElement;
  private menu: HTMLElement;
  private options: DropdownOptions;
  private isOpen: boolean = false;

  constructor(trigger: HTMLElement | string, options: DropdownOptions = {}) {
    this.trigger = typeof trigger === 'string'
      ? document.querySelector(trigger)!
      : trigger;

    this.options = {
      closeOnSelect: true,
      placement: 'bottom',
      offset: 4,
      ...options,
    };

    // Find menu (next sibling or data-target)
    const menuId = this.trigger.dataset.dropdownTarget;
    this.menu = menuId
      ? document.querySelector(menuId)!
      : this.trigger.nextElementSibling as HTMLElement;

    this.init();
  }

  private init(): void {
    // Trigger click
    this.trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });

    // Close on outside click
    document.addEventListener('click', () => {
      if (this.isOpen) {
        this.close();
      }
    });

    // Close on item select
    if (this.options.closeOnSelect) {
      this.menu.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('dropdown-item')) {
          this.close();
        }
      });
    }

    // Prevent menu clicks from closing
    this.menu.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  open(): void {
    if (this.isOpen) return;

    this.menu.classList.add('is-open');
    this.trigger.classList.add('is-active');
    this.isOpen = true;

    this.updatePosition();
  }

  close(): void {
    if (!this.isOpen) return;

    this.menu.classList.remove('is-open');
    this.trigger.classList.remove('is-active');
    this.isOpen = false;
  }

  toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  private updatePosition(): void {
    const triggerRect = this.trigger.getBoundingClientRect();
    const { placement, offset } = this.options;

    switch (placement) {
      case 'bottom':
        this.menu.style.top = `${triggerRect.bottom + offset!}px`;
        this.menu.style.left = `${triggerRect.left}px`;
        break;
      case 'top':
        this.menu.style.bottom = `${window.innerHeight - triggerRect.top + offset!}px`;
        this.menu.style.left = `${triggerRect.left}px`;
        break;
      case 'left':
        this.menu.style.top = `${triggerRect.top}px`;
        this.menu.style.right = `${window.innerWidth - triggerRect.left + offset!}px`;
        break;
      case 'right':
        this.menu.style.top = `${triggerRect.top}px`;
        this.menu.style.left = `${triggerRect.right + offset!}px`;
        break;
    }
  }
}
```

---

### Phase 4: Rollup 빌드 설정 수정 (1시간)

**rollup.config.js 전면 개편:**

```javascript
import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const external = ["react", "react-dom", "vue", "jquery"];

export default [
  // ========================================
  // A. UI 컴포넌트 개별 빌드 (CDN용 UMD)
  // ========================================
  {
    input: {
      'search-bar': 'ui/components/search-bar/search-bar.ts',
      'search-toolbar': 'ui/components/search-toolbar/search-toolbar.ts',
      'tree-view': 'ui/components/tree-view/tree-view.ts',
      'graph-view': 'ui/components/graph-view/graph-view.ts',
      'math-renderer': 'ui/components/math-renderer/math-renderer.ts',
      'stepper': 'ui/components/stepper/stepper.ts',
      'accordion': 'ui/components/accordion/accordion.ts',
      'modal': 'ui/components/modal/modal.ts',
      'tabs': 'ui/components/tabs/tabs.ts',
      'toast': 'ui/components/toast/toast.ts',
      'dropdown': 'ui/components/dropdown/dropdown.ts',
    },
    output: {
      dir: 'dist/ui/components',
      format: 'umd',
      name: 'MonochromeEdge',
      exports: 'named',
    },
    plugins: [
      typescript({
        declaration: true,
        declarationDir: 'dist/ui/components',
        rootDir: 'ui',
      }),
      resolve(),
      commonjs(),
      terser(),
    ],
  },

  // ========================================
  // B. UI 통합 번들 (CDN용 전체 포함)
  // ========================================
  {
    input: 'ui/index.ts',
    output: [
      {
        file: 'dist/ui.js',
        format: 'umd',
        name: 'MonochromeEdge',
        exports: 'named',
      },
      {
        file: 'dist/ui.esm.js',
        format: 'es',
      },
    ],
    plugins: [
      typescript({
        declaration: true,
        declarationDir: 'dist',
        declarationMap: true,
        rootDir: 'ui',
      }),
      resolve(),
      commonjs(),
      terser(),
    ],
  },

  // ========================================
  // C. React 래퍼
  // ========================================
  {
    input: 'src/react.tsx',
    external: [...external],
    output: [
      {
        file: 'dist/react.js',
        format: 'cjs',
        exports: 'named',
      },
      {
        file: 'dist/react.esm.js',
        format: 'es',
      },
    ],
    plugins: [
      typescript({
        declaration: true,
        declarationDir: 'dist',
        rootDir: 'src',
        jsx: 'react',
      }),
      resolve(),
      commonjs(),
      terser(),
    ],
  },

  // ========================================
  // D. Vue 래퍼
  // ========================================
  {
    input: 'src/vue.ts',
    external: [...external],
    output: [
      {
        file: 'dist/vue.js',
        format: 'cjs',
        exports: 'named',
      },
      {
        file: 'dist/vue.esm.js',
        format: 'es',
      },
    ],
    plugins: [
      typescript({
        declaration: true,
        declarationDir: 'dist',
        rootDir: 'src',
      }),
      resolve(),
      commonjs(),
      terser(),
    ],
  },

  // ========================================
  // E. jQuery 플러그인
  // ========================================
  {
    input: 'src/jquery.ts',
    external: [...external],
    output: [
      {
        file: 'dist/jquery.js',
        format: 'cjs',
        exports: 'named',
      },
      {
        file: 'dist/jquery.esm.js',
        format: 'es',
      },
    ],
    plugins: [
      typescript({
        declaration: true,
        declarationDir: 'dist',
        rootDir: 'src',
      }),
      resolve(),
      commonjs(),
      terser(),
    ],
  },

  // ========================================
  // F. Web Components
  // ========================================
  {
    input: 'src/web-components.ts',
    output: [
      {
        file: 'dist/web-components.js',
        format: 'cjs',
        exports: 'named',
      },
      {
        file: 'dist/web-components.esm.js',
        format: 'es',
      },
    ],
    plugins: [
      typescript({
        declaration: true,
        declarationDir: 'dist',
        rootDir: 'src',
      }),
      resolve(),
      commonjs(),
      terser(),
    ],
  },
];
```

---

### Phase 5: package.json 수정 (15분)

**exports 필드 전면 업데이트:**

```json
{
  "name": "@monochrome-edge/ui",
  "version": "2.0.0",
  "description": "A modern, minimalist UI with Warm and Cold themes",
  "type": "module",
  "main": "dist/ui.js",
  "module": "dist/ui.esm.js",
  "types": "dist/ui.d.ts",
  "exports": {
    ".": {
      "types": "./dist/ui.d.ts",
      "import": "./dist/ui.esm.js",
      "require": "./dist/ui.js"
    },
    "./ui": {
      "types": "./dist/ui.d.ts",
      "import": "./dist/ui.esm.js",
      "require": "./dist/ui.js"
    },
    "./ui/components/search-bar": {
      "types": "./dist/ui/components/search-bar.d.ts",
      "default": "./dist/ui/components/search-bar.js"
    },
    "./ui/components/search-toolbar": {
      "types": "./dist/ui/components/search-toolbar.d.ts",
      "default": "./dist/ui/components/search-toolbar.js"
    },
    "./ui/components/tree-view": {
      "types": "./dist/ui/components/tree-view.d.ts",
      "default": "./dist/ui/components/tree-view.js"
    },
    "./ui/components/graph-view": {
      "types": "./dist/ui/components/graph-view.d.ts",
      "default": "./dist/ui/components/graph-view.js"
    },
    "./ui/components/stepper": {
      "types": "./dist/ui/components/stepper.d.ts",
      "default": "./dist/ui/components/stepper.js"
    },
    "./ui/components/accordion": {
      "types": "./dist/ui/components/accordion.d.ts",
      "default": "./dist/ui/components/accordion.js"
    },
    "./ui/components/modal": {
      "types": "./dist/ui/components/modal.d.ts",
      "default": "./dist/ui/components/modal.js"
    },
    "./ui/components/tabs": {
      "types": "./dist/ui/components/tabs.d.ts",
      "default": "./dist/ui/components/tabs.js"
    },
    "./ui/components/toast": {
      "types": "./dist/ui/components/toast.d.ts",
      "default": "./dist/ui/components/toast.js"
    },
    "./ui/components/dropdown": {
      "types": "./dist/ui/components/dropdown.d.ts",
      "default": "./dist/ui/components/dropdown.js"
    },
    "./react": {
      "types": "./dist/react.d.ts",
      "import": "./dist/react.esm.js",
      "require": "./dist/react.js"
    },
    "./vue": {
      "types": "./dist/vue.d.ts",
      "import": "./dist/vue.esm.js",
      "require": "./dist/vue.js"
    },
    "./jquery": {
      "types": "./dist/jquery.d.ts",
      "import": "./dist/jquery.esm.js",
      "require": "./dist/jquery.js"
    },
    "./web-components": {
      "types": "./dist/web-components.d.ts",
      "import": "./dist/web-components.esm.js",
      "require": "./dist/web-components.js"
    },
    "./css": "./dist/monochrome.min.css",
    "./warm": "./dist/warm-theme.min.css",
    "./cold": "./dist/cold-theme.min.css",
    "./assets/*": "./ui/assets/*"
  },
  "files": [
    "dist",
    "ui"
  ]
}
```

---

### Phase 6: CSS 파일 생성 및 정리 (30분)

**6.1 각 컴포넌트 CSS 파일 생성**

- `ui/components/search-bar/search-bar.css` - 검색바 스타일
- `ui/components/search-toolbar/search-toolbar.css` - 툴바 스타일
- `ui/components/tree-view/tree-view.css` - 트리뷰 스타일
- `ui/components/graph-view/graph-view.css` - 그래프 스타일
- `ui/components/math-renderer/math-renderer.css` - 수식 렌더러 스타일 (필요시)

**6.2 메인 CSS에 import 추가**
```css
/* ui/monochrome-edge.css */
@import './components/search-bar/search-bar.css';
@import './components/search-toolbar/search-toolbar.css';
@import './components/tree-view/tree-view.css';
@import './components/graph-view/graph-view.css';
@import './components/math-renderer/math-renderer.css';
/* accordion, modal, tabs, toast, dropdown은 이미 있음 */
```

---

### Phase 7: 문서 업데이트 (1.5시간)

**7.1 README.md 업데이트**

추가할 섹션:
- CDN 사용법 (개별 컴포넌트)
- CDN 사용법 (통합 번들)
- npm + TypeScript 사용법
- 컴포넌트별 사용 예시

**7.2 docs/index.html 업데이트**

**Icon Button 아이콘 경로를 jsDelivr CDN으로 변경:**
```html
<!-- Before -->
<img src="node_modules/@monochrome-edge/ui/ui/assets/icons/sun.svg">

<!-- After -->
<img src="https://cdn.jsdelivr.net/npm/@monochrome-edge/ui/ui/assets/icons/sun.svg">
```

**각 컴포넌트 문서에 사용법 추가:**
- Search Bar, Tree View, Graph View 등에 CDN + npm 양쪽 사용법
- Accordion, Modal, Tabs, Toast, Dropdown에 새로운 JS API 문서

**7.3 MIGRATION.md 작성 (v1.x → v2.0.0)**

Breaking Changes와 마이그레이션 가이드

---

### Phase 8: 테스트 및 빌드 (1시간)

**8.1 빌드 테스트**
```bash
npm run build
```

**8.2 빌드 결과 확인**
```bash
# 개별 컴포넌트 확인
ls -la dist/ui/components/

# 타입 정의 확인
ls -la dist/*.d.ts
ls -la dist/ui/components/*.d.ts

# 파일 크기 확인
du -sh dist/ui.js
du -sh dist/ui/components/*.js
```

**8.3 CDN 시뮬레이션 테스트**

**test-cdn.html 생성:**
```html
<!DOCTYPE html>
<html>
<head>
  <title>CDN Test</title>
  <link rel="stylesheet" href="dist/monochrome.min.css">
</head>
<body>
  <!-- Accordion Test -->
  <div class="accordion">
    <div class="accordion-item">
      <div class="accordion-header">Section 1</div>
      <div class="accordion-content">Content 1</div>
    </div>
  </div>

  <!-- Scripts -->
  <script src="dist/ui/components/accordion.js"></script>
  <script>
    new MonochromeEdge.Accordion('.accordion');
  </script>
</body>
</html>
```

**8.4 TypeScript 타입 체크 테스트**
**8.5 프레임워크 래퍼 테스트**

---

## 📊 예상 결과

### 빌드 출력 구조
```
dist/
├── ui.js                        ← 전체 통합 (UMD, CDN용)
├── ui.esm.js                    ← 전체 통합 (ESM)
├── ui.d.ts                      ← TypeScript 타입
├── ui/
│   └── components/
│       ├── search-bar.js
│       ├── search-bar.d.ts
│       ├── accordion.js
│       ├── accordion.d.ts
│       ├── modal.js
│       ├── modal.d.ts
│       └── ...
├── react.js
├── react.esm.js
├── react.d.ts
├── vue.js
├── vue.d.ts
└── monochrome.min.css
```

### 사용 예시

**CDN (개별):**
```html
<script src="https://cdn.jsdelivr.net/npm/@monochrome-edge/ui/dist/ui/components/accordion.js"></script>
<script>
  new MonochromeEdge.Accordion('#accordion');
</script>
```

**CDN (통합):**
```html
<script src="https://cdn.jsdelivr.net/npm/@monochrome-edge/ui/dist/ui.js"></script>
<script>
  new MonochromeEdge.Modal('#modal');
  MonochromeEdge.Toast.success('Hello!');
</script>
```

**npm + TypeScript:**
```typescript
import { SearchBar, Modal } from '@monochrome-edge/ui';
import type { SearchBarOptions, ModalOptions } from '@monochrome-edge/ui';

const searchBar = new SearchBar({...});
const modal = new Modal('#modal', { closeOnBackdrop: true });
```

**npm + React:**
```tsx
import { SearchBar, Modal } from '@monochrome-edge/ui/react';

function App() {
  return (
    <>
      <SearchBar documents={[]} />
      <Modal isOpen={open} onClose={() => setOpen(false)}>Content</Modal>
    </>
  );
}
```

**Icon (jsDelivr):**
```html
<img src="https://cdn.jsdelivr.net/npm/@monochrome-edge/ui/ui/assets/icons/sun.svg" class="icon">
```

---

## ⏱️ 예상 소요 시간

- Phase 1: 30분
- Phase 2: 30분
- Phase 3: 2시간
- Phase 4: 1시간
- Phase 5: 15분
- Phase 6: 30분
- Phase 7: 1.5시간
- Phase 8: 1시간

**총: 약 7시간**

---

## ⚠️ 주의사항

1. **Breaking Changes (v2.0.0)**
   - Major version bump 필요
   - MIGRATION.md 작성

2. **Stepper TypeScript 전환**
   - 기존 로직 최대한 유지
   - 타입만 추가

3. **Editor 제외**
   - 너무 복잡
   - 향후 작업

4. **Graph View 의존성**
   - 5개 파일 같은 디렉토리

5. **새 컴포넌트 품질**
   - 간단하지만 실용적
   - 문서화 철저

---

## ✅ 체크리스트

**Phase 1**
- [ ] 디렉토리 생성
- [ ] 파일 이동
- [ ] 파일 정리

**Phase 2**
- [ ] import 경로 수정
- [ ] src/index.ts 축소
- [ ] ui/index.ts 생성
- [ ] ui/utils/ 파일 생성

**Phase 3**
- [ ] Accordion.ts
- [ ] Modal.ts
- [ ] Tabs.ts
- [ ] Toast.ts
- [ ] Dropdown.ts

**Phase 4**
- [ ] rollup.config.js 개편

**Phase 5**
- [ ] package.json exports
- [ ] version 1.10.2

**Phase 6**
- [ ] CSS 파일 생성
- [ ] CSS import 추가

**Phase 7**
- [ ] README.md
- [ ] docs/index.html
- [ ] MIGRATION.md

**Phase 8**
- [ ] 빌드 테스트
- [ ] CDN 테스트
- [ ] 타입 체크
- [ ] 래퍼 테스트

**마무리**
- [ ] CHANGELOG.md
- [ ] Git commit
- [ ] Git tag v1.10.0
- [ ] npm publish

---

## 📚 Import Path Standards (2025-10-12 Updated)

### ✅ Recommended: Use '@' Alias Imports

**Why?**
- Path aliases (`@ui/`, `@src/`) are configured in both `tsconfig.json` and rollup configs
- Makes code more maintainable - file moves won't break imports
- Clearer dependencies - immediately see if importing from `ui/` or `src/`
- Better IDE support for autocomplete and refactoring

**Configuration:**

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@src/*": ["src/*"],
      "@ui/*": ["ui/*"]
    }
  }
}
```

`rollup.config.js` and `rollup.editor.config.js`:
```javascript
import alias from "@rollup/plugin-alias";

alias({
  entries: [
    { find: "@src", replacement: path.resolve(__dirname, "src") },
    { find: "@ui", replacement: path.resolve(__dirname, "ui") }
  ]
})
```

### 📝 Import Guidelines

**1. Within `ui/` directory - Use `@ui/` alias:**

```typescript
// ✅ GOOD - Clear, maintainable
import { iconLoader } from "@ui/utils/icon-loader";
import { ThemeManager } from "@ui/utils/theme-manager";
import { SearchBar } from "@ui/components/search-bar/search-bar";

// ❌ AVOID - Relative paths are fragile
import { iconLoader } from "../../utils/icon-loader";
import { iconLoader } from "../utils/icon-loader";
```

**2. Within `src/` directory - Use `@src/` or `@ui/` alias:**

```typescript
// ✅ GOOD - Importing from ui/
import { SearchBar } from "@ui/components/search-bar/search-bar";
import { ThemeManager } from "@ui/utils/theme-manager";

// ✅ GOOD - Importing from src/ (if needed)
import { SomeHelper } from "@src/helpers";

// ❌ AVOID
import { SearchBar } from "../ui/components/search-bar/search-bar";
```

**3. Editor components (JavaScript files) - Use `@ui/` alias:**

```javascript
// ✅ GOOD - Works with rollup alias plugin
import { iconLoader } from "@ui/utils/icon-loader";

// ❌ WRONG - After migration, src/iconLoader doesn't exist
import { iconLoader } from "@src/iconLoader";
```

### 🔧 Fixed Issues (2025-10-12)

**Issue 1: Broken import after migration**
- **File**: `ui/utils/icon.js:6`
- **Problem**: Referenced `@src/iconLoader` but file moved to `ui/utils/icon-loader.ts`
- **Fix**: Changed to `@ui/utils/icon-loader`

**Issue 2: Inconsistent relative imports**
- **Files**:
  - `ui/components/search-toolbar/search-toolbar.ts:6`
  - `ui/molecules/search-toolbar.ts:6`
- **Problem**: Used relative imports `../../utils/icon-loader` and `../utils/icon-loader`
- **Fix**: Standardized to `@ui/utils/icon-loader`

### ✅ TypeScript Warnings Resolution (2025-10-12 Fixed)

Previously, you might have seen TypeScript warnings like:
```
Cannot find module '@ui/utils/icon-loader' or its corresponding type declarations
```

**This has been FIXED** by adding explicit `paths` configuration to TypeScript plugin options.

**Solution Applied:**
All rollup configs now include `baseUrl` and `paths` in TypeScript `compilerOptions`:

```javascript
typescript({
  tsconfig: false,
  compilerOptions: {
    target: "es2022",
    module: "esnext",
    moduleResolution: "node",
    allowSyntheticDefaultImports: true,
    esModuleInterop: true,
    baseUrl: ".",           // ← Added
    paths: {                // ← Added
      "@src/*": ["src/*"],
      "@ui/*": ["ui/*"],
    },
  },
})
```

**Files Updated:**
- ✅ `rollup.config.js` - 4 configs (Vue, jQuery, Web Components, src/index)
- ✅ `rollup.editor.config.js` - 4 configs (ESM, UMD, Minified, Standalone)

**Result:**
- ✅ **No TypeScript warnings** during build
- ✅ Build completes successfully
- ✅ All '@' alias imports work correctly

### 🎯 Best Practices

1. **Always use `@ui/` or `@src/` aliases** for imports
2. **Never use `@src/` for files that moved to `ui/`** - check the migration plan
3. **Prefer absolute imports over relative imports** for better maintainability
4. **Keep same-directory imports relative** - e.g., `./graph-builder` within `graph-view/`

### 📋 Quick Reference

| Scenario | Import Style | Example |
|----------|--------------|---------|
| UI component → UI util | `@ui/` | `import { iconLoader } from "@ui/utils/icon-loader"` |
| UI component → UI component | `@ui/` | `import { SearchBar } from "@ui/components/search-bar/search-bar"` |
| Src wrapper → UI component | `@ui/` | `import { SearchBar } from "@ui/components/search-bar/search-bar"` |
| Same directory | `./` | `import { DocumentGraph } from "./graph-builder"` |
| Editor JS → UI util | `@ui/` | `import { iconLoader } from "@ui/utils/icon-loader"` |
