(() => {
  'use strict';
  const measurementId = 'G-908JD22RWW';
  const origin = 'https://www.masayuki-kudou.com';
  const pages = {
    '/': '工藤まさゆき｜奈良県議会議員（日本維新の会）',
    '/index.html': '工藤まさゆき｜奈良県議会議員（日本維新の会）',
    '/policy/': '政策｜工藤まさゆき',
    '/policy/index.html': '政策｜工藤まさゆき',
    '/portal.html': '県民ポータル｜工藤まさゆき 奈良県議会議員',
    '/reports/': '活動報告｜工藤まさゆき',
    '/reports/index.html': '活動報告｜工藤まさゆき',
    '/reports/2023-09.html': '令和5年9月定例会（初質問）｜活動報告｜工藤まさゆき',
    '/reports/2024-12.html': '令和6年12月定例会｜活動報告｜工藤まさゆき',
    '/reports/2025-06.html': '令和7年6月定例会｜活動報告｜工藤まさゆき'
  };
  const consent = window.kudouAnalyticsConsent;
  if (location.origin !== origin || !Object.hasOwn(pages, location.pathname) || !consent || window.kudouAnalyticsInitialized) return;
  window.kudouAnalyticsInitialized = true;
  const disableKey = 'ga-disable-' + measurementId;
  window[disableKey] = true;
  let started = false;
  let stopped = false;
  let tag;

  function removeAnalyticsCookies() {
    // This site owns just this stream. Do not erase other services' cookies.
    for (const name of ['_ga', '_ga_908JD22RWW']) {
      for (const domain of ['', 'www.masayuki-kudou.com', '.www.masayuki-kudou.com', 'masayuki-kudou.com', '.masayuki-kudou.com']) {
        document.cookie = name + '=; Max-Age=0; Path=/; SameSite=Lax; Secure' + (domain ? '; Domain=' + domain : '');
      }
    }
  }

  function stop(persisted) {
    window[disableKey] = true;
    removeAnalyticsCookies();
    if (!started) return;
    stopped = true;
    if (tag) tag.remove();
    // ga-disable suppresses pagehide/unload beacons; reload discards tag timers.
    // Never reload into an old grant when saving the withdrawal failed.
    if (persisted) location.reload();
  }

  function start() {
    if (stopped) { location.reload(); return; }
    if (started || consent.getState() !== 'granted') return;
    started = true;
    window[disableKey] = false;
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    // Basic consent: this queue and the remote script exist only after opt-in.
    gtag('consent', 'default', {
      analytics_storage: 'denied', ad_storage: 'denied',
      ad_user_data: 'denied', ad_personalization: 'denied'
    });
    gtag('consent', 'update', { analytics_storage: 'granted' });
    const safePage = {
      page_location: origin + location.pathname,
      page_referrer: '',
      page_title: pages[location.pathname],
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    };
    // Global defaults also cover standard first_visit/session/engagement events.
    gtag('set', safePage);
    gtag('js', new Date());
    gtag('config', measurementId, {
      ...safePage,
      send_page_view: false,
      cookie_domain: 'www.masayuki-kudou.com',
      cookie_path: '/',
      cookie_flags: 'SameSite=Lax;Secure'
    });
    gtag('event', 'page_view', { ...safePage, send_to: measurementId });
    tag = document.createElement('script');
    tag.async = true;
    tag.referrerPolicy = 'no-referrer';
    tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
    document.head.append(tag);
  }

  consent.subscribe((state, { persisted = true } = {}) => {
    if (state === 'granted') start();
    else stop(persisted);
  });
  // Reconcile a restored page even if storage events were missed while frozen.
  window.addEventListener('pageshow', event => {
    if (event.persisted) location.reload();
  });
})();
