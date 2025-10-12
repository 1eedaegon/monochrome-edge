/**
 * QuadTree - Spatial partitioning data structure for Barnes-Hut algorithm
 * Divides 2D space into quadrants for efficient force calculations
 */

export interface QuadTreeNode {
  x: number;
  y: number;
  mass: number;
  centerX: number;
  centerY: number;
}

export class QuadTree {
  private boundary: { x: number; y: number; width: number; height: number };
  private capacity: number = 1;
  private nodes: QuadTreeNode[] = [];
  private divided: boolean = false;

  // Child quadrants
  private northwest?: QuadTree;
  private northeast?: QuadTree;
  private southwest?: QuadTree;
  private southeast?: QuadTree;

  // Barnes-Hut properties
  private totalMass: number = 0;
  private centerOfMassX: number = 0;
  private centerOfMassY: number = 0;

  constructor(x: number, y: number, width: number, height: number) {
    this.boundary = { x, y, width, height };
  }

  /**
   * Insert a node into the quadtree
   */
  insert(node: QuadTreeNode): boolean {
    // Check if node is within boundary
    if (!this.contains(node.x, node.y)) {
      return false;
    }

    // Update center of mass
    const totalMass = this.totalMass + node.mass;
    this.centerOfMassX = (this.centerOfMassX * this.totalMass + node.x * node.mass) / totalMass;
    this.centerOfMassY = (this.centerOfMassY * this.totalMass + node.y * node.mass) / totalMass;
    this.totalMass = totalMass;

    // If capacity not reached and not divided, add node
    if (this.nodes.length < this.capacity && !this.divided) {
      this.nodes.push(node);
      return true;
    }

    // Otherwise, subdivide and add to children
    if (!this.divided) {
      this.subdivide();
    }

    // Try to insert into children
    if (this.northwest!.insert(node)) return true;
    if (this.northeast!.insert(node)) return true;
    if (this.southwest!.insert(node)) return true;
    if (this.southeast!.insert(node)) return true;

    return false;
  }

  /**
   * Subdivide this quadrant into four children
   */
  private subdivide(): void {
    const { x, y, width, height } = this.boundary;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    this.northwest = new QuadTree(x, y, halfWidth, halfHeight);
    this.northeast = new QuadTree(x + halfWidth, y, halfWidth, halfHeight);
    this.southwest = new QuadTree(x, y + halfHeight, halfWidth, halfHeight);
    this.southeast = new QuadTree(x + halfWidth, y + halfHeight, halfWidth, halfHeight);

    this.divided = true;

    // Move existing nodes to children
    for (const node of this.nodes) {
      this.northwest.insert(node) ||
      this.northeast.insert(node) ||
      this.southwest.insert(node) ||
      this.southeast.insert(node);
    }
    this.nodes = [];
  }

  /**
   * Check if a point is within this quadrant's boundary
   */
  private contains(x: number, y: number): boolean {
    return (
      x >= this.boundary.x &&
      x < this.boundary.x + this.boundary.width &&
      y >= this.boundary.y &&
      y < this.boundary.y + this.boundary.height
    );
  }

  /**
   * Calculate force on a node using Barnes-Hut approximation
   * theta: determines accuracy vs speed tradeoff (typical: 0.5)
   */
  calculateForce(
    node: QuadTreeNode,
    theta: number = 0.5,
    repulsionStrength: number = 100
  ): { fx: number; fy: number } {
    let fx = 0;
    let fy = 0;

    // If this is an empty quadrant, return no force
    if (this.totalMass === 0) {
      return { fx, fy };
    }

    const dx = this.centerOfMassX - node.x;
    const dy = this.centerOfMassY - node.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Avoid self-interaction
    if (distance < 0.01) {
      return { fx, fy };
    }

    // Calculate width of this quadrant
    const width = this.boundary.width;

    // Barnes-Hut criterion: if far enough, treat as single body
    if (width / distance < theta) {
      // Calculate repulsion force (Coulomb-like)
      const force = (repulsionStrength * this.totalMass * node.mass) / (distance * distance);
      fx = (dx / distance) * force;
      fy = (dy / distance) * force;
      return { fx, fy };
    }

    // Otherwise, recursively calculate force from children
    if (this.divided) {
      const nwForce = this.northwest!.calculateForce(node, theta, repulsionStrength);
      const neForce = this.northeast!.calculateForce(node, theta, repulsionStrength);
      const swForce = this.southwest!.calculateForce(node, theta, repulsionStrength);
      const seForce = this.southeast!.calculateForce(node, theta, repulsionStrength);

      fx = nwForce.fx + neForce.fx + swForce.fx + seForce.fx;
      fy = nwForce.fy + neForce.fy + swForce.fy + seForce.fy;
    } else {
      // Leaf node: calculate force from each node
      for (const otherNode of this.nodes) {
        if (otherNode === node) continue;

        const dx2 = otherNode.x - node.x;
        const dy2 = otherNode.y - node.y;
        const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

        if (dist2 < 0.01) continue;

        const force = (repulsionStrength * otherNode.mass * node.mass) / (dist2 * dist2);
        fx += (dx2 / dist2) * force;
        fy += (dy2 / dist2) * force;
      }
    }

    return { fx, fy };
  }

  /**
   * Get all nodes in this quadtree (for debugging)
   */
  getAllNodes(): QuadTreeNode[] {
    const nodes: QuadTreeNode[] = [...this.nodes];

    if (this.divided) {
      nodes.push(...this.northwest!.getAllNodes());
      nodes.push(...this.northeast!.getAllNodes());
      nodes.push(...this.southwest!.getAllNodes());
      nodes.push(...this.southeast!.getAllNodes());
    }

    return nodes;
  }

  /**
   * Get center of mass (for debugging)
   */
  getCenterOfMass(): { x: number; y: number; mass: number } {
    return {
      x: this.centerOfMassX,
      y: this.centerOfMassY,
      mass: this.totalMass
    };
  }
}
