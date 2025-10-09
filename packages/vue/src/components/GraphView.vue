<template>
  <div
    ref="containerRef"
    :class="['graph-view-container', className]"
    :style="{ width: width || '100%', height: height || '600px', position: 'relative', ...customStyle }"
  >
    <canvas
      ref="canvasRef"
      :width="width"
      :height="height"
      class="graph-view-canvas"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

export interface DocumentMetadata {
  id: string;
  title: string;
  tags: string[];
  links?: Array<{ target: string; type: string }>;
}

interface Props {
  documents: DocumentMetadata[];
  width?: number;
  height?: number;
  iterations?: number;
  repulsionStrength?: number;
  attractionStrength?: number;
  nodeRadius?: number;
  showLabels?: boolean;
  className?: string;
  customStyle?: Record<string, any>;
}

const props = withDefaults(defineProps<Props>(), {
  width: 800,
  height: 600,
  iterations: 300,
  repulsionStrength: 800,
  attractionStrength: 0.01,
  nodeRadius: 8,
  showLabels: true,
  className: '',
  customStyle: () => ({})
});

const emit = defineEmits<{
  nodeClick: [node: { id: string; title: string; tags: string[] }];
  nodeHover: [node: { id: string; title: string; tags: string[] } | null];
  layoutProgress: [iteration: number, alpha: number];
}>();

const containerRef = ref<HTMLDivElement>();
const canvasRef = ref<HTMLCanvasElement>();
let graphView: any = null;

onMounted(async () => {
  if (!containerRef.value) return;

  const { GraphView } = await import('../../../src/graph-view');

  graphView = new GraphView({
    container: containerRef.value,
    documents: props.documents,
    width: props.width,
    height: props.height,
    iterations: props.iterations,
    repulsionStrength: props.repulsionStrength,
    attractionStrength: props.attractionStrength,
    nodeRadius: props.nodeRadius,
    showLabels: props.showLabels,
    onNodeClick: (node) => emit('nodeClick', node),
    onNodeHover: (node) => emit('nodeHover', node),
    onLayoutProgress: (iter, alpha) => emit('layoutProgress', iter, alpha)
  });

  graphView.runLayout();
});

onUnmounted(() => {
  graphView?.destroy();
});
</script>
