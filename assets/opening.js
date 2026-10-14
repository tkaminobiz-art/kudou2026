(() => {
  'use strict';
  const opening = document.getElementById('opening');
  if (!opening) return;
  let timer;
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    clearTimeout(timer);
    opening.remove();
    document.removeEventListener('visibilitychange', onVisibility);
    document.removeEventListener('keydown', onKey);
    try { sessionStorage.setItem('openingDone', '1'); } catch {}
  };
  const onVisibility = () => { if (document.visibilityState !== 'visible') close(); };
  const onKey = event => { if (event.key === 'Escape') close(); };
  window.kudouCloseOpening = close;
  let played = true;
  try { played = sessionStorage.getItem('openingDone') === '1'; } catch {}
  if (played || location.hash || document.visibilityState !== 'visible' ||
      matchMedia('(prefers-reduced-motion: reduce)').matches || performance.now() > 1500) {
    close();
    return;
  }
  // Fail open: the markup is hidden until this independent controller is ready.
  // The intro never locks body scrolling and does not depend on a CDN or animation callback.
  timer = setTimeout(close, 3000);
  opening.querySelector('#openSkip')?.addEventListener('click', close);
  opening.addEventListener('animationend', event => { if (event.target === opening) close(); });
  document.addEventListener('visibilitychange', onVisibility);
  document.addEventListener('keydown', onKey);
  window.addEventListener('hashchange', close, { once: true });
  window.addEventListener('pagehide', close, { once: true });
  window.addEventListener('pageshow', event => { if (event.persisted) close(); });
  opening.hidden = false;
  opening.classList.add('is-playing');
})();
