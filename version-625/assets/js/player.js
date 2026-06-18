(function () {
  function setupMoviePlayer(source) {
    var shell = document.querySelector('[data-player]');
    if (!shell || !source) {
      return;
    }
    var video = shell.querySelector('video');
    var overlay = shell.querySelector('.play-overlay');
    var ready = false;
    function attach() {
      if (ready) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        video.src = source;
      }
    }
    function play() {
      attach();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      video.controls = true;
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }
    if (overlay) {
      overlay.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (!ready || video.paused) {
        play();
      }
    });
  }
  window.setupMoviePlayer = setupMoviePlayer;
})();
