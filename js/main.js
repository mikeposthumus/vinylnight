/* vinylnight.net — main script */

(function () {
  'use strict';

  // Mark active nav link based on current page
  function setActiveNav() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(function (link) {
      const href = link.getAttribute('href');
      if (href === path || (path === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  // Avatar image preview before upload
  function initAvatarUpload() {
    const input = document.getElementById('avatar-input');
    const preview = document.getElementById('avatar-preview');
    if (!input || !preview) return;

    input.addEventListener('change', function () {
      const file = this.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function (e) {
        preview.innerHTML = '<img src="' + e.target.result + '" alt="Avatar preview">';
      };
      reader.readAsDataURL(file);
    });
  }

  // Simple mobile nav toggle (placeholder — expand as needed)
  function initMobileNav() {
    const toggle = document.getElementById('nav-toggle');
    const links = document.querySelector('.nav-links');
    if (!toggle || !links) return;

    toggle.addEventListener('click', function () {
      links.classList.toggle('nav-open');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setActiveNav();
    initAvatarUpload();
    initMobileNav();
  });
})();
