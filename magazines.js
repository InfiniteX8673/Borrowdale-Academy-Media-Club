document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('magazines-grid');
  const countEl = document.getElementById('magazine-count');
  const reader = document.getElementById('magazine-reader');
  const readerFrame = document.getElementById('reader-frame');
  const readerClose = document.getElementById('reader-close');
  const readerTitle = document.getElementById('reader-title');

  if (!grid) return;

  const magazines = typeof MAGAZINE_MANIFEST !== 'undefined' ? MAGAZINE_MANIFEST : [];

  if (countEl) {
    countEl.textContent = `${magazines.length} issue${magazines.length !== 1 ? 's' : ''}`;
  }

  if (magazines.length === 0) {
    grid.innerHTML = '<p class="magazines-empty">No magazines have been published yet.</p>';
    return;
  }

  function openReader(m) {
    readerFrame.src = m.href;
    readerTitle.textContent = m.title;
    reader.classList.add('open');
    reader.ariaHidden = 'false';
    document.body.style.overflow = 'hidden';
  }

  function closeReader() {
    reader.classList.remove('open');
    reader.ariaHidden = 'true';
    readerFrame.src = '';
    document.body.style.overflow = '';
  }

  grid.innerHTML = magazines
    .map(
      (m, i) => `
        <article class="magazine-card" data-index="${i}">
          ${m.cover ? `<img class="magazine-cover" src="${m.cover}" alt="${m.title}" loading="lazy" />` : `<div class="magazine-cover" style="display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.6);font-weight:700;font-size:3rem;">${m.year}</div>`}
          <div class="magazine-card-body">
            <span class="year-badge">${m.year}</span>
            <h3>${m.title}</h3>
            <p>Issue for ${m.year}</p>
            <button class="read-btn" data-index="${i}">Read Issue <i class="fa-solid fa-arrow-right"></i></button>
          </div>
        </article>
      `
    )
    .join('');

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('.read-btn');
    const card = e.target.closest('.magazine-card');
    if (btn) {
      const i = Number(btn.dataset.index);
      openReader(magazines[i]);
    } else if (card && !e.target.closest('.read-btn')) {
      const i = Number(card.dataset.index);
      openReader(magazines[i]);
    }
  });

  readerClose.addEventListener('click', closeReader);
  document.getElementById('reader-backdrop').addEventListener('click', closeReader);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && reader.classList.contains('open')) {
      closeReader();
    }
  });
});
