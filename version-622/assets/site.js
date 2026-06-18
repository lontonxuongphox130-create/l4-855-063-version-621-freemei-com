(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initMobileMenu() {
    var toggle = $('[data-menu-toggle]');
    var menu = $('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = $('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = $$('[data-hero-slide]', hero);
    var dots = $$('[data-hero-dot]', hero);
    var thumbs = $$('[data-hero-thumb]', hero);
    var active = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle('is-active', thumbIndex === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('mouseenter', function () {
        show(Number(thumb.getAttribute('data-hero-thumb')) || 0);
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initImageFallback() {
    $$('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-missing');
        image.removeAttribute('srcset');
      }, { once: true });
    });
  }

  function initFilters() {
    $$('[data-filter-panel]').forEach(function (panel) {
      var input = $('[data-filter-input]', panel);
      var region = $('[data-filter-region]', panel);
      var type = $('[data-filter-type]', panel);
      var year = $('[data-filter-year]', panel);
      var reset = $('[data-filter-reset]', panel);
      var count = $('[data-filter-count]', panel);
      var cards = $$('.movie-card');
      var querySync = input && input.hasAttribute('data-query-sync');

      function apply() {
        var q = normalize(input && input.value);
        var selectedRegion = region ? region.value : '全部';
        var selectedType = type ? type.value : '全部';
        var selectedYear = year ? year.value : '全部';
        var shown = 0;

        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute('data-search'));
          var cardRegion = card.getAttribute('data-region') || '';
          var cardType = card.getAttribute('data-type') || '';
          var cardYear = card.getAttribute('data-year') || '';
          var matchQuery = !q || haystack.indexOf(q) !== -1;
          var matchRegion = selectedRegion === '全部' || selectedRegion === cardRegion;
          var matchType = selectedType === '全部' || selectedType === cardType;
          var matchYear = selectedYear === '全部' || selectedYear === cardYear;
          var visible = matchQuery && matchRegion && matchType && matchYear;
          card.classList.toggle('is-hidden-by-filter', !visible);
          if (visible) {
            shown += 1;
          }
        });

        if (count) {
          count.textContent = String(shown);
        }

        if (querySync && window.history && window.URLSearchParams) {
          var params = new URLSearchParams(window.location.search);
          if (q) {
            params.set('q', input.value.trim());
          } else {
            params.delete('q');
          }
          var next = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
          window.history.replaceState(null, '', next);
        }
      }

      if (input && window.URLSearchParams && input.hasAttribute('data-query-sync')) {
        var params = new URLSearchParams(window.location.search);
        var fromQuery = params.get('q');
        if (fromQuery) {
          input.value = fromQuery;
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      [region, type, year].forEach(function (select) {
        if (select) {
          select.addEventListener('change', apply);
        }
      });
      if (reset) {
        reset.addEventListener('click', function () {
          if (input) {
            input.value = '';
          }
          [region, type, year].forEach(function (select) {
            if (select) {
              select.value = '全部';
            }
          });
          apply();
        });
      }
      $$('[data-search-tag]', panel).forEach(function (button) {
        button.addEventListener('click', function () {
          if (input) {
            input.value = button.getAttribute('data-search-tag') || '';
          }
          apply();
          input && input.focus();
        });
      });
      var submit = $('[data-filter-submit]', panel);
      if (submit) {
        submit.addEventListener('click', apply);
      }
      apply();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHero();
    initImageFallback();
    initFilters();
  });
})();
