(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('is-active', current === activeIndex);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('active', current === activeIndex);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(activeIndex - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(activeIndex + 1);
        restart();
      });
    }

    showSlide(0);
    restart();
  }

  var searchInput = document.querySelector('[data-search-input]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var emptyState = document.querySelector('[data-empty-state]');
  var clearButton = document.querySelector('[data-clear-search]');
  var filterPills = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
  var activeFilter = '';

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilters() {
    var query = normalize(searchInput ? searchInput.value : '');
    var visibleCount = 0;

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-search-text'));
      var matchQuery = !query || text.indexOf(query) !== -1;
      var matchFilter = !activeFilter || text.indexOf(normalize(activeFilter)) !== -1;
      var visible = matchQuery && matchFilter;
      card.hidden = !visible;
      if (visible) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visibleCount !== 0;
    }
  }

  if (searchInput && cards.length) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query) {
      searchInput.value = query;
    }
    searchInput.addEventListener('input', applyFilters);
    applyFilters();
  }

  if (clearButton && searchInput) {
    clearButton.addEventListener('click', function () {
      searchInput.value = '';
      activeFilter = '';
      filterPills.forEach(function (pill) {
        pill.classList.toggle('active', pill.getAttribute('data-filter-value') === '');
      });
      applyFilters();
      searchInput.focus();
    });
  }

  filterPills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      activeFilter = pill.getAttribute('data-filter-value') || '';
      filterPills.forEach(function (item) {
        item.classList.toggle('active', item === pill);
      });
      applyFilters();
    });
  });
})();
