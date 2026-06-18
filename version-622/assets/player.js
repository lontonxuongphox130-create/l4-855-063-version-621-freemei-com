async function loadHlsClass() {
  if (window.Hls) {
    return window.Hls;
  }
  var module = await import('./hls-vendor.js');
  return module.H;
}

function canPlayNativeHls(video) {
  return video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL');
}

async function attachSource(video, source, state) {
  if (canPlayNativeHls(video)) {
    video.src = source;
    return null;
  }

  var Hls = await loadHlsClass();
  if (!Hls || !Hls.isSupported()) {
    video.src = source;
    return null;
  }

  var hls = new Hls({
    enableWorker: true,
    lowLatencyMode: true,
    backBufferLength: 60
  });

  hls.loadSource(source);
  hls.attachMedia(video);
  hls.on(Hls.Events.ERROR, function (_event, data) {
    if (!data || !data.fatal) {
      return;
    }

    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
      state.textContent = '播放源网络异常，正在尝试恢复。';
      hls.startLoad();
      return;
    }

    if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
      state.textContent = '媒体解码异常，正在尝试恢复。';
      hls.recoverMediaError();
      return;
    }

    state.textContent = '当前播放源暂时无法加载，请稍后重试。';
    hls.destroy();
  });

  return hls;
}

function initPlayer(wrapper) {
  var video = wrapper.querySelector('video');
  var start = wrapper.querySelector('.player-start');
  var state = wrapper.querySelector('.player-state');
  if (!video || !start || !state) {
    return;
  }

  var source = video.getAttribute('data-src');
  var fallback = video.getAttribute('data-fallback');
  var started = false;
  var hlsInstance = null;

  async function play() {
    if (!source) {
      state.textContent = '未找到播放源。';
      return;
    }

    start.classList.add('is-hidden');
    video.setAttribute('controls', 'controls');
    state.textContent = '正在加载播放源…';

    try {
      if (!started) {
        hlsInstance = await attachSource(video, source, state);
        started = true;
      }
      await video.play();
      state.textContent = '正在播放。';
    } catch (error) {
      if (fallback && fallback !== source) {
        try {
          if (hlsInstance && typeof hlsInstance.destroy === 'function') {
            hlsInstance.destroy();
          }
          video.removeAttribute('src');
          video.load();
          hlsInstance = await attachSource(video, fallback, state);
          await video.play();
          state.textContent = '已切换备用播放源。';
          return;
        } catch (fallbackError) {
          state.textContent = '播放被浏览器阻止或播放源不可用，请再次点击播放。';
        }
      } else {
        state.textContent = '播放被浏览器阻止或播放源不可用，请再次点击播放。';
      }
      start.classList.remove('is-hidden');
    }
  }

  start.addEventListener('click', play);
  video.addEventListener('play', function () {
    start.classList.add('is-hidden');
  });
  video.addEventListener('pause', function () {
    if (video.currentTime === 0 || video.ended) {
      start.classList.remove('is-hidden');
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-player]').forEach(initPlayer);
});
