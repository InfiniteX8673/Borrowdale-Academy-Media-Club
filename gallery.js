const PAGE_SIZE = 24;

let currentYear = null;
let filteredPhotos = [];
let displayedCount = 0;
let isMasonry = false;
let lightboxIndex = -1;

const els = {
  grid: document.getElementById('full-gallery-grid'),
  yearTabs: document.getElementById('year-tabs'),
  photoCount: document.getElementById('photo-count'),
  yearLabel: document.getElementById('year-label'),
  search: document.getElementById('gallery-search'),
  shuffleBtn: document.getElementById('shuffle-btn'),
  layoutBtn: document.getElementById('layout-btn'),
  loadMoreWrap: document.getElementById('load-more-wrap'),
  loadMoreBtn: document.getElementById('load-more-btn'),
  remainingCount: document.getElementById('remaining-count'),
  noResults: document.getElementById('no-results'),
  lightbox: document.getElementById('gallery-lightbox'),
  lbImage: document.getElementById('lb-image'),
  lbCounter: document.getElementById('lb-counter'),
  lbClose: document.getElementById('lb-close'),
  lbPrev: document.getElementById('lb-prev'),
  lbNext: document.getElementById('lb-next'),
  lbBackdrop: document.getElementById('lb-backdrop'),
  layoutIconGrid: document.getElementById('layout-icon-grid'),
  layoutIconMasonry: document.getElementById('layout-icon-masonry'),
};

function allPhotos() {
  const years = Object.keys(GALLERY_MANIFEST).sort();
  const photos = [];
  for (const year of years) {
    for (const src of GALLERY_MANIFEST[year]) {
      photos.push({ src, year: Number(year) });
    }
  }
  return photos;
}

function buildYearTabs() {
  const years = Object.keys(GALLERY_MANIFEST).sort((a, b) => b - a);
  if (years.length === 0) return;
  els.yearTabs.innerHTML = years
    .map(
      (y) =>
        `<button class="year-tab" role="tab" data-year="${y}" aria-selected="${y === String(currentYear)}">${y}</button>`
    )
    .join('');
  els.yearTabs.addEventListener('click', (e) => {
    const tab = e.target.closest('.year-tab');
    if (!tab) return;
    const year = tab.dataset.year;
    if (year === String(currentYear)) return;
    setYear(Number(year));
  });
}

function setYear(year) {
  currentYear = year;
  document.querySelectorAll('.year-tab').forEach((tab) => {
    tab.ariaSelected = String(Number(tab.dataset.year) === year);
  });
  els.yearLabel.textContent = year;
  applyFilters();
}

function applyFilters() {
  const query = els.search.value.toLowerCase().trim();
  let pool = currentYear ? allPhotos().filter((p) => p.year === currentYear) : allPhotos();
  if (query) {
    pool = pool.filter((p) => p.src.toLowerCase().includes(query));
  }
  filteredPhotos = pool;
  displayedCount = 0;
  els.grid.innerHTML = '';
  els.loadMoreWrap.hidden = true;
  els.noResults.hidden = true;
  if (filteredPhotos.length === 0) {
    els.noResults.hidden = false;
    updateStats();
    return;
  }
  loadMore();
}

function loadMore() {
  const batch = filteredPhotos.slice(displayedCount, displayedCount + PAGE_SIZE);
  for (const photo of batch) {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.role = 'listitem';
    item.dataset.src = photo.src;
    item.innerHTML = `<img src="${photo.src}" alt="" loading="lazy" /><div class="gallery-item-overlay"><span>${photo.year}</span></div>`;
    item.addEventListener('click', () => openLightbox(filteredPhotos.indexOf(photo)));
    els.grid.appendChild(item);
  }
  displayedCount += batch.length;
  const remaining = filteredPhotos.length - displayedCount;
  if (remaining > 0) {
    els.loadMoreWrap.hidden = false;
    els.remainingCount.textContent = `${remaining} remaining`;
  } else {
    els.loadMoreWrap.hidden = true;
  }
  updateStats();
}

function updateStats() {
  const total = filteredPhotos.length;
  els.photoCount.textContent = `${displayedCount} of ${total} photos`;
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function openLightbox(index) {
  if (index < 0 || index >= filteredPhotos.length) return;
  lightboxIndex = index;
  const photo = filteredPhotos[lightboxIndex];
  els.lbImage.src = photo.src;
  els.lbImage.alt = `Photo ${lightboxIndex + 1} of ${filteredPhotos.length}`;
  els.lbCounter.textContent = `${lightboxIndex + 1} / ${filteredPhotos.length}`;
  els.lightbox.classList.add('open');
  els.lightbox.ariaHidden = 'false';
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  els.lightbox.classList.remove('open');
  els.lightbox.ariaHidden = 'true';
  document.body.style.overflow = '';
}

function navigateLightbox(dir) {
  const next = lightboxIndex + dir;
  if (next >= 0 && next < filteredPhotos.length) {
    openLightbox(next);
  }
}

function init() {
  const years = Object.keys(GALLERY_MANIFEST).sort((a, b) => b - a);
  if (years.length === 0) return;
  currentYear = Number(years[0]);
  buildYearTabs();
  applyFilters();

  els.search.addEventListener('input', applyFilters);

  els.shuffleBtn.addEventListener('click', () => {
    shuffleArray(filteredPhotos);
    displayedCount = 0;
    els.grid.innerHTML = '';
    els.loadMoreWrap.hidden = true;
    els.noResults.hidden = true;
    if (filteredPhotos.length === 0) {
      els.noResults.hidden = false;
      updateStats();
      return;
    }
    loadMore();
  });

  els.layoutBtn.addEventListener('click', () => {
    isMasonry = !isMasonry;
    els.grid.classList.toggle('masonry', isMasonry);
    els.layoutIconGrid.style.display = isMasonry ? 'none' : '';
    els.layoutIconMasonry.style.display = isMasonry ? '' : 'none';
  });

  els.loadMoreBtn.addEventListener('click', loadMore);

  els.lbClose.addEventListener('click', closeLightbox);
  els.lbBackdrop.addEventListener('click', closeLightbox);
  els.lbPrev.addEventListener('click', () => navigateLightbox(-1));
  els.lbNext.addEventListener('click', () => navigateLightbox(1));

  document.addEventListener('keydown', (e) => {
    if (!els.lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
  });
}

document.addEventListener('DOMContentLoaded', init);
