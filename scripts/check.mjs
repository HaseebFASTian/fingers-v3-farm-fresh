import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { products } from "../src/products.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const html = await readFile(path.join(root, "index.html"), "utf8");
assert.equal(
  products.length,
  20,
  "The approved Farm Fresh range contains 20 product groups.",
);
assert(
  products.every((product) => product.brand === "Farm Fresh"),
  "Only Farm Fresh products belong in this brand website.",
);
assert.equal(
  new Set(products.map((product) => product.id)).size,
  products.length,
  "Product identifiers must be unique.",
);
assert.equal(
  new Set(products.map((product) => product.image)).size,
  products.length,
  "Each product needs its own matching image.",
);
for (const product of products) {
  assert(
    product.name && product.imageAlt && product.source.document,
    `Missing product provenance: ${product.id}`,
  );
  assert(product.packs.length, `Missing packs: ${product.id}`);
  assert(
    product.packs.every((pack) => pack.size || product.note),
    `An unspecified pack needs an enquiry note: ${product.id}`,
  );
  assert(
    product.image.startsWith("/assets/products/"),
    `Unexpected image source: ${product.id}`,
  );
  await access(path.join(root, "public", product.image));
  assert(
    html.includes(`data-category="${product.category}"`),
    `Missing category control: ${product.category}`,
  );
}
const ids = new Set(
  [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]),
);
for (const [, id] of html.matchAll(/href="#([^"]+)"/g))
  assert(ids.has(id), `Missing anchor #${id}`);
for (const id of [
  "navigation",
  "catalogue",
  "product-search",
  "category-filters",
  "product-count",
  "product-grid",
  "product-dialog",
  "close-product-dialog",
  "product-dialog-content",
  "saved-products",
  "saved-count",
  "clear-selection",
  "enquiry-form",
  "enquiry-preview",
])
  assert(ids.has(id), `Missing required UI element #${id}`);
assert.equal(
  [...html.matchAll(/<h1\b/g)].length,
  1,
  "The page must have one main heading.",
);
assert(!/href="(?:#|)"/.test(html), "Empty links are not permitted.");
assert(
  !/(?:PKR|Rs\.|\$)\s*\d|add to cart|buy now|checkout/i.test(html),
  "This is a product enquiry site, not a shopping checkout.",
);
for (const [, url] of html.matchAll(
  /(?:src|href)="(\/(?:assets|fonts|downloads|src)\/[^"?#]+)"/g,
))
  await access(path.join(root, url.startsWith("/src/") ? "" : "public", url));
const syntax = spawnSync(
  process.execPath,
  ["--check", path.join(root, "src/main.js")],
  { encoding: "utf8" },
);
assert.equal(syntax.status, 0, syntax.stderr);
console.log(
  "Passed: 20 sourced Farm Fresh products, matching assets, enquiry-only content, category controls, anchors, required UI and JavaScript syntax.",
);
