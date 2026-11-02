import { mkdir, cp, copyFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dest = path.join(root, "dist");

await mkdir(dest, { recursive: true });
await copyFile(path.join(root, "index.html"), path.join(dest, "index.html"));
await cp(path.join(root, "src"), path.join(dest, "src"), { recursive: true });
await cp(path.join(root, "public"), dest, { recursive: true });
console.log("Built static website in dist/");
