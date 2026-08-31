/* GSTSyncPro — shared script.js */

// ─── ACTIVE NAV ──────────────────────────────────────────────────────────────
(function () {
  var path = window.location.pathname;
  document.querySelectorAll('.nav-links a[data-nav]').forEach(function (a) {
    var key = a.getAttribute('data-nav');
    if (key === 'home') {
      if (path === '/' || path.endsWith('/index.html') && path.split('/').length <= 2) {
        a.classList.add('active');
      }
    } else if (path.indexOf('/' + key) !== -1) {
      a.classList.add('active');
    }
  });
})();

// ─── MOBILE NAV ──────────────────────────────────────────────────────────────
function toggleMenu() {
  var m = document.getElementById('mobileMenu');
  var btn = document.querySelector('.hamburger');
  if (m) {
    var isOpen = m.classList.toggle('open');
    if (btn) btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }
}

// ─── SMOOTH ANCHOR SCROLL ────────────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(function (a) {
  a.addEventListener('click', function (e) {
    var href = a.getAttribute('href');
    if (href === '#' || href === '#main-content') {
      e.preventDefault();
      var main = document.getElementById('main-content');
      if (main) main.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    var target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ─── FAQ TOGGLE ──────────────────────────────────────────────────────────────
function toggleFaq(el) {
  var item = el.closest('.faq-item');
  if (!item) item = el.parentElement;
  // Close all others
  document.querySelectorAll('.faq-item.open').forEach(function (o) {
    if (o !== item) {
      o.classList.remove('open');
      var btn = o.querySelector('.faq-q');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }
  });
  var isOpen = item.classList.toggle('open');
  el.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}

// ─── PRICING MODAL ───────────────────────────────────────────────────────────
var plans = {
  silver: {
    name: 'Silver Plan', icon: '🥈', desc: '1 User · 1 Year Validity',
    orig: '₹300', curr: '₹150',
    features: ['1 User License', '1 Year Validity', '2-Files Mode (As-Is Portal Upload)', '4-Files Mode (Standard Template Headers)', 'GSTR-2B & IMS Modes', 'IMS Action JSON Export (Portal Ready)', 'PDF & Excel Report Exports', 'Side-by-Side Matching', '100% Private Local Processing', 'Email Support', 'Price inclusive of GST'],
    link: 'https://pages.razorpay.com/infitaxsolutionsilverplans'
  },
  gold: {
    name: 'Gold Plan', icon: '🥇', desc: 'Up to 5 Users · 1 Year Validity',
    orig: '₹700', curr: '₹350',
    features: ['Up to 5 Users', '1 Year Validity', '2-Files Mode (As-Is Portal Upload)', '4-Files Mode (Standard Template Headers)', 'GSTR-2B & IMS Modes', 'IMS Action JSON Export (Portal Ready)', 'PDF & Excel Report Exports', 'Side-by-Side Matching', '100% Private Local Processing', 'Priority Support', 'Price inclusive of GST'],
    link: 'https://pages.razorpay.com/infitaxsolutiongoldplans'
  }
};

var lastFocusedElement = null;

function openModal(plan) {
  var p = plans[plan];
  if (!p) return;
  var body = document.getElementById('modal-body');
  if (!body) return;
  var featureItems = p.features.map(function (f) { return '<li>' + f + '</li>'; }).join('');
  body.innerHTML =
    '<div class="plan-tag">' + p.icon + ' ' + p.name + '</div>' +
    '<h3>Complete Your Purchase</h3>' +
    '<div class="modal-price-row">' +
      '<span class="orig">' + p.orig + '</span>' +
      '<span class="curr">' + p.curr + '</span>' +
      '<span class="badge">50% OFF</span>' +
    '</div>' +
    '<ul class="modal-features">' + featureItems + '</ul>' +
    '<button class="pay-btn" onclick="goToPay(\'' + plan + '\')">💳 Pay ' + p.curr + ' — Secure Checkout →</button>' +
    '<p class="modal-note" style="margin-top:14px">🔒 Secure payment via Razorpay &nbsp;|&nbsp; All payment methods accepted<br>License key sent to your email instantly<br><strong>Questions?</strong> WhatsApp us at +91 6354030446</p>';
  var overlay = document.getElementById('payModal');
  if (overlay) {
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    // Focus management: store current focus and move into modal
    lastFocusedElement = document.activeElement;
    // Focus the close button after a brief delay to allow DOM update
    setTimeout(function () {
      var closeBtn = overlay.querySelector('.modal-close');
      if (closeBtn) closeBtn.focus();
    }, 50);
  }
}

function goToPay(plan) {
  if (plans[plan]) window.open(plans[plan].link, '_blank');
}

function closeModal() {
  var overlay = document.getElementById('payModal');
  if (overlay) {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    // Restore focus to the element that opened the modal
    if (lastFocusedElement) lastFocusedElement.focus();
  }
}

// Close modal on overlay click
document.addEventListener('click', function (e) {
  var overlay = document.getElementById('payModal');
  if (overlay && e.target === overlay) closeModal();
});

// Close modal on Escape key + focus trap
document.addEventListener('keydown', function (e) {
  var overlay = document.getElementById('payModal');
  if (!overlay || !overlay.classList.contains('open')) return;

  if (e.key === 'Escape') {
    closeModal();
    return;
  }

  // Focus trap: keep Tab within modal
  if (e.key === 'Tab') {
    var focusable = overlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length === 0) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }
});

// ─── CONTACT FORM (Cloudflare Worker + D1) ───────────────────────────────────
var WORKER_URL = 'https://contact.manavsolankis3.workers.dev/contact';

async function submitForm() {
  var nameEl    = document.getElementById('cf-name');
  var emailEl   = document.getElementById('cf-email');
  var subjectEl = document.getElementById('cf-subject');
  var msgEl     = document.getElementById('cf-msg');

  var name    = nameEl    ? nameEl.value.trim()    : '';
  var email   = emailEl   ? emailEl.value.trim()   : '';
  var subject = subjectEl ? subjectEl.value        : '';
  var message = msgEl     ? msgEl.value.trim()     : '';

  if (!name || !email || !subject || !message) {
    showToast('⚠️ Please fill all fields before submitting.');
    return;
  }

  var btn = document.querySelector('.submit-btn');
  var origText = btn ? btn.textContent : 'Send Message →';
  if (btn) { btn.textContent = 'Sending…'; btn.disabled = true; btn.style.opacity = '0.6'; }

  function resetBtn() {
    if (btn) { btn.textContent = origText; btn.disabled = false; btn.style.opacity = '1'; }
  }

  try {
    var res = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, email: email, subject: subject, message: message })
    });

    var data = await res.json();

    if (data.success) {
      showToast('✅ Message sent! We\'ll get back to you soon.');
      [nameEl, emailEl, subjectEl, msgEl].forEach(function(el) { if (el) el.value = ''; });
    } else {
      showToast('❌ ' + (data.error || 'Something went wrong. Please try again.'));
    }
  } catch (err) {
    showToast('❌ Network error. Please check your connection and try again.');
  } finally {
    resetBtn();
  }
}

// ─── TOAST ───────────────────────────────────────────────────────────────────
function showToast(msg) {
  var t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(function () { t.classList.remove('show'); }, 3500);
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOTION SYSTEM — Manu Arora's 3 principles:
// 1. Gradual Revelation  2. Seamless Transitions  3. Careful Delight
// ═══════════════════════════════════════════════════════════════════════════════
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── SCROLL PROGRESS BAR (seamless transition indicator) ─────────────────────
  function initScrollProgress() {
    if (reduceMotion) return;
    var bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.appendChild(bar);
    function update() {
      var st = document.documentElement.scrollTop || document.body.scrollTop;
      var sh = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      var pct = sh > 0 ? (st / sh) * 100 : 0;
      bar.style.width = pct + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  // ── SCROLL REVEAL (gradual revelation via IntersectionObserver) ─────────────
  function initScrollReveal() {
    var els = document.querySelectorAll('.reveal');
    if (els.length === 0) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    els.forEach(function (el) { io.observe(el); });
  }

  // ── HERO CARD GRADUAL REVELATION (match-rows appear one-by-one) ─────────────
  function initHeroCard() {
    var card = document.querySelector('.hero-card');
    if (!card) return;
    if (reduceMotion) {
      card.classList.add('loaded');
      return;
    }
    // Small delay so the page settles before the choreography begins
    setTimeout(function () { card.classList.add('loaded'); }, 200);
  }

  // ── ANIMATED COUNTERS (careful delight — the climax moment) ─────────────────
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-counter'));
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var duration = parseInt(el.getAttribute('data-duration') || '1600', 10);
    var useIndian = el.getAttribute('data-indian') === 'true';

    if (reduceMotion) {
      el.textContent = prefix + formatNumber(target, decimals, useIndian) + suffix;
      return;
    }

    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      // easeOutCubic
      var eased = 1 - Math.pow(1 - progress, 3);
      var val = target * eased;
      el.textContent = prefix + formatNumber(val, decimals, useIndian) + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = prefix + formatNumber(target, decimals, useIndian) + suffix;
      }
    }
    requestAnimationFrame(step);
  }

  function formatNumber(num, decimals, useIndian) {
    if (useIndian) {
      // Indian numbering: 2,34,850.00
      var parts = num.toFixed(decimals).split('.');
      var intPart = parts[0];
      var lastThree = intPart.slice(-3);
      var otherNumbers = intPart.slice(0, -3);
      if (otherNumbers !== '') {
        lastThree = ',' + lastThree;
      }
      var formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
      return decimals > 0 ? formatted + '.' + parts[1] : formatted;
    }
    return num.toLocaleString('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  function initCounters() {
    var counters = document.querySelectorAll('[data-counter]');
    if (counters.length === 0) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      counters.forEach(function (el) { animateCounter(el); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) { io.observe(el); });
  }

  // ── NAV SCROLL STATE (seamless transition — nav shrinks subtly on scroll) ───
  function initNavScroll() {
    var nav = document.querySelector('nav');
    if (!nav || reduceMotion) return;
    var lastScroll = 0;
    window.addEventListener('scroll', function () {
      var cur = window.scrollY;
      if (cur > 20) {
        nav.style.boxShadow = '0 2px 20px rgba(0,0,0,0.08)';
      } else {
        nav.style.boxShadow = 'none';
      }
      lastScroll = cur;
    }, { passive: true });
  }

  // ── AUTO-ADD .reveal TO COMMON ELEMENTS (no manual markup needed) ───────────
  function autoReveal() {
    if (reduceMotion) return;
    // Add reveal classes to step cards with stagger
    var steps = document.querySelectorAll('.step-card');
    steps.forEach(function (el, i) {
      el.classList.add('reveal');
      el.setAttribute('data-delay', String(i + 1));
    });
    // Feature cards
    var feats = document.querySelectorAll('.feat');
    feats.forEach(function (el, i) {
      el.classList.add('reveal');
      el.setAttribute('data-delay', String((i % 6) + 1));
    });
    // Plans
    var plans = document.querySelectorAll('.plan');
    plans.forEach(function (el, i) {
      el.classList.add('reveal');
      el.setAttribute('data-delay', String(i + 1));
    });
    // FAQ items
    var faqs = document.querySelectorAll('.faq-item');
    faqs.forEach(function (el, i) {
      el.classList.add('reveal');
      el.setAttribute('data-delay', String((i % 6) + 1));
    });
    // Section titles and labels
    document.querySelectorAll('.section-title, .section-label, .section-sub').forEach(function (el) {
      el.classList.add('reveal');
    });
    // Discount banner
    var db = document.querySelector('.discount-banner');
    if (db) db.classList.add('reveal');
    // Product cards
    var pcs = document.querySelectorAll('.product-card');
    pcs.forEach(function (el, i) {
      el.classList.add('reveal');
      el.setAttribute('data-delay', String((i % 6) + 1));
    });
  }

  // ── INIT ON DOM READY ──────────────────────────────────────────────────────
  function init() {
    autoReveal();
    initScrollProgress();
    initScrollReveal();
    initHeroCard();
    initCounters();
    initNavScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
