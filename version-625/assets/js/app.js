(function () {
  function setActiveNav() {
    var file = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('[data-nav-link]').forEach(function (link) {
      var href = link.getAttribute('href') || '';
      if (href.replace('./', '') === file) {
        link.classList.add('is-active');
      }
      if (file.indexOf('category-') === 0 && href.indexOf('categories.html') > -1) {
        link.classList.add('is-active');
      }
      if (file.indexOf('movie-') === 0 && href.indexOf('categories.html') > -1) {
        link.classList.add('is-active');
      }
    });
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var thumbs = Array.prototype.slice.call(document.querySelectorAll('[data-hero-thumb]'));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle('is-active', i === current);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    thumbs.forEach(function (thumb, i) {
      thumb.addEventListener('click', function () {
        window.clearInterval(timer);
        show(i);
        start();
      });
    });
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initFilters() {
    var list = document.querySelector('[data-filter-list]');
    if (!list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));
    var input = document.querySelector('[data-search-input]');
    var year = document.querySelector('[data-year-filter]');
    var region = document.querySelector('[data-region-filter]');
    var empty = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(location.search);
    if (input && params.get('q')) {
      input.value = params.get('q');
    }
    function apply() {
      var q = normalize(input && input.value);
      var yearValue = normalize(year && year.value);
      var regionValue = normalize(region && region.value);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year')
        ].join(' '));
        var ok = true;
        if (q && haystack.indexOf(q) === -1) {
          ok = false;
        }
        if (yearValue && normalize(card.getAttribute('data-year')) !== yearValue) {
          ok = false;
        }
        if (regionValue && normalize(card.getAttribute('data-region')) !== regionValue) {
          ok = false;
        }
        card.classList.toggle('hidden-card', !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }
    [input, year, region].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
    apply();
  }

  function initQuickSearch() {
    document.querySelectorAll('[data-quick-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input');
        var query = input ? input.value.trim() : '';
        location.href = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
      });
    });
  }

  setActiveNav();
  initMenu();
  initHero();
  initFilters();
  initQuickSearch();
})();
