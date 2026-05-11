var currentUser = null;

/* ── Boot ─────────────────────────────────────────────────── */
(async function init() {
  try {
    var res = await fetch('/api/auth/me');
    if (res.ok) {
      var data = await res.json();
      showProfile(data);
    }
  } catch (e) { /* stay on auth panel */ }
})();

/* ── Auth panel toggling ─────────────────────────────────── */
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

/* ── Sign in ─────────────────────────────────────────────── */
document.getElementById('signin-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  var errEl = document.getElementById('login-error');
  errEl.style.display = 'none';
  var email    = document.getElementById('email').value.trim();
  var password = document.getElementById('password').value;
  try {
    var res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password }),
    });
    var data = await res.json();
    if (!res.ok) { showError(errEl, data.error || 'Sign in failed.'); return; }
    var me = await fetch('/api/auth/me');
    showProfile(await me.json());
  } catch (e) {
    showError(errEl, 'Could not connect. Try again.');
  }
});

/* ── Register ────────────────────────────────────────────── */
document.getElementById('register-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  var errEl = document.getElementById('register-error');
  errEl.style.display = 'none';
  var username = document.getElementById('reg-username').value.trim();
  var email    = document.getElementById('reg-email').value.trim();
  var password = document.getElementById('reg-password').value;
  try {
    var res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username, email: email, password: password }),
    });
    var data = await res.json();
    if (!res.ok) { showError(errEl, data.error || 'Registration failed.'); return; }
    var me = await fetch('/api/auth/me');
    showProfile(await me.json());
  } catch (e) {
    showError(errEl, 'Could not connect. Try again.');
  }
});

/* ── Sign out ────────────────────────────────────────────── */
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

/* ── Render profile ──────────────────────────────────────── */
function showProfile(data) {
  currentUser = data.user;
  document.getElementById('auth-panel').style.display = 'none';
  document.getElementById('profile-panel').style.display = '';

  var u = data.user;
  var initial = (u.username || '?')[0].toUpperCase();
  document.getElementById('view-avatar').textContent = initial;
  document.getElementById('view-username').textContent = u.username || '';
  document.getElementById('view-bio').textContent = u.bio || '';

  /* Groups */
  var groups = data.groups || [];
  var groupsEl = document.getElementById('view-groups');
  if (groups.length) {
    groupsEl.innerHTML = groups.map(function(g) {
      return '<div class="profile-group-item">' +
        '<div class="avatar" style="width:28px;height:28px;font-size:0.7rem;border-radius:50%;">' +
          esc((g.name || '?')[0].toUpperCase()) +
        '</div>' +
        '<a href="group.html?group=' + esc(g.slug) + '" class="text-sm" style="color:var(--text-muted);">' +
          esc(g.name) + '</a>' +
      '</div>';
    }).join('') + '<a href="groups.html" class="text-xs text-muted mt-2" style="display:block;">+ Find more groups</a>';
  } else {
    groupsEl.innerHTML = '<p class="text-xs text-muted">No groups yet. <a href="groups.html">Browse groups</a></p>';
  }

  /* Top albums */
  var albums = data.topAlbums || [];
  var albumsEl = document.getElementById('view-albums');
  var nums = ['01', '02', '03'];
  albumsEl.innerHTML = nums.map(function(n, i) {
    var a = albums[i];
    return '<div class="album-sleeve">' +
      '<div class="album-sleeve-image"><div class="album-sleeve-placeholder" aria-hidden="true"><div class="album-sleeve-placeholder-disc"></div></div></div>' +
      '<div class="album-sleeve-footer">' +
        '<p class="album-sleeve-number">' + n + '</p>' +
        '<p class="album-sleeve-label">' + esc(a ? a.artist : '—') + '</p>' +
        '<p class="album-sleeve-title"><em>' + esc(a ? a.album_title : '') + '</em></p>' +
      '</div>' +
    '</div>';
  }).join('');

  prefillEditForm(data);
}

/* ── Pre-fill edit form ──────────────────────────────────── */
function prefillEditForm(data) {
  var u = data.user;
  document.getElementById('edit-username').value = u.username || '';
  document.getElementById('edit-location').value = u.location || '';
  document.getElementById('edit-bio').value      = u.bio || '';

  var albums = data.topAlbums || [];
  for (var i = 1; i <= 3; i++) {
    var a = albums[i - 1];
    document.getElementById('album-' + i + '-artist').value = a ? a.artist : '';
    document.getElementById('album-' + i + '-title').value  = a ? a.album_title : '';
  }
}

/* ── Save profile ────────────────────────────────────────── */
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
    showTab('view');
  } catch (e) {
    showError(errEl, 'Could not connect. Try again.');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Changes';
  }
});

/* ── Tab switching ───────────────────────────────────────── */
function showTab(name) {
  document.querySelectorAll('.profile-tab').forEach(function(btn) {
    btn.classList.toggle('active', btn.textContent.toLowerCase().includes(name === 'view' ? 'view' : 'edit'));
  });
  document.getElementById('tab-view').classList.toggle('active', name === 'view');
  document.getElementById('tab-edit').classList.toggle('active', name === 'edit');
}

/* ── Helpers ─────────────────────────────────────────────── */
function showError(el, msg) {
  el.textContent = msg;
  el.style.display = '';
}

function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
