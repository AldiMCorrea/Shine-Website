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

    const navLogo = document.getElementById("navLogo");
    if (navLogo) navLogo.src = src;

    const footerLogo = document.getElementById("footerLogo");
    if (footerLogo) footerLogo.src = src;

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
            if (window.servicesData) renderAllFromJSON(window.servicesData);

            languageSelector.querySelector("img").src = selected === "es"
              ? "https://flagcdn.com/w40/ar.png"
              : "https://flagcdn.com/w40/us.png";
            languageSelector.querySelector("span").textContent = translations[currentLanguage].language;
          }
        });
      });

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
        if (el.children.length > 0) {
          // Save child elements, clear everything, re-insert
          const children = Array.from(el.children);
          el.textContent = texts[key];
          children.forEach(child => {
            if (child.classList.contains('coming-soon-badge')) {
              el.append(document.createTextNode(" "));
              el.append(child);
            } else {
              el.prepend(child);
            }
          });
        } else {
          el.textContent = texts[key];
        }
      }
    });
  }

  /* ========================================
     LOAD SERVICES FROM JSON DATABASE
     ======================================== */
  const isEn = () => currentLanguage === "en";
  const fmt = (n) => `$${n.toLocaleString("es-AR")}`;

  fetch("data/services.json")
    .then(r => r.json())
    .then(data => {
      window.servicesData = data;
      renderAllFromJSON(data);
    })
    .catch(err => console.error("Error loading services:", err));

  function renderAllFromJSON(data) {
    renderServices(data);
    renderPromos(data);
    renderBookingSelector(data);
    renderInfoList(data);
  }

  /* ========================================
     RENDER SERVICES SECTION
     ======================================== */
  function renderServices(data) {
    const container = document.getElementById("servicesContainer");
    if (!container) return;

    let html = "";

    // --- NAILS: MANOS ---
    html += `<div class="services-category container">
      <h3 class="category-title"><i class="bi bi-brush"></i> ${isEn() ? "Nails - Hands" : "Uñas - Manos"}</h3>
      <div class="services-grid">`;
    data.nails.manos.forEach(s => {
      html += serviceCard(s);
    });
    html += `</div></div>`;

    // --- NAILS: PIES ---
    html += `<div class="services-category container">
      <h3 class="category-title"><i class="bi bi-brush"></i> ${isEn() ? "Nails - Feet" : "Uñas - Pies"}</h3>
      <div class="services-grid">`;
    data.nails.pies.forEach(s => {
      html += serviceCard(s);
    });
    html += `</div></div>`;

    // --- NAIL ART ---
    html += `<div class="services-category container">
      <h3 class="category-title"><i class="bi bi-palette"></i> Nail Art - ${isEn() ? "Decoration" : "Decoración"}</h3>
      <div class="nail-art-grid">`;
    data.nails.nail_art.forEach(s => {
      const prefix = s.from_price ? (isEn() ? "From " : "Desde ") : "";
      const suffix = s.per_unit ? (isEn() ? " each" : " c/u") : "";
      html += `<div class="glass-card nail-art-item">
        <span class="nail-art-name">${isEn() ? s.name_en : s.name}</span>
        <span class="nail-art-price">${prefix}${fmt(s.price)}${suffix}</span>
      </div>`;
    });
    html += `</div></div>`;

    // --- REMOCIÓN ---
    html += `<div class="services-category container">
      <h3 class="category-title"><i class="bi bi-arrow-repeat"></i> ${isEn() ? "Removal, Repairs & Service Change" : "Remoción, Arreglos o Cambio de Servicio"}</h3>
      <div class="nail-art-grid">`;
    data.nails.remocion.forEach(s => {
      html += `<div class="glass-card nail-art-item">
        <span class="nail-art-name">${isEn() ? s.name_en : s.name}</span>
        <span class="nail-art-price">${fmt(s.price)}</span>
      </div>`;
    });
    html += `</div></div>`;

    // --- FACIAL ---
    html += `<div class="services-category container">
      <h3 class="category-title"><i class="bi bi-droplet-half"></i> ${isEn() ? "Facial Treatments" : "Tratamientos Faciales"}</h3>
      <div class="services-grid">`;
    data.facial.forEach(s => {
      html += serviceCard(s);
    });
    html += `</div></div>`;

    // --- CEJAS & PESTAÑAS ---
    html += `<div class="services-category container">
      <h3 class="category-title"><i class="bi bi-eye"></i> ${isEn() ? "Eyebrows & Lashes" : "Cejas y Pestañas"}</h3>
      <div class="services-grid">`;
    data.cejas_pestanas.forEach(s => {
      html += serviceCard(s);
    });
    html += `</div></div>`;

    container.innerHTML = html;
  }

  function serviceCard(s) {
    const name = isEn() ? (s.name_en || s.name) : s.name;
    const desc = isEn() ? (s.description_en || s.description) : s.description;
    const premium = s.premium ? ' premium-service' : '';
    const premiumBadge = s.premium ? `<span class="premium-badge">${isEn() ? "COMPLETE TREATMENT" : "TRATAMIENTO COMPLETO"}</span>` : '';

    const posStyle = s.object_position ? ` style="object-position:${s.object_position}"` : '';
    const media = s.video
      ? `<video autoplay loop muted playsinline${posStyle}><source src="${s.image}" type="video/mp4"></video>`
      : `<img src="${s.image}" alt="${name}"${posStyle}>`;

    return `<div class="glass-card service-card has-image${premium}">
      <div class="service-img">${media}</div>
      <div class="service-body">
        ${premiumBadge}
        <h4 class="service-name">${name}</h4>
        <p class="service-desc">${desc}</p>
        <span class="service-price">${fmt(s.price)}</span>
      </div>
    </div>`;
  }

  /* ========================================
     RENDER PROMOS SECTION
     ======================================== */
  function renderPromos(data) {
    // Packs (Basic, Most Popular, Luxury)
    const packsContainer = document.getElementById("promosPacksContainer");
    if (packsContainer) {
      let html = "";
      data.promos_packs.forEach(pack => {
        const featured = pack.featured ? " featured" : "";
        const badge = pack.featured ? `<div class="pricing-badge">${isEn() ? "MOST POPULAR" : "MÁS POPULAR"}</div>` : "";
        const name = isEn() ? pack.name_en : pack.name;
        const desc = isEn() ? pack.description_en : pack.description;
        const price = pack.price ? fmt(pack.price) : (isEn() ? "Ask for price" : "Consultá precio");
        const btnClass = pack.featured ? "glass-btn btn-accent" : "glass-btn";

        // Split description into service list
        const services = desc.split(" + ");

        html += `<div class="glass-card pricing-card${featured}">
          ${badge}
          <div class="pricing-header">
            <h4 class="pricing-name">${name}</h4>
            <div class="pricing-price">${price}</div>
            <p class="pricing-period">${isEn() ? "cash / transfer" : "efectivo / transferencia"}</p>
          </div>
          <ul class="pricing-features">
            ${services.map(s => `<li><i class="bi bi-check-circle-fill"></i> <span>${s.trim()}</span></li>`).join("")}
          </ul>
          <a href="#booking" class="${btnClass}">${isEn() ? "BOOK NOW" : "RESERVAR"}</a>
        </div>`;
      });
      packsContainer.innerHTML = html;
    }

    // Individual combos
    const combosContainer = document.getElementById("promosCombosContainer");
    if (combosContainer) {
      let html = "";
      data.promos.forEach(promo => {
        const name = isEn() ? promo.name_en : promo.name;
        const desc = isEn() ? promo.description_en : promo.description;

        html += `<div class="glass-card promo-combo-card">
          <div class="promo-combo-info">
            <h5 class="promo-combo-name">${name}</h5>
            <p class="promo-combo-desc">${desc}</p>
          </div>
          <div class="promo-combo-price">${fmt(promo.price)}</div>
        </div>`;
      });
      combosContainer.innerHTML = html;
    }
  }

  /* ========================================
     RENDER BOOKING SELECTOR FROM JSON
     ======================================== */
  function renderBookingSelector(data) {
    const columns = document.getElementById("selectorColumns");
    if (!columns) return;

    const categories = [
      { key: "manos",    icon: "bi-hand-index-thumb", labelEs: "Manos",               labelEn: "Hands",              items: data.nails.manos },
      { key: "pies",     icon: "bi-footprints",       labelEs: "Pies",                labelEn: "Feet",               items: data.nails.pies },
      { key: "nailart",  icon: "bi-palette",          labelEs: "Nail Art",            labelEn: "Nail Art",           items: data.nails.nail_art },
      { key: "remocion", icon: "bi-arrow-repeat",     labelEs: "Remoción",            labelEn: "Removal",            items: data.nails.remocion },
      { key: "facial",   icon: "bi-droplet-half",     labelEs: "Tratamientos Faciales", labelEn: "Facial Treatments", items: data.facial },
      { key: "cejas",    icon: "bi-eye",              labelEs: "Cejas y Pestañas",    labelEn: "Eyebrows & Lashes",  items: data.cejas_pestanas },
      { key: "promos",   icon: "bi-tag",              labelEs: "Promos",              labelEn: "Promos",             items: data.promos },
      { key: "packs",    icon: "bi-box-seam",         labelEs: "Packs",               labelEn: "Packs",              items: data.promos_packs },
    ];

    let html = '<div class="glass-accordion" id="bookingAccordion">';

    categories.forEach((cat, i) => {
      const label = isEn() ? cat.labelEn : cat.labelEs;
      const collapseId = `collapse-${cat.key}`;
      const headerId = `header-${cat.key}`;

      let checkboxes = "";
      cat.items.forEach(s => { checkboxes += selectorCheckbox(s); });

      html += `
        <div class="accordion-item glass-accordion-item" data-category="${cat.key}">
          <h2 class="accordion-header" id="${headerId}">
            <button class="accordion-button glass-accordion-btn collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#${collapseId}"
                    aria-expanded="false"
                    aria-controls="${collapseId}">
              <i class="bi ${cat.icon} accordion-cat-icon"></i>
              <span class="accordion-cat-label">${label}</span>
              <span class="accordion-badge" id="badge-${cat.key}"></span>
            </button>
          </h2>
          <div id="${collapseId}" class="accordion-collapse collapse"
               aria-labelledby="${headerId}">
            <div class="accordion-body glass-accordion-body">
              ${checkboxes}
            </div>
          </div>
        </div>`;
    });

    html += '</div>';
    columns.innerHTML = html;

    // Re-bind checkbox events
    bindBookingEvents();
  }

  function selectorCheckbox(s) {
    const name = isEn() ? (s.name_en || s.name) : s.name;
    const perNail = s.per_nail ? (isEn() ? "/nail" : "/uña") : "";
    const fromPrefix = s.from_price ? (isEn() ? "From " : "Desde ") : "";
    const priceLabel = `${fromPrefix}${fmt(s.price)}${perNail}`;
    return `<label class="service-check">
      <input type="checkbox" name="service" value="${name} - ${priceLabel}" data-price="${s.price}">
      <span class="check-label"><span>${name}</span> <span class="check-price">${priceLabel}</span></span>
    </label>`;
  }

  /* ========================================
     RENDER INFO LIST (language-aware)
     ======================================== */
  function renderInfoList(data) {
    const list = document.getElementById("infoList");
    if (!list || !data.info_importante) return;

    const items = isEn() ? data.info_importante.en : data.info_importante.es;
    const icons = [
      "bi-cash-coin", "bi-clock", "bi-calendar-x", "bi-person-x",
      "bi-image", "bi-shop", "bi-percent", "bi-credit-card"
    ];

    list.innerHTML = items.map((text, i) =>
      `<li><i class="bi ${icons[i] || 'bi-info-circle'}"></i> <span>${text}</span></li>`
    ).join("");
  }

  /* ========================================
     BOOKING SERVICE SELECTOR + WHATSAPP
     ======================================== */
  const bookingTotal = document.getElementById("bookingTotal");
  const waTani = document.getElementById("waTani");
  const waKaren = document.getElementById("waKaren");

  function bindBookingEvents() {
    const checkboxes = document.querySelectorAll('#serviceSelector input[type="checkbox"]');
    checkboxes.forEach(cb => {
      cb.addEventListener("change", updateTotal);
    });
  }

  function getSelectedServices() {
    const checkboxes = document.querySelectorAll('#serviceSelector input[type="checkbox"]');
    const selected = [];
    let total = 0;
    checkboxes.forEach(cb => {
      if (cb.checked) {
        selected.push(cb.value);
        total += parseInt(cb.dataset.price) || 0;
      }
    });
    return { selected, total };
  }

  function updateTotal() {
    const { total } = getSelectedServices();
    if (bookingTotal) bookingTotal.textContent = fmt(total);

    // Update per-category badges
    document.querySelectorAll('.glass-accordion-item').forEach(item => {
      const key = item.dataset.category;
      const badge = document.getElementById(`badge-${key}`);
      if (!badge) return;

      const checks = item.querySelectorAll('input[type="checkbox"]');
      let count = 0, subtotal = 0;
      checks.forEach(cb => {
        if (cb.checked) {
          count++;
          subtotal += parseInt(cb.dataset.price) || 0;
        }
      });

      if (count > 0) {
        const label = isEn()
          ? `${count} selected - ${fmt(subtotal)}`
          : `${count} seleccionado${count > 1 ? "s" : ""} - ${fmt(subtotal)}`;
        badge.textContent = label;
        badge.classList.add("visible");
      } else {
        badge.textContent = "";
        badge.classList.remove("visible");
      }
    });
  }

  function buildWhatsAppUrl(professional) {
    const { selected, total } = getSelectedServices();
    let msg = `Hola! Quiero reservar un turno con ${professional}.`;
    if (selected.length > 0) {
      msg += `\n\nServicios seleccionados:\n`;
      selected.forEach(s => { msg += `\u2022 ${s}\n`; });
      msg += `\nTotal estimado: ${fmt(total)}`;
    }
    return `https://wa.me/543517890168?text=${encodeURIComponent(msg)}`;
  }

  if (waTani) {
    waTani.addEventListener("click", (e) => {
      e.preventDefault();
      window.open(buildWhatsAppUrl("Tania"), "_blank");
    });
  }

  if (waKaren) {
    waKaren.addEventListener("click", (e) => {
      e.preventDefault();
      window.open(buildWhatsAppUrl("Karen"), "_blank");
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

    let autoPlay = setInterval(next, 5000);

    track.parentElement.parentElement.addEventListener("mouseenter", () => {
      clearInterval(autoPlay);
    });

    track.parentElement.parentElement.addEventListener("mouseleave", () => {
      autoPlay = setInterval(next, 5000);
    });

    buildDots();
    goToPage(0);
  }

  /* ========================================
     COMING SOON MODAL (blocked sections)
     ======================================== */
  const comingSoonModal = new bootstrap.Modal(document.getElementById("comingSoonModal"));
  document.querySelectorAll(".coming-soon-link").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      comingSoonModal.show();
      // Close mobile nav if open
      const navCollapse = document.getElementById("navMenu");
      if (navCollapse && navCollapse.classList.contains("show")) {
        const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
        if (bsCollapse) bsCollapse.hide();
      }
    });
  });

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

        const navCollapse = document.getElementById("navMenu");
        if (navCollapse && navCollapse.classList.contains("show")) {
          const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
          if (bsCollapse) bsCollapse.hide();
        }
      }
    });
  });
});
