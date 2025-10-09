/**
 * Graph Builder - Document Graph with Dual Index
 * Converts document metadata to efficient graph representation using Typed Arrays
 */

export interface DocumentMetadata {
  id: string;
  title: string;
  tags: string[];
  links: { target: string; type: string }[];
  x?: number;
  y?: number;
}

export interface GraphNode {
  id: number; // Integer ID
  originalId: string; // Original string ID
  title: string;
  tags: string[];
  x: number; // Position (for layout)
  y: number;
  vx: number; // Velocity (for physics simulation)
  vy: number;
  mass: number; // For force calculations
}

export interface GraphEdge {
  source: number; // Integer node ID
  target: number; // Integer node ID
  type: string;
}

/**
 * Document Graph with Dual Index
 * - Forward edges: source → targets
 * - Backward edges: target → sources (for O(1) backlink lookup)
 */
export class DocumentGraph {
  private nodeIdMap: Map<string, number> = new Map();
  private nodeIdReverse: string[] = [];
  private nodes: GraphNode[] = [];

  // Dual Index with Typed Arrays
  private forward: Map<number, Uint32Array> = new Map();
  private backward: Map<number, Uint32Array> = new Map();
  private edgeTypes: Map<string, string> = new Map(); // "source-target" → type

  /**
   * Build graph from document metadata
   */
  buildFromDocuments(documents: DocumentMetadata[]): void {
    // Phase 1: Create nodes and ID mapping
    this.nodeIdMap.clear();
    this.nodeIdReverse = [];
    this.nodes = [];

    documents.forEach((doc, index) => {
      this.nodeIdMap.set(doc.id, index);
      this.nodeIdReverse.push(doc.id);

      // Initialize node with provided position or random
      this.nodes.push({
        id: index,
        originalId: doc.id,
        title: doc.title,
        tags: doc.tags,
        x: doc.x ?? Math.random() * 800,
        y: doc.y ?? Math.random() * 600,
        vx: 0,
        vy: 0,
        mass: 1 + doc.links.length * 0.1, // Mass based on connections
      });
    });

    // Phase 2: Build dual index
    this.forward.clear();
    this.backward.clear();
    this.edgeTypes.clear();

    // Temporary storage for building typed arrays
    const forwardTemp: Map<number, number[]> = new Map();
    const backwardTemp: Map<number, number[]> = new Map();

    documents.forEach((doc, sourceId) => {
      doc.links.forEach((link) => {
        const targetId = this.nodeIdMap.get(link.target);

        if (targetId !== undefined) {
          // Add to forward index
          if (!forwardTemp.has(sourceId)) {
            forwardTemp.set(sourceId, []);
          }
          forwardTemp.get(sourceId)!.push(targetId);

          // Add to backward index
          if (!backwardTemp.has(targetId)) {
            backwardTemp.set(targetId, []);
          }
          backwardTemp.get(targetId)!.push(sourceId);

          // Store edge type
          this.edgeTypes.set(`${sourceId}-${targetId}`, link.type);
        }
      });
    });

    // Convert to Typed Arrays for memory efficiency
    forwardTemp.forEach((targets, sourceId) => {
      this.forward.set(sourceId, new Uint32Array(targets));
    });

    backwardTemp.forEach((sources, targetId) => {
      this.backward.set(targetId, new Uint32Array(sources));
    });
  }

  /**
   * Get all nodes
   */
  getNodes(): GraphNode[] {
    return this.nodes;
  }

  /**
   * Get node by ID
   */
  getNode(id: number): GraphNode | undefined {
    return this.nodes[id];
  }

  /**
   * Get node by original string ID
   */
  getNodeByOriginalId(originalId: string): GraphNode | undefined {
    const id = this.nodeIdMap.get(originalId);
    return id !== undefined ? this.nodes[id] : undefined;
  }

  /**
   * Get forward edges (outgoing links from node)
   */
  getForwardEdges(nodeId: number): Uint32Array | undefined {
    return this.forward.get(nodeId);
  }

  /**
   * Get backward edges (incoming links to node) - O(1) backlink lookup!
   */
  getBackwardEdges(nodeId: number): Uint32Array | undefined {
    return this.backward.get(nodeId);
  }

  /**
   * Get all edges as array
   */
  getEdges(): GraphEdge[] {
    const edges: GraphEdge[] = [];

    this.forward.forEach((targets, source) => {
      for (let i = 0; i < targets.length; i++) {
        const target = targets[i];
        if (target !== undefined) {
          edges.push({
            source,
            target,
            type: this.edgeTypes.get(`${source}-${target}`) || "default",
          });
        }
      }
    });

    return edges;
  }

  /**
   * Get edge type
   */
  getEdgeType(source: number, target: number): string | undefined {
    return this.edgeTypes.get(`${source}-${target}`);
  }

  /**
   * Update node position (for layout algorithm)
   */
  updateNodePosition(nodeId: number, x: number, y: number): void {
    const node = this.nodes[nodeId];
    if (node) {
      node.x = x;
      node.y = y;
    }
  }

  /**
   * Update node velocity (for physics simulation)
   */
  updateNodeVelocity(nodeId: number, vx: number, vy: number): void {
    const node = this.nodes[nodeId];
    if (node) {
      node.vx = vx;
      node.vy = vy;
    }
  }

  /**
   * Get graph statistics
   */
  getStats(): {
    nodeCount: number;
    edgeCount: number;
    avgDegree: number;
    maxDegree: number;
  } {
    let totalEdges = 0;
    let maxDegree = 0;

    this.forward.forEach((targets) => {
      totalEdges += targets.length;
      maxDegree = Math.max(maxDegree, targets.length);
    });

    return {
      nodeCount: this.nodes.length,
      edgeCount: totalEdges,
      avgDegree: this.nodes.length > 0 ? totalEdges / this.nodes.length : 0,
      maxDegree,
    };
  }
}
