/* vinylnight.net — main script */

(function () {
  'use strict';

  // Mark active nav link based on current page
  function setActiveNav() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(function (link) {
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

  // Mobile nav hamburger toggle
  function initMobileNav() {
    var toggle = document.getElementById('nav-toggle');
    var mobileNav = document.getElementById('mobile-nav');
    if (!toggle || !mobileNav) return;

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = mobileNav.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      mobileNav.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    });

    document.addEventListener('click', function (e) {
      if (!toggle.contains(e.target) && !mobileNav.contains(e.target)) {
        mobileNav.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        mobileNav.setAttribute('aria-hidden', 'true');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setActiveNav();
    initAvatarUpload();
    initMobileNav();
  });
})();
