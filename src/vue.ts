import { 
  defineComponent, 
  ref, 
  computed,
  onMounted, 
  provide, 
  inject,
  Ref,
  InjectionKey,
  PropType,
  h,
  VNode
} from 'vue';

type ThemeVariant = 'warm' | 'cold';
type ThemeMode = 'light' | 'dark';

interface ThemeContext {
  theme: Ref<ThemeVariant>;
  mode: Ref<ThemeMode>;
  setTheme: (theme: ThemeVariant) => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeKey: InjectionKey<ThemeContext> = Symbol('theme');

export const ThemeProvider = defineComponent({
  name: 'ThemeProvider',
  props: {
    defaultTheme: {
      type: String as PropType<ThemeVariant>,
      default: 'warm'
    },
    defaultMode: {
      type: String as PropType<ThemeMode>,
      default: 'light'
    }
  },
  setup(props, { slots }) {
    const theme = ref<ThemeVariant>(props.defaultTheme);
    const mode = ref<ThemeMode>(props.defaultMode);

    const setTheme = (newTheme: ThemeVariant) => {
      theme.value = newTheme;
      document.documentElement.setAttribute('data-theme-variant', newTheme);
    };

    const setMode = (newMode: ThemeMode) => {
      mode.value = newMode;
      document.documentElement.setAttribute('data-theme', newMode);
    };

    const toggleMode = () => {
      const newMode = mode.value === 'light' ? 'dark' : 'light';
      setMode(newMode);
    };

    onMounted(() => {
      setTheme(theme.value);
      setMode(mode.value);
    });

    provide(ThemeKey, {
      theme,
      mode,
      setTheme,
      setMode,
      toggleMode
    });

    return () => slots.default?.();
  }
});

export function useTheme() {
  const context = inject(ThemeKey);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

export const Button = defineComponent({
  name: 'MonoButton',
  props: {
    variant: {
      type: String as PropType<'primary' | 'secondary' | 'ghost' | 'danger'>,
      default: 'primary'
    },
    size: {
      type: String as PropType<'small' | 'medium' | 'large'>,
      default: 'medium'
    },
    loading: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    onClick: {
      type: Function as PropType<(e: MouseEvent) => void>
    }
  },
  setup(props, { slots }) {
    const classes = computed(() => {
      const classList = ['btn', `btn-${props.variant}`];
      if (props.size !== 'medium') {
        classList.push(`btn-${props.size}`);
      }
      if (props.loading) {
        classList.push('loading');
      }
      return classList.join(' ');
    });

    return () =>
      h(
        'button',
        {
          class: classes.value,
          disabled: props.disabled || props.loading,
          onClick: props.onClick
        },
        slots.default?.()
      );
  }
});

export const Card = defineComponent({
  name: 'MonoCard',
  props: {
    title: {
      type: String
    }
  },
  setup(props, { slots }) {
    return () =>
      h('div', { class: 'card' }, [
        props.title && h('div', { class: 'card-header' }, props.title),
        h('div', { class: 'card-body' }, slots.default?.())
      ]);
  }
});

export const Input = defineComponent({
  name: 'MonoInput',
  props: {
    modelValue: {
      type: [String, Number],
      default: ''
    },
    label: {
      type: String
    },
    error: {
      type: String
    },
    type: {
      type: String,
      default: 'text'
    },
    placeholder: {
      type: String
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const handleInput = (e: Event) => {
      const target = e.target as HTMLInputElement;
      emit('update:modelValue', target.value);
    };

    return () =>
      h('div', { class: 'form-group' }, [
        props.label && h('label', { class: 'label' }, props.label),
        h('input', {
          class: `input ${props.error ? 'input-error' : ''}`,
          type: props.type,
          value: props.modelValue,
          placeholder: props.placeholder,
          disabled: props.disabled,
          onInput: handleInput
        }),
        props.error && h('span', { class: 'error-message' }, props.error)
      ]);
  }
});

export const Modal = defineComponent({
  name: 'MonoModal',
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    title: {
      type: String
    },
    size: {
      type: String as PropType<'small' | 'medium' | 'large'>,
      default: 'medium'
    }
  },
  emits: ['close'],
  setup(props, { emit, slots }) {
    const handleClose = () => emit('close');

    return () => {
      if (!props.isOpen) return null;

      return h('div', { class: 'modal is-open' }, [
        h('div', { class: 'modal-backdrop', onClick: handleClose }),
        h('div', { class: `modal-content modal-${props.size}` }, [
          props.title && h('div', { class: 'modal-header' }, [
            h('h3', { class: 'modal-title' }, props.title),
            h('button', { class: 'modal-close', onClick: handleClose }, '×')
          ]),
          h('div', { class: 'modal-body' }, slots.default?.())
        ])
      ]);
    };
  }
});

export const Layout = defineComponent({
  name: 'MonoLayout',
  setup(_, { slots }) {
    return () =>
      h('div', { class: 'ui-layout' }, [
        slots.sidebar && h('aside', { class: 'sidebar' }, slots.sidebar()),
        h('div', { class: 'main-container' }, [
          slots.header && h('header', { class: 'header' }, slots.header()),
          h('main', { class: 'main-content' }, slots.default?.())
        ])
      ]);
  }
});

export function useToast() {
  const show = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  return {
    success: (message: string) => show(message, 'success'),
    error: (message: string) => show(message, 'error'),
    info: (message: string) => show(message, 'info'),
    show
  };
}

import { ThemeManager } from './index';
export { ThemeManager };

export default {
  ThemeProvider,
  Button,
  Card,
  Input,
  Modal,
  Layout,
  useTheme,
  useToast,
  ThemeManager
};