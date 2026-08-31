/*
 * GSTSyncPro — analytics.js
 * Self-contained Google Analytics 4 (gtag.js) loader with
 * Google Consent Mode v2 support.
 *
 * Behaviour:
 *  - On first visit, the gtag snippet in <head> already set the default
 *    consent state to "denied" for ad_storage, ad_user_data,
 *    ad_personalization, analytics_storage and functionality_storage.
 *  - This script shows a cookie consent banner (bottom of page) until the
 *    visitor makes a choice. Their choice is stored in localStorage for
 *    12 months.
 *  - "Accept"  → gtag('consent','update', ... all granted)
 *  - "Decline" → keeps denied state, but allows essential cookies only.
 *  - Returning visitors with a stored choice never see the banner again.
 *
 * Measurement ID: G-9V9T6C8QKY
 */
(function () {
  'use strict';

  var GA_ID = 'G-9V9T6C8QKY';
  var STORAGE_KEY = 'gsp_consent';
  var CONSENT_TTL_MS = 1000 * 60 * 60 * 24 * 365; // ~12 months

  /* ---------- consent storage ---------- */
  function readConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (!obj || typeof obj.granted !== 'boolean') return null;
      if (Date.now() - (obj.ts || 0) > CONSENT_TTL_MS) return null;
      return obj;
    } catch (e) {
      return null;
    }
  }

  function writeConsent(granted) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        granted: granted,
        ts: Date.now()
      }));
    } catch (e) { /* localStorage unavailable */ }
  }

  /* ---------- gtag consent update ---------- */
  function updateConsent(granted) {
    if (typeof gtag !== 'function') return;
    if (granted) {
      gtag('consent', 'update', {
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
        analytics_storage: 'granted',
        functionality_storage: 'granted',
        security_storage: 'granted'
      });
    } else {
      gtag('consent', 'update', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
        functionality_storage: 'denied',
        security_storage: 'granted'
      });
    }
  }

  /* ---------- banner UI ---------- */
  function injectStyles() {
    if (document.getElementById('gsp-consent-style')) return;
    var css = document.createElement('style');
    css.id = 'gsp-consent-style';
    css.textContent = [
      '#gsp-consent{position:fixed;left:0;right:0;bottom:0;z-index:9999;',
      'background:rgba(10,79,46,0.98);color:#fff;font-family:Inter,sans-serif;',
      'padding:16px 5%;display:flex;align-items:center;gap:20px;flex-wrap:wrap;',
      'box-shadow:0 -4px 24px rgba(0,0,0,.18);transform:translateY(100%);',
      'transition:transform .4s cubic-bezier(.16,1,.3,1);}',
      '#gsp-consent.show{transform:translateY(0);}',
      '#gsp-consent .gsp-c-text{flex:1;min-width:260px;font-size:13.5px;line-height:1.55;color:#e8f5e9}',
      '#gsp-consent .gsp-c-text a{color:#bbf7d0;text-decoration:underline}',
      '#gsp-consent .gsp-c-actions{display:flex;gap:10px;flex-shrink:0}',
      '#gsp-consent button{font-family:inherit;font-size:14px;font-weight:600;',
      'border:none;border-radius:8px;padding:10px 20px;cursor:pointer;transition:.2s;',
      'min-height:42px}',
      '#gsp-c-accept{background:#22c55e;color:#fff}',
      '#gsp-c-accept:hover{background:#16a34a}',
      '#gsp-c-decline{background:transparent;color:#bbf7d0;border:1px solid rgba(187,247,208,.4)}',
      '#gsp-c-decline:hover{background:rgba(255,255,255,.08)}',
      '@media(max-width:640px){#gsp-consent{flex-direction:column;align-items:stretch}',
      '#gsp-consent .gsp-c-actions{width:100%}',
      '#gsp-consent button{flex:1}}'
    ].join('');
    document.head.appendChild(css);
  }

  function buildBanner() {
    injectStyles();
    var bar = document.createElement('div');
    bar.id = 'gsp-consent';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', 'Cookie consent');
    bar.innerHTML =
      '<div class="gsp-c-text">' +
        'We use cookies to understand how you use GSTSyncPro and improve your experience. ' +
        'See our <a href="' + privacyLink() + '">Privacy Policy</a>.' +
      '</div>' +
      '<div class="gsp-c-actions">' +
        '<button id="gsp-c-decline" type="button">Decline</button>' +
        '<button id="gsp-c-accept" type="button">Accept</button>' +
      '</div>';
    document.body.appendChild(bar);

    // reveal after a paint
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { bar.classList.add('show'); });
    });

    document.getElementById('gsp-c-accept').addEventListener('click', function () {
      writeConsent(true);
      updateConsent(true);
      removeBanner(bar);
    });
    document.getElementById('gsp-c-decline').addEventListener('click', function () {
      writeConsent(false);
      updateConsent(false);
      removeBanner(bar);
    });
  }

  function removeBanner(bar) {
    bar.classList.remove('show');
    setTimeout(function () { if (bar.parentNode) bar.parentNode.removeChild(bar); }, 450);
  }

  /* resolve the privacy-policy link relative to the current page depth */
  function privacyLink() {
    var d = window.location.pathname.replace(/\/+$/, '').split('/').filter(Boolean).length;
    // root page depth 0 → 'policies/privacy/'
    // subdir page depth 1 → '../policies/privacy/'
    var up = new Array(Math.max(d, 0)).fill('..').join('/');
    return (up ? up + '/' : '') + 'policies/privacy/';
  }

  /* ---------- boot ---------- */
  function init() {
    var saved = readConsent();
    if (saved) {
      // repeat visitor — silently apply stored choice, no banner
      updateConsent(saved.granted);
      return;
    }
    // first visit: keep denied defaults, show banner
    buildBanner();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
