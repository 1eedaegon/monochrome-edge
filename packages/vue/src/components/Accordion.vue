<template>
  <div :class="['accordion', className]" :style="customStyle">
    <div
      v-for="item in items"
      :key="item.id"
      :class="['accordion-item', { 'is-expanded': isExpanded(item.id), 'is-disabled': item.disabled }]"
    >
      <button
        class="accordion-header"
        @click="() => handleToggle(item.id, item.disabled)"
        :disabled="item.disabled"
        :aria-expanded="isExpanded(item.id)"
        :aria-controls="`accordion-content-${item.id}`"
      >
        <span class="accordion-title">{{ item.title }}</span>
        <svg
          class="accordion-icon"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          :style="{ transform: isExpanded(item.id) ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }"
        >
          <path d="M4 6L8 10L12 6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <div
        :id="`accordion-content-${item.id}`"
        class="accordion-content"
        :style="{ maxHeight: isExpanded(item.id) ? '1000px' : '0', transition: 'max-height 0.3s ease' }"
      >
        <div class="accordion-body">
          <slot :name="`item-${item.id}`">{{ item.content }}</slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

export interface AccordionItem {
  id: string;
  title: string;
  content?: any;
  disabled?: boolean;
}

interface Props {
  items: AccordionItem[];
  defaultExpandedIds?: string[];
  allowMultiple?: boolean;
  className?: string;
  customStyle?: Record<string, any>;
}

const props = withDefaults(defineProps<Props>(), {
  defaultExpandedIds: () => [],
  allowMultiple: false,
  className: '',
  customStyle: () => ({})
});

const emit = defineEmits<{
  change: [expandedIds: string[]];
}>();

const expandedIds = ref<string[]>(props.defaultExpandedIds);

const isExpanded = (itemId: string) => expandedIds.value.includes(itemId);

const handleToggle = (itemId: string, disabled?: boolean) => {
  if (disabled) return;

  let newExpandedIds: string[];

  if (props.allowMultiple) {
    if (expandedIds.value.includes(itemId)) {
      newExpandedIds = expandedIds.value.filter(id => id !== itemId);
    } else {
      newExpandedIds = [...expandedIds.value, itemId];
    }
  } else {
    newExpandedIds = expandedIds.value.includes(itemId) ? [] : [itemId];
  }

  expandedIds.value = newExpandedIds;
  emit('change', newExpandedIds);
};
</script>
