(() => {
  'use strict';
  if (window.kudouAnalyticsConsent) return;

  // The UI stores consent only. analytics.js owns Google tag loading.
  const storageKey = 'kudou_analytics_consent_v1';
  const validState = value => value === 'granted' || value === 'denied' ? value : null;
  const readState = () => {
    try { return validState(localStorage.getItem(storageKey)); }
    catch { return null; }
  };
  let state = readState();
  const subscribers = new Set();
  const copy = {
    heading: 'アクセス解析について',
    notice: 'サイトの改善のため、許可した場合にGoogle Analyticsでページの閲覧状況を集計します。Cookieを使用します。入力内容や検索語は送信しません。',
    choice: '許可しなくてもサイトを利用できます。設定はいつでも変更できます。許可を取り消すと、ページを再読み込みします。',
    settings: 'アクセス解析の設定',
    allow: '許可する',
    deny: '許可しない',
    close: '閉じる',
    policy: 'Googleによるデータの利用について',
    details: '送信する情報について',
    data: 'ページのURLと名前、閲覧日時、端末やブラウザーの情報などをGoogleに送信します。URLの「?」以降や「#」以降の情報、参照元のURL、入力内容は送信しません。',
    unknown: '現在の設定：未選択',
    granted: '現在の設定：許可しています',
    denied: '現在の設定：許可していません',
    saveError: '設定を保存できませんでした。このページではアクセス解析を停止しています。ブラウザーの設定を確認し、もう一度お試しください。'
  };

  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };
  const settings = element('button', 'kudou-consent-settings', copy.settings);
  settings.type = 'button';
  settings.setAttribute('aria-controls', 'kudou-consent-panel');
  settings.setAttribute('aria-expanded', 'false');

  const panel = element('section', 'kudou-consent-panel');
  panel.id = 'kudou-consent-panel';
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-labelledby', 'kudou-consent-heading');
  panel.hidden = true;
  const header = element('div', 'kudou-consent-header');
  const heading = element('h2', '', copy.heading);
  heading.id = 'kudou-consent-heading';
  heading.tabIndex = -1;
  const close = element('button', 'kudou-consent-close', copy.close);
  close.type = 'button';
  header.append(heading, close);
  const status = element('p', 'kudou-consent-status');
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  const policy = element('a', 'kudou-consent-policy', copy.policy);
  policy.href = 'https://policies.google.com/technologies/partner-sites?hl=ja';
  policy.target = '_blank';
  policy.rel = 'noopener noreferrer';
  const details = element('details', 'kudou-consent-details');
  details.append(element('summary', '', copy.details), element('p', '', copy.data), policy);
  const actions = element('div', 'kudou-consent-actions');
  const deny = element('button', '', copy.deny);
  const allow = element('button', '', copy.allow);
  deny.type = allow.type = 'button';
  actions.append(deny, allow);
  panel.append(header, element('p', '', copy.notice), element('p', '', copy.choice), details, status, actions);
  document.body.append(settings, panel);

  function renderStatus() {
    status.textContent = copy[state || 'unknown'];
  }
  function open() {
    renderStatus();
    panel.hidden = false;
    settings.setAttribute('aria-expanded', 'true');
    heading.focus({ preventScroll: true });
  }
  function hide(restoreFocus) {
    panel.hidden = true;
    settings.setAttribute('aria-expanded', 'false');
    if (restoreFocus) settings.focus({ preventScroll: true });
  }
  function notify(persisted = true) {
    for (const callback of subscribers) callback(state, { persisted });
  }
  function choose(next) {
    try {
      localStorage.setItem(storageKey, next);
      if (localStorage.getItem(storageKey) !== next) throw new Error('Consent choice was not saved');
    } catch {
      // Fail closed in this document. Never imply a choice was persisted.
      state = 'denied';
      try { localStorage.removeItem(storageKey); } catch { /* Storage is unavailable. */ }
      notify(false);
      status.textContent = copy.saveError;
      return;
    }
    state = next;
    notify();
    renderStatus();
    hide(true);
  }
  settings.addEventListener('click', open);
  close.addEventListener('click', () => hide(true));
  panel.addEventListener('keydown', event => {
    if (event.key === 'Escape') hide(true);
  });
  allow.addEventListener('click', () => choose('granted'));
  deny.addEventListener('click', () => choose('denied'));
  window.addEventListener('storage', event => {
    if (event.key !== storageKey && event.key !== null) return;
    state = readState();
    renderStatus();
    notify();
  });
  window.kudouAnalyticsConsent = Object.freeze({
    getState: () => state,
    subscribe(callback) {
      subscribers.add(callback);
      callback(state);
      return () => subscribers.delete(callback);
    }
  });
  renderStatus();
  if (state === null) {
    panel.hidden = false;
    settings.setAttribute('aria-expanded', 'true');
  }
})();
