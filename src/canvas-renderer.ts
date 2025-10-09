/**
 * Canvas Renderer for Graph Visualization
 * Handles rendering, pan, zoom, and interactions
 */

import { DocumentGraph, GraphNode, GraphEdge } from "./graph-builder";

export interface RenderOptions {
  nodeRadius?: number;
  nodeColor?: string;
  nodeStroke?: string;
  nodeStrokeWidth?: number;
  edgeColor?: string;
  edgeWidth?: number;
  labelFont?: string;
  labelColor?: string;
  labelSize?: number;
  showLabels?: boolean;
  highlightColor?: string;
}

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private graph: DocumentGraph;
  private options: Required<RenderOptions>;

  // Pan & Zoom
  private offsetX: number = 0;
  private offsetY: number = 0;
  private scale: number = 1;

  // Interaction
  private isDragging: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private hoveredNode: GraphNode | null = null;
  private selectedNode: GraphNode | null = null;

  // Callbacks
  private onNodeClick?: (node: GraphNode) => void;
  private onNodeHover?: (node: GraphNode | null) => void;

  constructor(
    canvas: HTMLCanvasElement,
    graph: DocumentGraph,
    options: RenderOptions = {},
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.graph = graph;

    this.options = {
      nodeRadius: options.nodeRadius ?? 8,
      nodeColor: options.nodeColor ?? "var(--theme-accent)",
      nodeStroke: options.nodeStroke ?? "var(--theme-border)",
      nodeStrokeWidth: options.nodeStrokeWidth ?? 2,
      edgeColor: options.edgeColor ?? "var(--theme-border)",
      edgeWidth: options.edgeWidth ?? 1,
      labelFont: options.labelFont ?? "12px system-ui, sans-serif",
      labelColor: options.labelColor ?? "var(--theme-text-primary)",
      labelSize: options.labelSize ?? 12,
      showLabels: options.showLabels ?? true,
      highlightColor: options.highlightColor ?? "var(--theme-accent)",
    };

    this.setupEventListeners();
  }

  /**
   * Render the graph
   */
  render(): void {
    const { width, height } = this.canvas;

    console.log("CanvasRenderer.render() called");
    console.log("  Canvas size:", width, "x", height);
    console.log("  Graph stats:", this.graph.getStats());
    console.log("  Nodes:", this.graph.getNodes().length);
    if (this.graph.getNodes().length > 0) {
      console.log("  Sample node:", this.graph.getNodes()[0]);
    }

    // Clear canvas with background
    this.ctx.fillStyle =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--theme-bg")
        .trim() || "#ffffff";
    this.ctx.fillRect(0, 0, width, height);

    // Save context
    this.ctx.save();

    // Apply transformations
    this.ctx.translate(this.offsetX, this.offsetY);
    this.ctx.scale(this.scale, this.scale);

    // Render edges first (behind nodes)
    this.renderEdges();

    // Render nodes
    this.renderNodes();

    // Render labels
    if (this.options.showLabels) {
      this.renderLabels();
    }

    // Restore context
    this.ctx.restore();

    console.log("CanvasRenderer.render() completed");
  }

  /**
   * Render edges
   */
  private renderEdges(): void {
    const edges = this.graph.getEdges();

    this.ctx.strokeStyle = this.getComputedColor(this.options.edgeColor);
    this.ctx.lineWidth = this.options.edgeWidth;

    for (const edge of edges) {
      const source = this.graph.getNode(edge.source);
      const target = this.graph.getNode(edge.target);

      if (!source || !target) continue;

      this.ctx.beginPath();
      this.ctx.moveTo(source.x, source.y);
      this.ctx.lineTo(target.x, target.y);
      this.ctx.stroke();
    }
  }

  /**
   * Render nodes
   */
  private renderNodes(): void {
    const nodes = this.graph.getNodes();

    if (nodes.length === 0) {
      console.warn("CanvasRenderer: No nodes to render");
      return;
    }

    for (const node of nodes) {
      const isHovered = this.hoveredNode?.id === node.id;
      const isSelected = this.selectedNode?.id === node.id;

      // Node circle
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, this.options.nodeRadius, 0, Math.PI * 2);

      // Fill
      if (isSelected || isHovered) {
        this.ctx.fillStyle = this.getComputedColor(this.options.highlightColor);
      } else {
        this.ctx.fillStyle = this.getComputedColor(this.options.nodeColor);
      }
      this.ctx.fill();

      // Stroke
      this.ctx.strokeStyle = this.getComputedColor(this.options.nodeStroke);
      this.ctx.lineWidth = this.options.nodeStrokeWidth;
      this.ctx.stroke();
    }
  }

  /**
   * Render labels
   */
  private renderLabels(): void {
    const nodes = this.graph.getNodes();

    this.ctx.font = this.options.labelFont;
    this.ctx.fillStyle = this.getComputedColor(this.options.labelColor);
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    for (const node of nodes) {
      const isHovered = this.hoveredNode?.id === node.id;
      const isSelected = this.selectedNode?.id === node.id;

      // Only show label if hovered, selected, or if labels are always shown
      if (isHovered || isSelected || this.scale > 0.8) {
        const label =
          node.title.length > 20
            ? node.title.substring(0, 20) + "..."
            : node.title;

        this.ctx.fillText(label, node.x, node.y + this.options.nodeRadius + 12);
      }
    }
  }

  /**
   * Setup event listeners for interaction
   */
  private setupEventListeners(): void {
    // Mouse down - start dragging
    this.canvas.addEventListener("mousedown", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Check if clicking on a node
      const node = this.getNodeAtPosition(x, y);
      if (node) {
        this.selectedNode = node;
        if (this.onNodeClick) {
          this.onNodeClick(node);
        }
      } else {
        this.isDragging = true;
        this.dragStartX = x - this.offsetX;
        this.dragStartY = y - this.offsetY;
        this.canvas.style.cursor = "grabbing";
      }

      this.render();
    });

    // Mouse move - pan or hover
    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (this.isDragging) {
        this.offsetX = x - this.dragStartX;
        this.offsetY = y - this.dragStartY;
        this.render();
      } else {
        // Check for node hover
        const node = this.getNodeAtPosition(x, y);
        if (node !== this.hoveredNode) {
          this.hoveredNode = node;
          this.canvas.style.cursor = node ? "pointer" : "grab";
          if (this.onNodeHover) {
            this.onNodeHover(node);
          }
          this.render();
        }
      }
    });

    // Mouse up - stop dragging
    this.canvas.addEventListener("mouseup", () => {
      this.isDragging = false;
      this.canvas.style.cursor = "grab";
    });

    // Mouse leave - stop dragging
    this.canvas.addEventListener("mouseleave", () => {
      this.isDragging = false;
      this.hoveredNode = null;
      this.canvas.style.cursor = "default";
      this.render();
    });

    // Wheel - zoom
    this.canvas.addEventListener("wheel", (e) => {
      e.preventDefault();

      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.max(0.1, Math.min(3, this.scale * zoomFactor));

      // Zoom towards cursor position
      this.offsetX = x - (x - this.offsetX) * (newScale / this.scale);
      this.offsetY = y - (y - this.offsetY) * (newScale / this.scale);
      this.scale = newScale;

      this.render();
    });

    // Touch events for mobile
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartDistance = 0;

    this.canvas.addEventListener("touchstart", (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();

      if (e.touches.length === 1) {
        // Single touch - check for node tap or start pan
        const touch = e.touches[0];
        if (!touch) return;
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        const node = this.getNodeAtPosition(x, y);
        if (node) {
          this.selectedNode = node;
          if (this.onNodeClick) {
            this.onNodeClick(node);
          }
          this.render();
        } else {
          this.isDragging = true;
          touchStartX = x;
          touchStartY = y;
          this.dragStartX = x - this.offsetX;
          this.dragStartY = y - this.offsetY;
        }
      } else if (e.touches.length === 2) {
        // Two finger pinch zoom
        const touch0 = e.touches[0];
        const touch1 = e.touches[1];
        if (!touch0 || !touch1) return;
        const dx = touch0.clientX - touch1.clientX;
        const dy = touch0.clientY - touch1.clientY;
        touchStartDistance = Math.sqrt(dx * dx + dy * dy);
      }
    });

    this.canvas.addEventListener("touchmove", (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();

      if (e.touches.length === 1 && this.isDragging) {
        // Pan
        const touch = e.touches[0];
        if (!touch) return;
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        this.offsetX = x - this.dragStartX;
        this.offsetY = y - this.dragStartY;
        this.render();
      } else if (e.touches.length === 2) {
        // Pinch zoom
        const touch0 = e.touches[0];
        const touch1 = e.touches[1];
        if (!touch0 || !touch1) return;
        const dx = touch0.clientX - touch1.clientX;
        const dy = touch0.clientY - touch1.clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (touchStartDistance > 0) {
          const centerX = (touch0.clientX + touch1.clientX) / 2 - rect.left;
          const centerY = (touch0.clientY + touch1.clientY) / 2 - rect.top;

          const zoomFactor = distance / touchStartDistance;
          const newScale = Math.max(0.1, Math.min(3, this.scale * zoomFactor));

          this.offsetX =
            centerX - (centerX - this.offsetX) * (newScale / this.scale);
          this.offsetY =
            centerY - (centerY - this.offsetY) * (newScale / this.scale);
          this.scale = newScale;

          touchStartDistance = distance;
          this.render();
        }
      }
    });

    this.canvas.addEventListener("touchend", (e) => {
      e.preventDefault();
      this.isDragging = false;
      if (e.touches.length === 0) {
        touchStartDistance = 0;
      }
    });

    this.canvas.addEventListener("touchcancel", () => {
      this.isDragging = false;
      touchStartDistance = 0;
    });

    // Set initial cursor
    this.canvas.style.cursor = "grab";
  }

  /**
   * Get node at screen position
   */
  private getNodeAtPosition(
    screenX: number,
    screenY: number,
  ): GraphNode | null {
    // Transform screen coordinates to graph coordinates
    const graphX = (screenX - this.offsetX) / this.scale;
    const graphY = (screenY - this.offsetY) / this.scale;

    const nodes = this.graph.getNodes();
    const threshold = this.options.nodeRadius + 5;

    for (const node of nodes) {
      const dx = node.x - graphX;
      const dy = node.y - graphY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < threshold) {
        return node;
      }
    }

    return null;
  }

  /**
   * Get computed CSS color value
   */
  private getComputedColor(color: string): string {
    // If it's a CSS variable, get computed value
    if (color.startsWith("var(")) {
      const varName = color.match(/var\((.*?)\)/)?.[1];
      if (varName) {
        return getComputedStyle(document.documentElement)
          .getPropertyValue(varName)
          .trim();
      }
    }
    return color;
  }

  /**
   * Set node click callback
   */
  setOnNodeClick(callback: (node: GraphNode) => void): void {
    this.onNodeClick = callback;
  }

  /**
   * Set node hover callback
   */
  setOnNodeHover(callback: (node: GraphNode | null) => void): void {
    this.onNodeHover = callback;
  }

  /**
   * Reset view (center and fit)
   */
  resetView(): void {
    const nodes = this.graph.getNodes();
    if (nodes.length === 0) return;

    // Find bounding box
    let minX = Infinity,
      minY = Infinity;
    let maxX = -Infinity,
      maxY = -Infinity;

    for (const node of nodes) {
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x);
      maxY = Math.max(maxY, node.y);
    }

    const graphWidth = maxX - minX;
    const graphHeight = maxY - minY;
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // Calculate scale to fit
    const padding = 100;
    const scaleX = (this.canvas.width - padding * 2) / graphWidth;
    const scaleY = (this.canvas.height - padding * 2) / graphHeight;
    this.scale = Math.min(scaleX, scaleY, 1);

    // Center the graph
    this.offsetX = this.canvas.width / 2 - centerX * this.scale;
    this.offsetY = this.canvas.height / 2 - centerY * this.scale;

    this.render();
  }

  /**
   * Update canvas size
   */
  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    this.render();
  }
}
