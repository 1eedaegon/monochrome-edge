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

const server = http.createServer(
  (req: http.IncomingMessage, res: http.ServerResponse): void => {
    // Default to docs/index.html for root path
    // Remove query parameters from URL
    const urlPath = req.url?.split("?")[0] || "";
    let filePath: string = urlPath === "/" ? "/docs/index.html" : urlPath;

    // Construct full file path
    filePath = path.join(__dirname, filePath);

    // Get file extension
    const extname: string = path.extname(filePath).toLowerCase();
    const contentType: string =
      MIME_TYPES[extname] || "application/octet-stream";

    // Read and serve the file
    fs.readFile(
      filePath,
      (err: NodeJS.ErrnoException | null, content: Buffer): void => {
        if (err) {
          if (err.code === "ENOENT") {
            // File not found
            res.writeHead(404, { "Content-Type": "text/html" });
            res.end("<h1>404 - File Not Found</h1>", "utf-8");
          } else {
            // Server error
            res.writeHead(500);
            res.end(`Server Error: ${err.code}`, "utf-8");
          }
        } else {
          // Success
          res.writeHead(200, { "Content-Type": contentType });
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
