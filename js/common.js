(() => {
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');

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

  const navToggle = document.querySelector('.nav-toggle');
  const siteNav = document.querySelector('.site-nav');
  if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = siteNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
    siteNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        siteNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  document.querySelectorAll('.year').forEach(el => { el.textContent = new Date().getFullYear(); });

  const backBtn = document.getElementById('backToTop');
  if (backBtn) {
    window.addEventListener('scroll', () => backBtn.classList.toggle('visible', window.scrollY > 400), { passive: true });
    backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
