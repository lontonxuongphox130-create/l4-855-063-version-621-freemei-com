
(function() {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function() {
    var toggle = document.querySelector(".menu-toggle");
    var links = document.querySelector(".nav-links");
    if (toggle && links) {
      toggle.addEventListener("click", function() {
        var open = links.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(open));
      });
    }

    var carousel = document.querySelector("[data-hero-carousel]");
    if (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
      var prev = carousel.querySelector("[data-hero-prev]");
      var next = carousel.querySelector("[data-hero-next]");
      var current = 0;
      var timer;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function(slide, i) {
          slide.classList.toggle("is-active", i === current);
        });
        dots.forEach(function(dot, i) {
          dot.classList.toggle("is-active", i === current);
        });
      }

      function auto() {
        window.clearInterval(timer);
        timer = window.setInterval(function() {
          show(current + 1);
        }, 5200);
      }

      if (prev) {
        prev.addEventListener("click", function() {
          show(current - 1);
          auto();
        });
      }
      if (next) {
        next.addEventListener("click", function() {
          show(current + 1);
          auto();
        });
      }
      dots.forEach(function(dot) {
        dot.addEventListener("click", function() {
          show(Number(dot.getAttribute("data-slide")) || 0);
          auto();
        });
      });
      show(0);
      auto();
    }

    var input = document.getElementById("movieSearch");
    var year = document.getElementById("yearFilter");
    var category = document.getElementById("categoryFilter");
    var reset = document.getElementById("resetFilters");
    var results = document.getElementById("searchResults");
    var empty = document.getElementById("emptyState");

    if (input && results) {
      var cards = Array.prototype.slice.call(results.querySelectorAll(".movie-card"));
      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q");
      if (initial) {
        input.value = initial;
      }

      function filter() {
        var q = input.value.trim().toLowerCase();
        var y = year ? year.value : "";
        var c = category ? category.value : "";
        var visible = 0;
        cards.forEach(function(card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var matchText = !q || text.indexOf(q) !== -1;
          var matchYear = !y || card.getAttribute("data-year") === y;
          var matchCategory = !c || card.getAttribute("data-category") === c;
          var showCard = matchText && matchYear && matchCategory;
          card.style.display = showCard ? "" : "none";
          if (showCard) {
            visible += 1;
          }
        });
        if (empty) {
          empty.style.display = visible ? "none" : "block";
        }
      }

      input.addEventListener("input", filter);
      if (year) {
        year.addEventListener("change", filter);
      }
      if (category) {
        category.addEventListener("change", filter);
      }
      if (reset) {
        reset.addEventListener("click", function() {
          input.value = "";
          if (year) {
            year.value = "";
          }
          if (category) {
            category.value = "";
          }
          filter();
        });
      }
      filter();
    }
  });
})();

function initMoviePlayer(source) {
  var video = document.getElementById("videoPlayer");
  var cover = document.getElementById("playerCover");
  if (!video || !source) {
    return;
  }

  function hideCover() {
    if (cover) {
      cover.classList.add("is-hidden");
    }
  }

  function playVideo() {
    hideCover();
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function() {
        if (cover) {
          cover.classList.remove("is-hidden");
        }
      });
    }
  }

  if (window.Hls && window.Hls.isSupported()) {
    var hls = new window.Hls({
      enableWorker: true,
      lowLatencyMode: true
    });
    hls.loadSource(source);
    hls.attachMedia(video);
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = source;
  }

  if (cover) {
    cover.addEventListener("click", playVideo);
  }
  video.addEventListener("playing", hideCover);
  video.addEventListener("click", function() {
    if (video.paused) {
      playVideo();
    }
  });
}
