document.addEventListener('DOMContentLoaded', () => {
  const gallery = document.getElementById('gallery-grid');
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightbox-image');
  const lbPrev = document.getElementById('lb-prev-home');
  const lbNext = document.getElementById('lb-next-home');
  const lbCounter = document.getElementById('lb-counter-home');
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');

  let lightboxIndex = -1;
  const images = [
    { src: 'Galleries/2025/IMG-20251023-WA0081.jpg', title: 'School event highlight' },
    { src: 'Galleries/2025/IMG-20251023-WA0074.jpg', title: 'Creative capture' },
    { src: 'Galleries/2025/IMG-20251023-WA0100.jpg', title: 'Studio-style moment' },
    { src: 'Galleries/2025/IMG-20251023-WA0076.jpg', title: 'Team collaboration' },
    { src: 'Galleries/2025/IMG-20251023-WA0049.jpg', title: 'Visual storytelling' },
    { src: 'Galleries/2025/IMG-20251023-WA0064.jpg', title: 'Club energy' },
  ];

  function openHomeLightbox(index) {
    if (index < 0 || index >= images.length) return;
    lightboxIndex = index;
    const image = images[lightboxIndex];
    lightboxImage.src = image.src;
    lightboxImage.alt = image.title;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    updateHomeLightboxNav();
  }

  function closeHomeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lightboxIndex = -1;
  }

  function navigateHomeLightbox(dir) {
    const next = lightboxIndex + dir;
    if (next >= 0 && next < images.length) {
      openHomeLightbox(next);
    }
  }

  function updateHomeLightboxNav() {
    if (lbCounter) {
      lbCounter.textContent = `${lightboxIndex + 1} / ${images.length}`;
    }
    if (lbPrev) lbPrev.style.visibility = lightboxIndex > 0 ? 'visible' : 'hidden';
    if (lbNext) lbNext.style.visibility = lightboxIndex < images.length - 1 ? 'visible' : 'hidden';
  }

  // ── FEATURED GALLERY RENDERER ──
  if (gallery && images.length > 0) {
    gallery.innerHTML = images
      .map(
        (image, index) => `
          <figure class="gallery-card" data-index="${index}">
            <img src="${image.src}" alt="${image.title}" loading="lazy" />
            <figcaption>${image.title}</figcaption>
          </figure>
        `
      )
      .join('');

    gallery.addEventListener('click', (event) => {
      const card = event.target.closest('.gallery-card');
      if (!card) return;
      const index = Number(card.dataset.index);
      openHomeLightbox(index);
    });
  }

  // ── FEATURED LIGHTBOX CLOSE / NAVIGATE ──
  if (lightbox) {
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox || event.target.closest('.lightbox-close')) {
        closeHomeLightbox();
      }
    });
    if (lbPrev) lbPrev.addEventListener('click', () => navigateHomeLightbox(-1));
    if (lbNext) lbNext.addEventListener('click', () => navigateHomeLightbox(1));
  }

  document.addEventListener('keydown', (event) => {
    if (!lightbox || !lightbox.classList.contains('open')) return;
    if (event.key === 'Escape') closeHomeLightbox();
    if (event.key === 'ArrowLeft') navigateHomeLightbox(-1);
    if (event.key === 'ArrowRight') navigateHomeLightbox(1);
  });

  // ── CONTACT FORM HANDLING (EmailJS) ──
  const EMAILJS_SERVICE_ID = 'service_infinity';
  const EMAILJS_TEMPLATE_ID = 'template_efd9rua';
  const EMAILJS_PUBLIC_KEY = 'LI4nsO6xVH72lm1eP';

  const msgInput = document.getElementById('msg-input');
  const charCurrent = document.getElementById('char-current');
  if (msgInput && charCurrent) {
    msgInput.addEventListener('input', () => {
      charCurrent.textContent = msgInput.value.length;
    });
  }

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!status) return;

    if (EMAILJS_TEMPLATE_ID.includes('YOUR_TEMPLATE_ID') || EMAILJS_PUBLIC_KEY.includes('YOUR_PUBLIC_KEY')) {
      status.textContent = '\u26a0\ufe0f EmailJS not configured. Set TEMPLATE_ID and PUBLIC_KEY in js/script.js';
      status.className = 'form-status error';
      return;
    }

    const nameVal = form.name.value.trim();
    const emailVal = form.email.value.trim();
    const msgVal = form.message.value.trim();

    if (nameVal.length < 2) {
      status.textContent = 'Please enter your name (at least 2 characters).';
      status.className = 'form-status error';
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      status.textContent = 'Please enter a valid email address.';
      status.className = 'form-status error';
      return;
    }
    if (msgVal.length < 10) {
      status.textContent = 'Message must be at least 10 characters.';
      status.className = 'form-status error';
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Sending...';
    btn.disabled = true;

    status.textContent = 'Sending message...';
    status.className = 'form-status processing';

    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        from_name: form.name.value,
        from_email: form.email.value,
        message: form.message.value,
      }, EMAILJS_PUBLIC_KEY);

      btn.innerHTML = '<i class="fa-regular fa-circle-check"></i> Sent!';
      status.textContent = 'Thank you! Your message has been sent successfully.';
      status.className = 'form-status success';
      form.reset();
    } catch {
      status.textContent = 'Could not send message. Please try again later.';
      status.className = 'form-status error';
    }

    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }, 3000);
  });

  // ── VIDEO GRID ──
  const videoGrid = document.getElementById('video-grid');
  const videosEmpty = document.getElementById('videos-empty');

  const videos = (typeof VIDEO_MANIFEST !== 'undefined') ? VIDEO_MANIFEST : [];

  function youtubeId(url) {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=))([^&?#]+)/);
    return match ? match[1] : null;
  }

  if (videoGrid) {
    if (videos.length === 0) {
      if (videosEmpty) videosEmpty.hidden = false;
    } else {
      videoGrid.innerHTML = videos.map((v, i) => {
        const ytId = youtubeId(v.src);
        const thumb = v.thumbnail || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '');
        return `
          <article class="video-card" data-index="${i}" style="animation-delay:${i * 0.06}s">
            <div class="video-thumb">
              ${thumb ? `<img src="${thumb}" alt="${v.title}" loading="lazy" />` : ''}
              <div class="video-play-icon"><i class="fa-solid fa-play"></i></div>
            </div>
            <div class="video-card-body">
              <span class="video-year-badge">${v.year}</span>
              <h3>${v.title}</h3>
            </div>
          </article>
        `;
      }).join('');

      videoGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.video-card');
        if (!card) return;
        openVideoPlayer(videos[Number(card.dataset.index)]);
      });
    }
  }
});