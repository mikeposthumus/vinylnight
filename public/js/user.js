var USERNAME = new URLSearchParams(window.location.search).get('user') || '';

(async function init() {
  /* Update nav auth link if signed in */
  try {
    var me = await fetch('/api/auth/me');
    if (me.ok) {
      var meData = await me.json();
      var navLink = document.getElementById('nav-auth-link');
      navLink.textContent = meData.user.username;

      /* If viewing your own page, link nav back to your profile */
      if (meData.user.username === USERNAME) {
        navLink.href = 'profile.html';
      }
    }
  } catch (e) { /* guest */ }

  if (!USERNAME) { showNotFound(); return; }

  try {
    var res = await fetch('/api/users/' + encodeURIComponent(USERNAME));
    if (!res.ok) { showNotFound(); return; }
    render(await res.json());
  } catch (e) {
    showNotFound();
  }
})();

function render(data) {
  var u = data.user;
  document.title = u.username + ' — Vinyl Night';
  document.querySelector('meta[name="description"]').content = u.username + ' on Vinyl Night';

  document.getElementById('user-username').textContent = u.username;
  document.getElementById('user-location').textContent = u.location || '';
  document.getElementById('user-bio').textContent      = u.bio || '';
  document.getElementById('user-avatar').textContent   = (u.username || '?')[0].toUpperCase();

  /* Role label — show "Founder" if they're a founder in any group */
  var isFounder = (data.groups || []).some(function(g) { return g.role === 'founder'; });
  if (isFounder) document.getElementById('user-role-label').textContent = 'Founder';

  /* Groups */
  var groupsEl = document.getElementById('user-groups');
  var groups = data.groups || [];
  if (groups.length) {
    groupsEl.innerHTML = groups.map(function(g) {
      return '<div class="profile-group-item">' +
        '<div class="avatar" style="width:28px;height:28px;font-size:0.7rem;">' +
          esc((g.name || '?')[0].toUpperCase()) +
        '</div>' +
        '<a href="group.html?group=' + esc(g.slug) + '" style="color:var(--text-muted);font-size:0.88rem;">' +
          esc(g.name) +
        '</a>' +
      '</div>';
    }).join('');
  } else {
    groupsEl.innerHTML = '<p class="text-xs text-muted">No groups.</p>';
  }

  /* Recent vinyls */
  var grid = document.getElementById('vinyls-grid');
  var vinyls = data.recentVinyls || [];
  if (!vinyls.length) {
    grid.innerHTML = '<p class="text-muted text-sm" style="grid-column:1/-1;">No contributions yet.</p>';
  } else {
    grid.innerHTML = vinyls.map(function(v) {
      var imgHtml = v.art_url
        ? '<img src="' + esc(v.art_url) + '" alt="' + esc(v.artist) + '" style="width:100%;height:100%;object-fit:cover;display:block;">'
        : '<div class="album-sleeve-placeholder" aria-hidden="true"><div class="album-sleeve-placeholder-disc"></div></div>';
      var meta = 'S' + v.season_number + ' E' + String(v.episode_number).padStart(2, '0');
      return '<div class="album-sleeve" data-artist="' + esc(v.artist) + '" data-album="' + esc(v.album_title) + '">' +
        '<div class="album-sleeve-image">' + imgHtml + '</div>' +
        '<div class="album-sleeve-footer">' +
          '<p class="album-sleeve-number">' + esc(meta) + '</p>' +
          '<p class="album-sleeve-label">' + esc(v.artist) + '</p>' +
          '<p class="album-sleeve-title"><em>' + esc(v.album_title) + '</em></p>' +
          '<p class="album-sleeve-contributor">' +
            '<a href="group.html?group=' + esc(v.group_slug) + '" style="color:var(--text-dim);">' +
              esc(v.group_name) + '</a>' +
          '</p>' +
        '</div>' +
      '</div>';
    }).join('');

    /* Lazy-load art for sleeves without art_url */
    grid.querySelectorAll('.album-sleeve[data-artist]').forEach(function(sleeve) {
      if (sleeve.querySelector('img')) return;
      var artist = sleeve.dataset.artist;
      var album  = sleeve.dataset.album;
      fetch('https://itunes.apple.com/search?term=' + encodeURIComponent(artist + ' ' + album) + '&media=music&entity=album&limit=1')
        .then(function(r) { return r.json(); })
        .then(function(d) {
          if (!d.results || !d.results.length) return;
          var art = d.results[0].artworkUrl100.replace('100x100bb', '600x600bb');
          var placeholder = sleeve.querySelector('.album-sleeve-placeholder');
          if (!placeholder) return;
          var img = document.createElement('img');
          img.src = art;
          img.alt = artist + ' — ' + album;
          img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
          placeholder.replaceWith(img);
        }).catch(function() {});
    });
  }

  document.getElementById('user-content').style.display = '';
}

function showNotFound() {
  document.getElementById('not-found').style.display = '';
}

function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
