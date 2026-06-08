import { test, expect } from "@playwright/test";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Security regression tests for the hardening applied to the design
 * system: XSS escaping in the search components, ReDoS-safe query
 * highlighting, and the demo server's path-traversal / header defences.
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const BUNDLE_DIR = path.resolve(here, "../dist/ui/components");

// These DOM tests load the built UMD bundles directly, so they exercise
// the exact code consumers receive. Force headless for determinism.
test.use({ headless: true });

test.describe("SearchBar XSS / ReDoS", () => {
  test("escapes malicious document fields instead of executing them", async ({
    page,
  }) => {
    await page.setContent('<div id="app"></div>');
    await page.addScriptTag({ path: path.join(BUNDLE_DIR, "search-bar.js") });

    const result = await page.evaluate(() => {
      (window as any).__xss = false;
      const SearchBar = (window as any).MonochromeEdge.SearchBar;
      new SearchBar({
        container: "#app",
        documents: [
          {
            id: "1",
            // Query matches at index 0 so the result scores and renders;
            // the injected markup follows and must be escaped.
            title: 'pwn <img src=x onerror="window.__xss=true">',
            content: "pwn <script>window.__xss=true</script> injected body",
          },
        ],
      });
      const input = document.querySelector(
        ".search-bar-input",
      ) as HTMLInputElement;
      input.value = "pwn";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      const html = document.querySelector(".search-bar-results")!.innerHTML;
      return { xss: (window as any).__xss, html };
    });

    // No injected handler ran...
    expect(result.xss).toBe(false);
    // ...and the markup was neutralised (escaped) rather than parsed.
    expect(result.html).toContain("&lt;img");
    expect(result.html).not.toContain("<img src=x onerror");
    // A real <img>/<script> element must NOT exist in the live DOM.
    const liveImg = await page.locator(".search-bar-results img").count();
    const liveScript = await page.locator(".search-bar-results script").count();
    expect(liveImg).toBe(0);
    expect(liveScript).toBe(0);
  });

  test("a pathological regex query does not hang (ReDoS-safe)", async ({
    page,
  }) => {
    await page.setContent('<div id="app"></div>');
    await page.addScriptTag({ path: path.join(BUNDLE_DIR, "search-bar.js") });

    const elapsed = await page.evaluate(() => {
      const SearchBar = (window as any).MonochromeEdge.SearchBar;
      new SearchBar({
        container: "#app",
        documents: [
          { id: "1", title: "a".repeat(60), content: "a".repeat(5000) },
        ],
      });
      const input = document.querySelector(
        ".search-bar-input",
      ) as HTMLInputElement;
      const start = performance.now();
      // A catastrophic-backtracking pattern if injected verbatim into RegExp.
      input.value = "(a+)+$";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      return performance.now() - start;
    });

    // Escaped query => literal match => completes near-instantly.
    expect(elapsed).toBeLessThan(1000);
  });
});

test.describe("SearchToolbar XSS", () => {
  test("escapes filter labels and placeholder", async ({ page }) => {
    await page.setContent('<div id="app"></div>');
    await page.addScriptTag({
      path: path.join(BUNDLE_DIR, "search-toolbar.js"),
    });

    const result = await page.evaluate(() => {
      (window as any).__xss = false;
      const SearchToolbar = (window as any).MonochromeEdge.SearchToolbar;
      new SearchToolbar("#app", {
        placeholder: '"><img src=x onerror="window.__xss=true">',
        filters: [
          {
            id: "cat",
            label: "Category",
            values: [
              {
                value: "a",
                label: '<img src=x onerror="window.__xss=true">EVIL',
              },
            ],
          },
        ],
      });
      return {
        xss: (window as any).__xss,
        html: document.querySelector("#app")!.innerHTML,
      };
    });

    expect(result.xss).toBe(false);
    expect(result.html).toContain("&lt;img");
    const liveImg = await page.locator("#app img").count();
    expect(liveImg).toBe(0);
  });
});

test.describe("Demo server hardening", () => {
  test("blocks encoded path traversal", async ({ request }) => {
    // %2e%2e decodes to '..' on the server; the containment check must reject it.
    const res = await request.get(
      "/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/etc/passwd",
    );
    expect([403, 404]).toContain(res.status());
    const body = await res.text();
    expect(body).not.toContain("root:");
  });

  test("serves security headers on the index route", async ({ request }) => {
    const res = await request.get("/");
    expect(res.status()).toBe(200);
    const headers = res.headers();
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["content-security-policy"]).toContain("default-src 'self'");
  });
});
