var allGroups = [];

(async function init() {
  /* Update nav if signed in */
  try {
    var me = await fetch('/api/auth/me');
    if (me.ok) {
      var meData = await me.json();
      var navLink = document.getElementById('nav-auth-link');
      navLink.textContent = meData.user.username;
      navLink.href = 'profile.html';
    }
  } catch (e) { /* guest */ }

  /* Load groups */
  var grid = document.getElementById('groups-grid');
  try {
    var res  = await fetch('/api/groups');
    var data = await res.json();
    allGroups = data.groups || [];
    renderGroups(allGroups);
  } catch (e) {
    grid.innerHTML = '<p class="text-muted text-sm">Could not load groups.</p>';
  }
})();

/* ── Search ────────────────────────────────────────────────── */
document.getElementById('group-search').addEventListener('input', function() {
  var q = this.value.toLowerCase().trim();
  renderGroups(q
    ? allGroups.filter(function(g) {
        return g.name.toLowerCase().includes(q) ||
               (g.location || '').toLowerCase().includes(q);
      })
    : allGroups
  );
});

/* ── Render ────────────────────────────────────────────────── */
function renderGroups(groups) {
  var grid = document.getElementById('groups-grid');

  if (!groups.length) {
    grid.innerHTML = '<p class="text-muted text-sm">No groups found.</p>';
    return;
  }

  grid.innerHTML = groups.map(function(g) {
    var genres     = (g.genres || []).map(function(genre) {
      return '<span class="tag">' + esc(genre) + '</span>';
    }).join('');
    var gatherings = g.episode_count || 0;
    var estLabel   = g.founded_year ? 'Est. ' + g.founded_year : '';

    return '<a href="/group/' + esc(g.slug) + '" class="card group-card" style="text-decoration:none;">' +
      '<div class="group-detail-header">' +
        '<div class="group-detail-record" aria-hidden="true"></div>' +
        '<div>' +
          '<p class="group-card-name">' + esc(g.name) + '</p>' +
          '<p class="group-card-location text-xs mt-1">' + esc(g.location || '') + '</p>' +
        '</div>' +
      '</div>' +
      (g.description ? '<p class="text-muted text-sm mt-2">' + esc(g.description) + '</p>' : '') +
      (genres ? '<div class="gathering-albums mt-2">' + genres + '</div>' : '') +
      '<div class="group-card-footer">' +
        '<div class="meta-row">' +
          '<span class="meta-item"><strong>' + (g.member_count || 0) + '</strong> members</span>' +
          '<span class="meta-item"><strong>' + (gatherings || '—') + '</strong> gatherings</span>' +
        '</div>' +
        (estLabel ? '<span class="text-xs text-muted">' + esc(estLabel) + '</span>' : '') +
      '</div>' +
    '</a>';
  }).join('');
}

function esc(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
