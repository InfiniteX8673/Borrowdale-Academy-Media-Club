const gallery = document.getElementById('gallery-grid');
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
const form = document.getElementById('contact-form');
const status = document.getElementById('form-status');

const images = [
  { src: '2025 Pictures/IMG-20251023-WA0081.jpg', title: 'School event highlight' },
  { src: '2025 Pictures/IMG-20251023-WA0074.jpg', title: 'Creative capture' },
  { src: '2025 Pictures/IMG-20251023-WA0100.jpg', title: 'Studio-style moment' },
  { src: '2025 Pictures/IMG-20251023-WA0076.jpg', title: 'Team collaboration' },
  { src: '2025 Pictures/IMG-20251023-WA0049.jpg', title: 'Visual storytelling' },
  { src: '2025 Pictures/IMG-20251023-WA0064.jpg', title: 'Club energy' }
];

function renderGallery() {
  gallery.innerHTML = images
    .map(
      (image, index) => `
        <figure class="gallery-card" data-index="${index}">
          <img src="${image.src}" alt="${image.title}" />
          <figcaption>${image.title}</figcaption>
        </figure>
      `
    )
    .join('');
}

renderGallery();

gallery.addEventListener('click', (event) => {
  const card = event.target.closest('.gallery-card');
  if (!card) return;
  const index = Number(card.dataset.index);
  const image = images[index];
  lightboxImage.src = image.src;
  lightboxImage.alt = image.title;
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
});

lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox || event.target.closest('.lightbox-close')) {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
  }
});

navToggle?.addEventListener('click', () => {
  const isOpen = siteNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const name = data.get('name')?.toString().trim() || 'there';
  status.textContent = `Thanks, ${name}! Your message has been received.`;
  form.reset();
});
