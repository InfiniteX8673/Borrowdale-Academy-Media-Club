const EVENTS_REMOTE_URL =
  'https://raw.githubusercontent.com/charltonargos/Borrowdale-Academy-Media-Club/main/events.json';

const iconMap = {
  workshop: '<i class="fa-solid fa-paintbrush"></i>',
  coverage: '<i class="fa-solid fa-camera"></i>',
  showcase: '<i class="fa-solid fa-display"></i>',
};

document.addEventListener('DOMContentLoaded', () => {
  const list = document.getElementById('events-list');
  const countEl = document.getElementById('events-count');
  const statusEl = document.getElementById('events-status');

  if (!list) return;

  function render(events) {
    if (countEl) {
      countEl.textContent = `${events.length} event${events.length !== 1 ? 's' : ''}`;
    }

    if (events.length === 0) {
      list.innerHTML = '<p class="events-empty">No upcoming events right now. Check back later!</p>';
      return;
    }

    list.innerHTML = events
      .map(
        (e, i) => `
          <article class="event-card" style="animation-delay:${i * 0.06}s">
            <div class="event-icon ${e.type || 'default'}">${iconMap[e.type] || '<i class="fa-solid fa-calendar"></i>'}</div>
            <div class="event-body">
              <h3>${e.title}</h3>
              <div class="event-meta">
                <span><i class="fa-regular fa-calendar"></i> ${e.date}</span>
                ${e.time ? `<span><i class="fa-regular fa-clock"></i> ${e.time}</span>` : ''}
              </div>
              <p>${e.description}</p>
              ${e.link ? `<a class="event-link" href="${e.link}" target="_blank" rel="noopener">Learn more <i class="fa-solid fa-arrow-up-right-from-square"></i></a>` : ''}
            </div>
          </article>
        `
      )
      .join('');
  }

  function loadFallback() {
    if (statusEl) statusEl.textContent = 'Loading events...';
      fetch('data/events.json')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load local events');
        return r.json();
      })
      .then((data) => {
        render(data);
        if (statusEl) statusEl.textContent = '';
      })
      .catch(() => {
        if (statusEl) statusEl.textContent = '';
        list.innerHTML = '<p class="events-empty">Could not load events.</p>';
      });
  }

  if (statusEl) statusEl.textContent = 'Loading events...';

  fetch(EVENTS_REMOTE_URL)
    .then((r) => {
      if (!r.ok) throw new Error('Remote fetch failed');
      return r.json();
    })
    .then((data) => {
      render(data);
      if (statusEl) statusEl.textContent = 'Live data';
    })
    .catch(() => {
      loadFallback();
    });
});
