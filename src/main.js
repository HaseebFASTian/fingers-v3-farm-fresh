import { products } from "./products.js";

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [
  ...scope.querySelectorAll(selector),
];
const escapeHTML = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ],
  );
const arrow =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>';
const heart =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg>';
const closeIcon =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';
const state = { category: "All", query: "" };
const selectedProducts = new Map();
const grid = $("#product-grid");
const dialog = $("#product-dialog");
const form = $("#enquiry-form");
const preview = $("#enquiry-preview");
const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const packLabel = (pack) =>
  !pack.size
    ? "Pack size on enquiry"
    : pack.size === "KGS"
      ? "Bulk · weight on enquiry"
      : `${pack.size}${pack.packaging ? ` · ${pack.packaging}` : ""}`;
const packSummary = (product) =>
  product.packs.length === 1
    ? packLabel(product.packs[0])
    : `${product.packs.length} pack options`;
const normalise = (text) => text.toLowerCase().replace(/\s+/g, "");
let detailProduct = null;
let detailTrigger = null;
let enquiryText = "";
let notificationTimer;

const announcement = document.createElement("div");
announcement.id = "site-notification";
announcement.className = "site-notification";
announcement.setAttribute("role", "status");
announcement.setAttribute("aria-live", "polite");
announcement.hidden = true;
document.body.append(announcement);
function announce(message) {
  clearTimeout(notificationTimer);
  announcement.textContent = message;
  announcement.hidden = false;
  notificationTimer = setTimeout(() => {
    announcement.hidden = true;
  }, 3500);
}

function card(product) {
  const isSelected = selectedProducts.has(product.id);
  return `<article class="product-card" data-category="${escapeHTML(product.category)}" data-id="${product.id}">
    <div class="product-photo">
      <img src="${product.image}" alt="${escapeHTML(product.imageAlt)}" width="768" height="768" loading="lazy" decoding="async"/>
      <button class="save-product" type="button" data-save="${product.id}" aria-label="${isSelected ? "Remove" : "Add"} ${escapeHTML(product.name)} ${isSelected ? "from" : "to"} enquiry list" aria-pressed="${isSelected}">${heart}</button>
    </div>
    <div class="product-body"><span class="product-category">${escapeHTML(product.category)}</span><h3>${escapeHTML(product.name)}</h3><p class="product-pack">${escapeHTML(packSummary(product))}</p><button class="product-details" type="button" data-product="${product.id}" aria-label="View ${escapeHTML(product.name)} details">View product ${arrow}</button></div>
  </article>`;
}

function matchingProducts() {
  const query = normalise(state.query.trim());
  return products.filter(
    (product) =>
      (state.category === "All" || product.category === state.category) &&
      (!query ||
        normalise(
          `${product.name} ${product.category} ${product.packs.map(packLabel).join(" ")}`,
        ).includes(query)),
  );
}
function renderProducts() {
  const matched = matchingProducts();
  grid.innerHTML = matched.length
    ? matched.map(card).join("")
    : '<div class="empty-products"><h3>No matches just yet.</h3><p>Try a different product, pack size or category.</p><button type="button" class="button" data-reset-products>Show all products</button></div>';
  $("#product-count").textContent =
    `${matched.length} ${matched.length === 1 ? "product" : "products"}${state.category === "All" ? " in our range" : ` in ${state.category.toLowerCase()}`}`;
  $$("#category-filters [data-category]").forEach((button) => {
    const active = button.dataset.category === state.category;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function refreshSaveButtons() {
  $$("[data-save]").forEach((button) => {
    const product = products.find((item) => item.id === button.dataset.save);
    const active = selectedProducts.has(product.id);
    button.setAttribute("aria-pressed", String(active));
    button.setAttribute(
      "aria-label",
      `${active ? "Remove" : "Add"} ${product.name} ${active ? "from" : "to"} enquiry list`,
    );
  });
}
function renderSelection() {
  $("#saved-count").textContent = String(selectedProducts.size);
  $("#clear-selection").hidden = !selectedProducts.size;
  $("#saved-products").innerHTML = selectedProducts.size
    ? [...selectedProducts]
        .map(([id, index]) => {
          const product = products.find((item) => item.id === id);
          return `<div class="saved-product"><img src="${product.image}" alt="" width="64" height="64" loading="lazy"/><div><strong>${escapeHTML(product.name)}</strong><small>${escapeHTML(packLabel(product.packs[index]))}</small></div><button type="button" data-remove="${id}" aria-label="Remove ${escapeHTML(product.name)}">${closeIcon}</button></div>`;
        })
        .join("")
    : '<p class="selection-empty">Found a favourite? Save a product with the heart button, or choose a pack in its details.</p>';
  refreshSaveButtons();
  if (!preview.hidden) {
    preview.hidden = true;
    form.hidden = false;
  }
}
function toggleSelected(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;
  const wasSelected = selectedProducts.has(id);
  if (wasSelected) selectedProducts.delete(id);
  else selectedProducts.set(id, 0);
  renderSelection();
  announce(
    `${product.name} ${wasSelected ? "removed from" : "added to"} your enquiry list.`,
  );
}

function openProduct(id, trigger) {
  const product = products.find((item) => item.id === id);
  if (!product) return;
  detailProduct = product;
  detailTrigger = trigger;
  const intro =
    product.note ||
    `Explore the available ${product.name.toLowerCase()} packs and add the one you need to your enquiry.`;
  $("#product-dialog-content").innerHTML =
    `<div class="detail-layout"><div class="detail-visual"><img src="${product.image}" alt="${escapeHTML(product.imageAlt)}" width="768" height="768"/></div><div class="detail-copy"><span class="eyebrow">Farm Fresh · ${escapeHTML(product.category)}</span><h2 id="product-dialog-title">${escapeHTML(product.name)}</h2><p>${escapeHTML(intro)}</p><label for="pack-select">Choose your pack</label><select id="pack-select">${product.packs.map((pack, index) => `<option value="${index}"${selectedProducts.get(id) === index ? " selected" : ""}>${escapeHTML(packLabel(pack))}</option>`).join("")}</select><button type="button" class="button button-primary" id="add-product">Add to enquiry list ${arrow}</button><p class="detail-note">Catalogue-based product illustration. Packaging may vary by pack size. Please check the pack for ingredients and storage instructions.</p></div></div>`;
  dialog.setAttribute("aria-labelledby", "product-dialog-title");
  dialog.showModal();
  document.body.classList.add("dialog-open");
  $("#close-product-dialog").focus();
}
$("#close-product-dialog").addEventListener("click", () => dialog.close());
dialog.addEventListener("close", () => {
  document.body.classList.remove("dialog-open");
  if (detailTrigger?.isConnected) detailTrigger.focus({ preventScroll: true });
});
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {
    const bounds = dialog.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    )
      dialog.close();
  }
  if (event.target.closest("#add-product") && detailProduct) {
    selectedProducts.set(detailProduct.id, Number($("#pack-select").value));
    renderSelection();
    announce(
      `${detailProduct.name} and your selected pack added to the enquiry list.`,
    );
    dialog.close();
  }
});

grid.addEventListener("click", (event) => {
  const productButton = event.target.closest("[data-product]");
  const saveButton = event.target.closest("[data-save]");
  if (productButton) openProduct(productButton.dataset.product, productButton);
  else if (saveButton) toggleSelected(saveButton.dataset.save);
  else if (event.target.closest("[data-reset-products]")) {
    state.category = "All";
    state.query = "";
    $("#product-search").value = "";
    renderProducts();
    $("#product-search").focus();
  }
});
$("#product-search").addEventListener("input", (event) => {
  state.query = event.target.value;
  renderProducts();
});
$("#category-filters").addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (button) {
    state.category = button.dataset.category;
    renderProducts();
  }
});
$$("[data-filter-link]").forEach((link) =>
  link.addEventListener("click", () => {
    state.category = link.dataset.filterLink;
    state.query = "";
    $("#product-search").value = "";
    renderProducts();
  }),
);
$("#saved-products").addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove]");
  if (button) {
    selectedProducts.delete(button.dataset.remove);
    renderSelection();
    announce("Product removed from your enquiry list.");
  }
});
$("#clear-selection").addEventListener("click", () => {
  selectedProducts.clear();
  renderSelection();
  announce("Your enquiry list is now empty.");
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const selected = [...selectedProducts]
    .map(([id, index]) => {
      const product = products.find((item) => item.id === id);
      return `• ${product.name} — ${packLabel(product.packs[index])}`;
    })
    .join("\n");
  enquiryText = `Farm Fresh · Product enquiry\nThis is a preview. Your enquiry has not been sent.\n\nName: ${String(data.get("name") || "").trim()}\nEmail: ${String(data.get("email") || "").trim()}\nBusiness: ${String(data.get("business") || "").trim() || "Not provided"}\nCity: ${String(data.get("city") || "").trim() || "Not provided"}\n\nProducts:\n${selected || "No products selected"}\n\nMessage:\n${String(data.get("message") || "").trim()}`;
  preview.innerHTML =
    '<h3>Your enquiry is ready to review.</h3><p class="preview-copy">This preview has not been sent. You can edit it or download a copy to share with the team.</p><pre id="preview-text"></pre><div class="preview-actions"><button type="button" class="button button-primary" id="download-enquiry">Download enquiry</button><button type="button" class="button button-light" id="edit-enquiry">Edit details</button></div>';
  $("#preview-text").textContent = enquiryText;
  form.hidden = true;
  preview.hidden = false;
  preview.tabIndex = -1;
  preview.focus({ preventScroll: true });
  preview.scrollIntoView({
    behavior: reducedMotion() ? "instant" : "smooth",
    block: "start",
  });
});
preview.addEventListener("click", (event) => {
  if (event.target.closest("#edit-enquiry")) {
    preview.hidden = true;
    form.hidden = false;
    $('[name="name"]', form).focus();
  }
  if (event.target.closest("#download-enquiry")) {
    const url = URL.createObjectURL(
      new Blob([enquiryText], { type: "text/plain;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "farm-fresh-enquiry.txt";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
});

const menuToggle = $(".menu-toggle");
const navigation = $("#navigation");
function closeMenu() {
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open menu");
  navigation.classList.remove("open");
}
menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") !== "true";
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  navigation.classList.toggle("open", isOpen);
});
navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});
document.addEventListener("click", (event) => {
  if (
    !event.target.closest("#navigation") &&
    !event.target.closest(".menu-toggle")
  )
    closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    menuToggle.getAttribute("aria-expanded") === "true"
  ) {
    closeMenu();
    menuToggle.focus();
  }
});
matchMedia("(min-width: 901px)").addEventListener("change", closeMenu);

const signatureTrack = $("#signature-track");
if (signatureTrack) {
  function moveSignature(direction) {
    const card = signatureTrack.firstElementChild;
    const gap =
      Number.parseFloat(getComputedStyle(signatureTrack).columnGap) || 24;
    signatureTrack.scrollBy({
      left: direction * ((card?.getBoundingClientRect().width || 260) + gap),
      behavior: reducedMotion() ? "instant" : "smooth",
    });
  }
  $("#signature-prev")?.addEventListener("click", () => moveSignature(-1));
  $("#signature-next")?.addEventListener("click", () => moveSignature(1));
  function updateCarouselControls() {
    const previous = $("#signature-prev");
    const next = $("#signature-next");
    if (previous) previous.disabled = signatureTrack.scrollLeft <= 2;
    if (next)
      next.disabled =
        signatureTrack.scrollLeft >=
        signatureTrack.scrollWidth - signatureTrack.clientWidth - 2;
  }
  signatureTrack.addEventListener("scroll", updateCarouselControls, {
    passive: true,
  });
  new ResizeObserver(updateCarouselControls).observe(signatureTrack);
  updateCarouselControls();
}

renderProducts();
renderSelection();
