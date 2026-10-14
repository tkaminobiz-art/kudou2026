(() => {
  'use strict';
  const settings = document.querySelector('.kudou-consent-settings');
  const privacySlot = document.querySelector('.footer-social');
  if (settings && privacySlot) privacySlot.appendChild(settings);
  const button = document.querySelector('#menuBtn');
  const nav = document.querySelector('#siteMenu');
  const narrow = matchMedia('(max-width: 1100px)');
  let menuOpen = false;
  function updateMenu() {
    if (!button || !nav) return;
    button.hidden = !narrow.matches;
    nav.hidden = narrow.matches && !menuOpen;
    button.setAttribute('aria-expanded', String(narrow.matches && menuOpen));
    button.setAttribute('aria-label', menuOpen ? 'メニューを閉じる' : 'メニューを開く');
  }
  document.querySelector('.header-contact-mobile')?.addEventListener('click', () => { menuOpen = false; updateMenu(); });
  button?.addEventListener('click', () => { menuOpen = !menuOpen; updateMenu(); });
  nav?.addEventListener('click', e => { if (e.target.closest('a')) { menuOpen = false; updateMenu(); } });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menuOpen) { menuOpen = false; updateMenu(); button.focus(); } });
  document.addEventListener('click', e => { if (menuOpen && !e.target.closest('.site-header')) { menuOpen = false; updateMenu(); } });
  narrow.addEventListener('change', () => { menuOpen = false; updateMenu(); });
  updateMenu();

  // The menu is the only blocking surface. All prose and numbers render immediately.
  const tocLinks = [...document.querySelectorAll('.report-toc a, .policy-nav__item')];
  const sections = tocLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if (sections.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        for (const link of tocLinks) {
          const active = link.getAttribute('href') === '#' + entry.target.id;
          link.classList.toggle('is-active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        }
      }
    }, { rootMargin: '-18% 0px -65% 0px', threshold: 0 });
    sections.forEach(s => observer.observe(s));
  }

  const search = document.querySelector('#searchInput');
  if (search) {
    const filters = [...document.querySelectorAll('.portal-nav__item')];
    const groups = [...document.querySelectorAll('[data-category]')];
    const clear = document.querySelector('#searchClear');
    const status = document.querySelector('#searchStatus');
    const empty = document.querySelector('#searchEmpty');
    let category = 'all';
    const normalize = s => s.normalize('NFKC').toLocaleLowerCase('ja-JP');
    function applyFilters() {
      const query = normalize(search.value.trim());
      let count = 0;
      for (const group of groups) {
        const categoryMatches = category === 'all' || group.dataset.category === category;
        let inGroup = 0;
        for (const item of group.querySelectorAll('.link-item')) {
          const matches = categoryMatches && (!query || normalize(item.textContent + ' ' + (item.dataset.keywords || '')).includes(query));
          item.hidden = !matches;
          if (matches) { inGroup++; count++; }
        }
        group.hidden = inGroup === 0;
      }
      filters.forEach(f => { const selected = f.dataset.filter === category; f.classList.toggle('is-active', selected); f.setAttribute('aria-pressed', String(selected)); });
      if (clear) clear.hidden = !search.value;
      if (empty) empty.hidden = count !== 0;
      if (status) { status.replaceChildren(); const number = document.createElement('span'); number.textContent = String(count); status.append(number, document.createTextNode('件の情報')); }
    }
    search.addEventListener('input', applyFilters);
    filters.forEach(f => f.addEventListener('click', () => { category = f.dataset.filter; applyFilters(); }));
    clear?.addEventListener('click', () => { search.value = ''; applyFilters(); search.focus(); });
    applyFilters();
  }
})();
