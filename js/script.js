document.addEventListener('DOMContentLoaded', () => {
  const gallery = document.getElementById('gallery-grid');
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightbox-image');
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');

  const images = [
    { src: 'Galleries/2025/IMG-20251023-WA0081.jpg', title: 'School event highlight' },
    { src: 'Galleries/2025/IMG-20251023-WA0074.jpg', title: 'Creative capture' },
    { src: 'Galleries/2025/IMG-20251023-WA0100.jpg', title: 'Studio-style moment' },
    { src: 'Galleries/2025/IMG-20251023-WA0076.jpg', title: 'Team collaboration' },
    { src: 'Galleries/2025/IMG-20251023-WA0049.jpg', title: 'Visual storytelling' },
    { src: 'Galleries/2025/IMG-20251023-WA0064.jpg', title: 'Club energy' },
  ];

  // ── FEATURED GALLERY RENDERER ──
  if (gallery) {
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

    // Lightbox Open Event
    gallery.addEventListener('click', (event) => {
      const card = event.target.closest('.gallery-card');
      if (!card) return;
      const index = Number(card.dataset.index);
      const image = images[index];
      
      if (lightboxImage && lightbox) {
        lightboxImage.src = image.src;
        lightboxImage.alt = image.title;
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }
    });
  }

  // ── FEATURED LIGHTBOX CLOSE MECHANICS ──
  if (lightbox) {
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox || event.target.closest('.lightbox-close')) {
        closeMainLightbox();
      }
    });
  }

  function closeMainLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Global escape key handler for landing page lightbox
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && lightbox && lightbox.classList.contains('open')) {
      closeMainLightbox();
    }
  });

  // ── CONTACT FORM HANDLING (EmailJS) ──
  // Fill in your EmailJS credentials below:
  const EMAILJS_SERVICE_ID = 'service_infinity';
  const EMAILJS_TEMPLATE_ID = 'template_efd9rua';
  const EMAILJS_PUBLIC_KEY = 'LI4nsO6xVH72lm1eP';

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!status) return;

    if (EMAILJS_TEMPLATE_ID.includes('YOUR_TEMPLATE_ID') || EMAILJS_PUBLIC_KEY.includes('YOUR_PUBLIC_KEY')) {
      status.textContent = '⚠️ EmailJS not configured. Set TEMPLATE_ID and PUBLIC_KEY in js/script.js';
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
});