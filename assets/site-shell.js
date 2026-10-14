(() => {
  'use strict';
  const header = document.querySelector('.site-header');
  const button = document.getElementById('menuBtn');
  const panel = document.getElementById('mobilePanel');
  const mobile = window.matchMedia('(max-width: 1199px)');
  if (header && button && panel) {
    header.classList.add('has-menu');
    button.hidden = false;
    const close = (returnFocus = false) => {
      panel.hidden = true;
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', 'メニューを開く');
      if (returnFocus) button.focus();
    };
    button.addEventListener('click', () => {
      const open = panel.hidden;
      panel.hidden = !open;
      button.setAttribute('aria-expanded', String(open));
      button.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    });
    panel.addEventListener('click', event => { if (event.target.closest('a')) close(); });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !panel.hidden) close(true);
    });
    document.addEventListener('click', event => {
      if (!panel.hidden && !header.contains(event.target)) close();
    });
    header.addEventListener('focusout', event => {
      if (event.relatedTarget && !header.contains(event.relatedTarget)) close();
    });
    mobile.addEventListener('change', () => close());
    // Only the compact header counts toward the anchor offset, never its open menu.
    const measure = () => {
      const height = header.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--site-header-height', `${Math.ceil(height)}px`);
    };
    measure();
    if ('ResizeObserver' in window) new ResizeObserver(measure).observe(header.querySelector('.site-header__inner'));
  }

  const secondaryNav = document.querySelector('.policy-nav, .portal-nav');
  if (secondaryNav) {
    const measureSecondary = () => {
      const height = getComputedStyle(secondaryNav).position === 'sticky' ? secondaryNav.getBoundingClientRect().height : 0;
      document.documentElement.style.setProperty('--site-secondary-nav-height', `${Math.ceil(height)}px`);
    };
    measureSecondary();
    if ('ResizeObserver' in window) new ResizeObserver(measureSecondary).observe(secondaryNav);
    window.addEventListener('resize', measureSecondary, { passive: true });
  }

  const targetForHash = () => {
    if (!location.hash) return null;
    try { return document.getElementById(decodeURIComponent(location.hash.slice(1))); }
    catch { return null; }
  };
  const alignTarget = () => {
    const target = targetForHash();
    if (!target) return;
    window.kudouCloseOpening?.();
    const top = target.getBoundingClientRect().top + window.scrollY;
    const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    // Force an immediate correction; native smooth scrolling must not race a cross-page anchor.
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo({ top: target.id === 'home' ? 0 : Math.max(0, top - margin), behavior: 'auto' });
    root.style.scrollBehavior = previous;
  };
  let initialAlignmentPending = Boolean(location.hash);
  const cancelInitialAlignment = () => { initialAlignmentPending = false; };
  const alignInitialTarget = () => { if (initialAlignmentPending) alignTarget(); };
  // Late fonts must not pull a visitor back after they have started reading or using the page.
  for (const type of ['wheel', 'touchstart', 'pointerdown', 'keydown']) {
    window.addEventListener(type, cancelInitialAlignment, { once: true, passive: true });
  }
  window.addEventListener('hashchange', () => { cancelInitialAlignment(); alignTarget(); });
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === '_blank') return;
    const url = new URL(link.href, location.href);
    const normalizedPath = path => path.replace(/\/index\.html$/, '/');
    if (url.origin !== location.origin || normalizedPath(url.pathname) !== normalizedPath(location.pathname) || url.search !== location.search || !url.hash) return;
    let target;
    try { target = document.getElementById(decodeURIComponent(url.hash.slice(1))); } catch { return; }
    if (!target) return;
    event.preventDefault();
    cancelInitialAlignment();
    if (location.hash !== url.hash) history.pushState(null, '', url.hash);
    alignTarget();
    // Continue keyboard reading at the destination instead of leaving focus in a closed menu.
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
  window.addEventListener('pageshow', event => {
    if (event.persisted) window.kudouCloseOpening?.();
    else alignInitialTarget();
  });
  if (location.hash) {
    alignTarget();
    // Fonts and lazy images have reserved dimensions; one final load alignment covers the initial layout.
    window.addEventListener('load', alignInitialTarget, { once: true });
    document.fonts?.ready.then(() => { alignInitialTarget(); cancelInitialAlignment(); });
  }
})();
