function ready(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function initMobileMenu() {
  const button = document.querySelector('[data-mobile-menu-button]');
  const nav = document.querySelector('[data-mobile-nav]');
  if (!button || !nav) {
    return;
  }
  button.addEventListener('click', function () {
    nav.classList.toggle('is-open');
  });
}

function initSiteSearchForms() {
  document.querySelectorAll('[data-site-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const input = form.querySelector('input[name="q"]');
      const query = input ? input.value.trim() : '';
      const target = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
      window.location.href = target;
    });
  });
}

function initHeroCarousel() {
  const carousel = document.querySelector('[data-hero-carousel]');
  if (!carousel) {
    return;
  }

  const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
  const dots = Array.from(carousel.querySelectorAll('.hero-dot'));
  const thumbs = Array.from(carousel.querySelectorAll('.hero-thumb'));
  const prev = carousel.querySelector('[data-hero-prev]');
  const next = carousel.querySelector('[data-hero-next]');
  let current = 0;
  let timer = null;

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
    thumbs.forEach(function (thumb, thumbIndex) {
      thumb.classList.toggle('is-active', thumbIndex === current);
    });
  }

  function restart() {
    if (timer) {
      window.clearInterval(timer);
    }
    timer = window.setInterval(function () {
      show(current + 1);
    }, 5600);
  }

  dots.concat(thumbs).forEach(function (control) {
    control.addEventListener('click', function () {
      const index = Number(control.getAttribute('data-hero-index'));
      if (!Number.isNaN(index)) {
        show(index);
        restart();
      }
    });
  });

  if (prev) {
    prev.addEventListener('click', function () {
      show(current - 1);
      restart();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      show(current + 1);
      restart();
    });
  }

  if (slides.length > 1) {
    restart();
  }
}

function initMovieFilters() {
  const controls = document.querySelectorAll('[data-filter-target]');
  controls.forEach(function (control) {
    control.addEventListener('input', function () {
      applyFilter(control.getAttribute('data-filter-target'));
    });
    control.addEventListener('change', function () {
      applyFilter(control.getAttribute('data-filter-target'));
    });
  });
}

function applyFilter(targetId) {
  const list = document.getElementById(targetId);
  if (!list) {
    return;
  }

  const controls = document.querySelectorAll('[data-filter-target="' + targetId + '"]');
  let keyword = '';
  let region = '';

  controls.forEach(function (control) {
    if (control.matches('input')) {
      keyword = control.value.trim().toLowerCase();
    }
    if (control.matches('select')) {
      region = control.value.trim().toLowerCase();
    }
  });

  list.querySelectorAll('.movie-card').forEach(function (card) {
    const haystack = [
      card.getAttribute('data-title'),
      card.getAttribute('data-year'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-genre')
    ].join(' ').toLowerCase();
    const matchKeyword = !keyword || haystack.includes(keyword);
    const matchRegion = !region || String(card.getAttribute('data-region')).toLowerCase() === region;
    card.style.display = matchKeyword && matchRegion ? '' : 'none';
  });
}

function initSearchPage() {
  const form = document.getElementById('search-page-form');
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');
  const summary = document.getElementById('search-summary');
  if (!form || !input || !results || !summary || !window.SEARCH_MOVIES) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';
  input.value = initialQuery;

  function cardTemplate(movie) {
    const tags = movie.tags.slice(0, 2).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '<a class="movie-card" href="' + escapeHtml(movie.url) + '" data-title="' + escapeHtml(movie.title) + '" data-year="' + escapeHtml(movie.year) + '" data-region="' + escapeHtml(movie.region) + '" data-type="' + escapeHtml(movie.type) + '" data-genre="' + escapeHtml(movie.genre) + '">' +
      '<span class="poster-frame">' +
        '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
        '<span class="play-circle">▶</span>' +
        '<span class="year-badge">' + escapeHtml(movie.year) + '</span>' +
      '</span>' +
      '<span class="movie-card-body">' +
        '<strong>' + escapeHtml(movie.title) + '</strong>' +
        '<em>' + escapeHtml(movie.oneLine) + '</em>' +
        '<span class="movie-meta"><b>' + escapeHtml(movie.region) + '</b><b>' + escapeHtml(movie.type) + '</b><b>' + escapeHtml(movie.genre) + '</b></span>' +
        '<span class="tag-row">' + tags + '</span>' +
      '</span>' +
    '</a>';
  }

  function render(query) {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      summary.textContent = '热门推荐';
      return;
    }

    const matched = window.SEARCH_MOVIES.filter(function (movie) {
      return [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.tags.join(' '), movie.oneLine]
        .join(' ')
        .toLowerCase()
        .includes(normalized);
    }).slice(0, 96);

    if (!matched.length) {
      summary.textContent = '没有匹配影片';
      results.innerHTML = '';
      return;
    }

    summary.textContent = '搜索结果';
    results.innerHTML = matched.map(cardTemplate).join('');
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const query = input.value.trim();
    const url = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
    window.history.replaceState({}, '', url);
    render(query);
  });

  input.addEventListener('input', function () {
    render(input.value);
  });

  render(initialQuery);
}

ready(function () {
  initMobileMenu();
  initSiteSearchForms();
  initHeroCarousel();
  initMovieFilters();
  initSearchPage();
});
