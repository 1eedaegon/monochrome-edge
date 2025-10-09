<template>
  <div
    ref="dropdownRef"
    :class="['dropdown', { 'is-open': isOpen, 'is-disabled': disabled, 'is-error': error }, className]"
    :style="customStyle"
  >
    <button
      type="button"
      class="dropdown-toggle"
      @click="handleToggle"
      :disabled="disabled"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
    >
      <span class="dropdown-value">
        {{ selectedOption?.label || placeholder }}
      </span>
      <svg class="dropdown-icon" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor">
        <path d="M2 4L6 8L10 4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    <ul v-if="isOpen" class="dropdown-menu" role="listbox">
      <li
        v-for="option in options"
        :key="option.value"
        :class="['dropdown-item', { 'is-selected': modelValue === option.value, 'is-disabled': option.disabled }]"
        @click="() => handleSelect(option.value, option.disabled)"
        role="option"
        :aria-selected="modelValue === option.value"
      >
        {{ option.label }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface Props {
  options: DropdownOption[];
  modelValue?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  customStyle?: Record<string, any>;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select an option',
  disabled: false,
  error: false,
  className: '',
  customStyle: () => ({})
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  change: [value: string];
}>();

const dropdownRef = ref<HTMLDivElement>();
const isOpen = ref(false);

const selectedOption = computed(() =>
  props.options.find(opt => opt.value === props.modelValue)
);

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});

const handleToggle = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value;
  }
};

const handleSelect = (optionValue: string, optionDisabled?: boolean) => {
  if (optionDisabled || props.disabled) return;
  emit('update:modelValue', optionValue);
  emit('change', optionValue);
  isOpen.value = false;
};
</script>
