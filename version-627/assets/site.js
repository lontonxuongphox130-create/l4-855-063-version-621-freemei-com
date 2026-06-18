(function () {
  const menuButton = document.querySelector("[data-menu-button]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("open");
    });
  }

  const carousel = document.querySelector("[data-hero-carousel]");
  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
    let current = 0;
    let timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  const searchInputs = Array.from(document.querySelectorAll(".site-search"));
  const cards = Array.from(document.querySelectorAll("[data-card]"));
  const filterButtons = Array.from(document.querySelectorAll(".filter-button"));
  const emptyState = document.querySelector("[data-empty-state]");
  let activeFilter = "all";

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function applyFilters() {
    const query = normalize(searchInputs.map(function (input) {
      return input.value;
    }).find(Boolean));
    let visible = 0;

    cards.forEach(function (card) {
      const searchText = normalize(card.getAttribute("data-search"));
      const typeText = normalize(card.getAttribute("data-type"));
      const yearText = normalize(card.getAttribute("data-year"));
      const matchesSearch = !query || searchText.indexOf(query) !== -1;
      const matchesFilter = activeFilter === "all" || typeText.indexOf(normalize(activeFilter)) !== -1 || yearText === activeFilter;
      const show = matchesSearch && matchesFilter;
      card.classList.toggle("hidden", !show);
      if (show) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle("show", visible === 0 && cards.length > 0);
    }
  }

  searchInputs.forEach(function (input) {
    input.addEventListener("input", applyFilters);
  });

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      filterButtons.forEach(function (item) {
        item.classList.remove("active");
      });
      button.classList.add("active");
      activeFilter = button.getAttribute("data-filter") || "all";
      applyFilters();
    });
  });
})();
