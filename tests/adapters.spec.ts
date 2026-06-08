import { test, expect } from "@playwright/test";

/**
 * Smoke + security tests for the Web Components adapter. The bundle is
 * served by the demo server (it serves /dist), so we load the ESM build
 * from the same origin — exactly how a consumer would. The elements wrap
 * the canonical vanilla classes, so a passing render proves the base
 * library is wired through correctly.
 */

test.use({ headless: true });

async function loadWebComponents(page: import("@playwright/test").Page) {
  await page.goto("/"); // same-origin so /dist/* and the CSP allow the module
  await page.addScriptTag({
    type: "module",
    content: `import '/dist/web-components.esm.js';`,
  });
  // Wait for custom element registration.
  await page.waitForFunction(() => !!customElements.get("mce-tree-view"));
}

test.describe("Web Components adapter", () => {
  test("registers the full element set including the new interactive ones", async ({
    page,
  }) => {
    await loadWebComponents(page);
    const defined = await page.evaluate(() =>
      [
        "mce-button",
        "mce-modal",
        "mce-tree-view",
        "mce-graph-view",
        "mce-search-toolbar",
        "mce-toc",
        "mce-toc-item",
        "mce-icon-button",
      ].filter((n) => !!customElements.get(n)),
    );
    expect(defined).toContain("mce-tree-view");
    expect(defined).toContain("mce-search-toolbar");
    expect(defined).toContain("mce-toc");
    expect(defined.length).toBe(8);
  });

  test("mce-tree-view renders nodes from the .data property", async ({
    page,
  }) => {
    await loadWebComponents(page);
    const text = await page.evaluate(() => {
      const el = document.createElement("mce-tree-view") as any;
      document.body.appendChild(el);
      el.data = [
        { id: "a", label: "Alpha", children: [{ id: "b", label: "Beta" }] },
      ];
      return el.textContent || "";
    });
    expect(text).toContain("Alpha");
  });

  test("mce-toc escapes untrusted item labels (no XSS)", async ({ page }) => {
    await loadWebComponents(page);
    const result = await page.evaluate(() => {
      (window as any).__xss = false;
      const toc = document.createElement("mce-toc");
      toc.setAttribute("title", "Contents");
      const item = document.createElement("mce-toc-item");
      item.setAttribute("id", "1");
      item.setAttribute("href", "#x");
      item.textContent = '<img src=x onerror="window.__xss=true">PWN';
      toc.appendChild(item);
      document.body.appendChild(toc);
      return {
        xss: (window as any).__xss,
        html: toc.innerHTML,
        imgs: toc.querySelectorAll("img").length,
      };
    });
    expect(result.xss).toBe(false);
    expect(result.imgs).toBe(0);
    expect(result.html).toContain("&lt;img");
  });
});
