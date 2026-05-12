var USERNAME    = new URLSearchParams(window.location.search).get('user') || '';
var vinylsOffset = 0;

(async function init() {
  /* Update nav auth link if signed in */
  try {
    var me = await fetch('/api/auth/me');
    if (me.ok) {
      var meData = await me.json();
      var navLink = document.getElementById('nav-auth-link');
      navLink.textContent = meData.user.username;
      if (meData.user.username === USERNAME) navLink.href = 'profile.html';
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

  var isFounder = (data.groups || []).some(function(g) { return g.role === 'founder'; });
  if (isFounder) document.getElementById('user-role-label').textContent = 'Founder';

  /* Groups */
  var groupsEl = document.getElementById('user-groups');
  var groups = data.groups || [];
  groupsEl.innerHTML = groups.length
    ? groups.map(function(g) {
        return '<div class="profile-group-item">' +
          '<div class="avatar" style="width:28px;height:28px;font-size:0.7rem;">' +
            esc((g.name || '?')[0].toUpperCase()) +
          '</div>' +
          '<a href="/group/' + esc(g.slug) + '" style="color:var(--text-muted);font-size:0.88rem;">' +
            esc(g.name) +
          '</a>' +
        '</div>';
      }).join('')
    : '<p class="text-xs text-muted">No groups.</p>';

  /* Heavy rotation */
  var albums = data.topAlbums || [];
  var albumsEl = document.getElementById('user-albums');
  albumsEl.innerHTML = ['01','02','03'].map(function(n, i) {
    var a = albums[i];
    var attrs = a ? ' data-artist="' + esc(a.artist) + '" data-album="' + esc(a.album_title) + '"' : '';
    return '<div class="album-sleeve"' + attrs + '>' +
      '<div class="album-sleeve-image">' +
        '<div class="album-sleeve-placeholder" aria-hidden="true"><div class="album-sleeve-placeholder-disc"></div></div>' +
      '</div>' +
      '<div class="album-sleeve-footer">' +
        '<p class="album-sleeve-number">' + n + '</p>' +
        '<p class="album-sleeve-label">' + esc(a ? a.artist : '—') + '</p>' +
        '<p class="album-sleeve-title"><em>' + esc(a ? a.album_title : '') + '</em></p>' +
      '</div>' +
    '</div>';
  }).join('');
  loadArt(albumsEl);

  /* Recent contributions — first 9 come with the user object */
  var vinyls = data.recentVinyls || [];
  if (!vinyls.length) {
    document.getElementById('user-vinyls').innerHTML =
      '<p class="text-muted text-sm" style="grid-column:1/-1;">No contributions yet.</p>';
    document.getElementById('load-more-wrap').style.display = 'none';
  } else {
    appendVinyls(vinyls);
    vinylsOffset = vinyls.length;
    document.getElementById('load-more-wrap').style.display = vinyls.length === 9 ? '' : 'none';
  }

  document.getElementById('user-content').style.display = '';
}

/* ── Contributions pagination ──────────────────────────────── */
function appendVinyls(vinyls) {
  var grid = document.getElementById('user-vinyls');
  var tmp  = document.createElement('div');
  tmp.innerHTML = vinyls.map(function(v) {
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
          '<a href="/group/' + esc(v.group_slug) + '" style="color:var(--text-dim);">' +
            esc(v.group_name) + '</a>' +
        '</p>' +
      '</div>' +
    '</div>';
  }).join('');

  var frag = document.createDocumentFragment();
  Array.from(tmp.children).forEach(function(el) { frag.appendChild(el); });
  grid.appendChild(frag);
  loadArt(grid);
}

function loadArt(container) {
  container.querySelectorAll('.album-sleeve[data-artist]').forEach(function(sleeve) {
    if (sleeve.querySelector('img') || sleeve.dataset.artLoading) return;
    sleeve.dataset.artLoading = '1';
    var artist = sleeve.dataset.artist;
    var album  = sleeve.dataset.album;
    fetch('https://itunes.apple.com/search?term=' + encodeURIComponent(artist + ' ' + album) + '&media=music&entity=album&limit=5')
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (!d.results || !d.results.length) return;
        var target = album.toLowerCase();
        var best = d.results.find(function(r) {
          return (r.collectionName || '').toLowerCase() === target;
        }) || d.results.find(function(r) {
          return (r.collectionName || '').toLowerCase().indexOf(target) !== -1;
        }) || d.results[0];
        var art = best.artworkUrl100.replace('100x100bb', '600x600bb');
        var placeholder = sleeve.querySelector('.album-sleeve-placeholder');
        if (!placeholder) return;
        var img = document.createElement('img');
        img.src = art; img.alt = artist + ' — ' + album;
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
        placeholder.replaceWith(img);
      }).catch(function() {});
  });
}

async function loadMoreVinyls() {
  var btn = document.getElementById('load-more-btn');
  btn.disabled = true;
  btn.textContent = 'Loading…';
  try {
    var res = await fetch('/api/users/' + encodeURIComponent(USERNAME) + '/vinyls?offset=' + vinylsOffset);
    if (!res.ok) return;
    var data = await res.json();
    var vinyls = data.vinyls || [];
    if (vinyls.length) {
      appendVinyls(vinyls);
      vinylsOffset += vinyls.length;
    }
    document.getElementById('load-more-wrap').style.display = data.hasMore ? '' : 'none';
  } catch (e) { /* silent */ } finally {
    btn.disabled = false;
    btn.textContent = 'Load more';
  }
}

function showNotFound() {
  document.getElementById('not-found').style.display = '';
}

function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
