<template>
  <Teleport to="body">
    <div v-if="isOpen" :class="['modal', 'is-open', className]" :style="customStyle">
      <div class="modal-backdrop" @click="handleClose" />
      <div :class="['modal-content', sizeClass]">
        <div v-if="title" class="modal-header">
          <h3 class="modal-title">{{ title }}</h3>
          <button class="modal-close" @click="handleClose" aria-label="Close">×</button>
        </div>
        <div class="modal-body">
          <slot />
        </div>
        <div v-if="$slots.footer" class="modal-footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';

interface Props {
  isOpen: boolean;
  title?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  customStyle?: Record<string, any>;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  className: '',
  customStyle: () => ({})
});

const emit = defineEmits<{
  close: [];
}>();

const sizeClass = computed(() => {
  if (props.size === 'small') return 'modal-small';
  if (props.size === 'large') return 'modal-large';
  return '';
});

const handleClose = () => {
  emit('close');
};

const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.isOpen) {
    handleClose();
  }
};

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);
  } else {
    document.body.style.overflow = '';
    document.removeEventListener('keydown', handleEscape);
  }
}, { immediate: true });
</script>
