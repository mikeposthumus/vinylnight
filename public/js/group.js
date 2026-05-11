/* ── State ─────────────────────────────────────────────────── */
var GROUP_SLUG = groupSlugFromURL();
var groupData = null;
var currentUser = null;
var isMember = false;
var currentEpisodeId = null;

/* ── Boot ──────────────────────────────────────────────────── */
(async function init() {
  await Promise.all([loadGroup(), loadCurrentUser()]);
})();

async function loadGroup() {
  try {
    const res = await fetch('/api/groups/' + GROUP_SLUG);
    if (!res.ok) { document.getElementById('group-name').textContent = 'Group not found'; return; }
    groupData = await res.json();
    renderHero();
    renderMembers();
    renderArchive();
    await loadCurrentSeason();
  } catch (e) {
    document.getElementById('group-name').textContent = 'Could not load group';
  }
}

async function loadCurrentUser() {
  try {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      const data = await res.json();
      currentUser = data.user;
      if (groupData) checkMembership();
    }
  } catch (e) { /* guest */ }
}

async function loadCurrentSeason() {
  var activeSeason = groupData.seasons.find(function(s) { return s.status === 'active'; })
                  || groupData.seasons[0];
  if (!activeSeason) {
    document.getElementById('now-playing-content').innerHTML =
      '<p class="text-muted text-sm">No active season yet.</p>';
    return;
  }
  var res = await fetch('/api/seasons/' + activeSeason.id + '/episodes');
  var data = await res.json();
  renderNowPlaying(activeSeason, data.episodes || [], data.vinyls || []);
}

/* ── Hero ──────────────────────────────────────────────────── */
function renderHero() {
  var g = groupData.group;
  var seasons = groupData.seasons;

  document.title = g.name + ' — Vinyl Night';
  document.querySelector('meta[name="description"]').content = g.description || g.name;
  document.getElementById('group-name').textContent = g.name;
  document.getElementById('group-location').textContent =
    (g.location || '') + (g.founded_year ? ' — Est. ' + g.founded_year : '');
  document.getElementById('group-description').textContent = g.description || '';

  var memberCount = groupData.members.length;
  var seasonCount = seasons.length;
  var episodeCount = seasons.reduce(function(s, x) { return s + (x.episode_count || 0); }, 0);

  document.getElementById('stat-members').textContent = memberCount;
  document.getElementById('stat-seasons').textContent = seasonCount;
  document.getElementById('stat-episodes').textContent = episodeCount || '—';
  document.getElementById('stat-albums').textContent = '—';

  document.getElementById('archive-summary').textContent =
    seasonCount + ' season' + (seasonCount !== 1 ? 's' : '');
}

/* ── Now Playing ───────────────────────────────────────────── */
function renderNowPlaying(season, episodes, vinyls) {
  var el = document.getElementById('now-playing-content');

  if (!episodes.length) {
    el.innerHTML = '<p class="text-muted text-sm">No episodes yet this season.</p>';
    return;
  }

  var vinylsByEp = {};
  vinyls.forEach(function(v) {
    if (!vinylsByEp[v.episode_id]) vinylsByEp[v.episode_id] = [];
    vinylsByEp[v.episode_id].push(v);
  });

  var html = episodes.map(function(ep) {
    var isCurrent = ep.status === 'current';
    if (isCurrent) currentEpisodeId = ep.id;

    var epVinyls = vinylsByEp[ep.id] || [];
    var dateLabel = ep.date ? monthLabel(ep.date) : '';

    var albumsHtml = epVinyls.map(function(v) {
      return albumSleeveHtml(v.artist, v.album_title, v.contributor_username, v.art_url);
    }).join('');
    if (isCurrent) albumsHtml += emptySleeveHtml();

    var badge = isCurrent
      ? '<span class="tag tag-green">Current</span>'
      : '<span class="tag">Completed</span>';

    var addForm = isCurrent
      ? '<div class="add-album-form" id="add-album-form" style="display:none;">' +
          '<p class="add-album-form-title">Add your selection for this episode</p>' +
          '<div class="add-album-row">' +
            '<div><label for="add-artist">Artist</label><input type="text" id="add-artist" placeholder="Artist name" oninput="fetchAlbumArt()"></div>' +
            '<div><label for="add-album-title">Album</label><input type="text" id="add-album-title" placeholder="Album title" oninput="fetchAlbumArt()"></div>' +
            '<div style="display:flex;align-items:flex-end;gap:0.75rem;">' +
              '<div class="art-preview" id="art-preview" title="Album art preview"><div class="art-preview-icon"></div></div>' +
              '<button type="button" class="btn btn-primary" onclick="addAlbum()">Add</button>' +
            '</div>' +
          '</div>' +
          '<p class="form-hint mt-2">Album art is fetched automatically from the iTunes catalog as you type.</p>' +
        '</div>'
      : '';

    return '<details class="season"' + (isCurrent ? ' open' : '') + '>' +
      '<summary>' +
        '<div>' +
          '<span class="season-title">Episode ' + ep.number +
            (dateLabel ? ' &mdash; ' + dateLabel : '') + '</span>' +
          '<p class="text-xs text-muted mt-1">Hosted by ' + esc(ep.host_username || 'TBD') +
            (ep.attendee_count ? ' &middot; ' + ep.attendee_count + ' attended' : '') + '</p>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:1.5rem;">' +
          badge +
          '<span class="season-chevron">&#9656;</span>' +
        '</div>' +
      '</summary>' +
      '<div style="padding-top:1.5rem;">' +
        '<div class="episode-album-grid">' + albumsHtml + '</div>' +
        addForm +
      '</div>' +
    '</details>';
  }).join('');

  el.innerHTML = '<p class="label mb-4">Season ' + season.number + ' &mdash; ' + season.year + '</p>' + html;

  checkMembership();
  loadAlbumArtForContainer(el);
}

/* ── Members ───────────────────────────────────────────────── */
function renderMembers() {
  var members = groupData.members;
  var grid = document.getElementById('members-grid');

  document.getElementById('member-count-label').textContent = members.length + ' total';

  grid.innerHTML = members.map(function(m) {
    var initial = (m.username || '?')[0].toUpperCase();
    var roleLabel = m.role === 'founder' ? 'Founder' : 'Member';
    return '<a href="user.html?user=' + esc(m.username) + '" class="member-card">' +
      '<div class="avatar">' + esc(initial) + '</div>' +
      '<div>' +
        '<p class="member-card-role">' + roleLabel + '</p>' +
        '<p class="member-card-name">' + esc(m.username) + '</p>' +
      '</div>' +
    '</a>';
  }).join('');
}

/* ── Archive ───────────────────────────────────────────────── */
function renderArchive() {
  var seasons = groupData.seasons;
  var el = document.getElementById('archive-content');

  if (!seasons.length) {
    el.innerHTML = '<p class="text-muted text-sm">No archive yet.</p>';
    return;
  }

  el.innerHTML = seasons.map(function(s, idx) {
    var isCurrent = s.status === 'active';
    var epCount = s.episode_count || 0;
    return '<details class="season" id="season-' + s.id + '"' + (idx === 0 ? ' open' : '') + ' ' +
           'ontoggle="onSeasonToggle(this, \'' + s.id + '\')">' +
      '<summary>' +
        '<div>' +
          '<span class="season-title">Season ' + s.number + ' — ' + s.year + '</span>' +
          '<p class="text-xs text-muted mt-1">' + epCount + ' episode' + (epCount !== 1 ? 's' : '') + '</p>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:1.5rem;">' +
          '<span class="season-meta">' + (isCurrent ? 'Current Season' : 'Completed') + '</span>' +
          '<span class="season-chevron">&#9656;</span>' +
        '</div>' +
      '</summary>' +
      '<div class="episodes-list" id="eps-' + s.id + '">' +
        '<p class="text-muted text-sm" style="padding:1rem 0;">Loading episodes&hellip;</p>' +
      '</div>' +
    '</details>';
  }).join('');

  seasons.forEach(function(s) { loadSeasonEpisodes(s.id); });
}

var loadedSeasons = {};
function onSeasonToggle(el, seasonId) {
  if (el.open && !loadedSeasons[seasonId]) loadSeasonEpisodes(seasonId);
}

async function loadSeasonEpisodes(seasonId) {
  if (loadedSeasons[seasonId]) return;
  loadedSeasons[seasonId] = true;

  var res = await fetch('/api/seasons/' + seasonId + '/episodes');
  var data = await res.json();
  var episodes = data.episodes || [];
  var vinyls = data.vinyls || [];

  var vinylsByEp = {};
  vinyls.forEach(function(v) {
    if (!vinylsByEp[v.episode_id]) vinylsByEp[v.episode_id] = [];
    vinylsByEp[v.episode_id].push(v);
  });

  var season = groupData.seasons.find(function(s) { return s.id === seasonId; });
  var sNum = season ? season.number : '?';

  var html = episodes.map(function(ep) {
    var epVinyls = vinylsByEp[ep.id] || [];
    var dateLabel = ep.date ? monthLabel(ep.date) : '';
    var albumsHtml = epVinyls.map(function(v) {
      return albumSleeveHtml(v.artist, v.album_title, null, v.art_url);
    }).join('');

    return '<div class="archive-episode">' +
      '<p class="archive-episode-label">S' + sNum + ' E' + String(ep.number).padStart(2,'0') +
        (dateLabel ? ' &middot; ' + dateLabel : '') + '</p>' +
      '<p class="archive-episode-meta">Hosted by ' + esc(ep.host_username || 'TBD') +
        (ep.attendee_count ? ' &middot; ' + ep.attendee_count + ' attended' : '') + '</p>' +
      '<div class="episode-album-grid">' + albumsHtml + '</div>' +
    '</div>';
  }).join('');

  document.getElementById('eps-' + seasonId).innerHTML = html ||
    '<p class="text-muted text-sm" style="padding:1rem 0;">No episodes recorded yet.</p>';
  if (html) loadAlbumArtForContainer(document.getElementById('eps-' + seasonId));
}

/* ── Auth state / membership ────────────────────────────────── */
function checkMembership() {
  if (!groupData || !currentUser) return;
  var member = groupData.members.find(function(m) { return m.id === currentUser.id; });
  isMember = !!member;
  var isFounder = member && member.role === 'founder';

  document.getElementById('state-guest').style.display = 'none';
  if (isMember) {
    document.getElementById('state-member').style.display = '';
    var form = document.getElementById('add-album-form');
    if (form) form.style.display = '';
  } else {
    document.getElementById('state-nonmember').style.display = '';
  }

  if (isFounder) {
    document.getElementById('invite-section').style.display = '';
  }

  document.getElementById('nav-auth-link').textContent = currentUser.username;
}

/* ── Album art (iTunes) ─────────────────────────────────────── */
var artTimer = null;
function fetchAlbumArt() {
  clearTimeout(artTimer);
  var artist  = (document.getElementById('add-artist') || {}).value || '';
  var album   = (document.getElementById('add-album-title') || {}).value || '';
  var preview = document.getElementById('art-preview');
  if (!preview) return;
  artist = artist.trim(); album = album.trim();
  if (!artist || !album) { preview.innerHTML = '<div class="art-preview-icon"></div>'; return; }
  artTimer = setTimeout(function() {
    preview.classList.add('loading');
    preview.innerHTML = '';
    fetch('https://itunes.apple.com/search?term=' + encodeURIComponent(artist + ' ' + album) + '&media=music&entity=album&limit=1')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        preview.classList.remove('loading');
        if (data.results && data.results.length) {
          var art = data.results[0].artworkUrl100.replace('100x100bb', '600x600bb');
          preview.innerHTML = '<img src="' + art + '" alt="Album art">';
          preview.dataset.artUrl = art;
        } else {
          preview.innerHTML = '<div class="art-preview-icon"></div>';
          delete preview.dataset.artUrl;
        }
      }).catch(function() {
        preview.classList.remove('loading');
        preview.innerHTML = '<div class="art-preview-icon"></div>';
      });
  }, 600);
}

async function addAlbum() {
  if (!currentEpisodeId) return;
  var artist = (document.getElementById('add-artist').value || '').trim();
  var album  = (document.getElementById('add-album-title').value || '').trim();
  var artUrl = document.getElementById('art-preview').dataset.artUrl || null;
  if (!artist || !album) return;

  var res = await fetch('/api/episodes/' + currentEpisodeId + '/vinyls', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ artist: artist, album_title: album, art_url: artUrl }),
  });

  if (res.ok) {
    document.getElementById('add-artist').value = '';
    document.getElementById('add-album-title').value = '';
    document.getElementById('art-preview').innerHTML = '<div class="art-preview-icon"></div>';
    delete document.getElementById('art-preview').dataset.artUrl;
    await loadCurrentSeason();
  } else {
    var err = await res.json();
    alert(err.error || 'Could not add album.');
  }
}

/* ── Invite member (founders only) ─────────────────────────── */
function toggleInviteForm() {
  var form    = document.getElementById('invite-form');
  var errEl   = document.getElementById('invite-error');
  var success = document.getElementById('invite-success');
  var isOpen  = form.style.display !== 'none';
  form.style.display = isOpen ? 'none' : '';
  if (!isOpen) {
    document.getElementById('invite-username').value = '';
    errEl.style.display = 'none';
    success.style.display = 'none';
  }
}

async function sendInvite() {
  var username = (document.getElementById('invite-username').value || '').trim();
  var errEl    = document.getElementById('invite-error');
  var success  = document.getElementById('invite-success');
  errEl.style.display = 'none';
  success.style.display = 'none';
  if (!username) { errEl.textContent = 'Enter a username.'; errEl.style.display = ''; return; }

  var res = await fetch('/api/groups/' + GROUP_SLUG + '/invite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: username }),
  });
  var data = await res.json();
  if (res.ok) {
    document.getElementById('invite-username').value = '';
    success.textContent = 'Invitation sent to ' + data.invited + '.';
    success.style.display = '';
  } else {
    errEl.textContent = data.error || 'Could not send invitation.';
    errEl.style.display = '';
  }
}

/* ── Tab switching ──────────────────────────────────────────── */
function switchTab(name) {
  ['now', 'members', 'archive'].forEach(function(t) {
    document.getElementById('tab-' + t).classList.toggle('active', t === name);
  });
  document.querySelectorAll('.section-tab').forEach(function(btn, i) {
    btn.classList.toggle('active', ['now', 'members', 'archive'][i] === name);
  });
}

/* ── Album art for sleeves (iTunes) ─────────────────────────── */
function loadAlbumArtForContainer(container) {
  container.querySelectorAll('.album-sleeve[data-artist]').forEach(function(sleeve) {
    var artist = sleeve.dataset.artist;
    var album  = sleeve.dataset.album;
    if (!artist || !album) return;
    var placeholder = sleeve.querySelector('.album-sleeve-placeholder');
    if (!placeholder) return;
    fetch('https://itunes.apple.com/search?term=' + encodeURIComponent(artist + ' ' + album) + '&media=music&entity=album&limit=1')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.results && data.results.length) {
          var art = data.results[0].artworkUrl100.replace('100x100bb', '600x600bb');
          var img = document.createElement('img');
          img.src = art;
          img.alt = artist + ' — ' + album;
          img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
          placeholder.replaceWith(img);
        }
      }).catch(function() {});
  });
}

/* ── Helpers ────────────────────────────────────────────────── */
function albumSleeveHtml(artist, album, contributor, artUrl) {
  var imgHtml = artUrl
    ? '<img src="' + esc(artUrl) + '" alt="' + esc(artist) + ' — ' + esc(album) + '" style="width:100%;height:100%;object-fit:cover;display:block;">'
    : '<div class="album-sleeve-placeholder" aria-hidden="true"><div class="album-sleeve-placeholder-disc"></div></div>';
  return '<div class="album-sleeve" data-artist="' + esc(artist) + '" data-album="' + esc(album) + '">' +
    '<div class="album-sleeve-image">' + imgHtml + '</div>' +
    '<div class="album-sleeve-footer">' +
      '<p class="album-sleeve-label">' + esc(artist) + '</p>' +
      '<p class="album-sleeve-title"><em>' + esc(album) + '</em></p>' +
      (contributor ? '<p class="album-sleeve-contributor">Added by ' + esc(contributor) + '</p>' : '') +
    '</div>' +
  '</div>';
}

function emptySleeveHtml() {
  return '<div class="album-sleeve" style="border-style:dashed;opacity:0.35;cursor:default;">' +
    '<div class="album-sleeve-image"><div class="album-sleeve-placeholder" aria-hidden="true"><div class="album-sleeve-placeholder-disc"></div></div></div>' +
  '</div>';
}

function monthLabel(dateStr) {
  var d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function groupSlugFromURL() {
  var params = new URLSearchParams(window.location.search);
  return params.get('group') || 'the-original';
}
