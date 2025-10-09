<template>
  <div :class="['tree-view', className]" :style="customStyle">
    <TreeNodeItem
      v-for="node in data"
      :key="node.id"
      :node="node"
      :level="0"
      :default-expanded="defaultExpanded"
      @node-click="(node) => $emit('node-click', node)"
      @node-expand="(node, expanded) => $emit('node-expand', node, expanded)"
    />
  </div>
</template>

<script setup lang="ts">
import { defineComponent, ref } from 'vue';

export interface TreeNode {
  id: string;
  label: string;
  icon?: string;
  children?: TreeNode[];
  metadata?: Record<string, any>;
}

interface Props {
  data: TreeNode[];
  defaultExpanded?: boolean;
  className?: string;
  customStyle?: Record<string, any>;
}

withDefaults(defineProps<Props>(), {
  defaultExpanded: false,
  className: '',
  customStyle: () => ({})
});

defineEmits<{
  'node-click': [node: TreeNode];
  'node-expand': [node: TreeNode, expanded: boolean];
}>();
</script>

<script lang="ts">
export default defineComponent({
  name: 'TreeNodeItem',
  props: {
    node: { type: Object as () => TreeNode, required: true },
    level: { type: Number, default: 0 },
    defaultExpanded: { type: Boolean, default: false }
  },
  emits: ['node-click', 'node-expand'],
  setup(props, { emit }) {
    const isExpanded = ref(props.defaultExpanded);
    const hasChildren = props.node.children && props.node.children.length > 0;

    const handleToggle = (e: MouseEvent) => {
      e.stopPropagation();
      isExpanded.value = !isExpanded.value;
      emit('node-expand', props.node, isExpanded.value);
    };

    const handleClick = () => {
      emit('node-click', props.node);
    };

    return { isExpanded, hasChildren, handleToggle, handleClick };
  },
  template: `
    <div class="tree-node">
      <div
        :class="['tree-node-content', { 'is-expanded': isExpanded }]"
        :style="{ paddingLeft: level * 1.5 + 'rem' }"
        @click="handleClick"
      >
        <button
          v-if="hasChildren"
          class="tree-node-toggle"
          @click="handleToggle"
          :aria-label="isExpanded ? 'Collapse' : 'Expand'"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor"
            :style="{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }">
            <path d="M4 2L8 6L4 10" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <span v-if="node.icon" class="tree-node-icon">{{ node.icon }}</span>
        <span class="tree-node-label">{{ node.label }}</span>
      </div>
      <div v-if="hasChildren && isExpanded" class="tree-node-children">
        <TreeNodeItem
          v-for="child in node.children"
          :key="child.id"
          :node="child"
          :level="level + 1"
          :default-expanded="defaultExpanded"
          @node-click="(n) => $emit('node-click', n)"
          @node-expand="(n, exp) => $emit('node-expand', n, exp)"
        />
      </div>
    </div>
  `
});
</script>
