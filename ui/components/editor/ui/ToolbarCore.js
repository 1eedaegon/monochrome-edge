/**
 * Main Toolbar Component
 * Provides all editing tools and formatting options
 */

import { iconLoader } from "@utils/iconLoader.js";

export class ToolbarCore {
  constructor(container, editor) {
    this.container = container;
    this.editor = editor;
    this.activeFormats = new Set();

    this.groups = [
      {
        name: "history",
        items: [
          {
            command: "undo",
            icon: "undo",
            title: "Undo (Ctrl+Z)",
          },
          {
            command: "redo",
            icon: "redo",
            title: "Redo (Ctrl+Y)",
          },
        ],
      },
      {
        name: "headings",
        items: [
          { command: "paragraph", text: "P", title: "Paragraph" },
          { command: "heading1", text: "H1", title: "Heading 1" },
          { command: "heading2", text: "H2", title: "Heading 2" },
          { command: "heading3", text: "H3", title: "Heading 3" },
        ],
      },
      {
        name: "formatting",
        items: [
          {
            command: "bold",
            icon: "bold",
            title: "Bold (Ctrl+B)",
          },
          {
            command: "italic",
            icon: "italic",
            title: "Italic (Ctrl+I)",
          },
          {
            command: "strikethrough",
            icon: "strikethrough",
            title: "Strikethrough",
          },
          { command: "code", icon: "code", title: "Inline Code" },
        ],
      },
      {
        name: "lists",
        items: [
          {
            command: "bullet",
            icon: "list-ul",
            title: "Bullet List",
          },
          {
            command: "number",
            icon: "list-ol",
            title: "Numbered List",
          },
          {
            command: "checkbox",
            icon: "checkbox",
            title: "Checkbox",
          },
        ],
      },
      {
        name: "blocks",
        items: [
          { command: "quote", icon: "quote", title: "Quote" },
          {
            command: "codeblock",
            icon: "code-block",
            title: "Code Block",
          },
          {
            command: "divider",
            icon: "divider",
            title: "Divider",
          },
        ],
      },
      {
        name: "insert",
        items: [
          {
            command: "link",
            icon: "link",
            title: "Link (Ctrl+K)",
          },
          { command: "image", icon: "image", title: "Image" },
          { command: "table", icon: "table", title: "Table" },
          {
            command: "math",
            icon: "math",
            title: "Math Equation",
          },
        ],
      },
      {
        name: "tools",
        items: [
          { command: "export", icon: "export", title: "Export" },
          {
            command: "fullscreen",
            icon: "fullscreen",
            title: "Fullscreen",
          },
        ],
      },
    ];

    this.render();
    this.attachListeners();
  }

  render() {
    this.container.innerHTML = "";
    this.container.className = "editor-toolbar";
    this.container.style.cssText = `
            background: var(--theme-surface);
            border-bottom: 1px solid var(--theme-border);
            padding: 0.5rem 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            overflow-x: auto;
            flex-shrink: 0;
        `;

    this.groups.forEach((group, index) => {
      // Create group container
      const groupEl = document.createElement("div");
      groupEl.className = "toolbar-group";
      groupEl.style.cssText = `
                display: flex;
                gap: 0.25rem;
            `;

      // Add buttons
      group.items.forEach((item) => {
        const button = this.createButton(item);
        groupEl.appendChild(button);
      });

      this.container.appendChild(groupEl);

      // Add divider after group (except last)
      if (index < this.groups.length - 1) {
        const divider = document.createElement("div");
        divider.className = "toolbar-divider";
        divider.style.cssText = `
                    width: 1px;
                    height: 24px;
                    background: var(--theme-border);
                    margin: 0 0.5rem;
                `;
        this.container.appendChild(divider);
      }
    });
  }

  createButton(item) {
    const button = document.createElement("button");
    button.className = "toolbar-button";
    button.title = item.title;
    button.setAttribute("data-command", item.command);

    // Set content (icon or text)
    if (item.icon) {
      // Load SVG icon
      iconLoader.load(item.icon, { width: 16, height: 16 }).then((svg) => {
        button.innerHTML = svg;
      });
    } else if (item.text) {
      button.textContent = item.text;
    }

    button.style.cssText = `
            min-width: 32px;
            height: 32px;
            border: none;
            background: transparent;
            color: var(--theme-text-secondary);
            border-radius: var(--border-radius-sm);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 14px;
            transition: all 0.2s;
            padding: 0 8px;
        `;

    // Hover effect
    button.onmouseover = () => {
      if (!button.classList.contains("active")) {
        button.style.background = "var(--theme-bg)";
        button.style.color = "var(--theme-text-primary)";
      }
    };

    button.onmouseout = () => {
      if (!button.classList.contains("active")) {
        button.style.background = "transparent";
        button.style.color = "var(--theme-text-secondary)";
      }
    };

    // Click handler
    button.onclick = (e) => {
      e.preventDefault();
      this.handleCommand(item.command);
    };

    return button;
  }

  handleCommand(command) {
    switch (command) {
      case "export":
        this.showExportMenu();
        break;
      case "fullscreen":
        this.toggleFullscreen();
        break;
      case "math":
        this.insertMath();
        break;
      default:
        this.editor.executeCommand(command);
        break;
    }

    // Update active states
    this.updateActiveStates();
  }

  attachListeners() {
    // Update toolbar on selection change
    this.editor.on("selectionChange", () => {
      this.updateActiveStates();
    });

    // Update on block change
    this.editor.on("blockFocus", () => {
      this.updateActiveStates();
    });
  }

  updateActiveStates() {
    // Get current block type
    const selection = this.editor.selectionManager?.getSelection();
    if (!selection) return;

    const block = this.editor.dataModel?.getBlock(selection.blockId);
    if (!block) return;

    // Update block type buttons
    const buttons = this.container.querySelectorAll("[data-command]");
    buttons.forEach((button) => {
      const command = button.getAttribute("data-command");

      if (
        command === block.type ||
        (command === "paragraph" && block.type === "paragraph")
      ) {
        button.classList.add("active");
        button.style.background = "var(--theme-accent)";
        button.style.color = "white";
      } else {
        button.classList.remove("active");
        button.style.background = "transparent";
        button.style.color = "var(--theme-text-secondary)";
      }
    });
  }

  showExportMenu() {
    const menu = document.createElement("div");
    menu.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--theme-surface);
            border: 1px solid var(--theme-border);
            border-radius: var(--border-radius);
            padding: 1.5rem;
            box-shadow: var(--theme-shadow-xl, 0 10px 40px var(--theme-shadow-color));
            z-index: 2000;
            min-width: 300px;
        `;

    menu.innerHTML = `
            <h3 style="margin: 0 0 1rem 0; color: var(--theme-text-primary);">Export Document</h3>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                <button class="export-btn" data-format="markdown">Export as Markdown</button>
                <button class="export-btn" data-format="html">Export as HTML</button>
                <button class="export-btn" data-format="json">Export as JSON</button>
                <button class="export-btn" data-format="cancel" style="margin-top: 0.5rem;">Cancel</button>
            </div>
        `;

    // Style buttons
    menu.querySelectorAll(".export-btn").forEach((btn) => {
      btn.style.cssText = `
                padding: 0.75rem;
                border: 1px solid var(--theme-border);
                background: var(--theme-bg);
                color: var(--theme-text-primary);
                border-radius: var(--border-radius-sm);
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s;
            `;

      btn.onmouseover = () => {
        btn.style.background = "var(--theme-accent)";
        btn.style.color = "white";
      };

      btn.onmouseout = () => {
        btn.style.background = "var(--theme-bg)";
        btn.style.color = "var(--theme-text-primary)";
      };

      btn.onclick = () => {
        const format = btn.getAttribute("data-format");
        if (format !== "cancel") {
          this.exportDocument(format);
        }
        document.body.removeChild(menu);
      };
    });

    document.body.appendChild(menu);
  }

  exportDocument(format) {
    const content = this.editor.getContent();
    let data, filename, mimeType;

    switch (format) {
      case "markdown":
        data = content.markdown;
        filename = "document.md";
        mimeType = "text/markdown";
        break;
      case "html":
        data = this.generateHTML(content.blocks);
        filename = "document.html";
        mimeType = "text/html";
        break;
      case "json":
        data = content.json;
        filename = "document.json";
        mimeType = "application/json";
        break;
    }

    // Download file
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    // Show notification
    this.showNotification(`Document exported as ${format.toUpperCase()}`);
  }

  generateHTML(blocks) {
    let html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Exported Document</title>
    <style>
        body { font-family: -apple-system, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
        blockquote { border-left: 4px solid #ddd; padding-left: 1rem; color: #666; }
        code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; }
        pre { background: #f5f5f5; padding: 1rem; border-radius: 6px; overflow-x: auto; }
        img { max-width: 100%; height: auto; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    </style>
</head>
<body>
`;

    blocks.forEach((block) => {
      const text =
        typeof block.content === "string"
          ? block.content
          : block.content?.text || "";

      switch (block.type) {
        case "heading1":
          html += `<h1>${text}</h1>\n`;
          break;
        case "heading2":
          html += `<h2>${text}</h2>\n`;
          break;
        case "heading3":
          html += `<h3>${text}</h3>\n`;
          break;
        case "heading4":
          html += `<h4>${text}</h4>\n`;
          break;
        case "paragraph":
          html += `<p>${text}</p>\n`;
          break;
        case "quote":
          html += `<blockquote>${text}</blockquote>\n`;
          break;
        case "bullet":
          html += `<ul><li>${text}</li></ul>\n`;
          break;
        case "number":
          html += `<ol><li>${text}</li></ol>\n`;
          break;
        case "codeblock":
          html += `<pre><code>${text}</code></pre>\n`;
          break;
        case "divider":
          html += `<hr>\n`;
          break;
        case "image":
          html += `<img src="${block.content}" alt="${block.attributes?.alt || ""}">\n`;
          break;
      }
    });

    html += `</body></html>`;
    return html;
  }

  insertMath() {
    const latex = prompt("Enter LaTeX expression:", "E = mc^2");
    if (latex) {
      this.editor.insertBlock("math", latex);
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.editor.container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  showNotification(message) {
    const notification = document.createElement("div");
    notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--theme-success, #4caf50);
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            box-shadow: var(--theme-shadow-md, 0 2px 10px var(--theme-shadow-color));
            z-index: 9999;
            font-size: 14px;
        `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  }

  destroy() {
    this.container.innerHTML = "";
  }
}
