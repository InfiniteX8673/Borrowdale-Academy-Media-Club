const VIDEO_PAGE_SIZE = 6;

let videoCurrentYear = null;
let filteredVideos = [];
let videoDisplayedCount = 0;

const videoEls = {
  grid: document.getElementById('videos-grid'),
  yearTabs: document.getElementById('year-tabs'),
  videoCount: document.getElementById('video-count'),
  yearLabel: document.getElementById('year-label'),
  search: document.getElementById('video-search'),
  loadMoreWrap: document.getElementById('load-more-wrap'),
  loadMoreBtn: document.getElementById('load-more-btn'),
  remainingCount: document.getElementById('remaining-count'),
  emptyEl: document.getElementById('videos-empty'),
  noResults: document.getElementById('no-results'),
};

if (!videoEls.grid) throw new Error('videos-grid not found');

const allVideos = (typeof VIDEO_MANIFEST !== 'undefined') ? VIDEO_MANIFEST : [];

function youtubeId(url) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=))([^&?#]+)/);
  return match ? match[1] : null;
}

function videoYears() {
  const years = new Set(allVideos.map((v) => v.year));
  return [...years].sort((a, b) => Number(b) - Number(a));
}

function buildVideoYearTabs() {
  const years = videoYears();
  if (years.length === 0 || !videoEls.yearTabs) return;
  const allBtn = `<button class="year-tab" role="tab" data-year="all" aria-selected="${videoCurrentYear === null}">All</button>`;
  videoEls.yearTabs.innerHTML = allBtn + years
    .map(
      (y) =>
        `<button class="year-tab" role="tab" data-year="${y}" aria-selected="${y === String(videoCurrentYear)}">${y}</button>`
    )
    .join('');
  videoEls.yearTabs.addEventListener('click', (e) => {
    const tab = e.target.closest('.year-tab');
    if (!tab) return;
    const year = tab.dataset.year;
    if (year === 'all') {
      setVideoYear(null);
    } else {
      if (Number(year) === videoCurrentYear) return;
      setVideoYear(Number(year));
    }
  });
}

function setVideoYear(year) {
  videoCurrentYear = year;
  document.querySelectorAll('#year-tabs .year-tab').forEach((tab) => {
    if (tab.dataset.year === 'all') {
      tab.ariaSelected = String(year === null);
    } else {
      tab.ariaSelected = String(Number(tab.dataset.year) === year);
    }
  });
  if (videoEls.yearLabel) videoEls.yearLabel.textContent = year === null ? 'All years' : year;
  applyVideoFilters();
}

function applyVideoFilters() {
  const query = videoEls.search ? videoEls.search.value.toLowerCase().trim() : '';
  let pool = videoCurrentYear ? allVideos.filter((v) => v.year === String(videoCurrentYear)) : [...allVideos];
  if (query) {
    pool = pool.filter((v) => {
      const title = v.title.toLowerCase();
      return title.includes(query) || String(v.year).includes(query);
    });
  }
  filteredVideos = pool;
  videoDisplayedCount = 0;
  videoEls.grid.innerHTML = '';
  if (videoEls.loadMoreWrap) videoEls.loadMoreWrap.hidden = true;
  if (videoEls.noResults) videoEls.noResults.hidden = true;
  if (videoEls.emptyEl) videoEls.emptyEl.hidden = true;
  if (filteredVideos.length === 0) {
    if (videoEls.noResults) videoEls.noResults.hidden = false;
    updateVideoStats();
    return;
  }
  loadMoreVideos();
}

function renderVideoCard(v, globalIndex) {
  const ytId = youtubeId(v.src);
  const thumb = v.thumbnail || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '');
  const article = document.createElement('article');
  article.className = 'video-card';
  article.dataset.index = globalIndex;
  article.style.animationDelay = `${(videoDisplayedCount % VIDEO_PAGE_SIZE) * 0.06}s`;
  article.innerHTML = `
    <div class="video-thumb">
      ${thumb ? `<img src="${thumb}" alt="${v.title}" loading="lazy" />` : ''}
      <div class="video-play-icon"><i class="fa-solid fa-play"></i></div>
    </div>
    <div class="video-card-body">
      <span class="video-year-badge">${v.year}</span>
      <h3>${v.title}</h3>
    </div>
  `;
  return article;
}

function loadMoreVideos() {
  if (videoDisplayedCount >= filteredVideos.length) {
    if (videoEls.loadMoreWrap) videoEls.loadMoreWrap.hidden = true;
    return;
  }
  const batch = filteredVideos.slice(videoDisplayedCount, videoDisplayedCount + VIDEO_PAGE_SIZE);
  for (const video of batch) {
    const globalIndex = filteredVideos.indexOf(video);
    const card = renderVideoCard(video, globalIndex);
    videoEls.grid.appendChild(card);
  }
  videoDisplayedCount += batch.length;
  const remaining = filteredVideos.length - videoDisplayedCount;
  if (remaining > 0) {
    if (videoEls.loadMoreWrap) videoEls.loadMoreWrap.hidden = false;
    if (videoEls.remainingCount) videoEls.remainingCount.textContent = `${remaining} remaining`;
  } else {
    if (videoEls.loadMoreWrap) videoEls.loadMoreWrap.hidden = true;
  }
  updateVideoStats();
}

function updateVideoStats() {
  const total = filteredVideos.length;
  if (videoEls.videoCount) {
    videoEls.videoCount.textContent = `${videoDisplayedCount} of ${total} video${total !== 1 ? 's' : ''}`;
  }
}

function initVideos() {
  const years = videoYears();
  if (allVideos.length === 0) {
    if (videoEls.emptyEl) videoEls.emptyEl.hidden = false;
    return;
  }

  videoCurrentYear = null;
  buildVideoYearTabs();
  if (videoEls.yearLabel) videoEls.yearLabel.textContent = 'All years';
  applyVideoFilters();

  if (videoEls.search) videoEls.search.addEventListener('input', applyVideoFilters);
  if (videoEls.loadMoreBtn) videoEls.loadMoreBtn.addEventListener('click', loadMoreVideos);

  videoEls.grid.addEventListener('click', (e) => {
    const card = e.target.closest('.video-card');
    if (!card) return;
    openVideoPlayer(filteredVideos[Number(card.dataset.index)]);
  });
}

document.addEventListener('DOMContentLoaded', initVideos);
