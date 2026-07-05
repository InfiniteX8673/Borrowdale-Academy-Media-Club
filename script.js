/**
 * script.js
 * Primary interaction script for the landing page (index.html).
 */

document.addEventListener('DOMContentLoaded', () => {
  const gallery = document.getElementById('gallery-grid');
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightbox-image');
  const navToggle = document.querySelector('.nav-toggle');
  const siteNav = document.querySelector('.site-nav');
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');

  const images = [
    { src: 'Gallaries/2025/IMG-20251023-WA0081.jpg', title: 'School event highlight' },
    { src: 'Gallaries/2025/IMG-20251023-WA0074.jpg', title: 'Creative capture' },
    { src: 'Gallaries/2025/IMG-20251023-WA0100.jpg', title: 'Studio-style moment' },
    { src: 'Gallaries/2025/IMG-20251023-WA0076.jpg', title: 'Team collaboration' },
    { src: 'Gallaries/2025/IMG-20251023-WA0049.jpg', title: 'Visual storytelling' },
    { src: 'Gallaries/2025/IMG-20251023-WA0064.jpg', title: 'Club energy' },
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

  // ── MOBILE RESPONSIVE NAVIGATION ──
  navToggle?.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close responsive mobile navigation overlay if user clicks a link anchor
  document.querySelectorAll('.site-nav a').forEach(link => {
    link.addEventListener('click', () => {
      if (siteNav?.classList.contains('open')) {
        siteNav.classList.remove('open');
        navToggle?.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // ── CONTACT FORM HANDLING ──
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!status) return;

    status.textContent = 'Sending message...';
    status.className = 'form-status processing';

    // Simulate form submission process
    setTimeout(() => {
      status.textContent = 'Thank you! Your message has been sent successfully.';
      status.className = 'form-status success';
      form.reset();
    }, 1200);
  });
});