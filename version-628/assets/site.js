(function() {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-main-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function() {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function() {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        var index = Number(dot.getAttribute("data-hero-dot") || 0);
        show(index);
        start();
      });
    });

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
    }
    show(0);
    start();
  }

  function initSearch() {
    var input = document.querySelector(".search-input");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-grid .movie-card"));
    if (!input || !cards.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (initial) {
      input.value = initial;
    }

    function filter() {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function(card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-region")
        ].join(" ").toLowerCase();
        card.classList.toggle("is-hidden", query && text.indexOf(query) === -1);
      });
    }

    input.addEventListener("input", filter);
    filter();
  }

  function initPlayer(videoId, source) {
    var video = document.getElementById(videoId);
    var button = document.querySelector('[data-play-button="' + videoId + '"]');
    if (!video || !source) {
      return;
    }

    var attached = false;
    var hlsInstance = null;

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      attach();
      if (button) {
        button.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function() {});
      }
    }

    if (button) {
      button.addEventListener("click", play);
    }

    video.addEventListener("click", function() {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener("play", function() {
      if (button) {
        button.classList.add("is-hidden");
      }
    });

    window.addEventListener("beforeunload", function() {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.MovieSite = {
    initPlayer: initPlayer
  };

  ready(function() {
    initMenu();
    initHero();
    initSearch();
  });
})();
