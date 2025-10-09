<template>
  <div v-if="collapsible" :class="['toc-collapsible', { 'is-open': isOpen }, className]" :style="customStyle">
    <div class="toc-collapsible-header" @click="() => (isOpen = !isOpen)">
      <h4 class="toc-collapsible-title">{{ title }}</h4>
      <span class="toc-collapsible-icon">▼</span>
    </div>
    <div class="toc-collapsible-content">
      <ul class="toc-list">
        <li v-for="item in items" :key="item.id" class="toc-list-item">
          <a
            :href="item.href"
            :class="['toc-list-link', { 'is-active': activeId === item.id }]"
            @click="(e) => handleItemClick(e, item)"
            :style="item.level ? { paddingLeft: `${item.level * 0.75}rem` } : {}"
          >
            {{ item.label }}
          </a>
        </li>
      </ul>
    </div>
  </div>
  <div v-else :class="['toc-card', className]" :style="customStyle">
    <h4 class="toc-card-title">{{ title }}</h4>
    <ul class="toc-card-list">
      <li v-for="item in items" :key="item.id" class="toc-card-item">
        <a
          :href="item.href"
          :class="['toc-card-link', { 'is-active': activeId === item.id }]"
          @click="(e) => handleItemClick(e, item)"
          :style="item.level ? { paddingLeft: `${item.level * 0.75}rem` } : {}"
        >
          {{ item.label }}
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

export interface TOCItem {
  id: string;
  label: string;
  href: string;
  level?: number;
}

interface Props {
  items: TOCItem[];
  activeId?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  title?: string;
  className?: string;
  customStyle?: Record<string, any>;
}

const props = withDefaults(defineProps<Props>(), {
  collapsible: false,
  defaultCollapsed: false,
  title: 'Table of Contents',
  className: '',
  customStyle: () => ({})
});

const emit = defineEmits<{
  'item-click': [item: TOCItem];
}>();

const isOpen = ref(!props.defaultCollapsed);

const handleItemClick = (e: MouseEvent, item: TOCItem) => {
  e.preventDefault();
  emit('item-click', item);
  const element = document.querySelector(item.href);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};
</script>
