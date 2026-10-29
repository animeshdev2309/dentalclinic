/* ==========================================================================
   MAIN — Website behaviour + configuration integration + promo banner
   All original behaviour from the single-file version is preserved exactly.
   Only the config integration and the new initPromoBanner() step are new.
   ========================================================================== */
(function () {
  'use strict';

  /* -------- 1. Config binding ---------------------------------------------- */
  var CFG = (typeof BUSINESS_CONFIG !== 'undefined' && BUSINESS_CONFIG) || {};
  var PROMO = (typeof PROMOTION_CONFIG !== 'undefined' && PROMOTION_CONFIG) || null;

  var DEFAULT_WA_MESSAGE =
    (CFG.booking && CFG.booking.whatsappMessage) ||
    "Hello, I would like to book a dental appointment.";

  var SPY_IDS = ['top', 'experience', 'services', 'results', 'dentist',
                 'journey', 'clinic', 'notes', 'faq', 'visit'];

  /* -------- 2. Helpers ----------------------------------------------------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  var reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  function prefersReducedMotion() { return reduceMotionQuery.matches; }

  function sanitiseNumber(value) {
    return String(value || '').replace(/[^\d]/g, '');
  }
  function waUrl(message) {
    var number = sanitiseNumber((CFG.contact && CFG.contact.whatsapp) || '');
    if (!number) return '#';
    return 'https://wa.me/' + number + '?text=' +
      encodeURIComponent(message || DEFAULT_WA_MESSAGE);
  }
  function telUrl() {
    var cleaned = String((CFG.contact && CFG.contact.phone) || '').replace(/[^\d+]/g, '');
    return cleaned ? 'tel:' + cleaned : '#';
  }
  function isSafeUrl(url) {
    if (!url || typeof url !== 'string') return false;
    var t = url.trim().toLowerCase();
    if (!t) return false;
    if (t.indexOf('javascript:') === 0) return false;
    if (t.indexOf('data:') === 0) return false;
    if (t.indexOf('vbscript:') === 0) return false;
    return true;
  }

  /* Reconstruct the display address exactly as the original markup had it. */
  function formatAddressLines(a) {
    if (!a) return '';
    var lines = [];
    if (a.line1) lines.push(a.line1 + ',');
    var l2 = [];
    if (a.line2) l2.push(a.line2);
    if (a.city) l2.push(a.city);
    if (l2.length) lines.push(l2.join(', ') + ',');
    var l3 = [];
    if (a.state) l3.push(a.state);
    if (a.pincode) l3.push(a.pincode);
    var line3 = l3.join(' ');
    if (line3) {
      if (a.country) line3 += ', ' + a.country;
      lines.push(line3);
    } else if (a.country) {
      lines.push(a.country);
    }
    return lines.join('\n');
  }
  function formatHours(h) {
    if (!h) return '';
    return [h.weekdays, h.sunday].filter(Boolean).join('\n');
  }

  /* Shared UI state used by menu + modal for Escape coordination. */
  var ui = {
    menuToggle: null,
    isMenuOpen: function () { return false; },
    closeMenu: function () {},
    isModalOpen: function () { return false; },
    closeModal: function () {}
  };

  function syncScrollLock() {
    var locked = document.documentElement.classList.contains('modal-open');
    document.body.style.overflow = locked ? 'hidden' : '';
  }
  function haltScroll() {
    var root = document.documentElement;
    var prev = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(window.scrollX, window.scrollY);
    root.style.scrollBehavior = prev;
  }
  function goToSection(id) {
    var target = document.getElementById(id);
    if (!target) return false;
    target.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start'
    });
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    try {
      if (window.location.hash !== '#' + id) {
        history.replaceState(null, '', '#' + id);
      }
    } catch (err) { /* sandboxed contexts */ }
    return true;
  }

  /* -------- 3. Apply business configuration -------------------------------- */
  function applyConfig() {
    /* WhatsApp links */
    $$('[data-wa]').forEach(function (a) {
      a.href = waUrl(DEFAULT_WA_MESSAGE);
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    });
    /* Tel links */
    $$('[data-tel]').forEach(function (a) { a.href = telUrl(); });

    /* data-field elements */
    var textMap = {
      address: formatAddressLines(CFG.address),
      hours: formatHours(CFG.hours),
      phone: CFG.contact && CFG.contact.phoneDisplay,
      email: CFG.contact && CFG.contact.email,
      established: CFG.established,
      consultation: CFG.consultationFee,
      rating: CFG.rating
    };
    $$('[data-field]').forEach(function (el) {
      var v = textMap[el.dataset.field];
      if (!v) return;
      el.textContent = v;
      if (el.tagName === 'A' && el.dataset.field === 'email') {
        el.href = 'mailto:' + v;
      }
    });

    /* Rating badge visibility */
    var ratingItem = $('[data-rating]');
    if (ratingItem) ratingItem.hidden = !CFG.rating;

    /* Credentials */
    $$('[data-cred]').forEach(function (el) {
      var v = CFG.credentials && CFG.credentials[el.dataset.cred];
      if (v) el.textContent = v;
    });

    /* Directions */
    if (isSafeUrl(CFG.directionsUrl)) {
      $$('[data-directions]').forEach(function (a) {
        a.href = CFG.directionsUrl;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      });
    }

    /* Privacy */
    var privacy = $('[data-privacy]');
    if (privacy) {
      if (isSafeUrl(CFG.privacyUrl)) {
        privacy.href = CFG.privacyUrl;
        privacy.hidden = false;
      } else {
        privacy.hidden = true;
      }
    }

    /* Social links (only those present in config) */
    var fb = $('[data-social="facebook"]');
    if (fb) {
      if (isSafeUrl(CFG.social && CFG.social.facebook)) {
        fb.href = CFG.social.facebook;
        fb.hidden = false;
      } else {
        fb.hidden = true;
      }
    }

    /* Brand name / sub */
    if (CFG.brand) {
      var bn = $('.brand__name');
      var bs = $('.brand__sub');
      if (bn && CFG.brand.name) bn.textContent = CFG.brand.name;
      if (bs && CFG.brand.sub) bs.textContent = CFG.brand.sub;
    }
    var brandLink = $('.brand');
    if (brandLink && CFG.name) {
      brandLink.setAttribute('aria-label', CFG.name + ' — home');
    }

    /* Logo (image replaces the SVG mark; sizing kept identical) */
    if (isSafeUrl(CFG.logo)) {
      var mark = $('.brand__mark');
      if (mark) {
        mark.innerHTML = '';
        var img = document.createElement('img');
        img.src = CFG.logo;
        img.alt = '';
        img.width = 30; img.height = 30;
        img.style.cssText = 'width:100%;height:100%;object-fit:contain;display:block;';
        mark.appendChild(img);
      }
    }

    /* Favicon */
    if (isSafeUrl(CFG.favicon)) {
      var icon = document.querySelector('link[rel~="icon"]');
      if (!icon) {
        icon = document.createElement('link');
        icon.rel = 'icon';
        document.head.appendChild(icon);
      }
      icon.href = CFG.favicon;
    }

    /* Hero image */
    if (isSafeUrl(CFG.heroImage)) {
      var hero = $('.hero-img');
      if (hero) {
        hero.src = CFG.heroImage;
        if (CFG.heroImageSrcset) hero.srcset = CFG.heroImageSrcset;
        if (CFG.heroImageSizes) hero.sizes = CFG.heroImageSizes;
      }
    }

    /* Copyright year */
    var year = $('#year');
    if (year) year.textContent = String(new Date().getFullYear());
  }

  /* -------- 4. Scroll UI --------------------------------------------------- */
  function initScrollUi() {
    var bar = $('#scrollBar');
    var header = $('#siteHeader');
    var toTop = $('#toTop');
    var queued = false;

    function update() {
      var root = document.documentElement;
      var max = root.scrollHeight - root.clientHeight;
      var p = max > 0 ? Math.min(1, root.scrollTop / max) : 0;
      if (bar) bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
      if (header) header.classList.toggle('is-stuck', root.scrollTop > 8);
      if (toTop) toTop.classList.toggle('is-on', root.scrollTop > 620);
      queued = false;
    }
    window.addEventListener('scroll', function () {
      if (!queued) { queued = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update, { passive: true });

    if (toTop) {
      toTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      });
    }
    update();
  }

  /* -------- 5. Navigation + scroll spy + mobile menu ----------------------- */
  function initNav() {
    var navItems    = $$('.nav-list .nav-item');
    var mobileLinks = $$('.mobile-link');
    var toggle      = $('#navToggle');
    var menu        = $('#mobileMenu');

    var spyLocked = false;
    var spyTimer = null;
    function lockSpy() {
      spyLocked = true;
      clearTimeout(spyTimer);
      spyTimer = setTimeout(unlockSpy, 3000);
    }
    function unlockSpy() {
      spyLocked = false;
      clearTimeout(spyTimer); spyTimer = null;
    }

    function setActive(id) {
      navItems.forEach(function (item) {
        var on = item.dataset.id === id;
        item.classList.toggle('is-active', on);
        if (on) item.setAttribute('aria-current', 'location');
        else item.removeAttribute('aria-current');
      });
      mobileLinks.forEach(function (link) {
        var on = link.dataset.id === id;
        link.classList.toggle('is-active', on);
        if (on) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }

    function pulse(el) {
      el.classList.remove('is-pressed');
      void el.offsetWidth;
      el.classList.add('is-pressed');
      el.addEventListener('animationend', function handler(e) {
        if (e.animationName === 'iconPop') {
          el.classList.remove('is-pressed');
          el.removeEventListener('animationend', handler);
        }
      });
    }

    function isMenuOpen() { return !!(menu && menu.classList.contains('is-open')); }
    function openMenu() {
      if (!toggle || !menu) return;
      haltScroll();
      menu.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close menu');
      document.documentElement.classList.add('menu-open');
    }
    function closeMenu() {
      if (!toggle || !menu) return;
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
      document.documentElement.classList.remove('menu-open');
    }
    ui.menuToggle = toggle;
    ui.isMenuOpen = isMenuOpen;
    ui.closeMenu = closeMenu;

    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        if (isMenuOpen()) closeMenu(); else openMenu();
      });
      document.addEventListener('click', function (e) {
        if (!isMenuOpen()) return;
        var t = e.target;
        if (!t || !t.closest) return;
        if (menu.contains(t)) return;
        if (toggle.contains(t)) return;
        closeMenu();
      });
      $$('.mobile-actions a').forEach(function (a) {
        a.addEventListener('click', closeMenu);
      });
      var mq = window.matchMedia('(max-width: 899px)');
      var onBreakpoint = function (m) { if (!m.matches) closeMenu(); };
      if (mq.addEventListener) mq.addEventListener('change', onBreakpoint);
      else if (mq.addListener) mq.addListener(onBreakpoint);
    }

    window.addEventListener('scroll', function () {
      if (!spyLocked) return;
      clearTimeout(spyTimer);
      spyTimer = setTimeout(unlockSpy, 160);
    }, { passive: true });

    /* Global in-page anchor handler */
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 ||
          e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var t = e.target;
      if (!t || !t.closest) return;
      var link = t.closest('a[href^="#"]');
      if (!link) return;
      var href = link.getAttribute('href');
      if (!href || href.length < 2) return;
      var id = href.slice(1);
      if (!document.getElementById(id)) return;
      e.preventDefault();
      if (menu && menu.contains(link)) closeMenu();
      if (link.classList.contains('nav-item')) pulse(link);
      if (SPY_IDS.indexOf(id) !== -1) { lockSpy(); setActive(id); }
      goToSection(id);
    });

    navItems.forEach(function (item) {
      item.addEventListener('keydown', function (e) {
        if (e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault(); item.click();
        }
      });
    });

    /* Scroll spy */
    var visible = {};
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          visible[entry.target.id] = entry.isIntersecting;
        });
        if (spyLocked) return;
        for (var i = 0; i < SPY_IDS.length; i++) {
          if (visible[SPY_IDS[i]]) { setActive(SPY_IDS[i]); return; }
        }
      }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
      SPY_IDS.forEach(function (id) {
        var el = document.getElementById(id);
        if (el) io.observe(el);
      });
    }

    function syncFromHash() {
      var raw = (window.location.hash || '').replace('#', '');
      setActive(SPY_IDS.indexOf(raw) !== -1 ? raw : 'top');
    }
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) { closeMenu(); syncFromHash(); }
    });
  }

  /* -------- 6. Reveal on scroll ------------------------------------------- */
  function initReveal() {
    var items = $$('.reveal');
    if (!items.length) return;
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* -------- 7. Accordions ------------------------------------------------- */
  function initAccordions() {
    var hoverMq = window.matchMedia('(min-width: 900px) and (hover: hover) and (pointer: fine)');
    $$('[data-accordion]').forEach(function (group) {
      var single = group.dataset.accordion === 'single';
      var buttons = $$('.acc-btn', group);
      function setOpen(btn, open) {
        var item = btn.closest('.acc-item');
        if (!item) return;
        if (open && single) {
          buttons.forEach(function (other) {
            if (other === btn) return;
            other.setAttribute('aria-expanded', 'false');
            var oi = other.closest('.acc-item');
            if (oi) oi.classList.remove('is-open');
          });
        }
        btn.setAttribute('aria-expanded', String(open));
        item.classList.toggle('is-open', open);
      }
      buttons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          setOpen(btn, btn.getAttribute('aria-expanded') !== 'true');
        });
      });
      if (group.classList.contains('svc-index')) {
        buttons.forEach(function (btn) {
          var item = btn.closest('.acc-item');
          if (!item) return;
          item.addEventListener('mouseenter', function () {
            if (!hoverMq.matches) return;
            setOpen(btn, true);
          });
        });
      }
    });
  }

  /* -------- 8. Before/After slider ---------------------------------------- */
  function initBeforeAfter() {
    $$('.ba-media').forEach(function (media) {
      var input = $('.ba-input', media);
      if (!input) return;
      function setPos(v) {
        var pct = Math.max(0, Math.min(100, Number(v)));
        media.style.setProperty('--pos', pct + '%');
      }
      function fromPointer(e) {
        var rect = media.getBoundingClientRect();
        if (!rect.width) return;
        var pct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
        pct = Math.max(0, Math.min(100, pct));
        input.value = String(pct); setPos(pct);
      }
      var dragging = false, moved = false;
      media.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        dragging = true; moved = false;
        media.setPointerCapture(e.pointerId);
        input.focus({ preventScroll: true });
        if (e.pointerType !== 'touch') fromPointer(e);
      });
      media.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        moved = true; fromPointer(e);
      });
      function endDrag(e) {
        if (!dragging) return;
        dragging = false;
        if (e.type === 'pointerup' && e.pointerType === 'touch' && !moved) fromPointer(e);
        if (media.hasPointerCapture(e.pointerId)) media.releasePointerCapture(e.pointerId);
      }
      media.addEventListener('pointerup', endDrag);
      media.addEventListener('pointercancel', endDrag);
      input.addEventListener('input', function () { setPos(input.value); });
      setPos(input.value);
    });
  }

  /* -------- 9. Booking modal ---------------------------------------------- */
  function initBooking() {
    var modal = $('#bookingModal');
    var modalBody = $('#modalBody');
    var modalOk = $('#modalSuccess');
    var form = $('#bookingForm');
    var reopenWa = $('#reopenWa');
    if (!modal || !form) return;

    var nameInput = $('#f-name');
    var phoneInput = $('#f-phone');
    var dateInput = $('#f-date');
    var timeInput = $('#f-time');
    var serviceSel = $('#f-service');
    var msgInput = $('#f-msg');
    var opener = null;

    function todayIso() {
      var now = new Date();
      var pad = function (n) { return String(n).padStart(2, '0'); };
      return now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
    }
    function fieldOf(input) { return input ? input.closest('.field') : null; }
    function setError(input, errId, msg) {
      var f = fieldOf(input), e = document.getElementById(errId);
      if (f) f.classList.add('is-invalid');
      if (e) e.textContent = msg;
      if (input) input.setAttribute('aria-invalid', 'true');
    }
    function clearError(input, errId) {
      var f = fieldOf(input), e = document.getElementById(errId);
      if (f) f.classList.remove('is-invalid');
      if (e) e.textContent = '';
      if (input) input.removeAttribute('aria-invalid');
    }
    var FIELD_ERRORS = [
      [nameInput, 'e-name'],
      [phoneInput, 'e-phone'],
      [dateInput, 'e-date'],
      [timeInput, 'e-time']
    ];

    function resetForm() {
      form.reset();
      FIELD_ERRORS.forEach(function (p) { clearError(p[0], p[1]); });
      modalBody.hidden = false;
      modalOk.hidden = true;
    }

    function openModal(service, trigger) {
      if (modal.classList.contains('is-open')) return;
      opener = trigger;
      if (ui.isMenuOpen()) {
        ui.closeMenu();
        opener = ui.menuToggle || trigger;
      }
      resetForm();
      if (dateInput) dateInput.min = todayIso();
      if (service && serviceSel) {
        var match = Array.prototype.some.call(serviceSel.options, function (o) { return o.value === service; });
        if (match) serviceSel.value = service;
      }
      haltScroll();
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('modal-open');
      syncScrollLock();
      if (nameInput) nameInput.focus();
    }
    function closeModal() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('modal-open');
      syncScrollLock();
      if (opener && typeof opener.focus === 'function') opener.focus();
      opener = null;
    }
    ui.isModalOpen = function () { return modal.classList.contains('is-open'); };
    ui.closeModal = closeModal;

    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-book]');
      if (!trigger) return;
      e.preventDefault();
      openModal(trigger.dataset.service || '', trigger);
    });

    $$('[data-close-modal]').forEach(function (el) {
      el.addEventListener('click', closeModal);
    });

    modal.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var focusables = $$(
        'a[href], button:not([disabled]), input:not([disabled]), ' +
        'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        modal
      ).filter(function (el) { return el.offsetParent !== null && !el.hidden; });
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    function weekdayOf(value) {
      var d = new Date(value + 'T00:00:00');
      return isNaN(d.getTime()) ? null : d.getDay();
    }
    function validate() {
      var valid = true;
      FIELD_ERRORS.forEach(function (p) { clearError(p[0], p[1]); });
      if (!nameInput || nameInput.value.trim().length < 2) {
        setError(nameInput, 'e-name', 'Please enter your name.');
        valid = false;
      }
      var digits = sanitiseNumber(phoneInput ? phoneInput.value : '');
      if (digits.length < 7 || digits.length > 15) {
        setError(phoneInput, 'e-phone', 'Please enter a valid phone number, including country code.');
        valid = false;
      }
      if (dateInput && dateInput.value) {
        var chosen = new Date(dateInput.value + 'T00:00:00');
        var today = new Date(); today.setHours(0, 0, 0, 0);
        if (isNaN(chosen.getTime()) || chosen < today) {
          setError(dateInput, 'e-date', 'Please choose today or a future date.');
          valid = false;
        }
      }
      if (dateInput && dateInput.value && timeInput && timeInput.value) {
        var option = timeInput.options[timeInput.selectedIndex];
        var days = option ? option.getAttribute('data-days') : null;
        var day = weekdayOf(dateInput.value);
        if (days && day !== null && days.split(',').indexOf(String(day)) === -1) {
          setError(timeInput, 'e-time', day === 0
            ? 'On Sundays the evening session is 4:30 PM – 8:00 PM. Please choose “Sunday evening”, or another time.'
            : '“Sunday evening” applies to Sundays only. Please pick a Sunday, or choose the regular evening or daytime option.');
          valid = false;
        }
      }
      return valid;
    }

    FIELD_ERRORS.forEach(function (p) {
      var input = p[0], errId = p[1];
      if (!input) return;
      input.addEventListener('input', function () { clearError(input, errId); });
    });
    if (dateInput) dateInput.addEventListener('change', function () { clearError(timeInput, 'e-time'); });
    if (timeInput) timeInput.addEventListener('change', function () { clearError(timeInput, 'e-time'); });

    function buildMessage() {
      var lines = [];
      lines.push("Hello Dr. Raj's Multispeciality Dental Clinic,");
      lines.push('');
      lines.push('I would like to enquire about an appointment.');
      lines.push('');
      lines.push('— Name: ' + (nameInput.value.trim()));
      lines.push('— Phone: ' + (phoneInput.value.trim()));
      if (dateInput && dateInput.value) {
        var d = new Date(dateInput.value + 'T00:00:00');
        var nice = d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        lines.push('— Preferred date: ' + nice);
      }
      if (timeInput && timeInput.value) lines.push('— Preferred time: ' + timeInput.value);
      if (serviceSel && serviceSel.value) lines.push('— Service: ' + serviceSel.value);
      if (msgInput && msgInput.value.trim()) lines.push('— Note: ' + msgInput.value.trim());
      lines.push('');
      lines.push('Please share your available timings. Thank you.');
      return lines.join('\n');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate()) {
        var firstInvalid = $('.field.is-invalid input, .field.is-invalid select, .field.is-invalid textarea', form);
        if (firstInvalid) firstInvalid.focus();
        return;
      }
      var url = waUrl(buildMessage());
      window.open(url, '_blank', 'noopener,noreferrer');
      if (reopenWa) reopenWa.href = url;
      modalBody.hidden = true;
      modalOk.hidden = false;
      var heading = modalOk.querySelector('h2');
      if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus(); }
    });
  }

  /* -------- 10. Escape key ------------------------------------------------- */
  function initGlobalKeys() {
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (ui.isModalOpen()) { e.preventDefault(); ui.closeModal(); return; }
      if (ui.isMenuOpen()) {
        e.preventDefault(); ui.closeMenu();
        if (ui.menuToggle) ui.menuToggle.focus();
      }
    });
  }

  /* -------- 11. Promotional banner (NEW) --------------------------------- */
  function initPromoBanner() {
    if (!PROMO || PROMO.enabled !== true) return;

    /* Date eligibility */
    if (!promotionDatesPass(PROMO)) return;

    var desktop = String(PROMO.desktopImage || '').trim();
    var mobile  = String(PROMO.mobileImage  || '').trim();
    if (!desktop && !mobile) return;

    var dismissKey = 'promo_dismissed_' +
      String(PROMO.campaignName || 'default').replace(/\s+/g, '_').toLowerCase();

    var dismissible = PROMO.dismissible !== false;
    if (dismissible) {
      try {
        if (sessionStorage.getItem(dismissKey) === '1') return;
      } catch (e) { /* storage blocked — proceed */ }
    }

    var banner = buildPromoBanner(PROMO, desktop, mobile, dismissible);
    if (!banner) return;

    var placement = PROMO.placement || 'hero-after';
    if (!insertPromoBanner(banner, placement)) return;

    wirePromoClose(banner, PROMO, dismissKey, dismissible);
    if (placement === 'bottom-bar') measureBottomBarHeight(banner);
  }

  function promotionDatesPass(cfg) {
    var now = Date.now();
    var start = null, end = null;
    if (cfg.startDate) {
      start = Date.parse(cfg.startDate);
      if (isNaN(start)) return false;
    }
    if (cfg.endDate) {
      end = Date.parse(cfg.endDate);
      if (isNaN(end)) return false;
    }
    if (start !== null && now < start) return false;
    if (end   !== null && now > end)   return false;
    return true;
  }

  function buildPromoBanner(cfg, desktop, mobile, dismissible) {
    var banner = document.createElement('aside');
    banner.className = 'promo-banner';
    banner.setAttribute('role', 'complementary');
    banner.setAttribute('aria-label', cfg.campaignName || 'Promotion');

    var placement = cfg.placement || 'hero-after';
    if (placement === 'floating') banner.classList.add('promo-banner--floating');
    else if (placement === 'bottom-bar') banner.classList.add('promo-banner--bottom');
    else if (placement === 'top') banner.classList.add('promo-banner--top');
    else if (placement === 'hero-before') banner.classList.add('promo-banner--hero-before');
    else banner.classList.add('promo-banner--hero-after');

    /* Link or static container */
    var wrapper;
    if (isSafeUrl(cfg.link)) {
      wrapper = document.createElement('a');
      wrapper.className = 'promo-banner__link';
      wrapper.href = cfg.link;
      if (cfg.openInNewTab) {
        wrapper.target = '_blank';
        wrapper.rel = 'noopener noreferrer';
      }
    } else {
      wrapper = document.createElement('div');
      wrapper.className = 'promo-banner__link';
    }

    /* Responsive image */
    var picture = document.createElement('picture');
    if (mobile && desktop) {
      var source = document.createElement('source');
      source.media = '(max-width: 767px)';
      source.srcset = mobile;
      picture.appendChild(source);
    }
    var img = document.createElement('img');
    img.className = 'promo-banner__img';
    img.src = desktop || mobile;
    img.alt = cfg.altText || 'Special promotional offer';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.addEventListener('error', function () {
      /* If we still have an unused fallback, try it once */
      var fallback = mobile && img.getAttribute('src') !== mobile ? mobile
                    : desktop && img.getAttribute('src') !== desktop ? desktop
                    : null;
      if (fallback) { img.src = fallback; return; }
      /* Both failed — remove banner entirely */
      banner.remove();
      document.body.classList.remove('has-promo-bottom');
    });
    picture.appendChild(img);
    wrapper.appendChild(picture);
    banner.appendChild(wrapper);

    /* Close button */
    if (cfg.showCloseButton && dismissible) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'promo-banner__close';
      btn.setAttribute('aria-label', 'Dismiss promotion');
      btn.innerHTML =
        '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
      banner.appendChild(btn);
    }
    return banner;
  }

  function insertPromoBanner(banner, placement) {
    var main = document.getElementById('main');
    var hero = document.getElementById('top');
    switch (placement) {
      case 'top':
        return insertAtTop(banner);
      case 'hero-before':
        if (main) { main.insertBefore(banner, main.firstChild); return true; }
        return insertAtTop(banner);
      case 'hero-after':
        if (hero && hero.parentNode) { hero.parentNode.insertBefore(banner, hero.nextSibling); return true; }
        return insertAtTop(banner);
      case 'floating':
      case 'bottom-bar':
        document.body.appendChild(banner);
        if (placement === 'bottom-bar') document.body.classList.add('has-promo-bottom');
        return true;
      default:
        if (hero && hero.parentNode) { hero.parentNode.insertBefore(banner, hero.nextSibling); return true; }
        return insertAtTop(banner);
    }
  }
  function insertAtTop(banner) {
    var skip = document.querySelector('.skip-link');
    if (skip && skip.parentNode) {
      skip.parentNode.insertBefore(banner, skip.nextSibling);
    } else {
      document.body.insertBefore(banner, document.body.firstChild);
    }
    return true;
  }

  function wirePromoClose(banner, cfg, dismissKey, dismissible) {
    if (!dismissible) return;
    var btn = banner.querySelector('.promo-banner__close');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      banner.remove();
      document.body.classList.remove('has-promo-bottom');
      try { sessionStorage.setItem(dismissKey, '1'); } catch (err) { /* ignore */ }
    });
  }

  function measureBottomBarHeight(banner) {
    function apply() {
      var h = banner.offsetHeight;
      if (h > 0) {
        document.documentElement.style.setProperty('--promo-bottom-h', h + 'px');
      }
    }
    var img = banner.querySelector('.promo-banner__img');
    if (img && !img.complete) img.addEventListener('load', apply);
    window.requestAnimationFrame(apply);
    window.addEventListener('resize', apply, { passive: true });
  }

  /* -------- 12. Init ------------------------------------------------------ */
  function init() {
    [applyConfig, initPromoBanner, initScrollUi, initNav, initReveal,
     initAccordions, initBeforeAfter, initBooking, initGlobalKeys]
      .forEach(function (step) {
        try { step(); }
        catch (err) { console.error('Initialisation step "' + step.name + '" failed:', err); }
      });
    document.documentElement.classList.add('js-ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
