(async function loadGroups() {
  var grid = document.getElementById('groups-grid');
  try {
    var res = await fetch('/api/groups');
    var data = await res.json();
    var groups = (data.groups || []).slice(0, 3);
    if (!groups.length) {
      grid.innerHTML = '<p class="text-muted text-sm">No groups yet.</p>';
      return;
    }
    grid.innerHTML = groups.map(function(g) {
      var gatherings = g.episode_count || 0;
      var gatheringsLabel = gatherings ? '<strong>' + gatherings + '</strong> gatherings' : 'Just getting started';
      return '<div class="card group-card">' +
        '<div>' +
          '<p class="group-card-name">' + esc(g.name) + '</p>' +
          '<p class="group-card-location">' + esc(g.location || '') + '</p>' +
        '</div>' +
        '<p class="text-muted text-sm">' + esc(g.description || '') + '</p>' +
        '<div class="group-card-footer">' +
          '<div class="meta-row">' +
            '<span class="meta-item"><strong>' + (g.member_count || 0) + '</strong> members</span>' +
            '<span class="meta-item">' + gatheringsLabel + '</span>' +
          '</div>' +
          '<a href="group.html?group=' + esc(g.slug) + '" class="btn btn-ghost text-xs">View &rarr;</a>' +
        '</div>' +
      '</div>';
    }).join('');
  } catch (e) {
    grid.innerHTML = '<p class="text-muted text-sm">Could not load groups.</p>';
  }
})();

function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
