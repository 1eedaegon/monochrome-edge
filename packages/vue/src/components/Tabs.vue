<template>
  <div :class="['tabs', className]" :style="customStyle">
    <div class="tabs-header" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab-btn', { 'is-active': activeTab === tab.id, 'is-disabled': tab.disabled }]"
        @click="() => handleTabClick(tab.id, tab.disabled)"
        :disabled="tab.disabled"
        role="tab"
        :aria-selected="activeTab === tab.id"
        :aria-controls="`tab-panel-${tab.id}`"
      >
        {{ tab.label }}
      </button>
    </div>
    <div class="tabs-content">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        :id="`tab-panel-${tab.id}`"
        :class="['tab-panel', { 'is-active': activeTab === tab.id }]"
        role="tabpanel"
        :hidden="activeTab !== tab.id"
      >
        <slot :name="`tab-${tab.id}`">{{ tab.content }}</slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

export interface TabItem {
  id: string;
  label: string;
  content?: any;
  disabled?: boolean;
}

interface Props {
  tabs: TabItem[];
  defaultActiveId?: string;
  className?: string;
  customStyle?: Record<string, any>;
}

const props = withDefaults(defineProps<Props>(), {
  className: '',
  customStyle: () => ({})
});

const emit = defineEmits<{
  change: [tabId: string];
}>();

const activeTab = ref(props.defaultActiveId || props.tabs[0]?.id);

const handleTabClick = (tabId: string, disabled?: boolean) => {
  if (disabled) return;
  activeTab.value = tabId;
  emit('change', tabId);
};
</script>
