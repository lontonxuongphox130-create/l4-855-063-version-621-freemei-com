(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function attach(video, streamUrl) {
    if (!video || !streamUrl || video.dataset.ready === "1") {
      return;
    }
    video.dataset.ready = "1";
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      video._hls = hls;
      return;
    }
    video.src = streamUrl;
  }

  function start(video, overlay) {
    var streamUrl = video.getAttribute("data-stream");
    attach(video, streamUrl);
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    var promise = video.play();
    if (promise && promise.catch) {
      promise.catch(function () {
        video.addEventListener("canplay", function () {
          video.play();
        }, { once: true });
      });
    }
  }

  ready(function () {
    document.querySelectorAll("video[data-player]").forEach(function (video) {
      var overlay = document.querySelector('[data-play-target="' + video.id + '"]');
      if (overlay) {
        overlay.addEventListener("click", function () {
          start(video, overlay);
        });
      }
      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });
      video.addEventListener("ended", function () {
        if (overlay) {
          overlay.classList.remove("is-hidden");
        }
      });
    });
  });
})();
