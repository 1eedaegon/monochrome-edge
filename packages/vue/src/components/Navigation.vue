<template>
  <!-- Header Navigation -->
  <header v-if="type === 'header'" :class="['nav-header', className]" :style="customStyle">
    <div v-if="$slots.logo" class="nav-header-logo">
      <slot name="logo" />
    </div>
    <nav class="nav-header-menu">
      <a
        v-for="item in items"
        :key="item.id"
        :href="item.href || '#'"
        class="nav-header-item"
        @click="(e) => handleItemClick(e, item)"
      >
        <span v-if="item.icon" class="nav-header-item-icon">{{ item.icon }}</span>
        <span class="nav-header-item-label">{{ item.label }}</span>
      </a>
    </nav>
    <div v-if="$slots.actions" class="nav-header-actions">
      <slot name="actions" />
    </div>
  </header>

  <!-- Sidebar Navigation -->
  <aside v-else :class="['nav-sidebar', { 'is-collapsed': collapsed }, className]" :style="customStyle">
    <nav class="nav-sidebar-menu">
      <NavItem
        v-for="item in items"
        :key="item.id"
        :item="item"
        :active-id="activeId"
        :level="0"
        @item-click="handleItemClick"
      />
    </nav>
    <button
      v-if="collapsible"
      class="nav-sidebar-toggle"
      @click="() => (collapsed = !collapsed)"
      :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        :style="{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }"
      >
        <path d="M10 12L6 8L10 4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
  </aside>
</template>

<script setup lang="ts">
import { ref, defineComponent } from 'vue';

export interface NavItem {
  id: string;
  label: string;
  href?: string;
  icon?: string;
  onClick?: () => void;
  children?: NavItem[];
}

interface Props {
  type?: 'header' | 'sidebar';
  items: NavItem[];
  activeId?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
  customStyle?: Record<string, any>;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'sidebar',
  collapsible: false,
  defaultCollapsed: false,
  className: '',
  customStyle: () => ({})
});

const emit = defineEmits<{
  'item-click': [item: NavItem];
}>();

const collapsed = ref(props.defaultCollapsed);

const handleItemClick = (e: MouseEvent | Event, item: NavItem) => {
  if (item.onClick || props.type === 'sidebar') {
    e.preventDefault();
  }
  item.onClick?.();
  emit('item-click', item);
};
</script>

<script lang="ts">
// Sidebar Nav Item Component
export default defineComponent({
  name: 'NavItem',
  props: {
    item: { type: Object as () => NavItem, required: true },
    activeId: { type: String },
    level: { type: Number, default: 0 }
  },
  emits: ['item-click'],
  setup(props, { emit }) {
    const isExpanded = ref(false);
    const isActive = props.activeId === props.item.id;
    const hasChildren = props.item.children && props.item.children.length > 0;

    const handleClick = (e: MouseEvent) => {
      if (hasChildren) {
        e.preventDefault();
        isExpanded.value = !isExpanded.value;
      }
      emit('item-click', e, props.item);
    };

    return { isExpanded, isActive, hasChildren, handleClick };
  },
  template: `
    <div class="nav-sidebar-item-wrapper">
      <a
        :href="item.href || '#'"
        :class="['nav-sidebar-item', { 'is-active': isActive, 'has-children': hasChildren }]"
        :style="{ paddingLeft: level * 1.5 + 1 + 'rem' }"
        @click="handleClick"
      >
        <span v-if="item.icon" class="nav-sidebar-item-icon">{{ item.icon }}</span>
        <span class="nav-sidebar-item-label">{{ item.label }}</span>
        <svg
          v-if="hasChildren"
          class="nav-sidebar-item-arrow"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          :style="{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }"
        >
          <path d="M4 2L8 6L4 10" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </a>
      <div v-if="hasChildren && isExpanded" class="nav-sidebar-children">
        <NavItem
          v-for="child in item.children"
          :key="child.id"
          :item="child"
          :active-id="activeId"
          :level="level + 1"
          @item-click="(e, item) => $emit('item-click', e, item)"
        />
      </div>
    </div>
  `
});
</script>
