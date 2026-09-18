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
