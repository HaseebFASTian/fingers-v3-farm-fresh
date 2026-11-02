/* Mobile behaviour enhances the same document; desktop navigation stays native. */
const mobile = matchMedia("(max-width: 900px)");
const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const closingDialogs = new WeakMap();
let scrollLock = null;

export function lockMobileScroll(owner) {
  if (!mobile.matches || scrollLock) return;
  const body = document.body;
  scrollLock = {
    owner,
    y: window.scrollY,
    position: body.style.position,
    top: body.style.top,
    width: body.style.width,
    overflow: body.style.overflow,
  };
  body.style.position = "fixed";
  body.style.top = `-${scrollLock.y}px`;
  body.style.width = "100%";
  body.style.overflow = "hidden";
}

export function unlockMobileScroll(owner) {
  if (!scrollLock || scrollLock.owner !== owner) return;
  const previous = scrollLock;
  scrollLock = null;
  for (const property of ["position", "top", "width", "overflow"]) {
    document.body.style[property] = previous[property];
  }
  window.scrollTo({ top: previous.y, behavior: "instant" });
}

export function closeMobileDialog(dialog) {
  if (!dialog.open) return Promise.resolve();
  if (closingDialogs.has(dialog)) return closingDialogs.get(dialog);
  if (!mobile.matches || prefersReducedMotion.matches) {
    dialog.close();
    return Promise.resolve();
  }
  const closing = new Promise((resolve) => {
    dialog.classList.add("is-closing");
    const finish = () => {
      clearTimeout(timer);
      dialog.classList.remove("is-closing");
      closingDialogs.delete(dialog);
      resolve();
    };
    const timer = window.setTimeout(() => {
      if (dialog.open) dialog.close();
      else finish();
    }, 240);
    dialog.addEventListener("close", finish, { once: true });
  });
  closingDialogs.set(dialog, closing);
  return closing;
}

function isBackdropClick(event, dialog) {
  if (event.target !== dialog) return false;
  const bounds = dialog.getBoundingClientRect();
  return event.clientX < bounds.left || event.clientX > bounds.right ||
    event.clientY < bounds.top || event.clientY > bounds.bottom;
}

function initDrawer() {
  const drawer = document.querySelector("#mobile-menu");
  const trigger = document.querySelector("#open-mobile-menu") || document.querySelector(".menu-toggle");
  const close = document.querySelector("#close-mobile-menu");
  if (!drawer || !trigger || !close) return;
  let restoreFocus = true;

  trigger.addEventListener("click", () => {
    if (!mobile.matches || drawer.open) return;
    restoreFocus = true;
    drawer.classList.remove("is-closing");
    lockMobileScroll(drawer);
    document.body.classList.add("mobile-menu-open");
    drawer.showModal();
    trigger.setAttribute("aria-expanded", "true");
    trigger.setAttribute("aria-label", "Close menu");
    close.focus({ preventScroll: true });
  });
  close.addEventListener("click", () => closeMobileDialog(drawer));
  drawer.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeMobileDialog(drawer);
  });
  drawer.addEventListener("close", () => {
    document.body.classList.remove("mobile-menu-open");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-label", "Open menu");
    unlockMobileScroll(drawer);
    if (restoreFocus && mobile.matches) trigger.focus({ preventScroll: true });
  });
  drawer.addEventListener("click", async (event) => {
    if (isBackdropClick(event, drawer)) {
      closeMobileDialog(drawer);
      return;
    }
    const link = event.target.closest("a[href]");
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const destination = new URL(link.href, location.href);
    if (destination.origin !== location.origin || destination.pathname !== location.pathname) return;
    const target = destination.hash && document.getElementById(destination.hash.slice(1));
    if (!target) return;
    event.preventDefault();
    restoreFocus = false;
    await closeMobileDialog(drawer);
    if (location.hash !== destination.hash) location.hash = destination.hash;
    target.scrollIntoView({ behavior: prefersReducedMotion.matches ? "instant" : "smooth", block: "start" });
    // Move keyboard focus with navigation without triggering another scroll.
    const heading = target.matches("h1,h2,h3") ? target : target.querySelector("h1,h2,h3");
    if (heading) {
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    }
  });
  mobile.addEventListener("change", () => {
    if (!mobile.matches && drawer.open) {
      restoreFocus = false;
      drawer.close();
    }
  });
}

function initActiveNavigation() {
  const appHeader = document.querySelector(".mobile-app-header");
  const bottomLinks = [...document.querySelectorAll(".mobile-bottom-nav [data-mobile-destination]")];
  const drawerLinks = [...document.querySelectorAll("#mobile-menu [data-mobile-destination]")];
  if (!appHeader && !bottomLinks.length && !drawerLinks.length) return;
  const destinations = ["home", "categories", "catalogue", "about", "inspiration", "business", "faq", "contact"]
    .map((id) => document.getElementById(id)).filter(Boolean);
  let queued = false;

  function select(links, hash) {
    for (const link of links) {
      const active = link.hash === hash;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    }
  }
  function update() {
    queued = false;
    if (!mobile.matches || scrollLock) return;
    appHeader?.classList.toggle("is-scrolled", window.scrollY > 40);
    const marker = Math.min(innerHeight * 0.32, 220);
    let current = "home";
    for (const section of destinations) {
      if (section.getBoundingClientRect().top <= marker) current = section.id;
    }
    const bottom = current === "home" ? "home" : ["categories", "catalogue"].includes(current) ? "catalogue" :
      current === "contact" ? "contact" : current === "inspiration" ? "inspiration" : null;
    select(bottomLinks, bottom ? `#${bottom}` : null);
    select(drawerLinks, `#${current}`);
  }
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  }
  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", schedule, { passive: true });
  addEventListener("hashchange", schedule);
  mobile.addEventListener("change", schedule);
  // Product filtering changes the positions of later sections without scrolling.
  new ResizeObserver(schedule).observe(document.querySelector("main"));
  update();
}

function initMobileReveals() {
  if (!("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      if (mobile.matches && !prefersReducedMotion.matches) {
        entry.target.animate(
          [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }],
          { duration: 260, easing: "cubic-bezier(.2,.7,.2,1)" },
        );
      }
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.12 });
  document.querySelectorAll(".section-top,.center-heading,.pairing,.reason-card,.cheese-banner,.story-photo,.story-copy,.ideas-grid article,.business-banner,.faq>div,.contact-intro,.form-card")
    .forEach((element) => {
      element.classList.add("mobile-reveal");
      observer.observe(element);
    });
}

function initKeyboardAwareness() {
  if (!window.visualViewport) return;
  const update = () => {
    const editing = document.activeElement?.matches("input,textarea,select");
    const keyboardVisible = mobile.matches && editing && visualViewport.height < innerHeight - 140;
    document.body.classList.toggle("keyboard-open", Boolean(keyboardVisible));
  };
  visualViewport.addEventListener("resize", update, { passive: true });
  document.addEventListener("focusin", update);
  document.addEventListener("focusout", () => requestAnimationFrame(update));
}

export function initMobileUI() {
  initDrawer();
  initActiveNavigation();
  initMobileReveals();
  initKeyboardAwareness();
}
