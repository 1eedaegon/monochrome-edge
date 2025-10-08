/**
 * Tree View Component
 * Hierarchical tree structure with expand/collapse functionality
 * Styled with sharp edges and ">" toggles like TOC
 */

export interface TreeNode {
  id: string;
  label: string;
  icon?: string;
  children?: TreeNode[];
  isExpanded?: boolean;
  metadata?: Record<string, any>;
}

export interface TreeViewOptions {
  container: HTMLElement;
  data: TreeNode[];
  expandedByDefault?: boolean;
  onNodeClick?: (node: TreeNode) => void;
  onNodeToggle?: (node: TreeNode, isExpanded: boolean) => void;
}

export class TreeView {
  private container: HTMLElement;
  private data: TreeNode[];
  private options: TreeViewOptions;
  private nodeElements: Map<string, HTMLElement> = new Map();

  constructor(options: TreeViewOptions) {
    this.options = options;
    this.container = options.container;
    this.data = options.data;

    // Set default expanded state if specified
    if (options.expandedByDefault !== undefined) {
      this.setDefaultExpandedState(this.data, options.expandedByDefault);
    }

    this.render();
  }

  /**
   * Set default expanded state for all nodes
   */
  private setDefaultExpandedState(nodes: TreeNode[], expanded: boolean): void {
    for (const node of nodes) {
      if (node.children && node.children.length > 0) {
        node.isExpanded = node.isExpanded ?? expanded;
        this.setDefaultExpandedState(node.children, expanded);
      }
    }
  }

  /**
   * Render the tree view
   */
  private render(): void {
    this.container.innerHTML = "";
    this.container.className = "tree-view";
    this.nodeElements.clear();

    const rootList = this.createList(this.data);
    this.container.appendChild(rootList);
  }

  /**
   * Create a list element for tree nodes
   */
  private createList(nodes: TreeNode[]): HTMLUListElement {
    const list = document.createElement("ul");
    list.className = "tree-list";

    for (const node of nodes) {
      const item = this.createItem(node);
      list.appendChild(item);
    }

    return list;
  }

  /**
   * Create a tree item element
   */
  private createItem(node: TreeNode): HTMLLIElement {
    const item = document.createElement("li");
    item.className = "tree-item";
    item.dataset.nodeId = node.id;

    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = node.isExpanded ?? false;

    // Create item content
    const content = document.createElement("div");
    content.className = "tree-item-content";

    // Toggle button (only if has children)
    if (hasChildren) {
      const toggle = document.createElement("button");
      toggle.className = "tree-toggle";
      toggle.setAttribute("aria-expanded", isExpanded.toString());
      toggle.setAttribute("aria-label", isExpanded ? "Collapse" : "Expand");

      if (isExpanded) {
        toggle.classList.add("is-expanded");
      }

      toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleNode(node);
      });

      content.appendChild(toggle);
    } else {
      // Spacer for alignment
      const spacer = document.createElement("span");
      spacer.className = "tree-spacer";
      content.appendChild(spacer);
    }

    // Icon (optional)
    if (node.icon) {
      const icon = document.createElement("span");
      icon.className = "tree-icon";
      icon.textContent = node.icon;
      content.appendChild(icon);
    }

    // Label
    const label = document.createElement("span");
    label.className = "tree-label";
    label.textContent = node.label;
    content.appendChild(label);

    // Click handler for the entire content
    content.addEventListener("click", () => {
      if (this.options.onNodeClick) {
        this.options.onNodeClick(node);
      }
    });

    item.appendChild(content);

    // Children list (if any)
    if (hasChildren) {
      const childrenList = this.createList(node.children!);
      childrenList.className = "tree-children";

      if (!isExpanded) {
        childrenList.style.display = "none";
      }

      item.appendChild(childrenList);
    }

    // Store reference
    this.nodeElements.set(node.id, item);

    return item;
  }

  /**
   * Toggle node expansion
   */
  private toggleNode(node: TreeNode): void {
    const isExpanded = !node.isExpanded;
    node.isExpanded = isExpanded;

    const item = this.nodeElements.get(node.id);
    if (!item) return;

    const toggle = item.querySelector(".tree-toggle");
    const childrenList = item.querySelector(".tree-children") as HTMLElement;

    if (toggle) {
      toggle.setAttribute("aria-expanded", isExpanded.toString());
      toggle.setAttribute("aria-label", isExpanded ? "Collapse" : "Expand");

      if (isExpanded) {
        toggle.classList.add("is-expanded");
      } else {
        toggle.classList.remove("is-expanded");
      }
    }

    if (childrenList) {
      if (isExpanded) {
        childrenList.style.display = "";
      } else {
        childrenList.style.display = "none";
      }
    }

    if (this.options.onNodeToggle) {
      this.options.onNodeToggle(node, isExpanded);
    }
  }

  /**
   * Expand a node by ID
   */
  expandNode(nodeId: string): void {
    const node = this.findNode(this.data, nodeId);
    if (node && !node.isExpanded) {
      this.toggleNode(node);
    }
  }

  /**
   * Collapse a node by ID
   */
  collapseNode(nodeId: string): void {
    const node = this.findNode(this.data, nodeId);
    if (node && node.isExpanded) {
      this.toggleNode(node);
    }
  }

  /**
   * Expand all nodes
   */
  expandAll(): void {
    this.setAllExpanded(this.data, true);
    this.render();
  }

  /**
   * Collapse all nodes
   */
  collapseAll(): void {
    this.setAllExpanded(this.data, false);
    this.render();
  }

  /**
   * Set expanded state for all nodes
   */
  private setAllExpanded(nodes: TreeNode[], expanded: boolean): void {
    for (const node of nodes) {
      if (node.children && node.children.length > 0) {
        node.isExpanded = expanded;
        this.setAllExpanded(node.children, expanded);
      }
    }
  }

  /**
   * Find a node by ID
   */
  private findNode(nodes: TreeNode[], nodeId: string): TreeNode | null {
    for (const node of nodes) {
      if (node.id === nodeId) {
        return node;
      }

      if (node.children) {
        const found = this.findNode(node.children, nodeId);
        if (found) return found;
      }
    }

    return null;
  }

  /**
   * Update tree data and re-render
   */
  updateData(data: TreeNode[]): void {
    this.data = data;
    this.render();
  }

  /**
   * Get current tree data
   */
  getData(): TreeNode[] {
    return this.data;
  }

  /**
   * Destroy the tree view
   */
  destroy(): void {
    this.container.innerHTML = "";
    this.nodeElements.clear();
  }
}
