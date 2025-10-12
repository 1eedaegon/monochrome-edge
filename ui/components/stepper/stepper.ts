/**
 * Unified SVG-based Stepper Component
 * Supports two types (default, text) and three layouts (horizontal, vertical, snake)
 * All rendering done with SVG for consistent behavior and scaling
 */

export interface StepperOptions {
  type?: "default" | "text";
  layout?: "horizontal" | "vertical" | "snake";
  showProgress?: boolean;
  nodeSize?: number;
  connectorGap?: number;
  minGap?: number;
  padding?: number;
  rowGap?: number;
  onStepClick?: ((step: Step, index: number) => void) | null;
}

export interface Step {
  indicator: string;
  labelTitle?: string;
  labelDesc?: string;
  title?: string;
  desc?: string;
  state?: "pending" | "active" | "completed" | "failed" | "error";
}

interface Position extends Step {
  x: number;
  y: number;
  row?: number;
  col?: number;
  index?: number;
  textOnlyWidth?: number;
}

interface ViewBox {
  minX: number;
  minY: number;
  viewBoxWidth: number;
  viewBoxHeight: number;
}

interface LegacyMapping {
  type: "default" | "text";
  layout: "horizontal" | "vertical" | "snake";
}

export class Stepper {
  private container: HTMLElement;
  private options: Required<StepperOptions>;
  private steps: Step[] = [];
  private svg: SVGElement | null = null;
  private popupContainer: HTMLElement | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private viewBox!: ViewBox;
  private MIN_GAP: number;
  private CONTAINER_PADDING: number;
  private ROW_GAP: number;

  constructor(container: string | HTMLElement, options: StepperOptions = {}) {
    this.container =
      typeof container === "string"
        ? (document.querySelector(container) as HTMLElement)
        : container;

    if (!this.container) {
      throw new Error("Stepper container element not found");
    }

    // Parse new API: data-type and data-layout
    const dataType = this.container.getAttribute("data-type");
    const dataLayout = this.container.getAttribute("data-layout");
    const dataShowProgress = this.container.getAttribute("data-show-progress");

    // Parse legacy data-mode for backward compatibility
    const dataMode = this.container.getAttribute("data-mode");

    // Map legacy mode to new API
    let type: "default" | "text" =
      (dataType as "default" | "text") || options.type || "default";
    let layout: "horizontal" | "vertical" | "snake" =
      (dataLayout as "horizontal" | "vertical" | "snake") ||
      options.layout ||
      "horizontal";

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
      type,
      layout,
      showProgress:
        dataShowProgress === "true" || options.showProgress || false,
      nodeSize: options.nodeSize || 24,
      connectorGap: options.connectorGap || 6,
      minGap: this.MIN_GAP,
      padding: this.CONTAINER_PADDING,
      rowGap: this.ROW_GAP,
      onStepClick: options.onStepClick || null,
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
  private _mapLegacyMode(mode: string): LegacyMapping {
    const mapping: Record<string, LegacyMapping> = {
      linear: { type: "default", layout: "horizontal" },
      vertical: { type: "default", layout: "vertical" },
      snake: { type: "default", layout: "snake" },
      "text-only": { type: "text", layout: "horizontal" },
    };
    return mapping[mode] || { type: "default", layout: "horizontal" };
  }

  private init(): void {
    this.parseSteps();
    this.render();
    this.setupResponsive();
  }

  /**
   * Truncate text to maximum length (30 chars) with ellipsis
   */
  private truncateText(text: string, maxLength: number = 30): string {
    if (!text) return text;
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + "...";
  }

  private parseSteps(): void {
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
    this.steps = Array.from(children).map((child: Element) => {
      const step: Step = {
        indicator: child.getAttribute("data-indicator") || "",
        labelTitle: child.getAttribute("data-label-title") || "",
        labelDesc: child.getAttribute("data-label-desc") || "",
        title: child.getAttribute("data-title") || "",
        desc: child.getAttribute("data-desc") || "",
        state: (child.getAttribute("data-state") as Step["state"]) || "pending",
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
  private calculatePositions(containerWidth: number): Position[] {
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
  private calculateHorizontalLayout(containerWidth: number): Position[] {
    const stepCount = this.steps.length;
    if (stepCount === 0) return [];

    const availableWidth = containerWidth - this.CONTAINER_PADDING * 2;
    const gap = stepCount > 1 ? availableWidth / (stepCount - 1) : 0;

    return this.steps.map((step, i) => {
      return {
        ...step,
        x: this.CONTAINER_PADDING + i * gap,
        y: this.CONTAINER_PADDING,
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
  private calculateSnakeLayout(containerWidth: number): Position[] {
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

    let nodesPerRow: number;
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
  private calculateVerticalLayout(containerWidth: number): Position[] {
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
   */
  private _calculateTextWidths(positions: Position[]): Position[] {
    if (this.options.type !== "text") return positions;

    // Helper function to break text by word boundaries
    const breakTextByWords = (
      text: string,
      maxCharsPerLine: number,
    ): string[] => {
      const words = text.split(" ");
      const lines: string[] = [];
      let currentLine = "";

      words.forEach((word: string) => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (testLine.length <= maxCharsPerLine) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            lines.push(currentLine);
          }
          currentLine = word;
        }
      });

      if (currentLine) {
        lines.push(currentLine);
      }

      return lines;
    };

    positions.forEach((pos: Position) => {
      const label = pos.labelTitle || pos.indicator;
      const maxChars = 15;
      const charWidth = 7.8;
      const horizontalPadding = 20;

      let dynamicWidth: number;

      if (label.length > maxChars) {
        const lines = breakTextByWords(label, maxChars);
        const longestLine = lines.reduce(
          (max, line) => Math.max(max, line.length),
          0,
        );
        dynamicWidth = longestLine * charWidth + horizontalPadding;
      } else {
        dynamicWidth = label.length * charWidth + horizontalPadding;
      }

      pos.textOnlyWidth = dynamicWidth;
    });

    return positions;
  }

  private render(): void {
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

  private createSVG(positions: Position[]): SVGElement {
    const svg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg",
    ) as SVGElement;
    svg.classList.add("stepper-svg");

    // Calculate SVG viewBox
    const padding = this.options.nodeSize * 2;
    const labelHeight = 40;

    const minX = Math.min(...positions.map((p) => p.x)) - padding;
    const minY = Math.min(...positions.map((p) => p.y)) - padding;
    const maxX = Math.max(...positions.map((p) => p.x)) + padding;
    const maxY = Math.max(...positions.map((p) => p.y)) + padding + labelHeight;

    const viewBoxWidth = maxX - minX;
    const viewBoxHeight = maxY - minY;

    // Store viewBox for coordinate conversion
    this.viewBox = { minX, minY, viewBoxWidth, viewBoxHeight };

    // Set viewBox for scalable content
    svg.setAttribute(
      "viewBox",
      `${minX} ${minY} ${viewBoxWidth} ${viewBoxHeight}`,
    );

    // Detect vertical layout
    const isVertical = viewBoxHeight > viewBoxWidth * 2;

    // Apply consistent scaling logic
    const containerWidth = this.container.clientWidth;
    const scaleRatio = containerWidth / viewBoxWidth;
    const explicitHeight = viewBoxHeight * scaleRatio;

    if (isVertical) {
      svg.setAttribute("width", "100%");
      svg.setAttribute("height", String(explicitHeight));
      svg.setAttribute("preserveAspectRatio", "xMinYMin meet");
      svg.style.maxWidth = `${viewBoxWidth}px`;
      this.container.setAttribute("data-layout", "vertical");
    } else {
      svg.setAttribute("width", "100%");
      svg.setAttribute("height", String(explicitHeight));
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

    // Render labels
    this.renderLabels(svg, positions);

    return svg;
  }

  private renderProgressBar(svg: SVGElement, positions: Position[]): void {
    if (positions.length === 0) return;

    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.classList.add("progress-bar");

    const firstPos = positions[0];
    const lastPos = positions[positions.length - 1];

    // Check if positions exist
    if (!firstPos || !lastPos) return;

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
    bgRect.setAttribute("x", String(firstPos.x));
    bgRect.setAttribute("y", String(firstPos.y - 30));
    bgRect.setAttribute("width", String(lastPos.x - firstPos.x));
    bgRect.setAttribute("height", "2.5");
    bgRect.setAttribute("rx", "2");
    bgRect.classList.add("progress-bar-bg");
    g.appendChild(bgRect);

    // Progress fill
    const fillRect = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect",
    );
    fillRect.setAttribute("x", String(firstPos.x));
    fillRect.setAttribute("y", String(firstPos.y - 30));
    fillRect.setAttribute(
      "width",
      String((lastPos.x - firstPos.x) * progressPercent),
    );
    fillRect.setAttribute("height", "2.5");
    fillRect.setAttribute("rx", "2");
    fillRect.classList.add("progress-bar-fill");
    g.appendChild(fillRect);

    svg.appendChild(g);
  }

  private renderConnectors(svg: SVGElement, positions: Position[]): void {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.classList.add("connectors");

    const isTextType = this.options.type === "text";
    const gap = isTextType
      ? this.options.connectorGap * 2
      : this.options.connectorGap;

    positions.forEach((pos, i) => {
      if (i === positions.length - 1) return;

      const next = positions[i + 1];
      if (!next) return;

      // Calculate angle between nodes
      const dx = next.x - pos.x;
      const dy = next.y - pos.y;
      const angle = Math.atan2(dy, dx);

      const isVerticalLayout = this.options.layout === "vertical";

      let posRadius: number, nextRadius: number;

      if (isTextType && isVerticalLayout) {
        posRadius = 12;
        nextRadius = 12;
      } else if (isTextType) {
        posRadius = pos.textOnlyWidth ? pos.textOnlyWidth / 2 : 30;
        nextRadius = next.textOnlyWidth ? next.textOnlyWidth / 2 : 30;
      } else {
        posRadius = this.options.nodeSize / 2;
        nextRadius = this.options.nodeSize / 2;
      }

      // Start line at edge of first node + gap
      const x1 = pos.x + (posRadius + gap) * Math.cos(angle);
      const y1 = pos.y + (posRadius + gap) * Math.sin(angle);

      // End line at edge of second node + gap
      const x2 = next.x - (nextRadius + gap) * Math.cos(angle);
      const y2 = next.y - (nextRadius + gap) * Math.sin(angle);

      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );

      line.setAttribute("x1", String(x1));
      line.setAttribute("y1", String(y1));
      line.setAttribute("x2", String(x2));
      line.setAttribute("y2", String(y2));
      line.classList.add("connector");

      if (pos.state === "completed") {
        line.classList.add("completed");
      }

      g.appendChild(line);
    });

    svg.appendChild(g);
  }

  private renderNodes(svg: SVGElement, positions: Position[]): void {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.classList.add("nodes");

    positions.forEach((pos, i) => {
      if (this.options.type === "text") {
        // Text type: render as rect with text or icon
        // Wrap in a group for proper CSS nesting
        const nodeGroup = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "g",
        );
        nodeGroup.classList.add("node", "node-text", pos.state || "pending");

        const width = pos.textOnlyWidth || 60;
        const height = 24;
        const rect = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect",
        );
        rect.setAttribute("x", String(pos.x - width / 2));
        rect.setAttribute("y", String(pos.y - height / 2));
        rect.setAttribute("width", String(width));
        rect.setAttribute("height", String(height));
        rect.setAttribute("rx", "12");

        nodeGroup.appendChild(rect);

        // Add icon or text based on state
        if (pos.state === "completed") {
          const checkmark = this.createCheckmark(pos.x, pos.y, height / 2);
          nodeGroup.appendChild(checkmark);
        } else if (pos.state === "failed") {
          const closeIcon = this.createCloseIcon(pos.x, pos.y, height / 2);
          nodeGroup.appendChild(closeIcon);
        } else {
          // Add text for pending/active states
          const text = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text",
          );
          text.setAttribute("x", String(pos.x));
          text.setAttribute("y", String(pos.y));
          text.setAttribute("text-anchor", "middle");
          text.setAttribute("dominant-baseline", "central");
          text.classList.add("node-text-label");
          text.textContent = this.truncateText(
            pos.labelTitle || pos.indicator,
            15,
          );
          nodeGroup.appendChild(text);
        }

        nodeGroup.addEventListener("click", () => this.handleNodeClick(pos, i));
        nodeGroup.addEventListener("mouseenter", (e) =>
          this.showPopup(pos, i, e as MouseEvent),
        );
        nodeGroup.addEventListener("mouseleave", () => this.hidePopup());

        g.appendChild(nodeGroup);
      } else {
        // Default type: render as circle
        // Wrap circle and its content in a group so CSS can target children
        const nodeGroup = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "g",
        );
        nodeGroup.classList.add("node", pos.state || "pending");

        const circle = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "circle",
        );
        circle.setAttribute("cx", String(pos.x));
        circle.setAttribute("cy", String(pos.y));
        circle.setAttribute("r", String(this.options.nodeSize / 2));

        nodeGroup.appendChild(circle);

        // Content: checkmark, close icon, or text based on state
        if (pos.state === "completed") {
          const checkmark = this.createCheckmark(
            pos.x,
            pos.y,
            this.options.nodeSize / 2,
          );
          nodeGroup.appendChild(checkmark);
        } else if (pos.state === "failed") {
          const closeIcon = this.createCloseIcon(
            pos.x,
            pos.y,
            this.options.nodeSize / 2,
          );
          nodeGroup.appendChild(closeIcon);
        } else {
          // Inner text for pending/active states
          const text = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text",
          );
          text.setAttribute("x", String(pos.x));
          text.setAttribute("y", String(pos.y));
          text.setAttribute("text-anchor", "middle");
          text.setAttribute("dominant-baseline", "central");
          text.classList.add("node-text");
          text.textContent = this.truncateText(pos.indicator, 3);
          nodeGroup.appendChild(text);
        }

        nodeGroup.addEventListener("click", () => this.handleNodeClick(pos, i));
        nodeGroup.addEventListener("mouseenter", (e) =>
          this.showPopup(pos, i, e as MouseEvent),
        );
        nodeGroup.addEventListener("mouseleave", () => this.hidePopup());

        g.appendChild(nodeGroup);
      }
    });

    svg.appendChild(g);
  }

  private renderLabels(svg: SVGElement, positions: Position[]): void {
    if (this.options.type === "text") return; // Text type doesn't show separate labels

    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.classList.add("labels");

    positions.forEach((pos) => {
      const labelY = pos.y + this.options.nodeSize / 2 + 20;

      // Title
      if (pos.labelTitle) {
        const title = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text",
        );
        title.setAttribute("x", String(pos.x));
        title.setAttribute("y", String(labelY));
        title.setAttribute("text-anchor", "middle");
        title.classList.add("label-title");
        title.textContent = this.truncateText(pos.labelTitle);
        g.appendChild(title);
      }

      // Description
      if (pos.labelDesc) {
        const desc = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text",
        );
        desc.setAttribute("x", String(pos.x));
        desc.setAttribute("y", String(labelY + 14));
        desc.setAttribute("text-anchor", "middle");
        desc.classList.add("label-desc");
        desc.textContent = this.truncateText(pos.labelDesc);
        g.appendChild(desc);
      }
    });

    svg.appendChild(g);
  }

  private createPopup(): HTMLElement {
    const popup = document.createElement("div");
    popup.classList.add("stepper-popup");
    popup.style.cssText = `
      position: fixed;
      display: none;
      background: var(--theme-bg);
      border: 1px solid var(--theme-border);
      border-radius: 8px;
      padding: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      z-index: 10000;
      pointer-events: none;
      max-width: 300px;
    `;
    return popup;
  }

  private showPopup(step: Step, index: number, event: MouseEvent): void {
    if (!this.popupContainer) return;

    // Only show popup if there's title or desc to display
    if (!step.title && !step.desc) return;

    let content = `<div style="font-size: 0.75rem; color: var(--theme-text-secondary);">Step ${index + 1}</div>`;

    if (step.title) {
      content += `<div style="font-weight: 600; margin-top: 4px;">${step.title}</div>`;
    }

    if (step.desc) {
      content += `<div style="font-size: 0.875rem; margin-top: 4px; color: var(--theme-text-secondary);">${step.desc}</div>`;
    }

    this.popupContainer.innerHTML = content;
    this.popupContainer.style.display = "block";

    // Position popup
    const rect = this.container.getBoundingClientRect();
    this.popupContainer.style.left = `${event.clientX + 10}px`;
    this.popupContainer.style.top = `${event.clientY + 10}px`;
  }

  private hidePopup(): void {
    if (this.popupContainer) {
      this.popupContainer.style.display = "none";
    }
  }

  private handleNodeClick(step: Step, index: number): void {
    if (this.options.onStepClick) {
      this.options.onStepClick(step, index);
    }
  }

  private setupResponsive(): void {
    if (typeof ResizeObserver === "undefined") return;

    this.resizeObserver = new ResizeObserver(() => {
      this.render();
    });

    this.resizeObserver.observe(this.container);
  }

  /**
   * Update step state
   */
  public updateStep(index: number, newState: Step["state"]): void {
    if (index >= 0 && index < this.steps.length) {
      const step = this.steps[index];
      if (step) {
        step.state = newState;
      }
      this.render();
    }
  }

  /**
   * Create checkmark icon for completed state
   */
  private createCheckmark(
    cx: number,
    cy: number,
    radius: number,
  ): SVGPathElement {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
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

  /**
   * Create close icon for failed state
   */
  private createCloseIcon(cx: number, cy: number, radius: number): SVGGElement {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.classList.add("close-icon");

    const size = radius * 0.7;

    // First line: top-left to bottom-right
    const line1 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line",
    );
    line1.setAttribute("x1", String(cx - size * 0.5));
    line1.setAttribute("y1", String(cy - size * 0.5));
    line1.setAttribute("x2", String(cx + size * 0.5));
    line1.setAttribute("y2", String(cy + size * 0.5));
    g.appendChild(line1);

    // Second line: top-right to bottom-left
    const line2 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line",
    );
    line2.setAttribute("x1", String(cx + size * 0.5));
    line2.setAttribute("y1", String(cy - size * 0.5));
    line2.setAttribute("x2", String(cx - size * 0.5));
    line2.setAttribute("y2", String(cy + size * 0.5));
    g.appendChild(line2);

    return g;
  }

  /**
   * Destroy stepper instance
   */
  public destroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.popupContainer && this.popupContainer.parentNode) {
      this.popupContainer.parentNode.removeChild(this.popupContainer);
      this.popupContainer = null;
    }

    this.container.innerHTML = "";
  }
}

// Auto-initialization function
export function initSteppers(): void {
  document.querySelectorAll("[data-stepper]").forEach((el) => {
    if (!el.hasAttribute("data-stepper-initialized")) {
      new Stepper(el as HTMLElement);
      el.setAttribute("data-stepper-initialized", "true");
    }
  });
}

// DOM ready initialization
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSteppers);
} else {
  initSteppers();
}
