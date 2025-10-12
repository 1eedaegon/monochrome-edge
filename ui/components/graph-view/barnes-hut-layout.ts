/**
 * Barnes-Hut Force-Directed Layout
 * O(n log n) complexity using QuadTree spatial decomposition
 */

import { DocumentGraph, GraphNode } from "./graph-builder";
import { QuadTree, QuadTreeNode } from "./quad-tree";

export interface LayoutOptions {
  width: number;
  height: number;
  iterations?: number;
  repulsionStrength?: number;
  attractionStrength?: number;
  theta?: number; // Barnes-Hut approximation threshold
  damping?: number; // Velocity damping (friction)
  initialAlpha?: number; // Initial temperature
  alphaDecay?: number; // Cooling rate
  minAlpha?: number; // Stop threshold
}

export class BarnesHutLayout {
  private graph: DocumentGraph;
  private options: Required<LayoutOptions>;
  private alpha: number;

  constructor(graph: DocumentGraph, options: LayoutOptions) {
    this.graph = graph;
    this.options = {
      width: options.width,
      height: options.height,
      iterations: options.iterations ?? 300,
      repulsionStrength: options.repulsionStrength ?? 800,
      attractionStrength: options.attractionStrength ?? 0.01,
      theta: options.theta ?? 0.5,
      damping: options.damping ?? 0.3,
      initialAlpha: options.initialAlpha ?? 1.0,
      alphaDecay: options.alphaDecay ?? 0.01,
      minAlpha: options.minAlpha ?? 0.001,
    };
    this.alpha = this.options.initialAlpha;
  }

  /**
   * Run the layout simulation
   */
  simulate(onProgress?: (iteration: number, alpha: number) => void): void {
    for (let i = 0; i < this.options.iterations; i++) {
      this.step();

      // Cooling schedule
      this.alpha -= this.options.alphaDecay;

      if (this.alpha < this.options.minAlpha) {
        this.alpha = this.options.minAlpha;
      }

      if (onProgress) {
        onProgress(i, this.alpha);
      }

      // Early termination if cooled down
      if (this.alpha <= this.options.minAlpha && i > 50) {
        break;
      }
    }
  }

  /**
   * Single simulation step
   */
  private step(): void {
    const nodes = this.graph.getNodes();
    const edges = this.graph.getEdges();

    // 1. Build QuadTree for current positions
    const quadTree = this.buildQuadTree(nodes);

    // 2. Calculate repulsion forces using Barnes-Hut
    const forces: Map<number, { fx: number; fy: number }> = new Map();

    for (const node of nodes) {
      const quadNode: QuadTreeNode = {
        x: node.x,
        y: node.y,
        mass: node.mass,
        centerX: node.x,
        centerY: node.y,
      };

      const force = quadTree.calculateForce(
        quadNode,
        this.options.theta,
        this.options.repulsionStrength,
      );

      forces.set(node.id, force);
    }

    // 3. Calculate attraction forces (spring model)
    for (const edge of edges) {
      const source = this.graph.getNode(edge.source)!;
      const target = this.graph.getNode(edge.target)!;

      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 0.01) continue;

      // Hooke's law: F = k * (distance - restLength)
      const restLength = 100; // Ideal edge length
      const force = this.options.attractionStrength * (distance - restLength);

      const fx = (dx / distance) * force;
      const fy = (dy / distance) * force;

      // Apply force to both nodes
      const sourceForce = forces.get(source.id)!;
      sourceForce.fx += fx;
      sourceForce.fy += fy;

      const targetForce = forces.get(target.id)!;
      targetForce.fx -= fx;
      targetForce.fy -= fy;
    }

    // 4. Update velocities and positions
    for (const node of nodes) {
      const force = forces.get(node.id)!;

      // Update velocity with damping
      node.vx = (node.vx + force.fx * this.alpha) * (1 - this.options.damping);
      node.vy = (node.vy + force.fy * this.alpha) * (1 - this.options.damping);

      // Limit maximum velocity
      const maxVelocity = 10;
      const velocity = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
      if (velocity > maxVelocity) {
        node.vx = (node.vx / velocity) * maxVelocity;
        node.vy = (node.vy / velocity) * maxVelocity;
      }

      // Update position
      node.x += node.vx;
      node.y += node.vy;

      // Keep nodes within bounds with soft boundary
      const margin = 50;
      if (node.x < margin) {
        node.x = margin;
        node.vx *= -0.5;
      }
      if (node.x > this.options.width - margin) {
        node.x = this.options.width - margin;
        node.vx *= -0.5;
      }
      if (node.y < margin) {
        node.y = margin;
        node.vy *= -0.5;
      }
      if (node.y > this.options.height - margin) {
        node.y = this.options.height - margin;
        node.vy *= -0.5;
      }

      // Update in graph
      this.graph.updateNodePosition(node.id, node.x, node.y);
      this.graph.updateNodeVelocity(node.id, node.vx, node.vy);
    }
  }

  /**
   * Build QuadTree from current node positions
   */
  private buildQuadTree(nodes: GraphNode[]): QuadTree {
    const quadTree = new QuadTree(
      0,
      0,
      this.options.width,
      this.options.height,
    );

    for (const node of nodes) {
      const quadNode: QuadTreeNode = {
        x: node.x,
        y: node.y,
        mass: node.mass,
        centerX: node.x,
        centerY: node.y,
      };

      quadTree.insert(quadNode);
    }

    return quadTree;
  }

  /**
   * Reset simulation with new initial temperature
   */
  reset(alpha?: number): void {
    this.alpha = alpha ?? this.options.initialAlpha;
  }

  /**
   * Get current alpha (temperature)
   */
  getAlpha(): number {
    return this.alpha;
  }

  /**
   * Update layout bounds (for responsive resize)
   */
  updateBounds(width: number, height: number): void {
    this.options.width = width;
    this.options.height = height;
  }
}
