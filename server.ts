import * as http from "node:http";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

/*
 * Demo Server
 * It is a simple HTTP server that serves static files from `docs/index.html`
 * 데모니까 Pure html/css/typescript
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || "3000", 10);

interface MimeTypes {
  [key: string]: string;
}

const MIME_TYPES: MimeTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".ts": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
};

// Route mapping for clean URLs
const routes: { [key: string]: string } = {
  "/": "/docs/index.html",
  "/blog-demo": "/docs/blog-demo.html",
  "/editor": "/docs/editor.html",
  // Alias the bare filename too so the editor demo (and its e2e tests,
  // which load `/editor.html`) resolve against docs/ on the local server.
  // On GitHub Pages docs/ is the site root, so this is a dev-server-only shim.
  "/editor.html": "/docs/editor.html",
  "/integration": "/docs/integration-guide.html",
};

// Serving root — every resolved path must stay inside this directory.
const ROOT: string = path.resolve(__dirname);

// Security headers applied to every response.
const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // Allow the third-party CDNs the demo pages legitimately load
  // (Pretendard, KaTeX, Prism via jsDelivr/cdnjs, jQuery, Google Fonts).
  "Content-Security-Policy": [
    "default-src 'self'",
    "img-src 'self' data: https:",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
    "font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://code.jquery.com",
    "connect-src 'self' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
    "object-src 'none'",
    "base-uri 'self'",
  ].join("; "),
};

const server = http.createServer(
  (req: http.IncomingMessage, res: http.ServerResponse): void => {
    // Remove query parameters from URL, then decode percent-encoding so
    // encoded traversal sequences (%2e%2e) are normalised before the
    // containment check.
    const rawPath = req.url?.split("?")[0] || "";
    let urlPath: string;
    try {
      urlPath = decodeURIComponent(rawPath);
    } catch {
      res.writeHead(400, { "Content-Type": "text/plain", ...SECURITY_HEADERS });
      res.end("Bad Request", "utf-8");
      return;
    }

    // Use route mapping if available, otherwise use original path.
    const requested: string = routes[urlPath] || urlPath;

    // Resolve against the root and enforce containment. `path.resolve`
    // collapses any `..` segments; we then verify the result is still
    // inside ROOT so traversal cannot escape the served directory.
    const filePath: string = path.resolve(ROOT, "." + path.sep + requested);
    if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) {
      res.writeHead(403, { "Content-Type": "text/plain", ...SECURITY_HEADERS });
      res.end("Forbidden", "utf-8");
      return;
    }

    // Get file extension
    const extname: string = path.extname(filePath).toLowerCase();
    const contentType: string =
      MIME_TYPES[extname] || "application/octet-stream";

    // Read and serve the file
    fs.readFile(
      filePath,
      (err: NodeJS.ErrnoException | null, content: Buffer): void => {
        if (err) {
          if (err.code === "ENOENT" || err.code === "EISDIR") {
            // File not found
            res.writeHead(404, {
              "Content-Type": "text/html",
              ...SECURITY_HEADERS,
            });
            res.end("<h1>404 - File Not Found</h1>", "utf-8");
          } else {
            // Server error — log details server-side, do not leak to client.
            console.error(`[500] ${err.code} for ${filePath}`);
            res.writeHead(500, {
              "Content-Type": "text/plain",
              ...SECURITY_HEADERS,
            });
            res.end("Internal Server Error", "utf-8");
          }
        } else {
          // Success
          res.writeHead(200, {
            "Content-Type": contentType,
            ...SECURITY_HEADERS,
          });
          res.end(content, "utf-8");
        }
      },
    );
  },
);

server.listen(PORT, (): void => {
  console.log(`
╔════════════════════════════════════════════╗
║                                            ║
║   Monochrome Edge UI Components Server     ║
║                                            ║
║   Server running at:                       ║
║   http://localhost:${PORT}                    ║
║                                            ║
║   Press Ctrl+C to stop                     ║
║                                            ║
╚════════════════════════════════════════════╝
  `);
});

// Handle server shutdown gracefully
process.on("SIGTERM", (): void => {
  console.log("\nShutting down server...");
  server.close((): void => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", (): void => {
  console.log("\nShutting down server...");
  server.close((): void => {
    console.log("Server closed");
    process.exit(0);
  });
});
