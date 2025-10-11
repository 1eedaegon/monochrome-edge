/**
 * Unified SVG-based Stepper Component
 * Supports two types (default, text) and three layouts (horizontal, vertical, snake)
 * All rendering done with SVG for consistent behavior and scaling
 */

(function (global) {
  "use strict";

  class Stepper {
    constructor(container, options = {}) {
      this.container = container;

      // Parse new API: data-type and data-layout
      const dataType = this.container.getAttribute("data-type");
      const dataLayout = this.container.getAttribute("data-layout");
      const dataShowProgress =
        this.container.getAttribute("data-show-progress");

      // Parse legacy data-mode for backward compatibility
      const dataMode = this.container.getAttribute("data-mode");

      // Map legacy mode to new API
      let type = dataType || options.type || "default";
      let layout = dataLayout || options.layout || "horizontal";

      if (dataMode) {
        const mapping = this._mapLegacyMode(dataMode);
        type = mapping.type;
        layout = mapping.layout;
      }

      // Core spacing constants
      this.MIN_GAP = options.minGap || 80;
      this.CONTAINER_PADDING = options.padding || 32;
      this.ROW_GAP = options.rowGap || 80;

      this.options = {
        type: type, // 'default' | 'text'
        layout: layout, // 'horizontal' | 'vertical' | 'snake'
        showProgress:
          dataShowProgress === "true" || options.showProgress || false,
        nodeSize: 24,
        connectorGap: 6, // Gap between node and connector line
        onStepClick: null,
        ...options,
      };

      this.steps = [];
      this.svg = null;
      this.popupContainer = null;
      this.resizeObserver = null;

      this.init();
    }

    /**
     * Map legacy data-mode values to new API (type + layout)
     * For backward compatibility
     */
    _mapLegacyMode(mode) {
      const mapping = {
        linear: { type: "default", layout: "horizontal" },
        vertical: { type: "default", layout: "vertical" },
        snake: { type: "default", layout: "snake" },
        "text-only": { type: "text", layout: "horizontal" },
      };
      return mapping[mode] || { type: "default", layout: "horizontal" };
    }

    init() {
      this.parseSteps();
      this.render();
      this.setupResponsive();
    }

    parseSteps() {
      // Try to parse from data-steps attribute (JSON)
      const dataSteps = this.container.getAttribute("data-steps");
      if (dataSteps) {
        try {
          this.steps = JSON.parse(dataSteps);
          return;
        } catch (e) {
          console.warn("[Stepper] Failed to parse data-steps:", e);
        }
      }

      // Parse from child elements
      const children = this.container.querySelectorAll("[data-indicator]");
      this.steps = Array.from(children).map((child) => {
        const step = {
          indicator: child.getAttribute("data-indicator") || "",
          labelTitle: child.getAttribute("data-label-title") || "",
          labelDesc: child.getAttribute("data-label-desc") || "",
          title: child.getAttribute("data-title") || "",
          desc: child.getAttribute("data-desc") || "",
          state: child.getAttribute("data-state") || "pending",
        };

        // Priority logic: if no label, use title/desc as label
        if (!step.labelTitle && step.title) {
          step.labelTitle = step.title;
          step.title = ""; // Don't show in popup
        }
        if (!step.labelDesc && step.desc) {
          step.labelDesc = step.desc;
          step.desc = ""; // Don't show in popup
        }

        return step;
      });
    }

    /**
     * Calculate positions based on current layout
     */
    calculatePositions(containerWidth) {
      switch (this.options.layout) {
        case "horizontal":
          return this.calculateHorizontalLayout(containerWidth);
        case "vertical":
          return this.calculateVerticalLayout(containerWidth);
        case "snake":
          return this.calculateSnakeLayout(containerWidth);
        default:
          console.warn(
            `[Stepper] Unknown layout: ${this.options.layout}, using horizontal`,
          );
          return this.calculateHorizontalLayout(containerWidth);
      }
    }

    /**
     * Horizontal Layout: Single horizontal row with equal spacing
     */
    calculateHorizontalLayout(containerWidth) {
      const stepCount = this.steps.length;
      if (stepCount === 0) return [];

      const availableWidth = containerWidth - this.CONTAINER_PADDING * 2;
      const gap = stepCount > 1 ? availableWidth / (stepCount - 1) : 0;

      return this.steps.map((step, i) => {
        return {
          ...step,
          x: this.CONTAINER_PADDING + i * gap,
          y: this.CONTAINER_PADDING, // Same Y position as other modes for consistency
          row: 0,
          col: i,
          index: i,
        };
      });
    }

    /**
     * Snake Layout: Dynamic spacing with zigzag pattern (L→R→D→R→L)
     * Special case: if container width <= 240px, use vertical layout
     */
    calculateSnakeLayout(containerWidth) {
      const stepCount = this.steps.length;
      const VERTICAL_THRESHOLD = 240;

      // Special case: vertical layout when container is too narrow
      if (containerWidth <= VERTICAL_THRESHOLD) {
        return this.calculateVerticalLayout(containerWidth);
      }

      // Calculate nodes per row
      const availableWidth = containerWidth - this.CONTAINER_PADDING * 2;
      const maxPerRow = Math.floor(
        (availableWidth + this.MIN_GAP) / this.MIN_GAP,
      );

      let nodesPerRow;
      if (maxPerRow < stepCount) {
        nodesPerRow = Math.max(2, maxPerRow);
      } else {
        nodesPerRow = stepCount;
      }

      // Calculate gap
      const gap = nodesPerRow > 1 ? availableWidth / (nodesPerRow - 1) : 0;

      // Snake pattern layout
      return this.steps.map((step, i) => {
        const row = Math.floor(i / nodesPerRow);
        const col = i % nodesPerRow;
        const isReversedRow = row % 2 === 1;

        // Calculate X position with snake pattern
        const x = isReversedRow
          ? this.CONTAINER_PADDING + (nodesPerRow - 1 - col) * gap
          : this.CONTAINER_PADDING + col * gap;

        // Calculate Y position
        const y = this.CONTAINER_PADDING + row * this.ROW_GAP;

        return { ...step, x, y, row, col, index: i };
      });
    }

    /**
     * Vertical Layout: All nodes vertically centered
     */
    calculateVerticalLayout(containerWidth) {
      const centerX = containerWidth / 2;
      return this.steps.map((step, i) => {
        return {
          ...step,
          x: centerX,
          y: this.CONTAINER_PADDING + i * this.ROW_GAP,
          row: i,
          col: 0,
          index: i,
        };
      });
    }

    /**
     * Pre-calculate text widths for text type steppers
     * This must be called before rendering to ensure connectors have correct positions
     */
    _calculateTextWidths(positions) {
      if (this.options.type !== "text") return positions;

      positions.forEach((pos) => {
        const label = pos.labelTitle || pos.indicator;
        const textLength = label.length;
        const dynamicWidth = Math.max(60, textLength * 8 + 16);
        pos.textOnlyWidth = dynamicWidth;
      });

      return positions;
    }

    render() {
      const width = this.container.clientWidth;
      let positions = this.calculatePositions(width);

      // Pre-calculate text widths for text type
      positions = this._calculateTextWidths(positions);

      // Clear container
      this.container.innerHTML = "";

      // Add type and layout classes
      this.container.setAttribute("data-type", this.options.type);
      this.container.setAttribute("data-layout", this.options.layout);

      // Create SVG
      this.svg = this.createSVG(positions);
      this.container.appendChild(this.svg);

      // Create popup (append to body if not exists)
      if (!this.popupContainer) {
        this.popupContainer = this.createPopup();
        document.body.appendChild(this.popupContainer);
      }
    }

    createSVG(positions) {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.classList.add("stepper-svg");

      // Calculate SVG viewBox (content bounds)
      const padding = this.options.nodeSize * 2; // Extra padding for labels
      const labelHeight = 40; // Space for labels below nodes

      const minX = Math.min(...positions.map((p) => p.x)) - padding;
      const minY = Math.min(...positions.map((p) => p.y)) - padding;
      const maxX = Math.max(...positions.map((p) => p.x)) + padding;
      const maxY =
        Math.max(...positions.map((p) => p.y)) + padding + labelHeight;

      const viewBoxWidth = maxX - minX;
      const viewBoxHeight = maxY - minY;

      // Store viewBox for coordinate conversion
      this.viewBox = { minX, minY, viewBoxWidth, viewBoxHeight };

      // Set viewBox for scalable content
      svg.setAttribute(
        "viewBox",
        `${minX} ${minY} ${viewBoxWidth} ${viewBoxHeight}`,
      );

      // Detect vertical layout (height is more than 2x width)
      const isVertical = viewBoxHeight > viewBoxWidth * 2;

      // Apply consistent scaling logic for all layouts
      const containerWidth = this.container.clientWidth;
      const scaleRatio = containerWidth / viewBoxWidth;
      const explicitHeight = viewBoxHeight * scaleRatio;

      if (isVertical) {
        // Vertical layout: use explicit dimensions with consistent scale
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", explicitHeight);
        svg.setAttribute("preserveAspectRatio", "xMinYMin meet");
        svg.style.maxWidth = `${viewBoxWidth}px`; // Limit max width to viewBox width
        this.container.setAttribute("data-layout", "vertical");
      } else {
        // Horizontal layout: maintain consistent scale across all modes
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", explicitHeight);
        svg.setAttribute("preserveAspectRatio", "xMinYMin meet");
        this.container.setAttribute("data-layout", "horizontal");
      }

      // Render progress bar if enabled
      if (this.options.showProgress) {
        this.renderProgressBar(svg, positions);
      }

      // Render connectors
      this.renderConnectors(svg, positions);

      // Render nodes
      this.renderNodes(svg, positions);

      // Render labels as SVG text elements (fixes vertical mode bug)
      this.renderLabels(svg, positions);

      return svg;
    }

    renderProgressBar(svg, positions) {
      if (positions.length === 0) return;

      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.classList.add("progress-bar");

      const firstPos = positions[0];
      const lastPos = positions[positions.length - 1];

      // Calculate progress percentage
      const completedCount = this.steps.filter(
        (s) => s.state === "completed",
      ).length;
      const totalSteps = this.steps.length;
      const progressPercent = totalSteps > 0 ? completedCount / totalSteps : 0;

      // Background bar
      const bgRect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect",
      );
      bgRect.setAttribute("x", firstPos.x);
      bgRect.setAttribute("y", firstPos.y - 30); // Above nodes
      bgRect.setAttribute("width", lastPos.x - firstPos.x);
      bgRect.setAttribute("height", 2.5);
      bgRect.setAttribute("rx", 2);
      bgRect.classList.add("progress-bar-bg");
      g.appendChild(bgRect);

      // Progress fill
      const fillRect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect",
      );
      fillRect.setAttribute("x", firstPos.x);
      fillRect.setAttribute("y", firstPos.y - 30);
      fillRect.setAttribute(
        "width",
        (lastPos.x - firstPos.x) * progressPercent,
      );
      fillRect.setAttribute("height", 2.5);
      fillRect.setAttribute("rx", 2);
      fillRect.classList.add("progress-bar-fill");
      g.appendChild(fillRect);

      svg.appendChild(g);
    }

    renderConnectors(svg, positions) {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.classList.add("connectors");

      // For text type, use rect width/2 as "radius"
      // For default type, use circle radius
      const isTextType = this.options.type === "text";
      const gap = isTextType
        ? this.options.connectorGap * 2
        : this.options.connectorGap; // Double gap for text type

      positions.forEach((pos, i) => {
        if (i === positions.length - 1) return;

        const next = positions[i + 1];

        // Calculate angle between nodes
        const dx = next.x - pos.x;
        const dy = next.y - pos.y;
        const angle = Math.atan2(dy, dx);

        // For text type in vertical layout, use text box height (12px) instead of width
        // For horizontal/snake layouts or default type, use the original calculation
        const isVerticalLayout = this.options.layout === "vertical";

        let posRadius, nextRadius;

        if (isTextType && isVerticalLayout) {
          // Text type vertical: use half of text box height (24px / 2 = 12px)
          posRadius = 12;
          nextRadius = 12;
        } else if (isTextType) {
          // Text type horizontal/snake: use dynamic width
          posRadius = pos.textOnlyWidth ? pos.textOnlyWidth / 2 : 30;
          nextRadius = next.textOnlyWidth ? next.textOnlyWidth / 2 : 30;
        } else {
          // Default type: use circle radius
          posRadius = this.options.nodeSize / 2;
          nextRadius = this.options.nodeSize / 2;
        }

        // Start line at edge of first node + additional gap
        const x1 = pos.x + (posRadius + gap) * Math.cos(angle);
        const y1 = pos.y + (posRadius + gap) * Math.sin(angle);

        // End line at edge of second node + additional gap
        const x2 = next.x - (nextRadius + gap) * Math.cos(angle);
        const y2 = next.y - (nextRadius + gap) * Math.sin(angle);

        const line = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line",
        );

        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
        line.classList.add("connector");

        if (pos.state === "completed") {
          line.classList.add("completed");
        }

        g.appendChild(line);
      });

      svg.appendChild(g);
    }

    renderNodes(svg, positions) {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.classList.add("nodes");

      positions.forEach((pos) => {
        const nodeG = this.createNode(pos);
        g.appendChild(nodeG);
      });

      svg.appendChild(g);
    }

    createNode(pos) {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.classList.add(
        "node",
        pos.state,
        `type-${this.options.type}`,
        `layout-${this.options.layout}`,
      );
      g.setAttribute("data-index", pos.index);

      const radius = this.options.nodeSize / 2;

      // For text type, use different rendering
      if (this.options.type === "text") {
        // Text type: render as text with background
        // Use pre-calculated textOnlyWidth from layout calculation
        const label = pos.labelTitle || pos.indicator;
        const dynamicWidth = pos.textOnlyWidth || 60; // fallback to 60
        const halfWidth = dynamicWidth / 2;

        const rect = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect",
        );
        rect.setAttribute("x", pos.x - halfWidth);
        rect.setAttribute("y", pos.y - 12);
        rect.setAttribute("width", dynamicWidth);
        rect.setAttribute("height", 24);
        rect.setAttribute("rx", 4);
        rect.classList.add("text-node-bg");
        g.appendChild(rect);

        const text = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text",
        );
        text.setAttribute("x", pos.x);
        text.setAttribute("y", pos.y);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "central");
        text.setAttribute("class", "text-node-label");
        text.textContent = label;
        g.appendChild(text);
      } else {
        // Normal mode: render as circle
        const circle = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "circle",
        );
        circle.setAttribute("cx", pos.x);
        circle.setAttribute("cy", pos.y);
        circle.setAttribute("r", radius);
        g.appendChild(circle);

        // Content: checkmark, close icon, or text
        if (pos.state === "completed") {
          const checkmark = this.createCheckmark(pos.x, pos.y, radius);
          g.appendChild(checkmark);
        } else if (pos.state === "failed") {
          const closeIcon = this.createCloseIcon(pos.x, pos.y, radius);
          g.appendChild(closeIcon);
        } else {
          const text = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text",
          );
          text.setAttribute("x", pos.x);
          text.setAttribute("y", pos.y);
          text.setAttribute("text-anchor", "middle");
          text.setAttribute("dominant-baseline", "central");
          text.textContent = pos.indicator;
          g.appendChild(text);
        }
      }

      // Events
      g.style.cursor = "pointer";
      g.addEventListener("mouseenter", (e) => this.showPopup(pos, e));
      g.addEventListener("mouseleave", () => this.hidePopup());
      g.addEventListener("click", () => this.handleStepClick(pos));

      return g;
    }

    createCheckmark(cx, cy, radius) {
      // This checkmark uses the same design as icons/completed.svg
      // Symmetric V shape for visual consistency across all steppers
      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      const size = radius * 0.7;
      // Symmetric V shape: left arm and right arm have equal length
      const armLength = size * 0.6;
      const leftX = cx - armLength;
      const rightX = cx + armLength;
      const topY = cy - size * 0.3;
      const bottomY = cy + size * 0.4;

      const d = `M ${leftX} ${topY} L ${cx} ${bottomY} L ${rightX} ${topY}`;
      path.setAttribute("d", d);
      path.classList.add("checkmark");
      return path;
    }

    createCloseIcon(cx, cy, radius) {
      // X shape for failed state
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.classList.add("close-icon");

      const size = radius * 0.7;

      // First line: top-left to bottom-right
      const line1 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );
      line1.setAttribute("x1", cx - size * 0.5);
      line1.setAttribute("y1", cy - size * 0.5);
      line1.setAttribute("x2", cx + size * 0.5);
      line1.setAttribute("y2", cy + size * 0.5);
      g.appendChild(line1);

      // Second line: top-right to bottom-left
      const line2 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );
      line2.setAttribute("x1", cx + size * 0.5);
      line2.setAttribute("y1", cy - size * 0.5);
      line2.setAttribute("x2", cx - size * 0.5);
      line2.setAttribute("y2", cy + size * 0.5);
      g.appendChild(line2);

      return g;
    }

    /**
     * Render labels as SVG text elements instead of HTML divs
     * This fixes the vertical mode overflow bug by keeping labels within SVG coordinate system
     */
    renderLabels(svg, positions) {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.classList.add("labels");

      const isTextType = this.options.type === "text";
      const isVerticalLayout = this.options.layout === "vertical";

      positions.forEach((pos) => {
        if (!pos.labelTitle) return;

        // Text type doesn't need separate labels - the text box itself shows the label
        if (isTextType) return;

        const radius = this.options.nodeSize / 2;

        // For vertical layout, position labels to the side to avoid connector
        let labelX, labelY, textAnchor;

        if (isVerticalLayout) {
          // Position labels to the right of the node
          labelX = pos.x + radius + 16; // 16px to the right
          labelY = pos.y;
          textAnchor = "start";
        } else {
          // Horizontal/snake: position below the node (centered)
          labelX = pos.x;
          labelY = pos.y + radius + 20;
          textAnchor = "middle";
        }

        // Label title
        const title = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text",
        );
        title.setAttribute("x", labelX);
        title.setAttribute("y", labelY);
        title.setAttribute("text-anchor", textAnchor);
        title.setAttribute("class", "label-title");
        title.textContent = pos.labelTitle;
        g.appendChild(title);

        // Label description (if exists)
        if (pos.labelDesc) {
          const desc = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text",
          );
          desc.setAttribute("x", labelX);
          desc.setAttribute("y", labelY + 14); // 14px below title
          desc.setAttribute("text-anchor", textAnchor);
          desc.setAttribute("class", "label-desc");
          desc.textContent = pos.labelDesc;
          g.appendChild(desc);
        }
      });

      svg.appendChild(g);
    }

    createPopup() {
      const popup = document.createElement("div");
      popup.classList.add("stepper-popup");
      popup.innerHTML = `
        <h4 class="stepper-popup-title"></h4>
        <p class="stepper-popup-desc"></p>
      `;
      return popup;
    }

    showPopup(step, event) {
      // Only show if title or desc exists
      if (!step.title && !step.desc) return;

      const popup = this.popupContainer;
      const title = popup.querySelector(".stepper-popup-title");
      const desc = popup.querySelector(".stepper-popup-desc");

      title.textContent = step.title || "";
      desc.textContent = step.desc || "";

      if (!step.title) title.style.display = "none";
      else title.style.display = "block";

      if (!step.desc) desc.style.display = "none";
      else desc.style.display = "block";

      // Calculate absolute position (popup is in body, not container)
      const svgRect = this.svg.getBoundingClientRect();
      const containerRect = this.container.getBoundingClientRect();

      // Calculate node position in viewport coordinates
      const viewBox = [
        this.viewBox.minX,
        this.viewBox.minY,
        this.viewBox.viewBoxWidth,
        this.viewBox.viewBoxHeight,
      ];
      const svgWidth = svgRect.width;
      const svgHeight = svgRect.height;
      const viewBoxWidth = viewBox[2];
      const viewBoxHeight = viewBox[3];

      // Scale factor from viewBox to actual pixels
      const scaleX = svgWidth / viewBoxWidth;
      const scaleY = svgHeight / viewBoxHeight;

      // Convert SVG coordinates to screen coordinates
      const nodeScreenX = svgRect.left + (step.x - viewBox[0]) * scaleX;
      const nodeScreenY = svgRect.top + (step.y - viewBox[1]) * scaleY;

      // Smart positioning for vertical mode:
      // - If stepper is on left side of screen, position popup to the right
      // - If stepper is on right side of screen, position popup to the left
      const isVerticalLayout = this.options.layout === "vertical";

      if (isVerticalLayout) {
        const viewportWidth = window.innerWidth;
        const containerCenterX = containerRect.left + containerRect.width / 2;
        const isOnLeftSide = containerCenterX < viewportWidth / 2;

        if (isOnLeftSide) {
          // Stepper on left: position popup to the right of the node
          popup.style.left = `${nodeScreenX + this.options.nodeSize / 2 + 12}px`;
          popup.style.top = `${nodeScreenY}px`;
          popup.style.transform = "translateY(-50%)";
        } else {
          // Stepper on right: position popup to the left of the node
          popup.style.left = `${nodeScreenX - this.options.nodeSize / 2 - 12}px`;
          popup.style.top = `${nodeScreenY}px`;
          popup.style.transform = "translate(-100%, -50%)";
        }
      } else {
        // Horizontal modes: position popup centered above the node with 12px gap
        popup.style.left = `${nodeScreenX}px`;
        popup.style.top = `${nodeScreenY - this.options.nodeSize / 2 - 12}px`;
        popup.style.transform = "translate(-50%, -100%)";
      }

      popup.classList.add("visible");
    }

    hidePopup() {
      this.popupContainer.classList.remove("visible");
    }

    handleStepClick(step) {
      if (this.options.onStepClick) {
        this.options.onStepClick(step.index, step);
      }

      // Dispatch custom event
      this.container.dispatchEvent(
        new CustomEvent("step-click", {
          detail: { index: step.index, step },
          bubbles: true,
        }),
      );
    }

    /**
     * Setup responsive behavior using ResizeObserver
     * Monitors container size changes and re-renders automatically
     */
    setupResponsive() {
      let lastWidth = this.container.clientWidth;

      this.resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const newWidth = entry.contentRect.width;

          // Only re-render if width actually changed (avoid infinite loops)
          if (Math.abs(newWidth - lastWidth) > 1) {
            lastWidth = newWidth;

            // Use requestAnimationFrame for smooth rendering
            requestAnimationFrame(() => {
              this.render();
            });
          }
        }
      });

      this.resizeObserver.observe(this.container);
    }

    // Public API
    updateStep(index, data) {
      if (index < 0 || index >= this.steps.length) return;
      this.steps[index] = { ...this.steps[index], ...data };
      this.render();
    }

    addStep(data) {
      this.steps.push(data);
      this.render();
    }

    removeStep(index) {
      if (index < 0 || index >= this.steps.length) return;
      this.steps.splice(index, 1);
      this.render();
    }

    destroy() {
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      }
      if (this.popupContainer && this.popupContainer.parentNode) {
        this.popupContainer.parentNode.removeChild(this.popupContainer);
      }
      this.container.innerHTML = "";
    }
  }

  // Auto-initialize
  function initSteppers() {
    const containers = document.querySelectorAll(
      ".stepper:not([data-initialized])",
    );
    containers.forEach((container) => {
      container.setAttribute("data-initialized", "true");
      new Stepper(container);
    });
  }

  // Initialize on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSteppers);
  } else {
    initSteppers();
  }

  // Export
  if (typeof module !== "undefined" && module.exports) {
    module.exports = Stepper;
  } else if (typeof define === "function" && define.amd) {
    define([], function () {
      return Stepper;
    });
  } else {
    global.Stepper = Stepper;
  }
})(typeof window !== "undefined" ? window : this);
