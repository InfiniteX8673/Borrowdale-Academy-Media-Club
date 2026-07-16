(() => {
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');

  // ── THEME TOGGLE ──
  if (themeToggle) {
    const applyTheme = (theme) => {
      const isDark = theme === 'dark';
      root.setAttribute('data-theme', isDark ? 'dark' : 'light');
      themeToggle.textContent = isDark ? '\u2600\uFE0F Light mode' : '\uD83C\uDF19 Dark mode';
    };
    applyTheme(localStorage.getItem('media-club-theme') || 'light');
    themeToggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      localStorage.setItem('media-club-theme', next);
      applyTheme(next);
    });
  }

  // ── MOBILE NAV ──
  const navToggle = document.querySelector('.nav-toggle');
  const siteNav = document.querySelector('.site-nav');
  if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = siteNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
    siteNav.querySelectorAll('a, button').forEach(link => {
      link.addEventListener('click', () => {
        siteNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ── FOOTER YEAR ──
  document.querySelectorAll('.year').forEach(el => { el.textContent = new Date().getFullYear(); });

  // ── BACK TO TOP ──
  const backBtn = document.getElementById('backToTop');
  if (backBtn) {
    window.addEventListener('scroll', () => backBtn.classList.toggle('visible', window.scrollY > 400), { passive: true });
    backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // ── SERVICE WORKER ──
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  // ── SCROLL ANIMATIONS (Intersection Observer) ──
  const animElements = document.querySelectorAll('.section, .card, .gallery-card, .video-card, .event-card, .magazine-card');
  if ('IntersectionObserver' in window && animElements.length > 0) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    animElements.forEach((el) => io.observe(el));
  }

  // ── ACTIVE NAV HIGHLIGHT ──
  const sections = document.querySelectorAll('main > section[id]');
  const navLinks = document.querySelectorAll('.site-nav a[href^="#"]');
  if (sections.length > 0 && navLinks.length > 0) {
    const highlightNav = () => {
      let current = '';
      sections.forEach((sec) => {
        const top = sec.offsetTop - 120;
        if (window.scrollY >= top) current = sec.id;
      });
      navLinks.forEach((link) => {
        link.classList.toggle('nav-active', link.getAttribute('href') === `#${current}`);
      });
    };
    window.addEventListener('scroll', highlightNav, { passive: true });
    highlightNav();
  }

  // ── CUSTOM VIDEO PLAYER ──
  const vp = document.getElementById('video-player');
  const vpEl = document.getElementById('video-player-el');
  const vpFrame = document.getElementById('video-player-frame');
  const vpTitle = document.getElementById('video-player-title');
  const vpClose = document.getElementById('video-player-close');
  const vpBackdrop = document.getElementById('video-player-backdrop');
  const vcWrap = document.getElementById('video-controls');
  const vcPlay = document.getElementById('vc-play');
  const vcTime = document.getElementById('vc-time');
  const vcProgressWrap = document.getElementById('vc-progress-wrap');
  const vcProgressFilled = document.getElementById('vc-progress-filled');
  const vcProgressHover = document.getElementById('vc-progress-hover');
  const vcSpeed = document.getElementById('vc-speed');
  const vcMute = document.getElementById('vc-mute');
  const vcVolume = document.getElementById('vc-volume');
  const vcFullscreen = document.getElementById('vc-fullscreen');
  const vpBigPlay = document.getElementById('vp-big-play');
  const vpSpinner = document.getElementById('vp-spinner');
  const vcProgressTooltip = document.getElementById('vc-progress-tooltip');
  const vcSkipBack = document.getElementById('vc-skip-back');
  const vcSkipFwd = document.getElementById('vc-skip-fwd');

  const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
  let speedIdx = 2;
  let isLocal = false;
  let hideTimer = null;
  let isBuffering = false;
  let lastClickTime = 0;
  let lastClickX = 0;

  function formatTime(s) {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  }

  function updatePlayIcon() {
    if (!vpEl) return;
    const playing = !vpEl.paused;
    vcPlay.innerHTML = playing
      ? '<svg viewBox="0 0 24 24" fill="currentColor" style="width:20px;height:20px"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="currentColor" style="width:20px;height:20px"><polygon points="6,3 20,12 6,21"/></svg>';
    vcPlay.setAttribute('aria-label', playing ? 'Pause' : 'Play');
  }

  function updateTimeDisplay() {
    if (!vpEl || !vcTime) return;
    vcTime.textContent = `${formatTime(vpEl.currentTime)} / ${formatTime(vpEl.duration)}`;
  }

  function updateProgress() {
    if (!vpEl || !vcProgressFilled) return;
    const pct = vpEl.duration ? (vpEl.currentTime / vpEl.duration) * 100 : 0;
    vcProgressFilled.style.width = `${pct}%`;
  }

  function updateVolumeIcon() {
    if (!vpEl || !vcMute) return;
    const muted = vpEl.muted || vpEl.volume === 0;
    vcMute.innerHTML = muted
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:20px;height:20px"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:20px;height:20px"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>';
  }

  function showControls() {
    if (vcWrap) vcWrap.style.opacity = '1';
    clearTimeout(hideTimer);
    if (vpEl && !vpEl.paused) {
      hideTimer = setTimeout(() => { if (vcWrap) vcWrap.style.opacity = ''; }, 3000);
    }
  }

  function updateVolumeGradient() {
    if (!vcVolume) return;
    const pct = vcVolume.value * 100;
    vcVolume.style.setProperty('--volume-pct', `${pct}%`);
  }

  function showBigPlay() {
    if (vpBigPlay && isLocal) vpBigPlay.classList.add('visible');
  }

  function hideBigPlay() {
    if (vpBigPlay) vpBigPlay.classList.remove('visible');
  }

  function updateBufferingState() {
    if (!vpSpinner || !vpEl) return;
    if (isBuffering && !vpEl.paused) {
      vpSpinner.classList.add('visible');
    } else {
      vpSpinner.classList.remove('visible');
    }
  }

  function showSeekRipple(dir, seconds) {
    const vpBody = vp ? vp.querySelector('.video-player-body') : null;
    if (!vpBody) return;
    const ripple = document.createElement('div');
    ripple.className = `vp-seek-ripple ${dir}`;
    const icon = dir === 'left'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>';
    ripple.innerHTML = `${icon}<span>${seconds}s</span>`;
    vpBody.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  }

  function updateProgressTooltip(e) {
    if (!vcProgressTooltip || !vpEl || !vpEl.duration) return;
    const rect = vcProgressWrap.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const time = pct * vpEl.duration;
    vcProgressTooltip.textContent = formatTime(time);
    vcProgressTooltip.style.left = `${pct * 100}%`;
  }

  function youtubeId(url) {
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=))([^&?#]+)/);
    return m ? m[1] : null;
  }

  function isLocalVideo(src) {
    return !src.includes('youtube.com') && !src.includes('youtu.be');
  }

  window.openVideoPlayer = function(video) {
    if (!vp) return;
    // If mini-player is playing the same video, stop it first
    if (mp && mp.classList.contains('visible') && mpEl && mpEl.src) {
      hideMiniPlayer();
    }
    vpTitle.textContent = video.title;
    isLocal = isLocalVideo(video.src);

    if (isLocal) {
      vpEl.style.display = '';
      vpFrame.style.display = 'none';
      vcWrap.style.display = '';
      vpEl.src = video.src;
      vpEl.load();
      updatePlayIcon();
      updateTimeDisplay();
      updateProgress();
      updateVolumeGradient();
      showBigPlay();
    } else {
      vpEl.style.display = 'none';
      vcWrap.style.display = 'none';
      vpFrame.style.display = '';
      vpFrame.src = video.src;
    }

    vp.classList.add('open');
    vp.ariaHidden = 'false';
    document.body.style.overflow = 'hidden';
    showControls();
  };

  window.closeVideoPlayer = function() {
    if (!vp) return;
    vp.classList.remove('open');
    vp.ariaHidden = 'true';
    if (isLocal) {
      vpEl.pause();
      vpEl.src = '';
    } else {
      vpFrame.src = '';
    }
    document.body.style.overflow = '';
    clearTimeout(hideTimer);
  };

  if (vpClose) vpClose.addEventListener('click', closeVideoPlayer);
  if (vpBackdrop) vpBackdrop.addEventListener('click', closeVideoPlayer);

  // Video events
  if (vpEl) {
    vpEl.addEventListener('play', () => { updatePlayIcon(); hideBigPlay(); });
    vpEl.addEventListener('pause', () => { updatePlayIcon(); showBigPlay(); });
    vpEl.addEventListener('ended', () => { updatePlayIcon(); showBigPlay(); });
    vpEl.addEventListener('timeupdate', () => { updateTimeDisplay(); updateProgress(); });
    vpEl.addEventListener('loadedmetadata', updateTimeDisplay);
    vpEl.addEventListener('volumechange', () => { updateVolumeIcon(); updateVolumeGradient(); });
    vpEl.addEventListener('mousemove', showControls);

    // Buffering detection
    vpEl.addEventListener('waiting', () => { isBuffering = true; updateBufferingState(); });
    vpEl.addEventListener('canplay', () => { isBuffering = false; updateBufferingState(); });
    vpEl.addEventListener('playing', () => { isBuffering = false; updateBufferingState(); });

    // Click: double-click to seek, single-click to play/pause
    vpEl.addEventListener('click', (e) => {
      const now = Date.now();
      const timeDiff = now - lastClickTime;
      const xDiff = Math.abs(e.clientX - lastClickX);

      if (timeDiff < 350 && xDiff < 40) {
        // Double-click: seek forward or backward
        const rect = vpEl.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const isLeft = clickX < rect.width / 2;
        const seekSec = 10;
        if (isLeft) {
          if (vpEl.duration) vpEl.currentTime = Math.max(0, vpEl.currentTime - seekSec);
          showSeekRipple('left', seekSec);
        } else {
          if (vpEl.duration) vpEl.currentTime = Math.min(vpEl.duration, vpEl.currentTime + seekSec);
          showSeekRipple('right', seekSec);
        }
        lastClickTime = 0;
      } else {
        // Single-click: play/pause
        if (vpEl.paused) vpEl.play(); else vpEl.pause();
        showControls();
        lastClickTime = now;
        lastClickX = e.clientX;
      }
    });
  }

  // Controls
  if (vcPlay) vcPlay.addEventListener('click', () => {
    if (!vpEl) return;
    if (vpEl.paused) vpEl.play(); else vpEl.pause();
  });

  if (vcProgressWrap) {
    const seekTo = (e) => {
      const rect = vcProgressWrap.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      if (vpEl && vpEl.duration) vpEl.currentTime = pct * vpEl.duration;
    };
    vcProgressWrap.addEventListener('click', seekTo);
    vcProgressWrap.addEventListener('mousemove', (e) => {
      const rect = vcProgressWrap.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      if (vcProgressHover) {
        vcProgressHover.style.left = '0';
        vcProgressHover.style.width = `${pct * 100}%`;
      }
      updateProgressTooltip(e);
    });
  }

  if (vcSpeed) vcSpeed.addEventListener('click', () => {
    if (!vpEl) return;
    speedIdx = (speedIdx + 1) % SPEEDS.length;
    vpEl.playbackRate = SPEEDS[speedIdx];
    vcSpeed.textContent = SPEEDS[speedIdx] === 1 ? '1x' : `${SPEEDS[speedIdx]}x`;
  });

  if (vcMute) vcMute.addEventListener('click', () => {
    if (!vpEl) return;
    vpEl.muted = !vpEl.muted;
    updateVolumeIcon();
  });

  if (vcVolume) vcVolume.addEventListener('input', () => {
    if (!vpEl) return;
    vpEl.volume = vcVolume.value;
    vpEl.muted = vpEl.volume === 0;
    updateVolumeIcon();
    updateVolumeGradient();
  });

  if (vcFullscreen) vcFullscreen.addEventListener('click', () => {
    const container = vp.querySelector('.video-player-body');
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen().catch(() => {});
    }
  });

  // ── SKIP FORWARD/BACKWARD ──
  if (vcSkipBack) vcSkipBack.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!vpEl || !vpEl.duration) return;
    vpEl.currentTime = Math.max(0, vpEl.currentTime - 10);
    showControls();
  });
  if (vcSkipFwd) vcSkipFwd.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!vpEl || !vpEl.duration) return;
    vpEl.currentTime = Math.min(vpEl.duration, vpEl.currentTime + 10);
    showControls();
  });

  // ── BIG PLAY BUTTON ──
  if (vpBigPlay) vpBigPlay.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!vpEl) return;
    vpEl.play().catch(() => {});
  });

  // ── PICTURE-IN-PICTURE BUTTON ──
  const vcPip = document.getElementById('vc-pip');
  if (vcPip && vpEl) {
    if ('pictureInPictureEnabled' in document) {
      vcPip.style.display = '';
      vcPip.addEventListener('click', async () => {
        try {
          if (document.pictureInPictureElement) {
            await document.exitPictureInPicture();
          } else if (vpEl.src) {
            await vpEl.requestPictureInPicture();
          }
        } catch (err) {
          console.warn('PiP failed:', err);
        }
      });
      vpEl.addEventListener('enterpictureinpicture', () => {
        vcPip.classList.add('pip-active');
      });
      vpEl.addEventListener('leavepictureinpicture', () => {
        vcPip.classList.remove('pip-active');
      });
    }
  }

  // ── FLOATING MINI-PLAYER ──
  const mp = document.getElementById('mini-player');
  const mpEl = document.getElementById('mini-player-el');
  const mpPlay = document.getElementById('mini-play');
  const mpExpand = document.getElementById('mini-expand');
  const mpClose = document.getElementById('mini-close');
  const mpTitle = document.getElementById('mini-title');
  const mpDrag = document.getElementById('mini-player-drag');
  let miniVideoSrc = '';
  let miniVideoTitle = '';

  function updateMiniPlayIcon() {
    if (!mpEl || !mpPlay) return;
    mpPlay.innerHTML = mpEl.paused
      ? '<svg viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px"><polygon points="6,3 20,12 6,21"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
    mpPlay.setAttribute('aria-label', mpEl.paused ? 'Play' : 'Pause');
  }

  function showMiniPlayer(src, title) {
    if (!mp || !mpEl) return;
    miniVideoSrc = src;
    miniVideoTitle = title;
    mpTitle.textContent = title;
    mpEl.src = src;
    mpEl.load();
    mpEl.play().catch(() => {});
    mp.classList.add('visible');
    mp.ariaHidden = 'false';
    document.body.classList.add('mini-player-active');
    updateMiniPlayIcon();
  }

  function hideMiniPlayer() {
    if (!mp || !mpEl) return;
    mp.classList.remove('visible');
    mp.ariaHidden = 'true';
    document.body.classList.remove('mini-player-active');
    mpEl.pause();
    mpEl.src = '';
    miniVideoSrc = '';
    miniVideoTitle = '';
  }

  function expandToFullPlayer() {
    if (!miniVideoSrc) return;
    const video = { src: miniVideoSrc, title: miniVideoTitle };
    hideMiniPlayer();
    window.openVideoPlayer(video);
  }

  if (mpPlay) mpPlay.addEventListener('click', () => {
    if (!mpEl) return;
    if (mpEl.paused) mpEl.play(); else mpEl.pause();
  });

  if (mpExpand) mpExpand.addEventListener('click', expandToFullPlayer);
  if (mpClose) mpClose.addEventListener('click', hideMiniPlayer);

  if (mpEl) {
    mpEl.addEventListener('play', updateMiniPlayIcon);
    mpEl.addEventListener('pause', updateMiniPlayIcon);
  }

  // Drag support for mini-player
  if (mpDrag && mp) {
    let dragging = false, startX, startY, startRight, startBottom;
    const onMove = (e) => {
      if (!dragging) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      const dx = startX - x;
      const dy = startY - y;
      mp.style.right = `${Math.max(0, startRight + dx)}px`;
      mp.style.bottom = `${Math.max(0, startBottom + dy)}px`;
      mp.style.left = 'auto';
    };
    const onUp = () => {
      dragging = false;
      mpDrag.style.cursor = 'grab';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
    };
    const onDown = (e) => {
      e.preventDefault();
      dragging = true;
      mpDrag.style.cursor = 'grabbing';
      const rect = mp.getBoundingClientRect();
      startX = e.touches ? e.touches[0].clientX : e.clientX;
      startY = e.touches ? e.touches[0].clientY : e.clientY;
      startRight = window.innerWidth - rect.right;
      startBottom = window.innerHeight - rect.bottom;
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onUp);
    };
    mpDrag.addEventListener('mousedown', onDown);
    mpDrag.addEventListener('touchstart', onDown, { passive: false });
  }

  // When the full player closes while video is playing, show mini-player
  const origClose = window.closeVideoPlayer;
  window.closeVideoPlayer = function() {
    if (vp && vp.classList.contains('open') && isLocal && vpEl && !vpEl.paused && vpEl.src) {
      const src = vpEl.src;
      const title = vpTitle ? vpTitle.textContent : '';
      vpEl.pause();
      // Close the full player
      origClose();
      // Show the mini player
      showMiniPlayer(src, title);
      return;
    }
    origClose();
  };

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (!vp || !vp.classList.contains('open')) return;
    if (e.key === 'Escape') { closeVideoPlayer(); return; }
    if (!isLocal) return;
    showControls();
    switch (e.key) {
      case ' ':
      case 'k':
        e.preventDefault();
        if (vpEl.paused) vpEl.play(); else vpEl.pause();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (vpEl.duration) vpEl.currentTime = Math.max(0, vpEl.currentTime - 5);
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (vpEl.duration) vpEl.currentTime = Math.min(vpEl.duration, vpEl.currentTime + 5);
        break;
      case 'ArrowUp':
        e.preventDefault();
        vpEl.volume = Math.min(1, vpEl.volume + 0.1);
        vcVolume.value = vpEl.volume;
        break;
      case 'ArrowDown':
        e.preventDefault();
        vpEl.volume = Math.max(0, vpEl.volume - 0.1);
        vcVolume.value = vpEl.volume;
        break;
      case 'f':
        vcFullscreen.click();
        break;
      case 'm':
        vpEl.muted = !vpEl.muted;
        updateVolumeIcon();
        break;
    }
  });
})();
