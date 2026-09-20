(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.querySelector(".menu-toggle");
    const menu = document.querySelector(".nav-links");
    const navLinks = [...menu.querySelectorAll("a")];

    function setMenu(open, returnFocus = false) {
      toggle.setAttribute("aria-expanded", String(open));
      menu.classList.toggle("open", open);
      if (returnFocus) toggle.focus();
    }

    toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
    menu.addEventListener("click", event => {
      if (event.target.matches("a")) setMenu(false);
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") setMenu(false, true);
    });
    document.addEventListener("click", event => {
      if (!event.target.closest(".nav") && toggle.getAttribute("aria-expanded") === "true") setMenu(false);
    });

    let activeId = "";
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible || visible.target.id === activeId) return;
      activeId = visible.target.id;
      navLinks.forEach(link => link.classList.toggle("active", link.hash === `#${activeId}`));
    }, { rootMargin: "-18% 0px -68%", threshold: [0, 0.1, 0.25] });

    document.querySelectorAll("[data-section]:not([hidden])").forEach(section => observer.observe(section));
  });
})();
