/* ============================================================
   HL Mando Parking · SMS — Design System
   app.js — navigation, theme, copy, interactive controls
   ============================================================ */
(function () {
  'use strict';

  /* -------- section navigation -------- */
  var navItems = document.querySelectorAll('.nav-item');
  var pages = document.querySelectorAll('.page');
  var crumb = document.getElementById('crumb');
  var sidebar = document.getElementById('sidebar');

  function showPage(target, label) {
    pages.forEach(function (p) { p.classList.toggle('active', p.id === 'page-' + target); });
    navItems.forEach(function (n) { n.classList.toggle('active', n.dataset.target === target); });
    if (crumb && label) crumb.textContent = label;
    document.querySelector('.content').scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (sidebar) sidebar.classList.remove('open');
    if (history.replaceState) history.replaceState(null, '', '#' + target);
  }

  navItems.forEach(function (item) {
    item.addEventListener('click', function () {
      showPage(item.dataset.target, item.textContent.trim());
    });
  });

  /* open the section from the URL hash on load */
  var hash = (location.hash || '').replace('#', '');
  if (hash) {
    var match = document.querySelector('.nav-item[data-target="' + hash + '"]');
    if (match) showPage(hash, match.textContent.trim());
  }

  /* -------- theme baseline (dark only for Phase 1) -------- */
  var themeBtn = document.getElementById('themeBtn');
  var themeLabel = document.getElementById('themeLabel');
  var themeIcon = document.getElementById('themeIcon');
  var root = document.documentElement;

  var sun = '<path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4"/><circle cx="12" cy="12" r="4"/>';
  var moon = '<path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z"/>';

  function setTheme(mode) {
    root.setAttribute('data-theme', mode);
    if (themeLabel) themeLabel.textContent = mode === 'dark' ? 'Dark' : 'Light';
    if (themeIcon) themeIcon.innerHTML = mode === 'dark' ? moon : sun;
    try { localStorage.setItem('hl-theme', mode); } catch (e) {}
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      setTheme('dark');
    });
  }
  setTheme('dark');

  /* -------- copy hex on swatch click -------- */
  var toast = document.getElementById('copied');
  var toastTimer;

  function flash(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 1400);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { flash(text + ' 복사됨'); },
        function () { legacyCopy(text); });
    } else { legacyCopy(text); }
  }
  function legacyCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); flash(text + ' 복사됨'); } catch (e) { flash('복사 실패'); }
    document.body.removeChild(ta);
  }

  document.querySelectorAll('[data-hex]').forEach(function (el) {
    el.addEventListener('click', function () { copyText(el.getAttribute('data-hex')); });
  });

  /* -------- interactive toggle switches -------- */
  document.querySelectorAll('[data-toggle]').forEach(function (tg) {
    if (tg.classList.contains('dis')) return;
    tg.addEventListener('click', function () { tg.classList.toggle('on'); });
  });

  /* -------- segmented controls (열기/닫기, 관리자/엔지니어 …) -------- */
  document.querySelectorAll('.seg, .tb-seg').forEach(function (seg) {
    seg.querySelectorAll('span').forEach(function (span) {
      span.addEventListener('click', function () {
        seg.querySelectorAll('span').forEach(function (s) { s.classList.remove('on'); });
        span.classList.add('on');
      });
    });
  });

  /* -------- select dropdown option pick -------- */
  document.querySelectorAll('.selmenu').forEach(function (menu) {
    menu.querySelectorAll('.o').forEach(function (opt) {
      opt.addEventListener('click', function () {
        menu.querySelectorAll('.o').forEach(function (o) { o.classList.remove('sel'); });
        opt.classList.add('sel');
        var input = menu.parentElement.querySelector('.input');
        if (input) input.childNodes[0].nodeValue = opt.textContent;
      });
    });
  });

  /* -------- mobile menu -------- */
  var menuBtn = document.getElementById('menuBtn');
  if (menuBtn) {
    menuBtn.addEventListener('click', function () { sidebar.classList.toggle('open'); });
  }
  document.querySelector('.content').addEventListener('click', function () {
    if (sidebar) sidebar.classList.remove('open');
  });
})();
