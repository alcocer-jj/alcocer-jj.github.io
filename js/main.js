// ============================
// APP INITIALIZER
// ============================
export function initApp() {
  // Force scroll to top in case transforms affect scroll
   window.scrollTo(0, 0);

  // ──────────────────────────────────────
  // LINK ATTRIBUTION A HREF SETTER
  // ──────────────────────────────────────
  const links = {
    email: 'mailto:jalcocer@law.harvard.edu',
    googleScholar: 'https://scholar.google.com/citations?user=e8xo650AAAAJ&hl=en',
    linkedin: 'https://www.linkedin.com/in/alcocerjj',
    github: 'https://www.github.com/alcocer-jj',
    orcid: 'https://www.orcid.org/0009-0005-0469-3689',
    openReview: 'https://www.openreview.net/profile?id=~Jose_J._Alcocer1',
  };
  document.querySelectorAll('[data-link]').forEach(el => {
    const key = el.getAttribute('data-link');
    if (links[key]) el.setAttribute('href', links[key]);
  });

  // ──────────────────────────────────────
  // MOBILE MENU TOGGLE (bars ⇆ X + slide menu)
  // ──────────────────────────────────────
  const menuIcon   = document.getElementById("menuIcon");
  const mobileMenu = document.getElementById("mobileMenu");
  let menuOpen     = false;

  menuIcon.addEventListener("click", function(e) {
    e.stopPropagation();

    if (!menuOpen) {
      // Position menu below the navbar
      const navbar = document.getElementById("myTopnav");
      const navbarRect = navbar.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const topOffset = navbarRect.top + scrollTop + navbar.offsetHeight;

      mobileMenu.style.top = `${topOffset}px`;

      // OPEN the menu
      mobileMenu.classList.remove("closing");
      mobileMenu.classList.add("open");
      menuIcon.classList.add("open");
      menuOpen = true;
    } else {
      // CLOSE the menu with transition
      mobileMenu.classList.remove("open");
      mobileMenu.classList.add("closing");
      menuIcon.classList.remove("open");

      // remove .closing after transition
      setTimeout(() => {
        mobileMenu.classList.remove("closing");
      }, 400); // match your CSS transition duration
      menuOpen = false;
    }
  });

  // ──────────────────────────────────────
  // CLOSE menu on outside click
  // ──────────────────────────────────────
  document.addEventListener("click", function(event) {
    if (
      menuOpen &&
      !document.getElementById("myTopnav").contains(event.target) &&
      !mobileMenu.contains(event.target)
    ) {
      mobileMenu.classList.remove("open");
      mobileMenu.classList.add("closing");
      menuIcon.classList.remove("open");

      setTimeout(() => {
        mobileMenu.classList.remove("closing");
      }, 400);
      menuOpen = false;
    }
  });

  // ──────────────────────────────────────
  // CLOSE menu on resize to desktop
  // ──────────────────────────────────────
  window.addEventListener("resize", function() {
    if (window.innerWidth > 991 && menuOpen) {
      mobileMenu.classList.remove("open", "closing");
      menuIcon.classList.remove("open");
      menuOpen = false;
    }
  });

  //  ──────────────────────────────────────
  // HIDE navbar on scroll down, SHOW on scroll up
  // ALSO: close mobile menu when navbar hides
  // ALSO: show/hide scroll-to-top button
  // ALSO slide the social bar in once the page is scrolled and out again at the top,
  // and on small screens out again near the bottom so the footer stays clear
  // Single consolidated scroll handler — no competing style.transform
  // ──────────────────────────────────────
  const toTopButton = document.getElementById("to-top");
  const socialBar = document.getElementById("socialBar");
  const socialBarRevealY = 100; // Pixels of scroll before the social bar slides in
  const socialBarBottomBuffer = 150; // Small screens only. Pixels from the page bottom where the bar drops away
  const smallScreen = window.matchMedia("(max-width: 999px)"); // Same breakpoint as main.css
  let lastScrollY = window.scrollY;

  function updateSocialBar() {
    if (!socialBar) return;
    const scrollY = window.scrollY;
    const distanceToBottom = document.documentElement.scrollHeight - window.innerHeight - scrollY;
    const nearBottom = smallScreen.matches && distanceToBottom <= socialBarBottomBuffer;
    socialBar.classList.toggle("is-visible", scrollY > socialBarRevealY && !nearBottom);
  }
  window.addEventListener("resize", updateSocialBar);

  window.addEventListener("scroll", function () {
    const navbar = document.querySelector(".topnav");
    const currentScrollY = window.scrollY;

    updateSocialBar();

    if (currentScrollY <= 0) {
      navbar.classList.remove("hidden");
      navbar.style.transform = "";
      lastScrollY = 0;
      if (toTopButton) toTopButton.style.display = "none";
      return;
    }

    if (currentScrollY > lastScrollY) {
      navbar.classList.add("hidden");
      navbar.style.transform = "";

      if (menuOpen) {
        mobileMenu.classList.remove("open");
        mobileMenu.classList.add("closing");
        menuIcon.classList.remove("open");
        setTimeout(() => mobileMenu.classList.remove("closing"), 400);
        menuOpen = false;
      }
    } else {
      navbar.classList.remove("hidden");
      navbar.style.transform = "";
    }

    if (toTopButton) {
      toTopButton.style.display = currentScrollY > 500 ? "block" : "none";
    }

    lastScrollY = currentScrollY;
  });

  // ──────────────────────────────────────
  // SCROLL-TO-TOP BUTTON
  // ──────────────────────────────────────
  window.topFunction = function () {
    // Milliseconds; higher = faster; lower = slower
    const duration = 1000;
    const startY = window.scrollY;
    const startTime = performance.now();

    function easeInOutCubic(t) {
      return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress;
      window.scrollTo({ top: startY * (1 - eased), left: 0, behavior: 'instant' });

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  };

  // ──────────────────────────────────────
  // PAGE FADE-IN ON LOAD
  // ──────────────────────────────────────
  document.body.classList.add("page-loaded");

  // ──────────────────────────────────────
  // THEME TOGGLE LOGIC (with system preference fallback)
  // ──────────────────────────────────────
  const textToggle = document.getElementById("themeTextToggle");
  const checkboxToggle = document.getElementById("themeToggle");

  const storedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = storedTheme ? storedTheme === "dark" : prefersDark;

  document.body.classList.toggle("dark-mode", isDark);
  if (textToggle) textToggle.textContent = isDark ? "Lux" : "Nox";
  if (checkboxToggle) checkboxToggle.checked = isDark;

  textToggle?.addEventListener("click", e => {
    e.stopPropagation();
    const dark = !document.body.classList.toggle("dark-mode");
    textToggle.textContent = dark ? "Lux" : "Nox";
    localStorage.setItem("theme", dark ? "dark" : "light");
    if (checkboxToggle) checkboxToggle.checked = dark;
  });

  checkboxToggle?.addEventListener("change", e => {
    e.stopPropagation();
    const dark = checkboxToggle.checked;
    document.body.classList.toggle("dark-mode", dark);
    if (textToggle) textToggle.textContent = dark ? "Lux" : "Nox";
    localStorage.setItem("theme", dark ? "dark" : "light");
  });

  window.addEventListener("pageshow", () => {
  document.body.classList.add("page-loaded");
  });

  // page‐load fade‐in
  requestAnimationFrame(() => {
    document.body.classList.add("nav-loaded");
  });

  // ──────────────────────────────────────
  // HIDE specific H2 on small screens
  // ──────────────────────────────────────
  function maybeHideSectionTitle() {
    document.querySelectorAll('.section-title').forEach(el => {
      if (el.textContent.trim() === "Research and Project Highlights") {
        el.style.display = window.innerWidth < 680 ? "none" : "";
      }
    });
  }
  window.addEventListener("resize", maybeHideSectionTitle);
  window.addEventListener("DOMContentLoaded", maybeHideSectionTitle);

  // ──────────────────────────────────────
  // FOOTER AND HERO NOTES
  // ──────────────────────────────────────
  initNotes();

}

// ──────────────────────────────────────
// FOOTER AND HERO NOTES
// ──────────────────────────────────────
// The footer's AI Usage and Privacy Policy labels and the question mark on each hero
// open small frosted notes, whose text lives in /js/notes.js. A note stays open until
// its X, the Escape key, a click or tap anywhere else, or a scroll in any direction
// closes it, and only one is open at a time.
// Question mark and close icons from Font Awesome Free 6.7.2 (fontawesome.com), licensed CC BY 4.0
const NOTE_ICON_QUESTION = '<svg viewBox="0 0 320 512" width="9.4" height="15" aria-hidden="true"><path fill="currentColor" d="M80 160c0-35.3 28.7-64 64-64l32 0c35.3 0 64 28.7 64 64l0 3.6c0 21.8-11.1 42.1-29.4 53.8l-42.2 27.1c-25.2 16.2-40.4 44.1-40.4 74l0 1.4c0 17.7 14.3 32 32 32s32-14.3 32-32l0-1.4c0-8.2 4.2-15.8 11-20.2l42.2-27.1c36.6-23.6 58.8-64.1 58.8-107.7l0-3.6c0-70.7-57.3-128-128-128l-32 0C73.3 32 16 89.3 16 160c0 17.7 14.3 32 32 32s32-14.3 32-32zm80 320a40 40 0 1 0 0-80 40 40 0 1 0 0 80z"/></svg>';
const NOTE_ICON_CLOSE = '<svg viewBox="0 0 384 512" width="10.5" height="14" aria-hidden="true"><path fill="currentColor" d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>';

function initNotes() {
  const text = window.SITE_NOTES;
  const footerLabels = document.querySelectorAll(".footer-note-link");
  const footerDots = document.querySelectorAll(".footer-note-sep");

  if (!text || typeof text !== "object") {
    console.warn("notes.js did not load, so the footer and hero notes are unavailable");
    footerLabels.forEach(label => { label.hidden = true; });
    footerDots.forEach(dot => { dot.hidden = true; });
    return;
  }

  const GAP = 10;              // Space between a note and what opened it, in pixels
  const EDGE = 12;             // Closest a note comes to the top or bottom of the window
  const SCROLL_ALLOWANCE = 8;  // Pixels of scrolling a note ignores, which absorbs the bounce at the end of a phone page
  const SETTLE_TIME = 300;     // Milliseconds after opening when leftover momentum from a flick is ignored
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let current = null;          // The open note, the button that opened it, and what it lines up with
  let scrollStart = { x: 0, y: 0 };
  let openedAt = 0;
  let wheelTotal = 0;

  const hasText = html => typeof html === "string" && html.trim() !== "";

  function makeNote(id, title, html) {
    const note = document.createElement("div");
    note.className = "site-note";
    note.id = id;
    note.hidden = true;
    note.tabIndex = -1;
    note.setAttribute("role", "dialog");
    note.setAttribute("aria-labelledby", `${id}Title`);
    note.innerHTML =
      '<div class="site-note-header">' +
        `<h2 class="site-note-title" id="${id}Title">${title}</h2>` +
        `<button type="button" class="site-note-close" aria-label="Close">${NOTE_ICON_CLOSE}</button>` +
      "</div>" +
      `<div class="site-note-body">${html}</div>`;
    note.querySelector(".site-note-close").addEventListener("click", () => closeNote(true));
    document.body.appendChild(note);
    return note;
  }

  // Ties a button to its note. The anchor is what the note lines up with, and align says
  // whether the note centers on it or lines up with its right edge.
  function connect(button, note, anchor, align) {
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", note.id);
    button.addEventListener("click", event => {
      if (current && current.note === note) {
        closeNote(false);
      } else {
        // A click from the keyboard has a detail of 0, and then focus moves into the note
        openNote({ note, button, anchor, align }, event.detail === 0);
      }
    });
  }

  function pageGutter() {
    const value = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--content-gutter"));
    return Number.isFinite(value) ? value : 25;
  }

  // Puts the open note above what it belongs to, or below when there's more room there,
  // and keeps it inside the page margins
  function placeNote() {
    if (!current) return;
    const { note, anchor, align } = current;
    const viewWidth = document.documentElement.clientWidth;
    const viewHeight = window.innerHeight;
    const rect = anchor.getBoundingClientRect();

    note.style.maxHeight = "";
    const natural = note.offsetHeight;
    const above = rect.top - GAP - EDGE;
    const below = viewHeight - rect.bottom - GAP - EDGE;
    const goAbove = natural <= above || above >= below;
    const room = Math.max(goAbove ? above : below, 120);
    if (natural > room) note.style.maxHeight = `${room}px`;

    const width = note.offsetWidth;
    const height = note.offsetHeight;
    const side = Math.min(pageGutter(), (viewWidth - width) / 2);
    let left = align === "end" ? rect.right - width : rect.left + rect.width / 2 - width / 2;
    left = Math.min(Math.max(left, side), viewWidth - side - width);
    const top = goAbove ? rect.top - GAP - height : rect.bottom + GAP;

    note.style.left = `${Math.round(left)}px`;
    note.style.top = `${Math.round(Math.max(EDGE, top))}px`;
  }

  function openNote(next, fromKeyboard) {
    if (current) closeNote(false);
    current = next;
    const { note, button } = next;
    note.hidden = false;
    placeNote();  // Measuring here also gives the fade-in a starting point
    note.classList.add("is-visible");
    button.setAttribute("aria-expanded", "true");
    scrollStart = { x: window.scrollX, y: window.scrollY };
    openedAt = performance.now();
    wheelTotal = 0;
    if (fromKeyboard) note.focus({ preventScroll: true });
  }

  function closeNote(returnFocus) {
    if (!current) return;
    const { note, button } = current;
    current = null;
    button.setAttribute("aria-expanded", "false");
    note.classList.remove("is-visible");
    // Hide it once the fade ends, unless it was opened again in the meantime
    setTimeout(() => {
      if (!note.classList.contains("is-visible")) note.hidden = true;
    }, reduceMotion.matches ? 0 : 200);
    // Focus goes back to the button when the note is closed on purpose, or when focus
    // was inside the note, so it never ends up on something hidden
    if (returnFocus || note.contains(document.activeElement)) button.focus({ preventScroll: true });
  }

  // Footer notes sit above the whole footer text, which keeps the copyright line in view
  const footerText = document.querySelector(".footer-center > div");
  const footerNotes = [
    { key: "aiUsage", id: "noteAiUsage", title: "AI Usage" },
    { key: "privacy", id: "notePrivacy", title: "Privacy Policy" },
  ];
  let footerShown = 0;
  footerNotes.forEach(({ key, id, title }) => {
    const label = document.querySelector(`.footer-note-link[data-note="${key}"]`);
    if (!label) return;
    if (!hasText(text[key])) {
      label.hidden = true;
      return;
    }
    footerShown += 1;
    connect(label, makeNote(id, title, text[key]), footerText || label, "center");
  });
  // The dot between the labels only belongs there when both of them show
  if (footerShown < 2) footerDots.forEach(dot => { dot.hidden = true; });

  // The hero's question mark only appears once that page's note has text
  const hero = document.querySelector(".hero[data-hero-note]");
  const heroText = hero && text.hero ? text.hero[hero.dataset.heroNote] : "";
  if (hero && hasText(heroText)) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "hero-note-button";
    button.setAttribute("aria-label", "About this photo");
    button.innerHTML = NOTE_ICON_QUESTION;
    hero.appendChild(button);
    connect(button, makeNote("noteHero", "About this photo", heroText), button, "end");
  }

  // Clicking or tapping anywhere outside the note and its button closes it
  document.addEventListener("pointerdown", event => {
    if (current && !current.note.contains(event.target) && !current.button.contains(event.target)) {
      closeNote(false);
    }
  });

  document.addEventListener("keydown", event => {
    if (current && event.key === "Escape") {
      event.preventDefault();
      closeNote(true);
    }
  });

  // Tabbing away from the note closes it too
  document.addEventListener("focusin", event => {
    if (current && !current.note.contains(event.target) && !current.button.contains(event.target)) {
      closeNote(false);
    }
  });

  // Scrolling the page in any direction closes it, after a small allowance
  window.addEventListener("scroll", () => {
    if (!current) return;
    if (performance.now() - openedAt < SETTLE_TIME) {
      scrollStart = { x: window.scrollX, y: window.scrollY };
      return;
    }
    const moved = Math.abs(window.scrollX - scrollStart.x) + Math.abs(window.scrollY - scrollStart.y);
    if (moved > SCROLL_ALLOWANCE) closeNote(false);
  }, { passive: true });

  // At the very top or bottom of a page a scroll moves nothing, so the attempt itself
  // closes the note. Scrolling inside a long note leaves it open.
  window.addEventListener("wheel", event => {
    if (!current || current.note.contains(event.target)) return;
    if (performance.now() - openedAt < SETTLE_TIME) return;
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
    wheelTotal += (Math.abs(event.deltaX) + Math.abs(event.deltaY)) * unit;
    if (wheelTotal > SCROLL_ALLOWANCE) closeNote(false);
  }, { passive: true });

  window.addEventListener("resize", placeNote);
}
