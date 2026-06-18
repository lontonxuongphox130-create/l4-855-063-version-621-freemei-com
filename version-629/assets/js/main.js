(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var expanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!expanded));
      mobileNav.hidden = expanded;
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var currentSlide = 0;
  function showSlide(index) {
    if (!slides.length) return;
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === currentSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === currentSlide);
    });
  }
  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });
  if (slides.length > 1) {
    setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5800);
  }

  var searchInput = document.querySelector('[data-filter-search]');
  var categorySelect = document.querySelector('[data-filter-category]');
  var yearSelect = document.querySelector('[data-filter-year]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var noResult = document.querySelector('[data-no-result]');
  function runFilter() {
    if (!cards.length) return;
    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var category = categorySelect ? categorySelect.value : '';
    var year = yearSelect ? yearSelect.value : '';
    var visible = 0;
    cards.forEach(function (card) {
      var text = (card.getAttribute('data-search') || '').toLowerCase();
      var cardCategory = card.getAttribute('data-category') || '';
      var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchCategory = !category || cardCategory === category;
      var matchYear = !year || text.indexOf(year) !== -1;
      var shouldShow = matchKeyword && matchCategory && matchYear;
      card.style.display = shouldShow ? '' : 'none';
      if (shouldShow) visible += 1;
    });
    if (noResult) {
      noResult.style.display = visible ? 'none' : 'block';
    }
  }
  [searchInput, categorySelect, yearSelect].forEach(function (control) {
    if (control) control.addEventListener('input', runFilter);
  });

  window.initMoviePlayer = function (src) {
    var video = document.getElementById('movie-video');
    var button = document.querySelector('.play-overlay');
    if (!video || !src) return;
    function attach() {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (!data || !data.fatal) return;
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          }
        });
      } else {
        video.src = src;
      }
    }
    function play() {
      attach();
      if (button) button.classList.add('hidden');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (button) button.classList.remove('hidden');
        });
      }
    }
    if (button) {
      button.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });
  };
})();
