(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      if (!slides.length) {
        return;
      }
      var current = 0;
      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === current);
        });
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
        });
      });
      if (slides.length > 1) {
        setInterval(function () {
          show(current + 1);
        }, 5200);
      }
      show(0);
    });

    var input = document.querySelector("[data-search-input]");
    var year = document.querySelector("[data-search-year]");
    var region = document.querySelector("[data-search-region]");
    var empty = document.querySelector("[data-empty-state]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    function filterCards() {
      if (!cards.length) {
        return;
      }
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var yearValue = year ? year.value : "";
      var regionValue = region ? region.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var searchText = (card.getAttribute("data-search-text") || "").toLowerCase();
        var cardYear = card.getAttribute("data-year") || "";
        var cardRegion = card.getAttribute("data-region") || "";
        var matched = true;
        if (keyword && searchText.indexOf(keyword) === -1) {
          matched = false;
        }
        if (yearValue && cardYear !== yearValue) {
          matched = false;
        }
        if (regionValue && cardRegion.indexOf(regionValue) === -1) {
          matched = false;
        }
        card.classList.toggle("hidden", !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-active", visible === 0);
      }
    }
    [input, year, region].forEach(function (control) {
      if (control) {
        control.addEventListener("input", filterCards);
        control.addEventListener("change", filterCards);
      }
    });
  });
})();
