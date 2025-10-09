/**
 * Graph View Component
 * Interactive document graph visualization with Barnes-Hut force-directed layout
 */

import { DocumentGraph, DocumentMetadata } from "./graph-builder";
import { BarnesHutLayout } from "./barnes-hut-layout";
import { CanvasRenderer } from "./canvas-renderer";

export interface GraphViewOptions {
  container: HTMLElement | string;
  documents: DocumentMetadata[];
  width?: number;
  height?: number;

  // Layout options
  iterations?: number;
  repulsionStrength?: number;
  attractionStrength?: number;

  // Rendering options
  nodeRadius?: number;
  showLabels?: boolean;

  // Callbacks
  onNodeClick?: (node: { id: string; title: string; tags: string[] }) => void;
  onNodeHover?: (
    node: { id: string; title: string; tags: string[] } | null,
  ) => void;
  onLayoutProgress?: (iteration: number, alpha: number) => void;
}

export class GraphView {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private graph: DocumentGraph;
  private layout: BarnesHutLayout;
  private renderer: CanvasRenderer;
  private options: GraphViewOptions;

  private animationFrame: number | null = null;
  private isRunning: boolean = false;
  private resizeObserver: ResizeObserver | null = null;

  constructor(options: GraphViewOptions) {
    this.options = options;
    this.container =
      typeof options.container === "string"
        ? (document.querySelector(options.container) as HTMLElement)
        : options.container;

    if (!this.container) {
      throw new Error(`GraphView: Container not found: ${options.container}`);
    }

    // Create canvas
    this.canvas = document.createElement("canvas");
    this.canvas.className = "graph-view-canvas";

    // Append canvas to container FIRST so we can measure it
    this.container.innerHTML = "";
    this.container.appendChild(this.canvas);

    // Set canvas dimensions after appending (so container.clientWidth is available)
    this.canvas.width = options.width ?? this.container.clientWidth ?? 800;
    this.canvas.height = options.height ?? this.container.clientHeight ?? 600;

    // Build graph
    this.graph = new DocumentGraph();
    this.graph.buildFromDocuments(options.documents);

    // Initialize layout
    this.layout = new BarnesHutLayout(this.graph, {
      width: this.canvas.width,
      height: this.canvas.height,
      iterations: options.iterations ?? 300,
      repulsionStrength: options.repulsionStrength ?? 800,
      attractionStrength: options.attractionStrength ?? 0.01,
    });

    // Initialize renderer
    this.renderer = new CanvasRenderer(this.canvas, this.graph, {
      nodeRadius: options.nodeRadius ?? 8,
      showLabels: options.showLabels ?? true,
    });

    // Setup callbacks
    if (options.onNodeClick) {
      this.renderer.setOnNodeClick((node) => {
        options.onNodeClick!({
          id: node.originalId,
          title: node.title,
          tags: node.tags,
        });
      });
    }

    if (options.onNodeHover) {
      this.renderer.setOnNodeHover((node) => {
        if (node) {
          options.onNodeHover!({
            id: node.originalId,
            title: node.title,
            tags: node.tags,
          });
        } else {
          options.onNodeHover!(null);
        }
      });
    }

    // Setup resize observer for responsive canvas
    this.setupResizeObserver();

    // Initial render
    this.renderer.render();
  }

  /**
   * Setup resize observer for responsive canvas sizing
   */
  private setupResizeObserver(): void {
    if (typeof ResizeObserver === "undefined") return;

    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;

        // Update canvas size
        const newWidth = Math.floor(width);
        const newHeight = Math.floor(height);

        if (newWidth > 0 && newHeight > 0) {
          this.canvas.width = newWidth;
          this.canvas.height = newHeight;

          // Update layout bounds
          this.layout.updateBounds(newWidth, newHeight);

          // Re-render
          this.renderer.render();
        }
      }
    });

    this.resizeObserver.observe(this.container);
  }

  /**
   * Run layout simulation
   */
  runLayout(): void {
    this.isRunning = true;

    let iteration = 0;
    const maxIterations = this.options.iterations ?? 300;

    const animate = () => {
      if (!this.isRunning || iteration >= maxIterations) {
        this.isRunning = false;
        this.renderer.resetView();
        return;
      }

      // Perform layout step
      this.layout.simulate((iter, alpha) => {
        if (this.options.onLayoutProgress) {
          this.options.onLayoutProgress(iter, alpha);
        }
      });

      // Render
      this.renderer.render();

      iteration++;

      // Continue animation if alpha is significant
      if (this.layout.getAlpha() > 0.001) {
        this.animationFrame = requestAnimationFrame(animate);
      } else {
        this.isRunning = false;
        this.renderer.resetView();
      }
    };

    animate();
  }

  /**
   * Stop layout simulation
   */
  stopLayout(): void {
    this.isRunning = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  /**
   * Reset layout and restart
   */
  resetLayout(): void {
    this.stopLayout();

    // Randomize positions
    const nodes = this.graph.getNodes();
    for (const node of nodes) {
      node.x = Math.random() * this.canvas.width;
      node.y = Math.random() * this.canvas.height;
      node.vx = 0;
      node.vy = 0;
      this.graph.updateNodePosition(node.id, node.x, node.y);
      this.graph.updateNodeVelocity(node.id, 0, 0);
    }

    this.layout.reset();
    this.renderer.render();
  }

  /**
   * Update documents and rebuild graph
   */
  updateDocuments(documents: DocumentMetadata[]): void {
    this.stopLayout();
    this.graph.buildFromDocuments(documents);

    // Reinitialize layout
    this.layout = new BarnesHutLayout(this.graph, {
      width: this.canvas.width,
      height: this.canvas.height,
      iterations: this.options.iterations ?? 300,
      repulsionStrength: this.options.repulsionStrength ?? 800,
      attractionStrength: this.options.attractionStrength ?? 0.01,
    });

    this.renderer.render();
  }

  /**
   * Get graph statistics
   */
  getStats() {
    return this.graph.getStats();
  }

  /**
   * Resize canvas
   */
  resize(width?: number, height?: number): void {
    const w = width ?? this.container.clientWidth;
    const h = height ?? this.container.clientHeight;

    this.canvas.width = w;
    this.canvas.height = h;

    this.renderer.resize(w, h);
  }

  /**
   * Reset view (center and fit graph)
   */
  resetView(): void {
    this.renderer.resetView();
  }

  /**
   * Render the graph
   */
  render(): void {
    this.renderer.render();
  }

  /**
   * Destroy component
   */
  destroy(): void {
    this.stopLayout();

    // Disconnect resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    this.container.innerHTML = "";
  }
}
