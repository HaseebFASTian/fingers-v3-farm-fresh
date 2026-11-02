import http from "node:http";
import { stat, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const isDist = process.argv.includes("--dist");
const base = isDist ? path.join(root, "dist") : root;
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".txt": "text/plain",
  ".json": "application/json",
  ".pdf": "application/pdf",
};

const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    let file = path.resolve(
      base,
      "." + (pathname === "/" ? "/index.html" : pathname),
    );
    if (!file.startsWith(base + path.sep)) {
      res.writeHead(403).end();
      return;
    }
    if (
      !isDist &&
      (pathname.startsWith("/assets/") ||
        pathname.startsWith("/fonts/") ||
        pathname.startsWith("/downloads/") ||
        pathname === "/robots.txt")
    ) {
      file = path.join(base, "public", pathname);
    }
    if (!(await stat(file)).isFile()) throw new Error("Not a file");
    res.writeHead(200, {
      "Content-Type": types[path.extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" }).end("Page not found");
  }
});

server.listen(5176, "127.0.0.1", () =>
  console.log("Local: http://127.0.0.1:5176"),
);
