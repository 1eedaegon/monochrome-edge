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

// Table Components
export const Table = defineComponent({
  name: 'MonoTable',
  setup(_, { slots }) {
    return () => h('table', { class: 'table' }, slots.default?.());
  }
});

export const TableHeader = defineComponent({
  name: 'MonoTableHeader',
  setup(_, { slots }) {
    return () => h('thead', {}, slots.default?.());
  }
});

export const TableBody = defineComponent({
  name: 'MonoTableBody',
  setup(_, { slots }) {
    return () => h('tbody', {}, slots.default?.());
  }
});

export const TableRow = defineComponent({
  name: 'MonoTableRow',
  props: {
    onClick: {
      type: Function as PropType<() => void>
    }
  },
  setup(props, { slots }) {
    return () => h('tr', { onClick: props.onClick }, slots.default?.());
  }
});

export const TableCell = defineComponent({
  name: 'MonoTableCell',
  props: {
    header: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { slots }) {
    const tag = props.header ? 'th' : 'td';
    return () => h(tag, {}, slots.default?.());
  }
});

// Navigation Components
export const Nav = defineComponent({
  name: 'MonoNav',
  setup(_, { slots }) {
    return () => h('nav', { class: 'nav' }, slots.default?.());
  }
});

export const NavGroup = defineComponent({
  name: 'MonoNavGroup',
  props: {
    title: {
      type: String
    }
  },
  setup(props, { slots }) {
    return () =>
      h('div', { class: 'nav-group' }, [
        props.title && h('div', { class: 'nav-group-title' }, props.title),
        h('div', { class: 'nav-group-items' }, slots.default?.())
      ]);
  }
});

export const NavItem = defineComponent({
  name: 'MonoNavItem',
  props: {
    active: {
      type: Boolean,
      default: false
    },
    href: {
      type: String,
      default: '#'
    },
    onClick: {
      type: Function as PropType<() => void>
    }
  },
  setup(props, { slots }) {
    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      props.onClick?.();
    };

    return () =>
      h(
        'a',
        {
          href: props.href,
          class: `nav-item ${props.active ? 'is-active' : ''}`,
          onClick: handleClick
        },
        slots.default?.()
      );
  }
});

// Select Component
export const Select = defineComponent({
  name: 'MonoSelect',
  props: {
    modelValue: {
      type: [String, Number, Array] as PropType<string | number | string[] | number[]>
    },
    label: {
      type: String
    },
    error: {
      type: String
    },
    multiple: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit, slots }) {
    const handleChange = (e: Event) => {
      const target = e.target as HTMLSelectElement;
      if (props.multiple) {
        const values = Array.from(target.selectedOptions).map(option => option.value);
        emit('update:modelValue', values);
      } else {
        emit('update:modelValue', target.value);
      }
    };

    return () =>
      h('div', { class: 'form-group' }, [
        props.label && h('label', { class: 'label' }, props.label),
        h(
          'select',
          {
            class: `select ${props.error ? 'select-error' : ''}`,
            value: props.modelValue,
            multiple: props.multiple,
            disabled: props.disabled,
            onChange: handleChange
          },
          slots.default?.()
        ),
        props.error && h('span', { class: 'error-message' }, props.error)
      ]);
  }
});

// Badge Component
export const Badge = defineComponent({
  name: 'MonoBadge',
  props: {
    variant: {
      type: String as PropType<'default' | 'primary' | 'success' | 'warning' | 'danger'>,
      default: 'default'
    }
  },
  setup(props, { slots }) {
    return () =>
      h('span', { class: `badge badge-${props.variant}` }, slots.default?.());
  }
});

// Textarea Component
export const Textarea = defineComponent({
  name: 'MonoTextarea',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    label: {
      type: String
    },
    error: {
      type: String
    },
    placeholder: {
      type: String
    },
    disabled: {
      type: Boolean,
      default: false
    },
    rows: {
      type: Number,
      default: 3
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const handleInput = (e: Event) => {
      const target = e.target as HTMLTextAreaElement;
      emit('update:modelValue', target.value);
    };

    return () =>
      h('div', { class: 'form-group' }, [
        props.label && h('label', { class: 'label' }, props.label),
        h('textarea', {
          class: `textarea ${props.error ? 'textarea-error' : ''}`,
          value: props.modelValue,
          placeholder: props.placeholder,
          disabled: props.disabled,
          rows: props.rows,
          onInput: handleInput
        }),
        props.error && h('span', { class: 'error-message' }, props.error)
      ]);
  }
});

// Checkbox Component
export const Checkbox = defineComponent({
  name: 'MonoCheckbox',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    label: {
      type: String
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const handleChange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      emit('update:modelValue', target.checked);
    };

    return () =>
      h('label', { class: 'checkbox' }, [
        h('input', {
          type: 'checkbox',
          checked: props.modelValue,
          disabled: props.disabled,
          onChange: handleChange
        }),
        h('span', { class: 'checkbox-mark' }),
        props.label && h('span', {}, props.label)
      ]);
  }
});

// Radio Component
export const Radio = defineComponent({
  name: 'MonoRadio',
  props: {
    modelValue: {
      type: [String, Number]
    },
    value: {
      type: [String, Number],
      required: true
    },
    label: {
      type: String
    },
    name: {
      type: String
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const handleChange = () => {
      emit('update:modelValue', props.value);
    };

    return () =>
      h('label', { class: 'radio' }, [
        h('input', {
          type: 'radio',
          name: props.name,
          checked: props.modelValue === props.value,
          disabled: props.disabled,
          onChange: handleChange
        }),
        h('span', { class: 'radio-mark' }),
        props.label && h('span', {}, props.label)
      ]);
  }
});

// FormGroup Component
export const FormGroup = defineComponent({
  name: 'MonoFormGroup',
  setup(_, { slots }) {
    return () => h('div', { class: 'form-group' }, slots.default?.());
  }
});

// Label Component
export const Label = defineComponent({
  name: 'MonoLabel',
  props: {
    for: {
      type: String
    },
    required: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { slots }) {
    return () =>
      h('label', { class: 'label', for: props.for }, [
        slots.default?.(),
        props.required && h('span', { class: 'text-danger' }, '*')
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
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  Nav,
  NavGroup,
  NavItem,
  Select,
  Badge,
  Textarea,
  Checkbox,
  Radio,
  FormGroup,
  Label,
  useTheme,
  useToast,
  ThemeManager
};