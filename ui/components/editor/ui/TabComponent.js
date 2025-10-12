/**
 * Tab Component for Multi-Document Editing
 * Manages multiple document tabs with editor instances
 */

import { iconLoader } from "@ui/utils/icon-loader";

export class TabComponent {
  constructor(container, options = {}) {
    this.container =
      typeof container === "string"
        ? document.querySelector(container)
        : container;
    this.options = {
      onTabSelect: options.onTabSelect || (() => {}),
      onTabClose: options.onTabClose || (() => {}),
      onTabCreate: options.onTabCreate || (() => {}),
      onTabReorder: options.onTabReorder || (() => {}),
      maxTabs: options.maxTabs || 20,
      confirmClose: options.confirmClose !== false,
      ...options,
    };

    this.tabs = [];
    this.activeTabId = null;
    this.tabOrder = [];
    this.unsavedChanges = new Set();

    this.init();
  }

  init() {
    this.createDOM();
    this.attachListeners();
    this.applyStyles();
  }

  createDOM() {
    this.container.innerHTML = "";
    this.container.className = "tab-component";

    // Tab bar
    this.tabBar = document.createElement("div");
    this.tabBar.className = "tab-bar";

    // Tab list container (scrollable)
    this.tabList = document.createElement("div");
    this.tabList.className = "tab-list";

    // New tab button
    this.newTabButton = document.createElement("button");
    this.newTabButton.className = "tab-new-btn";
    this.newTabButton.title = "New Document";
    iconLoader.load("plus", { width: 16, height: 16 }).then((svg) => {
      this.newTabButton.innerHTML = svg;
    });

    // Tab menu button
    this.menuButton = document.createElement("button");
    this.menuButton.className = "tab-menu-btn";
    this.menuButton.title = "All Tabs";
    iconLoader.load("menu", { width: 16, height: 16 }).then((svg) => {
      this.menuButton.innerHTML = svg;
    });

    // Scroll buttons
    this.scrollLeftBtn = document.createElement("button");
    this.scrollLeftBtn.className = "tab-scroll-btn tab-scroll-left";
    this.scrollLeftBtn.innerHTML = "‹";
    this.scrollLeftBtn.style.display = "none";

    this.scrollRightBtn = document.createElement("button");
    this.scrollRightBtn.className = "tab-scroll-btn tab-scroll-right";
    this.scrollRightBtn.innerHTML = "›";
    this.scrollRightBtn.style.display = "none";

    // Content area
    this.contentArea = document.createElement("div");
    this.contentArea.className = "tab-content-area";

    // Assemble tab bar
    this.tabBar.appendChild(this.scrollLeftBtn);
    this.tabBar.appendChild(this.tabList);
    this.tabBar.appendChild(this.scrollRightBtn);
    this.tabBar.appendChild(this.newTabButton);
    this.tabBar.appendChild(this.menuButton);

    // Add to container
    this.container.appendChild(this.tabBar);
    this.container.appendChild(this.contentArea);

    // Create dropdown menu
    this.createDropdownMenu();
  }

  createDropdownMenu() {
    this.dropdownMenu = document.createElement("div");
    this.dropdownMenu.className = "tab-dropdown-menu";
    this.dropdownMenu.style.display = "none";
    document.body.appendChild(this.dropdownMenu);
  }

  applyStyles() {
    const style = document.createElement("style");
    style.textContent = `
            .tab-component {
                display: flex;
                flex-direction: column;
                height: 100%;
                background: var(--theme-background, #fff);
            }

            .tab-bar {
                display: flex;
                align-items: center;
                height: 40px;
                background: var(--theme-surface, #f8f8f8);
                border-bottom: 1px solid var(--theme-border, #e0e0e0);
                position: relative;
                user-select: none;
            }

            .tab-list {
                flex: 1;
                display: flex;
                overflow-x: auto;
                overflow-y: hidden;
                scroll-behavior: smooth;
                scrollbar-width: none;
                -ms-overflow-style: none;
            }

            .tab-list::-webkit-scrollbar {
                display: none;
            }

            .tab-item {
                display: flex;
                align-items: center;
                min-width: 120px;
                max-width: 200px;
                height: 40px;
                padding: 0 12px;
                background: var(--theme-surface, #f8f8f8);
                border-right: 1px solid var(--theme-border, #e0e0e0);
                cursor: pointer;
                position: relative;
                transition: background 0.2s;
            }

            .tab-item:hover {
                background: var(--theme-accent-light, #f0f0f0);
            }

            .tab-item.active {
                background: var(--theme-background, #fff);
                border-bottom: 2px solid var(--theme-accent);
            }

            .tab-item.unsaved .tab-title::after {
                content: '•';
                margin-left: 4px;
                color: var(--theme-warning, #ff9800);
                font-size: 16px;
                line-height: 1;
            }

            .tab-item.dragging {
                opacity: 0.5;
            }

            .tab-icon {
                width: 16px;
                height: 16px;
                margin-right: 8px;
                flex-shrink: 0;
            }

            .tab-title {
                flex: 1;
                font-size: 13px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                color: var(--theme-text, #000);
            }

            .tab-close {
                width: 16px;
                height: 16px;
                margin-left: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 3px;
                transition: background 0.2s;
                flex-shrink: 0;
            }

            .tab-close:hover {
                background: var(--theme-error-light, #ffebee);
            }

            .tab-close svg {
                width: 10px;
                height: 10px;
            }

            .tab-new-btn,
            .tab-menu-btn {
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: transparent;
                border: none;
                cursor: pointer;
                transition: background 0.2s;
                flex-shrink: 0;
            }

            .tab-new-btn:hover,
            .tab-menu-btn:hover {
                background: var(--theme-accent-light, #f0f0f0);
            }

            .tab-scroll-btn {
                width: 24px;
                height: 40px;
                background: var(--theme-surface, #f8f8f8);
                border: none;
                cursor: pointer;
                font-size: 18px;
                color: var(--theme-text-secondary, #666);
                transition: background 0.2s;
                flex-shrink: 0;
            }

            .tab-scroll-btn:hover {
                background: var(--theme-accent-light, #f0f0f0);
            }

            .tab-content-area {
                flex: 1;
                overflow: hidden;
                position: relative;
            }

            .tab-content {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                display: none;
            }

            .tab-content.active {
                display: block;
            }

            .tab-dropdown-menu {
                position: fixed;
                background: var(--theme-surface, #fff);
                border: 1px solid var(--theme-border, #e0e0e0);
                border-radius: 8px;
                box-shadow: var(--theme-shadow-md, 0 4px 12px var(--theme-shadow-color));
                padding: 8px;
                max-width: 300px;
                max-height: 400px;
                overflow-y: auto;
                z-index: 10000;
            }

            .tab-dropdown-item {
                display: flex;
                align-items: center;
                padding: 8px 12px;
                cursor: pointer;
                border-radius: 4px;
                transition: background 0.2s;
            }

            .tab-dropdown-item:hover {
                background: var(--theme-accent-light, #f0f0f0);
            }

            .tab-dropdown-item.active {
                background: var(--theme-accent);
                color: white;
            }

            .tab-dropdown-separator {
                height: 1px;
                background: var(--theme-border, #e0e0e0);
                margin: 8px 0;
            }

            .tab-drop-indicator {
                position: absolute;
                top: 0;
                width: 2px;
                height: 40px;
                background: var(--theme-accent);
                pointer-events: none;
                transition: left 0.2s;
            }
        `;
    document.head.appendChild(style);
  }

  attachListeners() {
    // New tab button
    this.newTabButton.addEventListener("click", () => {
      this.createTab();
    });

    // Menu button
    this.menuButton.addEventListener("click", (e) => {
      this.showDropdownMenu(e);
    });

    // Scroll buttons
    this.scrollLeftBtn.addEventListener("click", () => {
      this.tabList.scrollLeft -= 200;
    });

    this.scrollRightBtn.addEventListener("click", () => {
      this.tabList.scrollLeft += 200;
    });

    // Check scroll buttons visibility
    this.tabList.addEventListener("scroll", () => {
      this.updateScrollButtons();
    });

    // Window resize
    window.addEventListener("resize", () => {
      this.updateScrollButtons();
    });

    // Close dropdown on outside click
    document.addEventListener("click", (e) => {
      if (
        !this.dropdownMenu.contains(e.target) &&
        e.target !== this.menuButton
      ) {
        this.dropdownMenu.style.display = "none";
      }
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      // Ctrl/Cmd + T: New tab
      if ((e.ctrlKey || e.metaKey) && e.key === "t") {
        e.preventDefault();
        this.createTab();
      }

      // Ctrl/Cmd + W: Close current tab
      if ((e.ctrlKey || e.metaKey) && e.key === "w") {
        e.preventDefault();
        if (this.activeTabId) {
          this.closeTab(this.activeTabId);
        }
      }

      // Ctrl/Cmd + Tab: Next tab
      if ((e.ctrlKey || e.metaKey) && e.key === "Tab" && !e.shiftKey) {
        e.preventDefault();
        this.selectNextTab();
      }

      // Ctrl/Cmd + Shift + Tab: Previous tab
      if ((e.ctrlKey || e.metaKey) && e.key === "Tab" && e.shiftKey) {
        e.preventDefault();
        this.selectPreviousTab();
      }

      // Ctrl/Cmd + 1-9: Select tab by index
      if ((e.ctrlKey || e.metaKey) && e.key >= "1" && e.key <= "9") {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        if (index < this.tabs.length) {
          this.selectTab(this.tabs[index].id);
        }
      }
    });
  }

  createTab(options = {}) {
    if (this.tabs.length >= this.options.maxTabs) {
      alert(`Maximum ${this.options.maxTabs} tabs allowed`);
      return null;
    }

    const tab = {
      id: options.id || `tab-${Date.now()}`,
      title: options.title || "Untitled",
      icon: options.icon || "📄",
      content: options.content || null,
      data: options.data || {},
      unsaved: false,
    };

    this.tabs.push(tab);
    this.tabOrder.push(tab.id);

    // Create tab element
    const tabElement = this.createTabElement(tab);
    this.tabList.appendChild(tabElement);

    // Create content area
    const contentElement = document.createElement("div");
    contentElement.className = "tab-content";
    contentElement.id = `content-${tab.id}`;
    this.contentArea.appendChild(contentElement);

    // Setup drag and drop
    this.setupTabDragAndDrop(tabElement, tab);

    // Select the new tab
    this.selectTab(tab.id);

    // Callback
    this.options.onTabCreate(tab);

    this.updateScrollButtons();

    return tab;
  }

  createTabElement(tab) {
    const tabElement = document.createElement("div");
    tabElement.className = "tab-item";
    tabElement.dataset.tabId = tab.id;
    tabElement.draggable = true;

    // Icon
    const icon = document.createElement("div");
    icon.className = "tab-icon";
    icon.textContent = tab.icon;

    // Title
    const title = document.createElement("div");
    title.className = "tab-title";
    title.textContent = tab.title;

    // Close button
    const closeBtn = document.createElement("div");
    closeBtn.className = "tab-close";
    iconLoader.load("close", { width: 12, height: 12 }).then((svg) => {
      closeBtn.innerHTML = svg;
    });

    // Event listeners
    tabElement.addEventListener("click", (e) => {
      if (!e.target.closest(".tab-close")) {
        this.selectTab(tab.id);
      }
    });

    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.closeTab(tab.id);
    });

    // Middle click to close
    tabElement.addEventListener("mousedown", (e) => {
      if (e.button === 1) {
        // Middle button
        e.preventDefault();
        this.closeTab(tab.id);
      }
    });

    tabElement.appendChild(icon);
    tabElement.appendChild(title);
    tabElement.appendChild(closeBtn);

    return tabElement;
  }

  setupTabDragAndDrop(tabElement, tab) {
    let draggedTab = null;
    let dropIndicator = null;

    tabElement.addEventListener("dragstart", (e) => {
      draggedTab = tab;
      tabElement.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";

      // Create drop indicator
      dropIndicator = document.createElement("div");
      dropIndicator.className = "tab-drop-indicator";
      this.tabBar.appendChild(dropIndicator);
    });

    tabElement.addEventListener("dragend", (e) => {
      tabElement.classList.remove("dragging");
      dropIndicator?.remove();
      draggedTab = null;
    });

    tabElement.addEventListener("dragover", (e) => {
      e.preventDefault();
      if (!draggedTab || draggedTab === tab) return;

      const rect = tabElement.getBoundingClientRect();
      const midpoint = rect.left + rect.width / 2;

      if (dropIndicator) {
        if (e.clientX < midpoint) {
          dropIndicator.style.left = `${rect.left}px`;
        } else {
          dropIndicator.style.left = `${rect.right}px`;
        }
      }
    });

    tabElement.addEventListener("drop", (e) => {
      e.preventDefault();
      if (!draggedTab || draggedTab === tab) return;

      const rect = tabElement.getBoundingClientRect();
      const midpoint = rect.left + rect.width / 2;
      const insertBefore = e.clientX < midpoint;

      this.reorderTabs(draggedTab.id, tab.id, insertBefore);
    });
  }

  selectTab(tabId) {
    const tab = this.tabs.find((t) => t.id === tabId);
    if (!tab) return;

    // Update active state
    this.activeTabId = tabId;

    // Update tab elements
    this.tabList.querySelectorAll(".tab-item").forEach((el) => {
      el.classList.toggle("active", el.dataset.tabId === tabId);
    });

    // Update content areas
    this.contentArea.querySelectorAll(".tab-content").forEach((el) => {
      el.classList.toggle("active", el.id === `content-${tabId}`);
    });

    // Scroll to tab if needed
    const tabElement = this.tabList.querySelector(`[data-tab-id="${tabId}"]`);
    if (tabElement) {
      tabElement.scrollIntoView({ behavior: "smooth", inline: "nearest" });
    }

    // Callback
    this.options.onTabSelect(tab);
  }

  closeTab(tabId) {
    const tab = this.tabs.find((t) => t.id === tabId);
    if (!tab) return;

    // Check for unsaved changes
    if (this.unsavedChanges.has(tabId) && this.options.confirmClose) {
      if (!confirm(`"${tab.title}" has unsaved changes. Close anyway?`)) {
        return;
      }
    }

    // Remove from arrays
    const index = this.tabs.findIndex((t) => t.id === tabId);
    this.tabs.splice(index, 1);
    this.tabOrder = this.tabOrder.filter((id) => id !== tabId);
    this.unsavedChanges.delete(tabId);

    // Remove DOM elements
    const tabElement = this.tabList.querySelector(`[data-tab-id="${tabId}"]`);
    tabElement?.remove();

    const contentElement = this.contentArea.querySelector(`#content-${tabId}`);
    contentElement?.remove();

    // Select another tab if this was active
    if (this.activeTabId === tabId) {
      if (this.tabs.length > 0) {
        // Select next or previous tab
        const newIndex = Math.min(index, this.tabs.length - 1);
        this.selectTab(this.tabs[newIndex].id);
      } else {
        this.activeTabId = null;
      }
    }

    // Callback
    this.options.onTabClose(tab);

    this.updateScrollButtons();
  }

  closeAllTabs() {
    const tabIds = this.tabs.map((t) => t.id);
    tabIds.forEach((id) => this.closeTab(id));
  }

  closeOtherTabs(keepTabId) {
    const tabIds = this.tabs.filter((t) => t.id !== keepTabId).map((t) => t.id);
    tabIds.forEach((id) => this.closeTab(id));
  }

  reorderTabs(draggedId, targetId, insertBefore) {
    const draggedIndex = this.tabOrder.indexOf(draggedId);
    const targetIndex = this.tabOrder.indexOf(targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Remove dragged tab from order
    this.tabOrder.splice(draggedIndex, 1);

    // Calculate new index
    let newIndex = targetIndex;
    if (!insertBefore && draggedIndex < targetIndex) {
      newIndex--;
    }
    if (!insertBefore) {
      newIndex++;
    }

    // Insert at new position
    this.tabOrder.splice(newIndex, 0, draggedId);

    // Reorder DOM elements
    this.renderTabs();

    // Callback
    this.options.onTabReorder(draggedId, newIndex);
  }

  renderTabs() {
    this.tabList.innerHTML = "";
    this.tabOrder.forEach((tabId) => {
      const tab = this.tabs.find((t) => t.id === tabId);
      if (tab) {
        const tabElement = this.createTabElement(tab);
        if (tabId === this.activeTabId) {
          tabElement.classList.add("active");
        }
        if (this.unsavedChanges.has(tabId)) {
          tabElement.classList.add("unsaved");
        }
        this.setupTabDragAndDrop(tabElement, tab);
        this.tabList.appendChild(tabElement);
      }
    });
  }

  updateTab(tabId, updates) {
    const tab = this.tabs.find((t) => t.id === tabId);
    if (!tab) return;

    Object.assign(tab, updates);

    // Update tab element
    const tabElement = this.tabList.querySelector(`[data-tab-id="${tabId}"]`);
    if (tabElement) {
      if (updates.title) {
        tabElement.querySelector(".tab-title").textContent = updates.title;
      }
      if (updates.icon) {
        tabElement.querySelector(".tab-icon").textContent = updates.icon;
      }
    }
  }

  markUnsaved(tabId, unsaved = true) {
    const tabElement = this.tabList.querySelector(`[data-tab-id="${tabId}"]`);
    if (tabElement) {
      if (unsaved) {
        this.unsavedChanges.add(tabId);
        tabElement.classList.add("unsaved");
      } else {
        this.unsavedChanges.delete(tabId);
        tabElement.classList.remove("unsaved");
      }
    }
  }

  selectNextTab() {
    if (this.tabs.length === 0) return;

    const currentIndex = this.tabs.findIndex((t) => t.id === this.activeTabId);
    const nextIndex = (currentIndex + 1) % this.tabs.length;
    this.selectTab(this.tabs[nextIndex].id);
  }

  selectPreviousTab() {
    if (this.tabs.length === 0) return;

    const currentIndex = this.tabs.findIndex((t) => t.id === this.activeTabId);
    const prevIndex = (currentIndex - 1 + this.tabs.length) % this.tabs.length;
    this.selectTab(this.tabs[prevIndex].id);
  }

  updateScrollButtons() {
    const needsScroll = this.tabList.scrollWidth > this.tabList.clientWidth;

    if (needsScroll) {
      this.scrollLeftBtn.style.display =
        this.tabList.scrollLeft > 0 ? "block" : "none";
      this.scrollRightBtn.style.display =
        this.tabList.scrollLeft <
        this.tabList.scrollWidth - this.tabList.clientWidth
          ? "block"
          : "none";
    } else {
      this.scrollLeftBtn.style.display = "none";
      this.scrollRightBtn.style.display = "none";
    }
  }

  showDropdownMenu(event) {
    this.dropdownMenu.innerHTML = "";

    // Add all tabs
    this.tabs.forEach((tab) => {
      const item = document.createElement("div");
      item.className = "tab-dropdown-item";
      if (tab.id === this.activeTabId) {
        item.classList.add("active");
      }

      const icon = document.createElement("span");
      icon.textContent = tab.icon;
      icon.style.marginRight = "8px";

      const title = document.createElement("span");
      title.textContent = tab.title;
      title.style.flex = "1";

      item.appendChild(icon);
      item.appendChild(title);

      if (this.unsavedChanges.has(tab.id)) {
        const unsaved = document.createElement("span");
        unsaved.textContent = "•";
        unsaved.style.color = "var(--theme-warning, #ff9800)";
        unsaved.style.marginLeft = "4px";
        item.appendChild(unsaved);
      }

      item.addEventListener("click", () => {
        this.selectTab(tab.id);
        this.dropdownMenu.style.display = "none";
      });

      this.dropdownMenu.appendChild(item);
    });

    if (this.tabs.length > 0) {
      // Separator
      const separator = document.createElement("div");
      separator.className = "tab-dropdown-separator";
      this.dropdownMenu.appendChild(separator);

      // Actions
      const actions = [
        { label: "Close All", action: () => this.closeAllTabs() },
        {
          label: "Close Others",
          action: () => this.closeOtherTabs(this.activeTabId),
        },
      ];

      actions.forEach(({ label, action }) => {
        const item = document.createElement("div");
        item.className = "tab-dropdown-item";
        item.textContent = label;
        item.addEventListener("click", () => {
          action();
          this.dropdownMenu.style.display = "none";
        });
        this.dropdownMenu.appendChild(item);
      });
    }

    // Position dropdown
    const rect = this.menuButton.getBoundingClientRect();
    this.dropdownMenu.style.display = "block";
    this.dropdownMenu.style.top = `${rect.bottom + 5}px`;
    this.dropdownMenu.style.right = `${window.innerWidth - rect.right}px`;
  }

  getTab(tabId) {
    return this.tabs.find((t) => t.id === tabId);
  }

  getActiveTab() {
    return this.tabs.find((t) => t.id === this.activeTabId);
  }

  getAllTabs() {
    return [...this.tabs];
  }

  getContentElement(tabId) {
    return this.contentArea.querySelector(`#content-${tabId}`);
  }

  destroy() {
    this.dropdownMenu?.remove();
    this.container.innerHTML = "";
  }
}
