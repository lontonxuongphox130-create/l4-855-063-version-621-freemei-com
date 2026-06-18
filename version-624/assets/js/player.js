(function () {
  var shells = Array.prototype.slice.call(document.querySelectorAll('.video-shell'));
  var Hls = window.Hls;

  shells.forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.play-overlay');
    var src = shell.getAttribute('data-video-src');
    var hls = null;

    function loadVideo() {
      if (!video || !src || video.getAttribute('data-loaded') === 'true') {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }

      video.setAttribute('data-loaded', 'true');
    }

    function playVideo() {
      loadVideo();
      if (!video) {
        return;
      }
      shell.classList.add('is-playing');
      if (button) {
        button.hidden = true;
      }
      var request = video.play();
      if (request && typeof request.catch === 'function') {
        request.catch(function () {
          if (button) {
            button.hidden = false;
          }
          shell.classList.remove('is-playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener('play', function () {
        if (button) {
          button.hidden = true;
        }
      });
      video.addEventListener('pause', function () {
        if (!video.ended && button) {
          button.hidden = false;
        }
      });
      window.addEventListener('pagehide', function () {
        if (hls && typeof hls.destroy === 'function') {
          hls.destroy();
        }
      });
    }
  });
})();
