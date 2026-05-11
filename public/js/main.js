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

  // Auto-load album art for any .album-sleeve[data-artist] on the page
  function loadAlbumArt() {
    document.querySelectorAll('.album-sleeve[data-artist]').forEach(function (sleeve) {
      var artist = sleeve.getAttribute('data-artist');
      var album  = sleeve.getAttribute('data-album');
      if (!artist || !album) return;

      var query = encodeURIComponent(artist + ' ' + album);
      fetch('https://itunes.apple.com/search?term=' + query + '&media=music&entity=album&limit=1')
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (!data.results || !data.results.length) return;
          var artUrl = data.results[0].artworkUrl100.replace('100x100bb', '600x600bb');
          var placeholder = sleeve.querySelector('.album-sleeve-placeholder');
          var img = document.createElement('img');
          img.className = 'album-sleeve-art';
          img.alt = album + ' by ' + artist;
          // Insert after placeholder so art (z-index:1) is above it in both DOM order and z-index
          if (placeholder) {
            placeholder.insertAdjacentElement('afterend', img);
          } else {
            sleeve.insertBefore(img, sleeve.firstChild);
          }
          img.addEventListener('load', function () {
            if (placeholder) placeholder.style.display = 'none';
          });
          img.addEventListener('error', function () {
            img.remove();
          });
          img.src = artUrl;
        })
        .catch(function () { /* fetch failed — placeholder stays */ });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setActiveNav();
    initAvatarUpload();
    initMobileNav();
    loadAlbumArt();
  });
})();
