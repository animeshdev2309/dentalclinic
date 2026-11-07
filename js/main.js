/* ==========================================================================
   main.js — all behaviour for the website

   Requires (loaded before this file, see index.html):
     js/business-config.js   -> BUSINESS_CONFIG   (public business details)
     js/image-config.js      -> IMAGE_CONFIG      (every picture on the site)
     js/promotion-config.js  -> PROMOTION_CONFIG  (promotional banner)

   The interactive features (navigation, scroll spy, reveal animations,
   accordions, before/after sliders, appointment form) are the original
   page's code. New in this file: section 1 (config), section 3 (applying
   the config to the page) and section 11 (promotional banner).
   ========================================================================== */

(function () {
  'use strict';

  /* =======================================================================
     1. CONFIGURATION
     BUSINESS_CONFIG comes from js/business-config.js and PROMOTION_CONFIG
     from js/promotion-config.js. index.html loads both BEFORE this file.
     Nothing business-specific is hard-coded here.
     ======================================================================= */
  var BUSINESS = (typeof BUSINESS_CONFIG !== 'undefined' && BUSINESS_CONFIG) || {};
  var IMAGES = (typeof IMAGE_CONFIG !== 'undefined' && IMAGE_CONFIG) || {};
  var PROMOTION = (typeof PROMOTION_CONFIG !== 'undefined' && PROMOTION_CONFIG) || {};

  if (typeof IMAGE_CONFIG === 'undefined') {
    console.warn('image-config.js did not load: the page keeps its built-in pictures.');
  }

  /* A single picture setting from IMAGE_CONFIG as a trimmed string ('' when
     missing), e.g. imageSetting('logo'). */
  function imageSetting(key) {
    var value = IMAGES[key];
    return typeof value === 'string' ? value.trim() : '';
  }

  /* One entry of a picture list (services / gallery) as a trimmed string. */
  function imageListItem(key, index) {
    var list = IMAGES[key];
    var value = Array.isArray(list) ? list[index] : '';
    return typeof value === 'string' ? value.trim() : '';
  }

  if (typeof BUSINESS_CONFIG === 'undefined') {
    console.warn('business-config.js did not load: the page keeps its built-in text and links.');
  }

  /* Read a nested value from BUSINESS_CONFIG, e.g. read('contact.phone'). */
  function read(path) {
    var node = BUSINESS;
    var keys = path.split('.');
    for (var i = 0; i < keys.length; i++) {
      if (node === null || typeof node !== 'object') return undefined;
      node = node[keys[i]];
    }
    return node;
  }

  /* A trimmed string ('' when missing). Arrays (e.g. opening hours) become
     one line per entry. */
  function text(path) {
    var value = read(path);
    if (Array.isArray(value)) {
      return value.map(function (v) { return String(v).trim(); })
                  .filter(Boolean).join('\n');
    }
    return (typeof value === 'string' || typeof value === 'number')
      ? String(value).trim() : '';
  }

  /* URL checks. Only the listed schemes are accepted, so a value such as
     "javascript:..." can never end up in an href or src. Relative paths
     ("assets/x.jpg", "#visit") are fine. */
  function safeUrl(value, allowedProtocols) {
    var raw = typeof value === 'string' ? value.trim() : '';
    if (!raw) return '';
    try {
      var parsed = new URL(raw, 'https://placeholder.invalid/');
      return allowedProtocols.indexOf(parsed.protocol) !== -1 ? raw : '';
    } catch (err) {
      return '';
    }
  }
  function safeImageUrl(value) {
    var raw = typeof value === 'string' ? value.trim() : '';
    if (/^data:image\//i.test(raw)) return raw;
    return safeUrl(raw, ['http:', 'https:']);
  }

  var DEFAULT_WA_MESSAGE =
    text('booking.whatsappMessage') || 'Hello, I would like to make an enquiry.';

  /* Sections observed by the scroll spy, in document order. */
  var SPY_IDS = ['top', 'experience', 'services', 'results', 'dentist',
                 'journey', 'clinic', 'notes', 'faq', 'visit'];

  /* =======================================================================
     2. Helpers and shared UI state
     ======================================================================= */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* Live query: read .matches at the moment of use so a change in the OS
     setting is honoured without a reload. */
  var reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  function prefersReducedMotion() { return reduceMotionQuery.matches; }

  function sanitiseNumber(value) {
    return String(value || '').replace(/[^\d]/g, '');
  }

  function waUrl(message) {
    var number = sanitiseNumber(text('contact.whatsapp'));
    if (!number) return '#';
    return 'https://wa.me/' + number + '?text=' +
      encodeURIComponent(message || DEFAULT_WA_MESSAGE);
  }

  function telUrl() {
    var cleaned = text('contact.phone').replace(/[^\d+]/g, '');
    return cleaned ? 'tel:' + cleaned : '#';
  }

  /* The menu and the modal both register themselves here so Escape handling
     and overlay-state queries have one owner. */
  var ui = {
    menuToggle: null,
    isMenuOpen: function () { return false; },
    closeMenu: function () {},
    isModalOpen: function () { return false; },
    closeModal: function () {}
  };

  /* Scroll lock is derived from the state class, never set ad hoc, so
     nothing can leave the page locked except the modal. The mobile dropdown
     deliberately does NOT lock the page (see the note in the CSS). */
  function syncScrollLock() {
    var locked = document.documentElement.classList.contains('modal-open');
    document.body.style.overflow = locked ? 'hidden' : '';
  }

  /* Kill an in-flight smooth scroll instantly. Must run before we change the
     root scroller's overflow, otherwise the animation never resolves and the
     page can stay locked. Setting scroll-behavior:auto temporarily is what
     makes window.scrollTo() land immediately rather than starting a new
     smooth scroll. */
  function haltScroll() {
    var root = document.documentElement;
    var prev = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(window.scrollX, window.scrollY);
    root.style.scrollBehavior = prev;
  }

  /* One implementation of in-page navigation: scroll, move focus to the
     target for keyboard/screen-reader users, and keep the URL hash in sync. */
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
    } catch (err) {
      /* history.replaceState can throw a SecurityError in sandboxed or
         opaque-origin contexts. The scroll already happened, so only the
         address-bar hash is skipped. */
    }
    return true;
  }

  /* =======================================================================
     3. Apply business configuration
     Markup hooks (see index.html):
       data-field="x"      text is replaced by the configured value x
       data-field-row="x"  the element (a row/list item) is hidden when x is empty
       data-wa / data-tel  WhatsApp and call links
       data-directions     map links           data-social="x"  social links
       data-cred="x"       dentist credentials data-privacy     privacy link
     An empty value never blanks out text; the markup's own text stays.
     ======================================================================= */

  /* Three lines: "line1," / "line2, city," / "state pincode, country". */
  function formatAddress() {
    var lineOne = text('address.line1');
    var lineTwo = [text('address.line2'), text('address.city')].filter(Boolean).join(', ');
    var lineThree = [
      [text('address.state'), text('address.pincode')].filter(Boolean).join(' '),
      text('address.country')
    ].filter(Boolean).join(', ');
    return [lineOne, lineTwo, lineThree].filter(Boolean).join(',\n');
  }

  function applyConfig() {
    var name = text('name');
    var fee = text('consultation.fee');
    var feeNote = text('consultation.note');

    var values = {
      name: name,
      navbarName: text('navbarName') || name,
      navbarSubtitle: text('navbarSubtitle'),
      doctorName: text('doctor.name'),
      area: text('address.area'),
      city: text('address.city'),
      established: text('established'),
      address: formatAddress(),
      hours: text('openingHours'),
      phone: text('contact.phoneDisplay'),
      email: text('contact.email'),
      fee: fee,
      consultation: [fee, feeNote].filter(Boolean).join(' · '),
      rating: text('rating')
    };

    /* WhatsApp and call links (real hrefs in the markup keep working without
       JavaScript; these calls replace them with the configured values). */
    var hasWhatsapp = !!sanitiseNumber(text('contact.whatsapp'));
    $$('[data-wa]').forEach(function (a) {
      if (!hasWhatsapp) { a.hidden = true; return; }
      a.href = waUrl(DEFAULT_WA_MESSAGE);
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    });

    var hasPhone = telUrl() !== '#';
    $$('[data-tel]').forEach(function (a) {
      if (!hasPhone) { a.hidden = true; return; }
      a.href = telUrl();
    });

    $$('[data-field]').forEach(function (el) {
      var value = values[el.dataset.field];
      if (!value) return;
      el.textContent = value;
      if (el.tagName === 'A' && el.dataset.field === 'email') {
        el.href = 'mailto:' + value;
      }
    });

    /* Rows that make no sense without their value are hidden when it is empty. */
    $$('[data-field-row]').forEach(function (row) {
      row.hidden = !values[row.dataset.fieldRow];
    });

    /* A deliberately empty navbar subtitle removes the second line entirely. */
    var subtitle = $('.brand__sub');
    if (subtitle && typeof read('navbarSubtitle') === 'string' && !values.navbarSubtitle) {
      subtitle.hidden = true;
    }

    var brand = $('.brand');
    if (brand && name) brand.setAttribute('aria-label', name + ' — home');

    var ratingItem = $('[data-rating]');
    if (ratingItem) ratingItem.hidden = !values.rating;

    $$('[data-cred]').forEach(function (el) {
      var value = text('doctor.' + el.dataset.cred);
      if (value) el.textContent = value;
    });

    /* Both "Get directions" links (the one beside the details and the one
       under the embedded map) point at map.directionsUrl. */
    var directions = safeUrl(read('map.directionsUrl'), ['http:', 'https:']);
    if (directions) {
      $$('[data-directions]').forEach(function (a) {
        a.href = directions;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      });
    }

    /* Social links: shown only when a valid web address is configured. */
    $$('[data-social]').forEach(function (a) {
      var url = safeUrl(read('social.' + a.dataset.social), ['http:', 'https:']);
      if (url) {
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.hidden = false;
      } else {
        a.hidden = true;
      }
    });

    var privacy = $('[data-privacy]');
    if (privacy) {
      var privacyUrl = safeUrl(read('privacyUrl'), ['http:', 'https:']);
      if (privacyUrl) {
        privacy.href = privacyUrl;
        privacy.hidden = false;
      } else {
        privacy.hidden = true;
      }
    }

    var year = $('#year');
    if (year) year.textContent = String(new Date().getFullYear());
  }

  /* Pictures from IMAGE_CONFIG that sit in lists: the 12 services, the 4 clinic
     gallery tiles and the 3 before/after sliders. Each one is matched to its
     slot by position (same order as the page). An empty or unusable entry
     keeps the picture already in index.html. */

  /* Point an <img> at a new address. It stays lazy-loaded; if the new address
     cannot be loaded the original picture is put back. Returns true when the
     picture was actually changed. */
  function swapImage(img, url, onRestore) {
    if (!img || !url || img.getAttribute('src') === url) return false;
    var original = { src: img.getAttribute('src'), srcset: img.getAttribute('srcset') };
    img.addEventListener('error', function restore() {
      img.removeEventListener('error', restore);
      img.src = original.src;
      if (original.srcset) img.srcset = original.srcset;
      if (onRestore) onRestore();
    });
    img.removeAttribute('srcset');
    img.src = url;
    return true;
  }

  function applyPageImages() {
    /* -- Services (4:3 pictures inside the opened treatment). -- */
    $$('.svc-img').forEach(function (img, i) {
      swapImage(img, safeImageUrl(imageListItem('services', i)));
    });

    /* -- Clinic gallery. A real photo replaces the "Representative image"
          label and the "Clinic photo to be added" note, which would no longer
          be true. -- */
    $$('.tile').forEach(function (tile, i) {
      var img = $('.tile-media img', tile);
      var label = $('.tile-label', tile);
      var note = $('figcaption em', tile);
      var caption = $('figcaption', tile);
      var originalAlt = img ? img.alt : '';
      var swapped = swapImage(img, safeImageUrl(imageListItem('gallery', i)), function () {
        /* The new picture failed, so the sample is back: bring its labels back too. */
        if (label) label.hidden = false;
        if (note) note.hidden = false;
        img.alt = originalAlt;
      });
      if (!swapped) return;
      if (label) label.hidden = true;
      if (note) note.hidden = true;
      if (caption && caption.firstChild) {
        var title = String(caption.firstChild.textContent || '').trim();
        if (title) img.alt = title;
      }
    });

    /* -- Before / after sliders. Both pictures of a pair are needed; the pair
          is restored together if either one cannot be loaded. -- */
    var pairs = Array.isArray(IMAGES.beforeAfter) ? IMAGES.beforeAfter : [];
    $$('.ba').forEach(function (slider, i) {
      var pair = pairs[i] && typeof pairs[i] === 'object' ? pairs[i] : {};
      var beforeUrl = safeImageUrl(typeof pair.before === 'string' ? pair.before : '');
      var afterUrl = safeImageUrl(typeof pair.after === 'string' ? pair.after : '');
      var afterImg = $('.ba-media > img', slider);
      var beforeImg = $('.ba-before img', slider);
      if (!beforeUrl || !afterUrl || !afterImg || !beforeImg) return;

      var original = {
        before: { src: beforeImg.getAttribute('src'), alt: beforeImg.alt },
        after: { src: afterImg.getAttribute('src'), alt: afterImg.alt }
      };
      if (original.before.src === beforeUrl && original.after.src === afterUrl) return;

      var title = String(($('.ba-caption strong', slider) || {}).textContent || '').trim();
      var sampleBadge = $('.ba-sample', slider);
      var sampleNote = $('.ba-caption span', slider);
      var slideInput = $('.ba-input', slider);
      var originalLabel = slideInput ? slideInput.getAttribute('aria-label') : '';
      var originalNote = sampleNote ? sampleNote.hidden : false;

      function restorePair() {
        beforeImg.removeEventListener('error', restorePair);
        afterImg.removeEventListener('error', restorePair);
        beforeImg.src = original.before.src; beforeImg.alt = original.before.alt;
        afterImg.src = original.after.src; afterImg.alt = original.after.alt;
        if (sampleBadge) sampleBadge.hidden = false;
        if (sampleNote) sampleNote.hidden = originalNote;
        if (slideInput && originalLabel) slideInput.setAttribute('aria-label', originalLabel);
      }
      beforeImg.addEventListener('error', restorePair);
      afterImg.addEventListener('error', restorePair);

      beforeImg.src = beforeUrl;
      afterImg.src = afterUrl;
      /* Real photos: the "Illustrative sample" wording no longer applies. */
      beforeImg.alt = (title || 'Treatment') + ' — before';
      afterImg.alt = (title || 'Treatment') + ' — after';
      if (sampleBadge) sampleBadge.hidden = true;
      if (sampleNote) sampleNote.hidden = true;
      if (slideInput) {
        slideInput.setAttribute('aria-label', 'Compare before and after' + (title ? ', ' + title : ''));
      }
    });
  }

  /* Logo, hero photo, favicon, doctor portrait and embedded map. */
  function applyMedia() {
    var name = text('name');

    /* -- Logo: swap the built-in icon only once the image has loaded, so a
          bad address never leaves a broken image in the navbar. -- */
    var mark = $('.brand__mark');
    var logoUrl = safeImageUrl(imageSetting('logo'));
    if (mark && logoUrl) {
      var builtIn = mark.firstElementChild;
      var probe = new Image();
      probe.onload = function () {
        var logo = document.createElement('img');
        logo.src = logoUrl;
        logo.alt = '';            /* decorative: the link's label carries the name */
        logo.decoding = 'async';
        while (mark.firstChild) mark.removeChild(mark.firstChild);
        mark.appendChild(logo);
        mark.classList.add('brand__mark--logo');
        logo.addEventListener('error', function () {
          if (builtIn) {
            while (mark.firstChild) mark.removeChild(mark.firstChild);
            mark.appendChild(builtIn);
            mark.classList.remove('brand__mark--logo');
          }
        });
      };
      probe.src = logoUrl;
    }

    /* -- Dentist portrait: replaces the placeholder only once the image has
          loaded, so a bad address never leaves a broken picture. The frame
          (4:5, cropped to fill) is styled by .portrait-frame in style.css. -- */
    var portraitFrame = $('.portrait-frame');
    var portraitUrl = safeImageUrl(imageSetting('doctor'));
    if (portraitFrame && portraitUrl) {
      var portraitProbe = new Image();
      portraitProbe.onload = function () {
        var photo = document.createElement('img');
        photo.src = portraitUrl;
        photo.alt = text('doctor.name');
        photo.width = portraitProbe.naturalWidth;
        photo.height = portraitProbe.naturalHeight;
        photo.loading = 'lazy';
        photo.decoding = 'async';
        while (portraitFrame.firstChild) portraitFrame.removeChild(portraitFrame.firstChild);
        portraitFrame.appendChild(photo);
      };
      portraitProbe.src = portraitUrl;
    }

    /* -- Hero photo. Unsplash addresses get the same responsive set of widths
          the page has always used; any other host gets a single image. -- */
    var hero = $('.hero-img');
    var heroUrl = safeImageUrl(imageSetting('hero'));
    if (hero && heroUrl) {
      var srcset = '';
      var src = heroUrl;
      try {
        var u = new URL(heroUrl, window.location.href);
        if (u.hostname === 'images.unsplash.com') {
          srcset = [640, 960, 1280, 1600, 2000, 2400].map(function (w) {
            u.searchParams.set('w', String(w));
            return u.href + ' ' + w + 'w';
          }).join(', ');
          u.searchParams.set('w', '1280');
          src = u.href;
        }
      } catch (err) { /* keep the plain address */ }
      if (srcset) hero.srcset = srcset; else hero.removeAttribute('srcset');
      hero.src = src;
    }

    /* -- Favicon (none is set unless configured). -- */
    var faviconUrl = safeImageUrl(imageSetting('favicon'));
    if (faviconUrl) {
      var icon = $('link[rel~="icon"]');
      if (!icon) {
        icon = document.createElement('link');
        icon.rel = 'icon';
        document.head.appendChild(icon);
      }
      icon.href = faviconUrl;
    }

    /* -- Embedded map. -- */
    var map = $('[data-map-embed]');
    var mapQuery = text('map.embedQuery');
    if (map && mapQuery) {
      map.src = 'https://maps.google.com/maps?q=' +
        encodeURIComponent(mapQuery).replace(/'/g, '%27') +
        '&z=15&hl=en&output=embed';
      var where = [text('address.area'), text('address.city')].filter(Boolean).join(', ');
      if (name) {
        map.title = 'Google map showing the location of ' + name + (where ? ', ' + where : '');
      }
    }
  }

  /* =======================================================================
     4. Scroll UI (progress bar, is-stuck, to-top)
     ======================================================================= */
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
      if (!queued) {
        queued = true;
        window.requestAnimationFrame(update);
      }
    }, { passive: true });

    window.addEventListener('resize', update, { passive: true });

    if (toTop) {
      toTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      });
    }

    update();
  }

  /* =======================================================================
     5. Floating pill navigation + mobile menu + scroll spy
     ======================================================================= */
  function initNav() {
    var navItems    = $$('.nav-list .nav-item');
    var mobileLinks = $$('.mobile-link');
    var toggle      = $('#navToggle');
    var menu        = $('#mobileMenu');

    /* ---- Scroll-spy lock ------------------------------------------------
       A click-initiated smooth scroll passes through many sections, and the
       IntersectionObserver would otherwise re-highlight each one on the way.
       The lock keeps the clicked item active for the duration of the scroll;
       it is released as soon as scrolling settles (debounced on the scroll
       event) or after a hard safety ceiling if no scroll event ever fires. */
    var spyLocked = false;
    var spyTimer = null;

    function lockSpy() {
      spyLocked = true;
      clearTimeout(spyTimer);
      spyTimer = setTimeout(unlockSpy, 3000); /* safety ceiling */
    }
    function unlockSpy() {
      spyLocked = false;
      clearTimeout(spyTimer);
      spyTimer = null;
    }

    /* -- Active state, desktop + mobile together. A section with no nav
          entry (clinic, notes) simply leaves everything unhighlighted rather
          than showing a wrong item. aria-current="location" is the correct
          token for the current position within the page. -- */
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

    /* -- Mobile menu open/close. The dropdown does NOT lock the root
          scroller; it is anchored to the sticky header, so it scrolls with
          the page. Locking <html> here (as the old build did) could leave
          the viewport unscrollable if a smooth scroll was still running
          when the user re-opened the menu. -- */
    function isMenuOpen() {
      return !!(menu && menu.classList.contains('is-open'));
    }

    function openMenu() {
      if (!toggle || !menu) return;
      haltScroll();            /* don't let the page drift under the menu */
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
        if (isMenuOpen()) closeMenu();
        else openMenu();
      });

      /* Close on outside click */
      document.addEventListener('click', function (e) {
        if (!isMenuOpen()) return;
        var t = e.target;
        if (!t || !t.closest) return;
        if (menu.contains(t)) return;
        if (toggle.contains(t)) return;
        closeMenu();
      });

      /* WhatsApp / Call inside the menu leave the page context, so the menu
         should not stay open behind them. */
      $$('.mobile-actions a').forEach(function (a) {
        a.addEventListener('click', closeMenu);
      });

      /* Reset when leaving mobile breakpoint */
      var mq = window.matchMedia('(max-width: 899px)');
      var onBreakpoint = function (m) { if (!m.matches) closeMenu(); };
      if (mq.addEventListener) mq.addEventListener('change', onBreakpoint);
      else if (mq.addListener) mq.addListener(onBreakpoint);
    }

    /* Re-open the spy as soon as scrolling settles. */
    window.addEventListener('scroll', function () {
      if (!spyLocked) return;
      clearTimeout(spyTimer);
      spyTimer = setTimeout(unlockSpy, 160);
    }, { passive: true });

    /* -- Every in-page "#section" link (brand, desktop nav, mobile menu,
          scroll cue, footer, skip link) goes through this one handler. -- */
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

      if (SPY_IDS.indexOf(id) !== -1) {
        lockSpy();          /* hold the clicked item while the scroll runs */
        setActive(id);      /* highlight the target immediately */
      }
      goToSection(id);
    });

    /* Space activates the desktop icon links, matching button behaviour. */
    navItems.forEach(function (item) {
      item.addEventListener('keydown', function (e) {
        if (e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          item.click();
        }
      });
    });

    /* -- Scroll spy (IntersectionObserver on a thin band at mid-screen) -- */
    var visible = {};

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          visible[entry.target.id] = entry.isIntersecting;
        });
        if (spyLocked) return;
        for (var i = 0; i < SPY_IDS.length; i++) {
          if (visible[SPY_IDS[i]]) {
            setActive(SPY_IDS[i]);
            return;
          }
        }
      }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

      SPY_IDS.forEach(function (id) {
        var el = document.getElementById(id);
        if (el) io.observe(el);
      });
    }

    /* -- Sync active from hash on load / hash change -- */
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

  /* =======================================================================
     6. Reveal on scroll
     ======================================================================= */
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

  /* =======================================================================
     7. Accordions
     Click toggles every accordion. Additionally, on wide screens with a real
     pointer, hovering a row in the Services index opens it — so the panel is
     reachable without a click. The panel stays open when the pointer leaves,
     which lets you move down into it to reach the "Enquire" button.
     ======================================================================= */
  function initAccordions() {
    /* Hover only where a real pointer exists and the layout is desktop-sized,
       so tablets/phones keep tap-to-open and never open on stray hovers. */
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
            var otherItem = other.closest('.acc-item');
            if (otherItem) otherItem.classList.remove('is-open');
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

      /* Services only: hovering a row opens it. The panel stays open when the
         pointer leaves, so you can move down into it and click "Enquire". */
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

  /* =======================================================================
     8. Before & After slider
     Pointer input is mapped straight from the cursor position to the value,
     so the visual handle sits exactly under the pointer (the native range
     thumb has a fixed width, which made its travel shorter than the image).
     The range input stays in the page for keyboard and assistive tech.
     ======================================================================= */
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
        input.value = String(pct);
        setPos(pct);
      }

      var dragging = false;
      var moved = false;

      media.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        dragging = true;
        moved = false;
        media.setPointerCapture(e.pointerId);
        input.focus({ preventScroll: true });
        /* Touch: wait for the first horizontal move (or a tap) so a vertical
           page scroll that starts on the slider does not move the handle. */
        if (e.pointerType !== 'touch') fromPointer(e);
      });

      media.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        moved = true;
        fromPointer(e);
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

  /* =======================================================================
     9. Booking modal
     ======================================================================= */
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

    function setError(input, errId, message) {
      var field = fieldOf(input);
      var err = document.getElementById(errId);
      if (field) field.classList.add('is-invalid');
      if (err) err.textContent = message;
      if (input) input.setAttribute('aria-invalid', 'true');
    }

    function clearError(input, errId) {
      var field = fieldOf(input);
      var err = document.getElementById(errId);
      if (field) field.classList.remove('is-invalid');
      if (err) err.textContent = '';
      if (input) input.removeAttribute('aria-invalid');
    }

    var FIELD_ERRORS = [
      [nameInput, 'e-name'],
      [phoneInput, 'e-phone'],
      [dateInput, 'e-date'],
      [timeInput, 'e-time']
    ];

    /* A fresh enquiry always starts clean: values, errors and panels. */
    function resetForm() {
      form.reset();
      FIELD_ERRORS.forEach(function (pair) { clearError(pair[0], pair[1]); });
      modalBody.hidden = false;
      modalOk.hidden = true;
    }

    function openModal(service, trigger) {
      if (modal.classList.contains('is-open')) return;

      /* If the booking button was inside the mobile menu, close the menu
         first and return focus to its toggle (the button is about to be
         hidden along with the menu). */
      opener = trigger;
      if (ui.isMenuOpen()) {
        ui.closeMenu();
        opener = ui.menuToggle || trigger;
      }

      resetForm();
      if (dateInput) dateInput.min = todayIso();

      if (service && serviceSel) {
        var match = Array.prototype.some.call(serviceSel.options, function (o) {
          return o.value === service;
        });
        if (match) serviceSel.value = service;
      }

      /* Stop any in-flight smooth scroll before applying the root lock so
         the lock can never be applied mid-animation. */
      haltScroll();
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('modal-open');
      syncScrollLock();

      /* The modal becomes visible immediately on open (see .modal.is-open),
         so the field can take focus right away. */
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

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    });

    /* -- Validation -- */
    function weekdayOf(value) {
      var d = new Date(value + 'T00:00:00');
      return isNaN(d.getTime()) ? null : d.getDay(); /* 0 = Sunday */
    }

    function validate() {
      var valid = true;
      FIELD_ERRORS.forEach(function (pair) { clearError(pair[0], pair[1]); });

      if (!nameInput || nameInput.value.trim().length < 2) {
        setError(nameInput, 'e-name', 'Please enter your name.');
        valid = false;
      }

      var digits = sanitiseNumber(phoneInput ? phoneInput.value : '');
      if (digits.length < 7 || digits.length > 15) {
        setError(phoneInput, 'e-phone',
          'Please enter a valid phone number, including country code.');
        valid = false;
      }

      if (dateInput && dateInput.value) {
        var chosen = new Date(dateInput.value + 'T00:00:00');
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        if (isNaN(chosen.getTime()) || chosen < today) {
          setError(dateInput, 'e-date', 'Please choose today or a future date.');
          valid = false;
        }
      }

      /* Weekday and time slot must agree. Each time option lists the weekdays
         it applies to in data-days (0 = Sunday ... 6 = Saturday). */
      if (dateInput && dateInput.value && timeInput && timeInput.value) {
        var option = timeInput.options[timeInput.selectedIndex];
        var days = option ? option.getAttribute('data-days') : null;
        var day = weekdayOf(dateInput.value);
        if (days && day !== null && days.split(',').indexOf(String(day)) === -1) {
          /* The Sunday hours are read from the form's own Sunday option, so
             the message always matches the options in index.html. */
          var sundayOption = timeInput.querySelector('option[data-days="0"]');
          var sundayMatch = sundayOption ? /\(([^)]+)\)/.exec(sundayOption.value) : null;
          setError(timeInput, 'e-time', day === 0
            ? (sundayMatch
                ? 'On Sundays the evening session is ' + sundayMatch[1] + '. Please choose “Sunday evening”, or another time.'
                : 'On Sundays a different evening session applies. Please choose “Sunday evening”, or another time.')
            : '“Sunday evening” applies to Sundays only. Please pick a Sunday, or choose the regular evening or daytime option.');
          valid = false;
        }
      }

      return valid;
    }

    FIELD_ERRORS.forEach(function (pair) {
      var input = pair[0];
      var errId = pair[1];
      if (!input) return;
      input.addEventListener('input', function () { clearError(input, errId); });
    });
    /* Changing either half of the date/time pair re-opens the other's error. */
    if (dateInput) dateInput.addEventListener('change', function () { clearError(timeInput, 'e-time'); });
    if (timeInput) timeInput.addEventListener('change', function () { clearError(timeInput, 'e-time'); });

    function buildMessage() {
      var lines = [];
      lines.push('Hello ' + (text('name') || 'there') + ',');
      lines.push('');
      lines.push('I would like to enquire about an appointment.');
      lines.push('');
      lines.push('— Name: ' + (nameInput.value.trim()));
      lines.push('— Phone: ' + (phoneInput.value.trim()));

      if (dateInput && dateInput.value) {
        var d = new Date(dateInput.value + 'T00:00:00');
        var nice = d.toLocaleDateString(undefined, {
          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });
        lines.push('— Preferred date: ' + nice);
      }

      if (timeInput && timeInput.value) {
        lines.push('— Preferred time: ' + timeInput.value);
      }

      if (serviceSel && serviceSel.value) {
        lines.push('— Service: ' + serviceSel.value);
      }

      if (msgInput && msgInput.value.trim()) {
        lines.push('— Note: ' + msgInput.value.trim());
      }

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

      /* Open synchronously inside the submit gesture so popup blockers allow
         it. The return value is deliberately ignored: with "noopener" it is
         always null even when the tab opened, so it cannot signal failure.
         The current page is never navigated; if a browser still blocks the
         tab, the "Open WhatsApp again" link below is a normal user click. */
      window.open(url, '_blank', 'noopener,noreferrer');
      if (reopenWa) reopenWa.href = url;

      modalBody.hidden = true;
      modalOk.hidden = false;

      var heading = modalOk.querySelector('h2');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus();
      }
    });
  }


  /* =======================================================================
     10. Global keys (Escape): one handler decides what Escape closes
     ======================================================================= */
  function initGlobalKeys() {
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;

      if (ui.isModalOpen()) {
        e.preventDefault();
        ui.closeModal();
        return;
      }
      if (ui.isMenuOpen()) {
        e.preventDefault();
        ui.closeMenu();
        if (ui.menuToggle) ui.menuToggle.focus();
      }
    });
  }

  /* =======================================================================
     11. Promotional banner  (configured in js/promotion-config.js)
     Eligibility (enabled flag, schedule, earlier dismissal, usable image) is
     decided once, when the page initialises. The banner is only inserted into
     the page AFTER its image has loaded, so a disabled, expired, closed or
     broken promotion never leaves an empty container or blank space behind.
     ======================================================================= */
  var PROMO_ID = 'promoBanner';
  var PROMO_PLACEMENTS = ['top', 'hero-before', 'hero-after', 'floating', 'bottom-bar'];
  var PROMO_DEFAULT_PLACEMENT = 'hero-after';
  /* Phones use the mobile image; everything wider uses the desktop image. */
  var PROMO_MOBILE_QUERY = '(max-width: 767px)';
  var promoStarted = false;

  /* ---- Schedule ------------------------------------------------------- */

  /* Accepts "YYYY-MM-DD" or "YYYY-MM-DD[T ]HH:MM[:SS[.mmm]]", optionally
     followed by "Z" or "+HH:MM" / "-HH:MM". */
  var PROMO_DATE_PATTERN =
    /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?)?\s*(Z|[+-]\d{2}:\d{2})?$/i;

  /* "Z" / "+05:30" / "-08:00" -> minutes east of UTC, or null when invalid. */
  function offsetToMinutes(token) {
    if (typeof token !== 'string') return null;
    var t = token.trim();
    if (/^z$/i.test(t)) return 0;
    var m = /^([+-])(\d{2}):(\d{2})$/.exec(t);
    if (!m) return null;
    var hours = Number(m[2]);
    var minutes = Number(m[3]);
    if (hours > 14 || minutes > 59) return null;
    return (m[1] === '-' ? -1 : 1) * (hours * 60 + minutes);
  }

  /* Returns the instant in milliseconds, or null when the value is not a real
     date. A date without a time means the start of that day, or - for an end
     date - its last millisecond. A date without its own offset uses
     fallbackOffset (minutes), which is null when timeZoneOffset is invalid. */
  function parsePromoDate(value, isEnd, fallbackOffset) {
    if (typeof value !== 'string') return null;
    var m = PROMO_DATE_PATTERN.exec(value.trim());
    if (!m) return null;

    var year = Number(m[1]);
    var month = Number(m[2]);
    var day = Number(m[3]);
    var hasTime = m[4] !== undefined;
    var hour = hasTime ? Number(m[4]) : (isEnd ? 23 : 0);
    var minute = hasTime ? Number(m[5]) : (isEnd ? 59 : 0);
    var second = hasTime ? (m[6] !== undefined ? Number(m[6]) : 0) : (isEnd ? 59 : 0);
    var millis = hasTime ? (m[7] !== undefined ? Number((m[7] + '00').slice(0, 3)) : 0)
                         : (isEnd ? 999 : 0);

    var offset = m[8] !== undefined ? offsetToMinutes(m[8]) : fallbackOffset;
    if (offset === null) return null;

    var asUtc = Date.UTC(year, month - 1, day, hour, minute, second, millis);
    var check = new Date(asUtc);
    /* Reject impossible dates such as 2026-02-31 or 24:00 that Date.UTC
       would silently roll over into the next day. */
    if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 ||
        check.getUTCDate() !== day || check.getUTCHours() !== hour ||
        check.getUTCMinutes() !== minute || check.getUTCSeconds() !== second) {
      return null;
    }
    return asUtc - offset * 60000;
  }

  function isBlank(value) {
    return value === undefined || value === null ||
      (typeof value === 'string' && value.trim() === '');
  }

  /* true only when "now" lies inside the configured window. A date that
     cannot be understood hides the banner instead of guessing. */
  function isWithinSchedule(config, now) {
    var fallbackOffset = offsetToMinutes(config.timeZoneOffset);
    var start = null;
    var end = null;

    if (!isBlank(config.startDate)) {
      start = parsePromoDate(config.startDate, false, fallbackOffset);
      if (start === null) {
        console.warn('Promotion hidden: startDate "' + config.startDate +
          '" is not a valid date (use e.g. 2026-10-28T00:00:00+05:30).');
        return false;
      }
    }
    if (!isBlank(config.endDate)) {
      end = parsePromoDate(config.endDate, true, fallbackOffset);
      if (end === null) {
        console.warn('Promotion hidden: endDate "' + config.endDate +
          '" is not a valid date (use e.g. 2026-11-05T23:59:59+05:30).');
        return false;
      }
    }
    if (start !== null && end !== null && start > end) {
      console.warn('Promotion hidden: startDate is later than endDate.');
      return false;
    }
    if (start !== null && now < start) return false;   /* not started yet */
    if (end !== null && now > end) return false;       /* already finished */
    return true;
  }

  /* ---- Dismissal (sessionStorage: this tab only, no personal data) ------- */

  function promoStorageKey(config) {
    var raw = [config.campaignName, config.startDate, config.endDate,
               config.desktopImage, config.mobileImage].map(String).join('|');
    var hash = 5381;
    for (var i = 0; i < raw.length; i++) {
      hash = ((hash << 5) + hash + raw.charCodeAt(i)) | 0;
    }
    return 'promo-dismissed:' + (hash >>> 0).toString(36);
  }

  function wasPromoDismissed(key) {
    try { return window.sessionStorage.getItem(key) === '1'; }
    catch (err) { return false; }
  }

  function rememberPromoDismissed(key) {
    try { window.sessionStorage.setItem(key, '1'); }
    catch (err) { /* storage unavailable: the banner just comes back next load */ }
  }

  /* ---- DOM ------------------------------------------------------------- */

  function createCloseIcon() {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 20 20');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    var path = document.createElementNS(ns, 'path');
    path.setAttribute('d', 'M5 5l10 10M15 5L5 15');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'currentColor');
    path.setAttribute('stroke-width', '1.8');
    path.setAttribute('stroke-linecap', 'round');
    svg.appendChild(path);
    return svg;
  }

  /* <picture> with a phone-only <source>, so the browser downloads just one
     of the two images. */
  function createPromoPicture(desktopUrl, mobileUrl, altText, size) {
    var picture = document.createElement('picture');
    if (desktopUrl && mobileUrl && desktopUrl !== mobileUrl) {
      var source = document.createElement('source');
      source.media = PROMO_MOBILE_QUERY;
      source.srcset = mobileUrl;
      picture.appendChild(source);
    }
    var img = document.createElement('img');
    img.className = 'promo__img';
    img.src = desktopUrl || mobileUrl;
    img.alt = altText;
    img.decoding = 'async';
    /* Intrinsic size of the image that has just loaded: the browser reserves
       the right aspect ratio and the banner never stretches. */
    if (size && size.width && size.height) {
      img.width = size.width;
      img.height = size.height;
    }
    picture.appendChild(img);
    return { picture: picture, img: img };
  }

  /* Where each placement goes. Returns null when its anchor is missing. */
  function promoTarget(placement) {
    var header = $('#siteHeader');
    var hero = $('#top');
    switch (placement) {
      case 'top':
        return header && header.parentNode ? {
          name: 'top',
          insert: function (el) { header.parentNode.insertBefore(el, header); }
        } : null;
      case 'hero-before':
        return hero && hero.parentNode ? {
          name: 'hero-before',
          insert: function (el) { hero.parentNode.insertBefore(el, hero); }
        } : null;
      case 'hero-after':
        return hero && hero.parentNode ? {
          name: 'hero-after',
          insert: function (el) { hero.parentNode.insertBefore(el, hero.nextSibling); }
        } : null;
      case 'floating':
      case 'bottom-bar':
        return {
          name: placement,
          insert: function (el) { document.body.appendChild(el); }
        };
      default:
        return null;
    }
  }

  /* Try images in order until one loads. */
  function loadFirstAvailableImage(urls, done) {
    var index = 0;
    (function next() {
      if (index >= urls.length) { done(null, null, urls); return; }
      var url = urls[index++];
      var probe = new Image();
      probe.onload = function () { done(url, probe, urls.slice(0, index - 1)); };
      probe.onerror = next;
      probe.src = url;
    })();
  }

  function initPromotion() {
    if (promoStarted || document.getElementById(PROMO_ID)) return;   /* never twice */
    promoStarted = true;

    var config = PROMOTION;
    if (config.enabled !== true) return;

    var desktopUrl = safeImageUrl(config.desktopImage);
    var mobileUrl = safeImageUrl(config.mobileImage);
    if (!desktopUrl && !mobileUrl) return;

    if (!isWithinSchedule(config, Date.now())) return;

    var dismissible = config.dismissible !== false;
    var showClose = dismissible && config.showCloseButton !== false;
    var storageKey = promoStorageKey(config);
    if (dismissible && wasPromoDismissed(storageKey)) return;

    var requested = String(config.placement || '').trim().toLowerCase();
    if (PROMO_PLACEMENTS.indexOf(requested) === -1) {
      if (requested) {
        console.warn('Unknown promotion placement "' + config.placement +
          '"; using "' + PROMO_DEFAULT_PLACEMENT + '".');
      }
      requested = PROMO_DEFAULT_PLACEMENT;
    }
    var target = promoTarget(requested) || promoTarget('top') ||
                 promoTarget('hero-before') || promoTarget('floating');

    var campaignName = typeof config.campaignName === 'string' ? config.campaignName.trim() : '';
    var altText = (typeof config.altText === 'string' && config.altText.trim()) ||
                  campaignName || 'Promotional offer';

    var link = safeUrl(config.link, ['http:', 'https:', 'mailto:', 'tel:']);
    var opensNewTab = !!link && config.openInNewTab === true &&
                      link.charAt(0) !== '#' && !/^(mailto|tel):/i.test(link);

    var isPhone = window.matchMedia(PROMO_MOBILE_QUERY).matches;
    var preferred = isPhone ? [mobileUrl, desktopUrl] : [desktopUrl, mobileUrl];
    var candidates = preferred.filter(function (url, i) {
      return url && preferred.indexOf(url) === i;
    });

    loadFirstAvailableImage(candidates, function (loadedUrl, probe, failedUrls) {
      if (!loadedUrl) return;                       /* nothing loaded: show nothing */
      if (document.getElementById(PROMO_ID)) return;

      var desktopFinal = failedUrls.indexOf(desktopUrl) === -1 ? desktopUrl : '';
      var mobileFinal = failedUrls.indexOf(mobileUrl) === -1 ? mobileUrl : '';

      var root = document.documentElement;
      var cleanups = [];

      var banner = document.createElement('aside');
      banner.id = PROMO_ID;
      banner.className = 'promo promo--' + target.name;
      banner.setAttribute('aria-label', campaignName || 'Promotion');

      var inner = document.createElement('div');
      inner.className = 'promo__inner';
      var media = document.createElement('div');
      media.className = 'promo__media';

      var built = createPromoPicture(desktopFinal, mobileFinal, altText,
        { width: probe.naturalWidth, height: probe.naturalHeight });

      if (link) {
        var anchor = document.createElement('a');
        anchor.className = 'promo__link';
        anchor.href = link;
        if (opensNewTab) {
          anchor.target = '_blank';
          anchor.rel = 'noopener noreferrer';
        }
        anchor.appendChild(built.picture);
        if (opensNewTab) {
          var hint = document.createElement('span');
          hint.className = 'sr-only';
          hint.textContent = ' (opens in a new tab)';
          anchor.appendChild(hint);
        }
        media.appendChild(anchor);
      } else {
        media.appendChild(built.picture);          /* a plain picture, not a link */
      }

      function teardown() {
        cleanups.forEach(function (fn) { fn(); });
        cleanups = [];
        root.classList.remove('has-promo-bottom');
        root.style.removeProperty('--promo-bar-h');
        if (banner.parentNode) banner.parentNode.removeChild(banner);
      }

      function dismiss() {
        if (dismissible) rememberPromoDismissed(storageKey);
        var hadFocus = banner.contains(document.activeElement);
        var finished = false;
        function finish() {
          if (finished) return;
          finished = true;
          teardown();
          /* The focused close button is gone; hand focus to the page. */
          var main = $('#main');
          if (hadFocus && main) {
            if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
            main.focus({ preventScroll: true });
          }
        }
        if (prefersReducedMotion()) { finish(); return; }
        banner.classList.add('is-closing');
        banner.addEventListener('transitionend', function (e) {
          if (e.target === banner) finish();
        });
        window.setTimeout(finish, 400);              /* safety net */
      }

      if (showClose) {
        var closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = 'promo__close';
        closeButton.setAttribute('aria-label', 'Close promotion');
        closeButton.appendChild(createCloseIcon());
        closeButton.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          dismiss();
        });
        media.appendChild(closeButton);
      }

      /* If the image breaks later (e.g. after a breakpoint change), remove the
         banner rather than leave a broken picture. */
      built.img.addEventListener('error', teardown);

      inner.appendChild(media);
      banner.appendChild(inner);
      target.insert(banner);

      /* A fixed bottom bar: keep the page end and the floating buttons clear. */
      if (target.name === 'bottom-bar') {
        var syncHeight = function () {
          root.style.setProperty('--promo-bar-h', banner.offsetHeight + 'px');
        };
        root.classList.add('has-promo-bottom');
        syncHeight();
        if ('ResizeObserver' in window) {
          var observer = new ResizeObserver(syncHeight);
          observer.observe(banner);
          cleanups.push(function () { observer.disconnect(); });
        } else {
          window.addEventListener('resize', syncHeight);
          cleanups.push(function () { window.removeEventListener('resize', syncHeight); });
        }
      }
    });
  }

  /* =======================================================================
     12. Init
     Each step is isolated so one failure cannot stop the others. Failures
     are reported to the console, not swallowed.
     ======================================================================= */
  function init() {
    /* Order matters: the business configuration is applied first, and the
       promotional banner last, once the rest of the page is in place. */
    [applyConfig, applyMedia, applyPageImages, initScrollUi, initNav, initReveal, initAccordions,
     initBeforeAfter, initBooking, initGlobalKeys, initPromotion].forEach(function (step) {
      try {
        step();
      } catch (err) {
        console.error('Initialisation step "' + step.name + '" failed:', err);
      }
    });
    /* Tells the head watchdog the script loaded, so content hidden for
       reveal animations is not force-revealed. */
    document.documentElement.classList.add('js-ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
