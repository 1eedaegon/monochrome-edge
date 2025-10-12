/**
 * Tree File View Component
 * File explorer with tree structure for the editor
 */

import { iconLoader } from "@ui/utils/icon-loader";

export class TreeFileView {
  constructor(container, options = {}) {
    this.container =
      typeof container === "string"
        ? document.querySelector(container)
        : container;
    this.options = {
      onFileSelect: options.onFileSelect || (() => {}),
      onFileCreate: options.onFileCreate || (() => {}),
      onFileDelete: options.onFileDelete || (() => {}),
      onFileRename: options.onFileRename || (() => {}),
      onFolderCreate: options.onFolderCreate || (() => {}),
      onFolderDelete: options.onFolderDelete || (() => {}),
      storage: options.storage || null,
      ...options,
    };

    this.selectedNode = null;
    this.expandedFolders = new Set();
    this.fileTree = [];
    this.contextMenu = null;

    this.init();
  }

  async init() {
    this.createDOM();
    this.createContextMenu();
    this.attachListeners();
    await this.loadFileTree();
    this.render();
  }

  createDOM() {
    this.container.innerHTML = "";
    this.container.className = "tree-file-view";

    // Header
    const header = document.createElement("div");
    header.className = "tree-header";

    const title = document.createElement("div");
    title.className = "tree-title";
    title.textContent = "Files";

    const actions = document.createElement("div");
    actions.className = "tree-actions";

    // Create action buttons with icons
    const newFileBtn = document.createElement("button");
    newFileBtn.className = "tree-action-btn";
    newFileBtn.setAttribute("data-action", "new-file");
    newFileBtn.title = "New File";
    iconLoader.load("file-plus", { width: 16, height: 16 }).then((svg) => {
      newFileBtn.innerHTML = svg;
    });

    const newFolderBtn = document.createElement("button");
    newFolderBtn.className = "tree-action-btn";
    newFolderBtn.setAttribute("data-action", "new-folder");
    newFolderBtn.title = "New Folder";
    iconLoader.load("folder-plus", { width: 16, height: 16 }).then((svg) => {
      newFolderBtn.innerHTML = svg;
    });

    const refreshBtn = document.createElement("button");
    refreshBtn.className = "tree-action-btn";
    refreshBtn.setAttribute("data-action", "refresh");
    refreshBtn.title = "Refresh";
    iconLoader.load("refresh", { width: 16, height: 16 }).then((svg) => {
      refreshBtn.innerHTML = svg;
    });

    actions.appendChild(newFileBtn);
    actions.appendChild(newFolderBtn);
    actions.appendChild(refreshBtn);

    header.appendChild(title);
    header.appendChild(actions);

    // Search
    const searchContainer = document.createElement("div");
    searchContainer.className = "tree-search";
    searchContainer.innerHTML = `
            <input type="text" class="tree-search-input" placeholder="Search files...">
        `;

    // Tree container
    this.treeContainer = document.createElement("div");
    this.treeContainer.className = "tree-container";

    this.container.appendChild(header);
    this.container.appendChild(searchContainer);
    this.container.appendChild(this.treeContainer);

    // Apply styles
    this.applyStyles();
  }

  applyStyles() {
    const style = document.createElement("style");
    style.textContent = `
            .tree-file-view {
                display: flex;
                flex-direction: column;
                height: 100%;
                background: var(--theme-surface, #fff);
                border: 1px solid var(--theme-border, #e0e0e0);
                border-radius: 8px;
                overflow: hidden;
            }

            .tree-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 16px;
                border-bottom: 1px solid var(--theme-border, #e0e0e0);
                background: var(--theme-background, #fafafa);
            }

            .tree-title {
                font-weight: 600;
                font-size: 14px;
                color: var(--theme-text, #000);
            }

            .tree-actions {
                display: flex;
                gap: 4px;
            }

            .tree-action-btn {
                padding: 4px;
                background: transparent;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                color: var(--theme-text-secondary, #666);
                transition: all 0.2s;
            }

            .tree-action-btn:hover {
                background: var(--theme-accent-light, #f0f0f0);
                color: var(--theme-text, #000);
            }

            .tree-search {
                padding: 8px 16px;
                border-bottom: 1px solid var(--theme-border, #e0e0e0);
            }

            .tree-search-input {
                width: 100%;
                padding: 6px 10px;
                border: 1px solid var(--theme-border, #e0e0e0);
                border-radius: 6px;
                font-size: 13px;
                outline: none;
            }

            .tree-search-input:focus {
                border-color: var(--theme-accent);
            }

            .tree-container {
                flex: 1;
                overflow-y: auto;
                padding: 8px;
            }

            .tree-node {
                user-select: none;
            }

            .tree-node-content {
                display: flex;
                align-items: center;
                padding: 4px 8px;
                border-radius: 4px;
                cursor: pointer;
                transition: background 0.2s;
            }

            .tree-node-content:hover {
                background: var(--theme-accent-light, #f0f0f0);
            }

            .tree-node-content.selected {
                background: var(--theme-accent);
                color: white;
            }

            .tree-node-arrow {
                width: 16px;
                height: 16px;
                margin-right: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.2s;
            }

            .tree-node-arrow.expanded {
                transform: rotate(90deg);
            }

            .tree-node-arrow svg {
                width: 8px;
                height: 8px;
                fill: currentColor;
            }

            .tree-node-icon {
                width: 16px;
                height: 16px;
                margin-right: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .tree-node-name {
                flex: 1;
                font-size: 13px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .tree-node-children {
                margin-left: 20px;
                display: none;
            }

            .tree-node-children.expanded {
                display: block;
            }

            .tree-context-menu {
                position: fixed;
                background: var(--theme-surface, #fff);
                border: 1px solid var(--theme-border, #e0e0e0);
                border-radius: 6px;
                box-shadow: var(--theme-shadow-md, 0 4px 12px var(--theme-shadow-color));
                padding: 4px;
                z-index: 10000;
                min-width: 150px;
            }

            .tree-context-item {
                padding: 8px 12px;
                font-size: 13px;
                cursor: pointer;
                border-radius: 4px;
                transition: background 0.2s;
            }

            .tree-context-item:hover {
                background: var(--theme-accent-light, #f0f0f0);
            }

            .tree-context-separator {
                height: 1px;
                background: var(--theme-border, #e0e0e0);
                margin: 4px 0;
            }
        `;
    document.head.appendChild(style);
  }

  createContextMenu() {
    this.contextMenu = document.createElement("div");
    this.contextMenu.className = "tree-context-menu";
    this.contextMenu.style.display = "none";
    document.body.appendChild(this.contextMenu);
  }

  attachListeners() {
    // Header actions
    this.container
      .querySelector('[data-action="new-file"]')
      .addEventListener("click", () => {
        this.createNewFile();
      });

    this.container
      .querySelector('[data-action="new-folder"]')
      .addEventListener("click", () => {
        this.createNewFolder();
      });

    this.container
      .querySelector('[data-action="refresh"]')
      .addEventListener("click", () => {
        this.loadFileTree().then(() => this.render());
      });

    // Search
    const searchInput = this.container.querySelector(".tree-search-input");
    searchInput.addEventListener("input", (e) => {
      this.filterTree(e.target.value);
    });

    // Tree interactions
    this.treeContainer.addEventListener("click", (e) => {
      const nodeContent = e.target.closest(".tree-node-content");
      if (nodeContent) {
        const nodeId = nodeContent.dataset.nodeId;
        const node = this.findNode(nodeId);

        if (e.target.closest(".tree-node-arrow")) {
          this.toggleFolder(node);
        } else {
          this.selectNode(node);
        }
      }
    });

    // Context menu
    this.treeContainer.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      const nodeContent = e.target.closest(".tree-node-content");
      if (nodeContent) {
        const nodeId = nodeContent.dataset.nodeId;
        const node = this.findNode(nodeId);
        this.showContextMenu(e.clientX, e.clientY, node);
      }
    });

    // Close context menu
    document.addEventListener("click", (e) => {
      if (!this.contextMenu.contains(e.target)) {
        this.contextMenu.style.display = "none";
      }
    });

    // Drag and drop
    this.setupDragAndDrop();
  }

  setupDragAndDrop() {
    let draggedNode = null;

    this.treeContainer.addEventListener("dragstart", (e) => {
      const nodeContent = e.target.closest(".tree-node-content");
      if (nodeContent) {
        draggedNode = this.findNode(nodeContent.dataset.nodeId);
        e.dataTransfer.effectAllowed = "move";
        nodeContent.style.opacity = "0.5";
      }
    });

    this.treeContainer.addEventListener("dragend", (e) => {
      const nodeContent = e.target.closest(".tree-node-content");
      if (nodeContent) {
        nodeContent.style.opacity = "";
      }
      draggedNode = null;
    });

    this.treeContainer.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    });

    this.treeContainer.addEventListener("drop", (e) => {
      e.preventDefault();
      const nodeContent = e.target.closest(".tree-node-content");
      if (nodeContent && draggedNode) {
        const targetNode = this.findNode(nodeContent.dataset.nodeId);
        if (targetNode && targetNode !== draggedNode) {
          this.moveNode(draggedNode, targetNode);
        }
      }
    });
  }

  async loadFileTree() {
    if (this.options.storage) {
      try {
        const files = await this.options.storage.getAllDocuments();
        this.fileTree = this.buildTreeFromFiles(files);
      } catch (e) {
        console.error("Failed to load file tree:", e);
        this.fileTree = this.getDefaultTree();
      }
    } else {
      this.fileTree = this.getDefaultTree();
    }
  }

  buildTreeFromFiles(files) {
    const tree = [];
    const folders = new Map();

    files.forEach((file) => {
      const parts = file.path ? file.path.split("/") : [file.name];
      let currentLevel = tree;

      parts.forEach((part, index) => {
        if (index < parts.length - 1) {
          // It's a folder
          let folder = folders.get(parts.slice(0, index + 1).join("/"));
          if (!folder) {
            folder = {
              id: `folder-${Date.now()}-${Math.random()}`,
              name: part,
              type: "folder",
              children: [],
            };
            currentLevel.push(folder);
            folders.set(parts.slice(0, index + 1).join("/"), folder);
          }
          currentLevel = folder.children;
        } else {
          // It's a file
          currentLevel.push({
            id: file.id,
            name: part,
            type: "file",
            data: file,
          });
        }
      });
    });

    return tree;
  }

  getDefaultTree() {
    return [
      {
        id: "folder-1",
        name: "Documents",
        type: "folder",
        children: [
          { id: "file-1", name: "README.md", type: "file" },
          { id: "file-2", name: "notes.md", type: "file" },
        ],
      },
      {
        id: "folder-2",
        name: "Projects",
        type: "folder",
        children: [
          {
            id: "folder-3",
            name: "Website",
            type: "folder",
            children: [
              { id: "file-3", name: "index.html", type: "file" },
              { id: "file-4", name: "style.css", type: "file" },
            ],
          },
        ],
      },
      { id: "file-5", name: "todo.txt", type: "file" },
    ];
  }

  render() {
    this.treeContainer.innerHTML = "";
    this.renderNodes(this.fileTree, this.treeContainer, 0);
  }

  renderNodes(nodes, container, level) {
    nodes.forEach((node) => {
      const nodeElement = this.createNodeElement(node, level);
      container.appendChild(nodeElement);

      if (node.type === "folder" && node.children) {
        const childrenContainer = document.createElement("div");
        childrenContainer.className = "tree-node-children";
        if (this.expandedFolders.has(node.id)) {
          childrenContainer.classList.add("expanded");
          nodeElement
            .querySelector(".tree-node-arrow")
            ?.classList.add("expanded");
        }
        this.renderNodes(node.children, childrenContainer, level + 1);
        container.appendChild(childrenContainer);
      }
    });
  }

  createNodeElement(node, level) {
    const nodeDiv = document.createElement("div");
    nodeDiv.className = "tree-node";
    nodeDiv.dataset.level = level;

    const content = document.createElement("div");
    content.className = "tree-node-content";
    content.dataset.nodeId = node.id;
    content.draggable = true;

    if (this.selectedNode === node.id) {
      content.classList.add("selected");
    }

    // Arrow for folders
    if (node.type === "folder") {
      const arrow = document.createElement("div");
      arrow.className = "tree-node-arrow";
      iconLoader
        .load("chevron-right", { width: 12, height: 12 })
        .then((svg) => {
          arrow.innerHTML = svg;
        });
      content.appendChild(arrow);
    } else {
      // Spacer for files
      const spacer = document.createElement("div");
      spacer.style.width = "20px";
      content.appendChild(spacer);
    }

    // Icon
    const icon = document.createElement("div");
    icon.className = "tree-node-icon";
    this.setNodeIcon(icon, node);
    content.appendChild(icon);

    // Name
    const name = document.createElement("div");
    name.className = "tree-node-name";
    name.textContent = node.name;
    content.appendChild(name);

    nodeDiv.appendChild(content);
    return nodeDiv;
  }

  setNodeIcon(iconElement, node) {
    if (node.type === "folder") {
      iconLoader.load("folder", { width: 16, height: 16 }).then((svg) => {
        iconElement.innerHTML = svg;
      });
    } else {
      iconLoader.load("file", { width: 16, height: 16 }).then((svg) => {
        iconElement.innerHTML = svg;
      });
    }
  }

  getNodeIcon(node) {
    // Legacy method - keeping for backwards compatibility
    if (node.type === "folder") {
      return iconLoader.loadSync("folder", { width: 16, height: 16 });
    }
    return iconLoader.loadSync("file", { width: 16, height: 16 });
  }

  findNode(id, nodes = this.fileTree) {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = this.findNode(id, node.children);
        if (found) return found;
      }
    }
    return null;
  }

  selectNode(node) {
    this.selectedNode = node.id;
    this.render();

    if (node.type === "file") {
      this.options.onFileSelect(node);
    }
  }

  toggleFolder(node) {
    if (node.type !== "folder") return;

    if (this.expandedFolders.has(node.id)) {
      this.expandedFolders.delete(node.id);
    } else {
      this.expandedFolders.add(node.id);
    }

    this.render();
  }

  filterTree(query) {
    if (!query) {
      this.render();
      return;
    }

    const filtered = this.filterNodes(this.fileTree, query.toLowerCase());
    this.treeContainer.innerHTML = "";
    this.renderNodes(filtered, this.treeContainer, 0);
  }

  filterNodes(nodes, query) {
    const result = [];

    nodes.forEach((node) => {
      if (node.name.toLowerCase().includes(query)) {
        result.push(node);
      } else if (node.children) {
        const filteredChildren = this.filterNodes(node.children, query);
        if (filteredChildren.length > 0) {
          result.push({
            ...node,
            children: filteredChildren,
          });
          this.expandedFolders.add(node.id);
        }
      }
    });

    return result;
  }

  showContextMenu(x, y, node) {
    this.contextMenu.innerHTML = "";

    const items = [];

    if (node.type === "folder") {
      items.push(
        { label: "New File", action: () => this.createNewFile(node) },
        { label: "New Folder", action: () => this.createNewFolder(node) },
        { separator: true },
        { label: "Rename", action: () => this.renameNode(node) },
        { label: "Delete", action: () => this.deleteNode(node) },
      );
    } else {
      items.push(
        { label: "Open", action: () => this.selectNode(node) },
        { label: "Rename", action: () => this.renameNode(node) },
        { separator: true },
        { label: "Duplicate", action: () => this.duplicateFile(node) },
        { label: "Delete", action: () => this.deleteNode(node) },
      );
    }

    items.forEach((item) => {
      if (item.separator) {
        const separator = document.createElement("div");
        separator.className = "tree-context-separator";
        this.contextMenu.appendChild(separator);
      } else {
        const menuItem = document.createElement("div");
        menuItem.className = "tree-context-item";
        menuItem.textContent = item.label;
        menuItem.onclick = () => {
          item.action();
          this.contextMenu.style.display = "none";
        };
        this.contextMenu.appendChild(menuItem);
      }
    });

    this.contextMenu.style.display = "block";
    this.contextMenu.style.left = `${x}px`;
    this.contextMenu.style.top = `${y}px`;

    // Adjust position if menu goes off screen
    const rect = this.contextMenu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      this.contextMenu.style.left = `${x - rect.width}px`;
    }
    if (rect.bottom > window.innerHeight) {
      this.contextMenu.style.top = `${y - rect.height}px`;
    }
  }

  createNewFile(parent = null) {
    const name = prompt("Enter file name:");
    if (!name) return;

    const newFile = {
      id: `file-${Date.now()}`,
      name: name,
      type: "file",
      data: { content: "" },
    };

    if (parent && parent.type === "folder") {
      if (!parent.children) parent.children = [];
      parent.children.push(newFile);
      this.expandedFolders.add(parent.id);
    } else {
      this.fileTree.push(newFile);
    }

    this.render();
    this.options.onFileCreate(newFile);
  }

  createNewFolder(parent = null) {
    const name = prompt("Enter folder name:");
    if (!name) return;

    const newFolder = {
      id: `folder-${Date.now()}`,
      name: name,
      type: "folder",
      children: [],
    };

    if (parent && parent.type === "folder") {
      if (!parent.children) parent.children = [];
      parent.children.push(newFolder);
      this.expandedFolders.add(parent.id);
    } else {
      this.fileTree.push(newFolder);
    }

    this.render();
    this.options.onFolderCreate(newFolder);
  }

  renameNode(node) {
    const newName = prompt("Enter new name:", node.name);
    if (newName && newName !== node.name) {
      node.name = newName;
      this.render();
      this.options.onFileRename(node);
    }
  }

  deleteNode(node) {
    if (!confirm(`Delete "${node.name}"?`)) return;

    const deleteFromArray = (array, target) => {
      const index = array.indexOf(target);
      if (index !== -1) {
        array.splice(index, 1);
        return true;
      }

      for (const item of array) {
        if (item.children && deleteFromArray(item.children, target)) {
          return true;
        }
      }

      return false;
    };

    deleteFromArray(this.fileTree, node);
    this.render();

    if (node.type === "file") {
      this.options.onFileDelete(node);
    } else {
      this.options.onFolderDelete(node);
    }
  }

  duplicateFile(node) {
    if (node.type !== "file") return;

    const newFile = {
      id: `file-${Date.now()}`,
      name: `${node.name} (copy)`,
      type: "file",
      data: { ...node.data },
    };

    // Add to same location as original
    const addToSameLocation = (array) => {
      const index = array.indexOf(node);
      if (index !== -1) {
        array.splice(index + 1, 0, newFile);
        return true;
      }

      for (const item of array) {
        if (item.children && addToSameLocation(item.children)) {
          return true;
        }
      }

      return false;
    };

    addToSameLocation(this.fileTree);
    this.render();
    this.options.onFileCreate(newFile);
  }

  moveNode(source, target) {
    // Remove source from tree
    const removeFromArray = (array) => {
      const index = array.indexOf(source);
      if (index !== -1) {
        array.splice(index, 1);
        return true;
      }

      for (const item of array) {
        if (item.children && removeFromArray(item.children)) {
          return true;
        }
      }

      return false;
    };

    removeFromArray(this.fileTree);

    // Add to target
    if (target.type === "folder") {
      if (!target.children) target.children = [];
      target.children.push(source);
      this.expandedFolders.add(target.id);
    } else {
      // Add after target file
      const addAfterTarget = (array) => {
        const index = array.indexOf(target);
        if (index !== -1) {
          array.splice(index + 1, 0, source);
          return true;
        }

        for (const item of array) {
          if (item.children && addAfterTarget(item.children)) {
            return true;
          }
        }

        return false;
      };

      addAfterTarget(this.fileTree);
    }

    this.render();
  }

  destroy() {
    this.contextMenu?.remove();
    this.container.innerHTML = "";
  }
}
