/* main.js — vanilla JS, không framework.
   Hai việc: mở/đóng menu mobile, và mở sẵn FAQ đầu tiên trên desktop. */
(function () {
  'use strict';

  // --- menu mobile ---
  var toggle = document.querySelector('.nav-toggle');
  var list = document.getElementById('nav-list');

  if (toggle && list) {
    toggle.addEventListener('click', function () {
      var open = list.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
      toggle.textContent = open ? '✕' : '☰';
    });

    // Đóng menu khi bấm ra ngoài
    document.addEventListener('click', function (e) {
      if (!list.classList.contains('is-open')) return;
      if (list.contains(e.target) || toggle.contains(e.target)) return;
      list.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = '☰';
    });

    // Đóng bằng Esc
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || !list.classList.contains('is-open')) return;
      list.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = '☰';
      toggle.focus();
    });
  }

  // --- FAQ: mở câu đầu trên màn hình rộng để nội dung không bị ẩn hoàn toàn ---
  if (window.matchMedia('(min-width: 769px)').matches) {
    var first = document.querySelector('.faq details');
    if (first) first.setAttribute('open', '');
  }
})();
