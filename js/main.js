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
    googleScholar: 'https://www.scholar.google.com/citations?user=e8xo650AAAAJ&hl=en',
    linkedin: 'https://www.linkedin.com/in/alcocerjj',
    github: 'https://www.github.com/alcocer-jj',
    orcid: 'https://www.orcid.org/0009-0005-0469-3689'
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
  // ──────────────────────────────────────
  let lastScrollY = window.scrollY;

  window.addEventListener("scroll", function () {
    const navbar = document.querySelector(".topnav");
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY) {
      // Scrolling down — hide navbar
      navbar.classList.add("hidden");

      // Close mobile menu if open
      if (menuOpen) {
        mobileMenu.classList.remove("open");
        mobileMenu.classList.add("closing");
        menuIcon.classList.remove("open");

        setTimeout(() => {
          mobileMenu.classList.remove("closing");
        }, 400);
        menuOpen = false;
      }
    } else {
      // Scrolling up — show navbar
      navbar.classList.remove("hidden");
    }

    lastScrollY = currentScrollY;
  });

  // ──────────────────────────────────────
  // CAROUSEL ROTATION & INTERACTION
  // ──────────────────────────────────────
  const items = document.querySelectorAll(".carousel-item");
  const dots = document.querySelectorAll(".dot");
  const carouselContainer = document.querySelector(".carousel-container");
  let index = 0, interval = null, touchTimer, startX = 0, endX = 0;

  function showSlide(i) {
    items.forEach(item => item.classList.remove("active", "exiting"));
    if (items[index]) items[index].classList.add("exiting");
    items[i]?.classList.add("active");
    dots.forEach(dot => dot.classList.toggle("active", dot === dots[i]));
    index = i;
  }

  function startCarousel() {
    if (window.innerWidth >= 680 && interval === null) {
      interval = setInterval(() => showSlide((index + 1) % items.length), 20000);
    }
  }

  function stopCarousel() {
    clearInterval(interval);
    interval = null;
  }

  function initCarouselEvents() {
    dots.forEach((dot, i) => dot.addEventListener("click", () => showSlide(i)));

    carouselContainer?.addEventListener("mouseenter", stopCarousel);
    carouselContainer?.addEventListener("mouseleave", startCarousel);

    carouselContainer?.addEventListener("touchstart", (e) => {
      stopCarousel();
      touchTimer = setTimeout(startCarousel, 10000);
      startX = e.changedTouches[0].clientX;
    });

    carouselContainer?.addEventListener("touchend", (e) => {
      clearTimeout(touchTimer);
      endX = e.changedTouches[0].clientX;
      const threshold = 50;
      if (startX - endX > threshold) showSlide((index + 1) % items.length);
      else if (endX - startX > threshold) showSlide((index - 1 + items.length) % items.length);
    });
  }

  // Run setup once
  initCarouselEvents();
  startCarousel();

  // Stop/start on resize based on screen width
  window.addEventListener("resize", () => {
    if (window.innerWidth < 680) stopCarousel();
    else startCarousel();
  });

  // ──────────────────────────────────────
  // SCROLL-TO-TOP BUTTON
  // ──────────────────────────────────────
  const toTopButton = document.getElementById("to-top");
  window.onscroll = function() {
    if (window.scrollY > 500) toTopButton.style.display = "block";
    else toTopButton.style.display = "none";
  };
  window.topFunction = function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

    // ──────────────────────────────────────
  // HIDE/SHOW NAVBAR ON SCROLL (fixed)
  // ──────────────────────────────────────
  const nav           = document.getElementById("myTopnav");
  let prevScrollPos   = window.pageYOffset;

  window.addEventListener("scroll", function() {
    const currentScrollPos = window.pageYOffset;
    if (currentScrollPos > prevScrollPos) {
      // scroll down → hide
      nav.style.transform = "translateY(-100%)";
    } else {
      // scroll up → show
      nav.style.transform = "translateY(0)";
    }
    prevScrollPos = currentScrollPos;
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

}

