/* =========================================================
   松本達彦 ― ある曲芸師の歩み / Scripts
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Header state + reading progress ---------- */
  const header = document.getElementById("header");
  const progress = document.getElementById("progress");

  const onScroll = () => {
    header.classList.toggle("scrolled", window.scrollY > 30);
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
    progress.style.width = Math.min(100, ratio * 100) + "%";
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  const closeNav = () => {
    links.classList.remove("open");
    toggle.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  };
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
  });
  links.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeNav));

  /* ---------- Scroll reveal ----------
     Position is measured directly rather than through IntersectionObserver:
     an element fades in as soon as its top edge enters the viewport. Revealed
     elements are dropped from the list, so the check stays cheap. */
  const pending = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  function revealInView() {
    const limit = window.innerHeight - 40;
    for (let i = pending.length - 1; i >= 0; i--) {
      if (pending[i].getBoundingClientRect().top < limit) {
        pending[i].classList.add("visible");
        pending.splice(i, 1);
      }
    }
    if (!pending.length) {
      window.removeEventListener("scroll", revealInView);
      window.removeEventListener("resize", revealInView);
    }
  }

  window.addEventListener("scroll", revealInView, { passive: true });
  window.addEventListener("resize", revealInView);
  revealInView();
  window.addEventListener("load", revealInView);

  /* ---------- Newsletter modal ----------
     Opens immediately on load. Closes with the × button, the backdrop or Esc. */
  const modal = document.getElementById("newsletter");
  if (modal) {
    const card = modal.querySelector(".modal-card");
    const form = document.getElementById("nlForm");
    const email = document.getElementById("nlEmail");
    const msg = document.getElementById("nlMsg");
    let lastFocus = null;

    const focusable = () =>
      card.querySelectorAll("button, input, a[href]");

    const openModal = () => {
      lastFocus = document.activeElement;
      modal.hidden = false;
      document.body.style.overflow = "hidden";
      // Focus the dialog itself, so screen readers announce it without
      // putting a focus ring on the close button for mouse users.
      card.focus();
    };

    const closeModal = () => {
      modal.hidden = true;
      document.body.style.overflow = "";
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };

    modal.querySelectorAll("[data-close]").forEach((el) =>
      el.addEventListener("click", closeModal)
    );
    document.getElementById("nlClose").addEventListener("click", closeModal);

    document.addEventListener("keydown", (e) => {
      if (modal.hidden) return;
      if (e.key === "Escape") { closeModal(); return; }
      // Keep keyboard focus inside the dialog while it is open.
      if (e.key === "Tab") {
        const items = focusable();
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    });

    form.addEventListener("submit", (e) => {
      const value = email.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        e.preventDefault();
        msg.className = "modal-msg";
        msg.textContent = "メールアドレスをご確認ください。";
        email.focus();
        return;
      }
      // No provider configured yet: say so plainly rather than showing a
      // confirmation for a registration that did not happen.
      if (!form.getAttribute("action")) {
        e.preventDefault();
        msg.className = "modal-msg";
        msg.textContent = "ただいま登録の受付を準備しております。恐れ入りますが、しばらくお待ちください。";
        return;
      }
      // Otherwise the form posts to the newsletter provider normally.
    });

    openModal();
  }

  /* ---------- Highlight the section currently being read ---------- */
  const navAnchors = Array.from(links.querySelectorAll("a[href^='#']"));
  const sections = navAnchors
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          navAnchors.forEach((a) =>
            a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id)
          );
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => spy.observe(s));
  }
})();
