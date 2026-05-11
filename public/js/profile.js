var currentUser = null;
var vinylsOffset = 0;

/* ── Boot ───────────────────────────────────────────────────── */
(async function init() {
  try {
    var res = await fetch('/api/auth/me');
    if (res.ok) showProfile(await res.json());
  } catch (e) { /* stay on auth panel */ }
})();

/* ── Auth panel toggles ──────────────────────────────────────── */
document.getElementById('show-register').addEventListener('click', function(e) {
  e.preventDefault();
  document.getElementById('login-section').style.display = 'none';
  document.getElementById('register-section').style.display = '';
});

document.getElementById('show-login').addEventListener('click', function(e) {
  e.preventDefault();
  document.getElementById('register-section').style.display = 'none';
  document.getElementById('login-section').style.display = '';
});

/* ── Sign in ─────────────────────────────────────────────────── */
document.getElementById('signin-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  var errEl = document.getElementById('login-error');
  errEl.style.display = 'none';
  try {
    var res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email:    document.getElementById('email').value.trim(),
        password: document.getElementById('password').value,
      }),
    });
    var data = await res.json();
    if (!res.ok) { showError(errEl, data.error || 'Sign in failed.'); return; }
    var me = await fetch('/api/auth/me');
    showProfile(await me.json());
  } catch (e) {
    showError(errEl, 'Could not connect. Try again.');
  }
});

/* ── Register ────────────────────────────────────────────────── */
document.getElementById('register-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  var errEl = document.getElementById('register-error');
  errEl.style.display = 'none';
  try {
    var res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: document.getElementById('reg-username').value.trim(),
        email:    document.getElementById('reg-email').value.trim(),
        password: document.getElementById('reg-password').value,
      }),
    });
    var data = await res.json();
    if (!res.ok) { showError(errEl, data.error || 'Registration failed.'); return; }
    var me = await fetch('/api/auth/me');
    showProfile(await me.json());
  } catch (e) {
    showError(errEl, 'Could not connect. Try again.');
  }
});

/* ── Sign out ────────────────────────────────────────────────── */
async function handleLogout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  currentUser = null;
  document.getElementById('profile-panel').style.display = 'none';
  document.getElementById('auth-panel').style.display = '';
  document.getElementById('login-section').style.display = '';
  document.getElementById('register-section').style.display = 'none';
  document.getElementById('email').value = '';
  document.getElementById('password').value = '';
}

/* ── View / Edit toggle ──────────────────────────────────────── */
document.getElementById('btn-edit').addEventListener('click', showEdit);

function showView() {
  document.getElementById('profile-view').style.display = '';
  document.getElementById('profile-edit').style.display = 'none';
}

function showEdit() {
  document.getElementById('profile-view').style.display = 'none';
  document.getElementById('profile-edit').style.display = '';
}

/* ── Render profile ──────────────────────────────────────────── */
function showProfile(data) {
  currentUser = data.user;
  document.getElementById('auth-panel').style.display = 'none';
  document.getElementById('profile-panel').style.display = '';
  showView();

  var u = data.user;
  document.getElementById('view-username').textContent = u.username || '';
  document.getElementById('view-location').textContent = u.location || '';
  document.getElementById('view-bio').textContent      = u.bio || '';
  document.getElementById('view-avatar').textContent   = (u.username || '?')[0].toUpperCase();

  /* Groups */
  var groupsEl = document.getElementById('view-groups');
  var groups = data.groups || [];
  if (groups.length) {
    groupsEl.innerHTML = groups.map(function(g) {
      return '<div class="profile-group-item">' +
        '<div class="avatar" style="width:28px;height:28px;font-size:0.7rem;">' +
          esc((g.name || '?')[0].toUpperCase()) +
        '</div>' +
        '<a href="group.html?group=' + esc(g.slug) + '" style="color:var(--text-muted); font-size:0.88rem;">' +
          esc(g.name) +
        '</a>' +
      '</div>';
    }).join('');
  } else {
    groupsEl.innerHTML = '<p class="text-xs text-muted">No groups yet.</p>';
  }

  /* Heavy rotation (top 3) */
  var albums = data.topAlbums || [];
  var albumsEl = document.getElementById('view-albums');
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

  /* Recent contributions — first page comes from /api/auth/me */
  vinylsOffset = 0;
  var vinylsEl = document.getElementById('view-vinyls');
  vinylsEl.innerHTML = '';
  var vinyls = data.recentVinyls || [];
  if (!vinyls.length) {
    vinylsEl.innerHTML = '<p class="text-muted text-sm" style="grid-column:1/-1;">No contributions recorded yet.</p>';
    document.getElementById('load-more-wrap').style.display = 'none';
  } else {
    appendVinyls(vinyls);
    vinylsOffset = vinyls.length;
    document.getElementById('load-more-wrap').style.display = vinyls.length === 9 ? '' : 'none';
  }

  prefillEditForm(data);
  loadInvitations();
}

/* ── Invitations ─────────────────────────────────────────────── */
async function loadInvitations() {
  try {
    var res = await fetch('/api/me/invitations');
    if (!res.ok) return;
    var data = await res.json();
    renderInvitations(data.invitations || []);
  } catch (e) { /* silent */ }
}

function renderInvitations(invitations) {
  var section = document.getElementById('invitations-section');
  var list    = document.getElementById('invitations-list');
  if (!invitations.length) { section.style.display = 'none'; return; }
  section.style.display = '';
  list.innerHTML = invitations.map(function(inv) {
    return '<div class="access-notice" style="margin-bottom:0.75rem; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.75rem;">' +
      '<p style="margin:0;"><strong>' + esc(inv.group_name) + '</strong>' +
        ' &mdash; invited by ' + esc(inv.invited_by) + '</p>' +
      '<div style="display:flex;gap:0.5rem;flex-shrink:0;">' +
        '<button class="btn btn-primary" style="padding:0.35rem 1rem; font-size:0.72rem;" ' +
          'onclick="acceptInvitation(\'' + esc(inv.id) + '\')">Accept</button>' +
        '<button class="btn btn-ghost" style="font-size:0.72rem;" ' +
          'onclick="declineInvitation(\'' + esc(inv.id) + '\')">Decline</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

async function acceptInvitation(id) {
  var res = await fetch('/api/invitations/' + id + '/accept', { method: 'POST' });
  if (res.ok) {
    var me = await fetch('/api/auth/me');
    showProfile(await me.json());
  } else {
    var err = await res.json();
    alert(err.error || 'Could not accept invitation.');
  }
}

async function declineInvitation(id) {
  var res = await fetch('/api/invitations/' + id + '/decline', { method: 'POST' });
  if (res.ok) loadInvitations();
  else {
    var err = await res.json();
    alert(err.error || 'Could not decline invitation.');
  }
}

/* ── Pre-fill edit form ──────────────────────────────────────── */
function prefillEditForm(data) {
  var u = data.user;
  document.getElementById('edit-username').value = u.username  || '';
  document.getElementById('edit-location').value = u.location  || '';
  document.getElementById('edit-bio').value      = u.bio       || '';
  var albums = data.topAlbums || [];
  for (var i = 1; i <= 3; i++) {
    var a = albums[i - 1];
    document.getElementById('album-' + i + '-artist').value = a ? a.artist      : '';
    document.getElementById('album-' + i + '-title').value  = a ? a.album_title : '';
  }
}

/* ── Save profile ────────────────────────────────────────────── */
document.getElementById('edit-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  var errEl   = document.getElementById('edit-error');
  var saveBtn = document.getElementById('save-btn');
  errEl.style.display = 'none';
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving…';

  var topAlbums = [];
  for (var i = 1; i <= 3; i++) {
    var artist = document.getElementById('album-' + i + '-artist').value.trim();
    var title  = document.getElementById('album-' + i + '-title').value.trim();
    if (artist && title) topAlbums.push({ artist: artist, album_title: title });
  }

  try {
    var res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username:  document.getElementById('edit-username').value.trim(),
        location:  document.getElementById('edit-location').value.trim(),
        bio:       document.getElementById('edit-bio').value.trim(),
        topAlbums: topAlbums,
      }),
    });
    var data = await res.json();
    if (!res.ok) { showError(errEl, data.error || 'Save failed.'); return; }
    var me = await fetch('/api/auth/me');
    showProfile(await me.json());
  } catch (e) {
    showError(errEl, 'Could not connect. Try again.');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Changes';
  }
});

/* ── Contributions pagination ────────────────────────────────── */
function appendVinyls(vinyls) {
  var vinylsEl = document.getElementById('view-vinyls');
  var frag = document.createDocumentFragment();
  var tmp = document.createElement('div');
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
          '<a href="group.html?group=' + esc(v.group_slug) + '" style="color:var(--text-dim);">' +
            esc(v.group_name) + '</a>' +
        '</p>' +
      '</div>' +
    '</div>';
  }).join('');

  Array.from(tmp.children).forEach(function(el) { frag.appendChild(el); });
  vinylsEl.appendChild(frag);
  loadArt(vinylsEl);
}

function loadArt(container) {
  container.querySelectorAll('.album-sleeve[data-artist]').forEach(function(sleeve) {
    if (sleeve.querySelector('img') || sleeve.dataset.artLoading) return;
    sleeve.dataset.artLoading = '1';
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
    var res = await fetch('/api/me/vinyls?offset=' + vinylsOffset);
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

/* ── Helpers ─────────────────────────────────────────────────── */
function showError(el, msg) {
  el.textContent = msg;
  el.style.display = '';
}

function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
