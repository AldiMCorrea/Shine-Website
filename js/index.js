document.addEventListener("DOMContentLoaded", () => {

  /* ========================================
     THEME TOGGLE (Dark / Light Mode)
     ======================================== */
  const themeToggle = document.getElementById("themeToggle");
  const htmlElement = document.documentElement;

  const savedTheme = localStorage.getItem("theme") || "dark";
  htmlElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);
  updateLogos(savedTheme);

  themeToggle.addEventListener("click", () => {
    const current = htmlElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";

    htmlElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    updateThemeIcon(next);
    updateLogos(next);
  });

  function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector("i");
    icon.className = theme === "dark" ? "bi bi-moon-fill" : "bi bi-sun-fill";
  }

  function updateLogos(theme) {
    const darkLogo = "img/ShineLogoBM.png";
    const lightLogo = "img/ShineLogoLM.png";
    const src = theme === "dark" ? darkLogo : lightLogo;

    // Navbar logo
    const navLogo = document.getElementById("navLogo");
    if (navLogo) navLogo.src = src;

    // Footer logo
    const footerLogo = document.getElementById("footerLogo");
    if (footerLogo) footerLogo.src = src;

    // Hero logo — always white on video, use filter instead
    const heroLogo = document.getElementById("heroLogo");
    if (heroLogo) {
      heroLogo.src = darkLogo;
      heroLogo.style.filter = "brightness(0) invert(1)";
    }
  }

  /* ========================================
     LANGUAGE SYSTEM
     ======================================== */
  const languageSelector = document.getElementById("languageDropdown");
  let currentLanguage = localStorage.getItem("lang") || "es";

  const translationsPath = document.querySelector('script[data-translations-path]');
  const jsonPath = translationsPath ? translationsPath.dataset.translationsPath : "js/translations.json";

  fetch(jsonPath)
    .then(response => response.json())
    .then(translations => {
      document.querySelectorAll("[data-lang]").forEach(item => {
        item.addEventListener("click", (event) => {
          event.preventDefault();
          const selected = event.target.closest("[data-lang]").dataset.lang;

          if (selected && selected !== currentLanguage) {
            currentLanguage = selected;
            localStorage.setItem("lang", currentLanguage);
            applyTranslations(translations[currentLanguage]);

            languageSelector.querySelector("img").src = selected === "es"
              ? "https://flagcdn.com/w40/ar.png"
              : "https://flagcdn.com/w40/us.png";
            languageSelector.querySelector("span").textContent = translations[currentLanguage].language;
          }
        });
      });

      // Set initial flag/text based on current language
      if (languageSelector) {
        languageSelector.querySelector("img").src = currentLanguage === "es"
          ? "https://flagcdn.com/w40/ar.png"
          : "https://flagcdn.com/w40/us.png";
        languageSelector.querySelector("span").textContent = currentLanguage === "es" ? "ES" : "EN";
      }

      applyTranslations(translations[currentLanguage]);
    })
    .catch(error => console.error("Error loading translations:", error));

  function applyTranslations(texts) {
    document.querySelectorAll("[data-translate]").forEach(el => {
      const key = el.getAttribute("data-translate");
      if (texts[key]) {
        el.textContent = texts[key];
      }
    });
  }

  /* ========================================
     PRODUCTS CAROUSEL
     ======================================== */
  const track = document.querySelector(".carousel-track");
  const cards = track ? Array.from(track.children) : [];
  const prevBtn = document.getElementById("carouselPrev");
  const nextBtn = document.getElementById("carouselNext");
  const dotsContainer = document.getElementById("carouselDots");

  if (track && cards.length > 0) {
    let currentIndex = 0;
    let cardsPerView = getCardsPerView();
    let totalPages = Math.ceil(cards.length / cardsPerView);

    // Build dots
    function buildDots() {
      dotsContainer.innerHTML = "";
      for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement("span");
        dot.classList.add("carousel-dot");
        if (i === 0) dot.classList.add("active");
        dot.addEventListener("click", () => goToPage(i));
        dotsContainer.appendChild(dot);
      }
    }

    function getCardsPerView() {
      const w = window.innerWidth;
      if (w <= 400) return 1;
      if (w <= 767) return 1;
      if (w <= 991) return 2;
      return 3;
    }

    function getCardWidth() {
      const gap = 24;
      const containerWidth = track.parentElement.offsetWidth;
      return (containerWidth - gap * (cardsPerView - 1)) / cardsPerView + gap;
    }

    function goToPage(page) {
      const maxPage = Math.max(0, cards.length - cardsPerView);
      const targetIndex = Math.min(page * cardsPerView, maxPage);
      currentIndex = page;

      const offset = targetIndex * getCardWidth();
      track.style.transform = `translateX(-${offset}px)`;

      // Update dots
      dotsContainer.querySelectorAll(".carousel-dot").forEach((dot, i) => {
        dot.classList.toggle("active", i === currentIndex);
      });
    }

    function next() {
      currentIndex = currentIndex < totalPages - 1 ? currentIndex + 1 : 0;
      goToPage(currentIndex);
    }

    function prev() {
      currentIndex = currentIndex > 0 ? currentIndex - 1 : totalPages - 1;
      goToPage(currentIndex);
    }

    prevBtn.addEventListener("click", prev);
    nextBtn.addEventListener("click", next);

    // Swipe support
    let startX = 0;
    let isDragging = false;

    track.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    }, { passive: true });

    track.addEventListener("touchend", (e) => {
      if (!isDragging) return;
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? next() : prev();
      }
      isDragging = false;
    }, { passive: true });

    // Mouse drag support
    track.addEventListener("mousedown", (e) => {
      startX = e.clientX;
      isDragging = true;
      e.preventDefault();
    });

    document.addEventListener("mouseup", (e) => {
      if (!isDragging) return;
      const diff = startX - e.clientX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? next() : prev();
      }
      isDragging = false;
    });

    // Recalculate on resize
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        cardsPerView = getCardsPerView();
        totalPages = Math.ceil(cards.length / cardsPerView);
        buildDots();
        goToPage(0);
      }, 200);
    });

    // Auto-play
    let autoPlay = setInterval(next, 5000);

    track.parentElement.parentElement.addEventListener("mouseenter", () => {
      clearInterval(autoPlay);
    });

    track.parentElement.parentElement.addEventListener("mouseleave", () => {
      autoPlay = setInterval(next, 5000);
    });

    // Init
    buildDots();
    goToPage(0);
  }

  /* ========================================
     BOOKING SERVICE SELECTOR + WHATSAPP
     ======================================== */
  const serviceCheckboxes = document.querySelectorAll('#serviceSelector input[type="checkbox"]');
  const bookingTotal = document.getElementById("bookingTotal");
  const waTani = document.getElementById("waTani");
  const waKaren = document.getElementById("waKaren");

  function getSelectedServices() {
    const selected = [];
    let total = 0;
    serviceCheckboxes.forEach(cb => {
      if (cb.checked) {
        selected.push(cb.value);
        total += parseInt(cb.dataset.price) || 0;
      }
    });
    return { selected, total };
  }

  function updateTotal() {
    const { total } = getSelectedServices();
    bookingTotal.textContent = `$${total.toLocaleString("es-AR")}`;
  }

  function buildWhatsAppUrl(professional) {
    const { selected, total } = getSelectedServices();
    let msg = `Hola! Quiero reservar un turno con ${professional}.`;
    if (selected.length > 0) {
      msg += `\n\nServicios seleccionados:\n`;
      selected.forEach(s => { msg += `• ${s}\n`; });
      msg += `\nTotal estimado: $${total.toLocaleString("es-AR")}`;
    }
    return `https://wa.me/543517890168?text=${encodeURIComponent(msg)}`;
  }

  serviceCheckboxes.forEach(cb => {
    cb.addEventListener("change", updateTotal);
  });

  if (waTani) {
    waTani.addEventListener("click", (e) => {
      e.preventDefault();
      window.open(buildWhatsAppUrl("Tani"), "_blank");
    });
  }

  if (waKaren) {
    waKaren.addEventListener("click", (e) => {
      e.preventDefault();
      window.open(buildWhatsAppUrl("Karen"), "_blank");
    });
  }

  /* ========================================
     SMOOTH SCROLL FOR NAV LINKS
     ======================================== */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", (e) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });

        // Close mobile nav if open
        const navCollapse = document.getElementById("navMenu");
        if (navCollapse && navCollapse.classList.contains("show")) {
          const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
          if (bsCollapse) bsCollapse.hide();
        }
      }
    });
  });
});
