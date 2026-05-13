/* ── State ─────────────────────────────────────────────────── */
var GROUP_SLUG = groupSlugFromURL();
var groupData = null;
var currentUser = null;
var isMember = false;
var currentEpisodeId = null;
var currentEpisodeNumber = null;
var currentSeasonId = null;
var episodeSeasonMap = {};

/* ── Boot ──────────────────────────────────────────────────── */
(async function init() {
  await Promise.all([loadGroup(), loadCurrentUser()]);
})();

async function loadGroup() {
  if (!GROUP_SLUG) {
    document.getElementById('group-name').textContent = 'Group not found';
    return;
  }
  try {
    const res = await fetch('/api/groups/' + GROUP_SLUG);
    if (!res.ok) { document.getElementById('group-name').textContent = 'Group not found'; return; }
    groupData = await res.json();
    renderHero();
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
  currentSeasonId = activeSeason.id;
  var res  = await fetch('/api/seasons/' + activeSeason.id + '/episodes');
  var data = await res.json();
  renderNowPlaying(activeSeason, data.episodes || [], data.vinyls || []);
}

/* ── Hero ──────────────────────────────────────────────────── */
function renderHero() {
  var g       = groupData.group;
  var seasons = groupData.seasons;
  var members = groupData.members;

  document.title = g.name + ' — Vinyl Night';
  document.querySelector('meta[name="description"]').content = g.description || g.name;
  document.getElementById('group-name').textContent = g.name;
  document.getElementById('group-location').textContent =
    (g.location || '') + (g.founded_year ? ' — Est. ' + g.founded_year : '');
  document.getElementById('group-description').textContent = g.description || '';

  var episodeCount = seasons.reduce(function(s, x) { return s + (x.episode_count || 0); }, 0);
  document.getElementById('stat-members').textContent  = members.length;
  document.getElementById('stat-seasons').textContent  = seasons.length;
  document.getElementById('stat-episodes').textContent = episodeCount || '—';
  document.getElementById('stat-albums').textContent   = groupData.vinyl_count || '—';

  var completedCount = seasons.filter(function(s) { return s.status !== 'active'; }).length;
  document.getElementById('archive-summary').textContent =
    completedCount + ' completed season' + (completedCount !== 1 ? 's' : '');

  /* Members row under description */
  var heroMembers = document.getElementById('hero-members');
  if (heroMembers) {
    heroMembers.innerHTML = members.map(function(m) {
      var initial   = (m.username || '?')[0].toUpperCase();
      var isFounder = m.role === 'founder';
      return '<a href="user.html?user=' + esc(m.username) + '" class="hero-member">' +
        '<div class="avatar">' + esc(initial) + '</div>' +
        esc(m.username) +
        (isFounder ? '<span class="hero-member-role">Founder</span>' : '') +
      '</a>';
    }).join('');
  }
}

/* ── Now Playing ───────────────────────────────────────────── */
function renderNowPlaying(season, episodes, vinyls) {
  var el   = document.getElementById('now-playing-content');
  var wrap = document.getElementById('this-season-wrap');

  var vinylsByEp = {};
  vinyls.forEach(function(v) {
    if (!vinylsByEp[v.episode_id]) vinylsByEp[v.episode_id] = [];
    vinylsByEp[v.episode_id].push(v);
  });

  var currentEp = episodes.find(function(e) { return e.status === 'current'; });
  var otherEps  = episodes.filter(function(e) { return e.status !== 'current'; });

  if (!currentEp) {
    el.innerHTML = '<p class="text-muted text-sm" style="display:inline;">No current episode.</p>' +
      '<button id="start-ep-btn" class="btn btn-outline" style="display:none;margin-left:0.75rem;font-size:0.78rem;" onclick="confirmNewEpisode()">Start Episode</button>';
    checkMembership();
    renderThisSeason(season, otherEps, vinylsByEp);
    return;
  }

  currentEpisodeId     = currentEp.id;
  currentEpisodeNumber = currentEp.number;

  var epVinyls  = vinylsByEp[currentEp.id] || [];
  var dateLabel = currentEp.date ? monthLabel(currentEp.date) : '';

  /* Only add empty sleeve if it stays on the current row */
  var albumsHtml = epVinyls.map(function(v) {
    return albumSleeveHtml(v.artist, v.album_title, v.contributor_username, v.art_url, v.id, v.play_order, true);
  }).join('');
  if (epVinyls.length % 3 !== 0) albumsHtml += emptySleeveHtml();

  /* Meta */
  var metaParts = [];
  if (dateLabel) metaParts.push(dateLabel);
  if (currentEp.host_username) metaParts.push('Hosted by ' + esc(currentEp.host_username));
  var attendeeList = currentEp.attendees || [];
  if (attendeeList.length) metaParts.push(attendeeList.map(esc).join(', '));

  /* Episode editor */
  var members = groupData.members || [];
  var memberUsernames = members.map(function(m) { return m.username; });
  var guestAttendees  = attendeeList.filter(function(a) { return memberUsernames.indexOf(a) === -1; });

  var hostOptions = '<option value="">— not set —</option>' +
    members.map(function(m) {
      var sel = currentEp.host_username === m.username ? ' selected' : '';
      return '<option value="' + esc(m.username) + '"' + sel + '>' + esc(m.username) + '</option>';
    }).join('');

  var attendeeCheckboxes = members.map(function(m) {
    var chk = attendeeList.indexOf(m.username) !== -1 ? ' checked' : '';
    return '<label style="display:flex;align-items:center;gap:0.4rem;cursor:pointer;">' +
      '<input type="checkbox" name="ep-attendee" value="' + esc(m.username) + '"' + chk + '> ' +
      '<span style="font-size:0.88rem;">' + esc(m.username) + '</span>' +
    '</label>';
  }).join('');

  /* Guest badges + add-guest form for the episode editor */
  var guestBadges = guestAttendees.map(function(g) {
    return '<span class="tag">' + esc(g) + '</span>';
  }).join(' ');

  var guestSection =
    '<div class="form-group" style="margin-bottom:1.25rem;">' +
      '<label>Guests</label>' +
      (guestBadges ? '<div style="display:flex;flex-wrap:wrap;gap:0.4rem;margin-bottom:0.6rem;">' + guestBadges + '</div>' : '') +
      '<div id="add-guest-form" style="display:none;margin-bottom:0.5rem;">' +
        '<div style="display:flex;gap:0.75rem;align-items:flex-end;">' +
          '<div style="flex:1;"><input type="text" id="guest-name-input" placeholder="Guest name" style="margin:0;" onkeydown="if(event.key===\'Enter\')submitAddGuest()"></div>' +
          '<button type="button" class="btn btn-outline" style="font-size:0.78rem;" onclick="submitAddGuest()">Add</button>' +
          '<button type="button" class="btn btn-ghost" style="font-size:0.78rem;" onclick="toggleAddGuestForm()">Cancel</button>' +
        '</div>' +
      '</div>' +
      '<button id="add-guest-btn" type="button" class="btn btn-ghost" style="font-size:0.78rem;" onclick="toggleAddGuestForm()">+ Add a Guest</button>' +
    '</div>';

  /* Contributor dropdown — members first, then guests */
  var contribOptions = '<option value="">Select contributor…</option>' +
    members.map(function(m) {
      return '<option value="' + esc(m.username) + '">' + esc(m.username) + '</option>';
    }).join('') +
    (guestAttendees.length
      ? '<optgroup label="Guests">' +
          guestAttendees.map(function(g) {
            return '<option value="' + esc(g) + '">' + esc(g) + '</option>';
          }).join('') +
        '</optgroup>'
      : '');

  el.innerHTML =
    '<div class="now-playing-episode">' +
      '<div class="now-playing-episode-header">' +
        '<div>' +
          '<p class="label" style="margin-bottom:0.4rem;">Season ' + season.number + ' &middot; Episode ' + currentEp.number + '</p>' +
          (metaParts.length ? '<p class="text-sm text-muted">' + metaParts.join(' &middot; ') + '</p>' : '') +
        '</div>' +
        '<div id="episode-actions" style="display:none;gap:0.5rem;flex-wrap:wrap;align-items:center;">' +
          '<button class="btn btn-outline" style="font-size:0.78rem;" onclick="toggleEpisodeEditor()">Edit Episode</button>' +
          '<button class="btn btn-ghost" style="font-size:0.78rem;" onclick="confirmNewEpisode()">New Episode &rarr;</button>' +
          '<button class="btn btn-ghost" style="font-size:0.78rem;color:var(--accent-bright);" onclick="showCurrentEpDelete()">Delete</button>' +
        '</div>' +
        '<div id="del-confirm-current" style="display:none;padding:1rem;background:var(--surface-raised);border:1px solid var(--border-subtle);margin-bottom:1rem;">' +
          '<p class="text-sm" style="color:var(--text-muted);margin-bottom:0.6rem;">Permanently delete Episode ' + currentEp.number + ' and all its albums. Type <strong>delete</strong> to confirm.</p>' +
          '<div style="display:flex;gap:0.75rem;align-items:center;flex-wrap:wrap;">' +
            '<input type="text" id="del-input-current" placeholder="delete" style="width:130px;margin:0;" oninput="checkDeleteCurrentInput()">' +
            '<button id="del-btn-current" class="btn" style="font-size:0.78rem;background:var(--accent-bright);color:#fff;border-color:var(--accent-bright);opacity:0.4;cursor:not-allowed;" disabled onclick="executeDeleteCurrentEpisode()">Delete Forever</button>' +
            '<button class="btn btn-ghost" style="font-size:0.78rem;" onclick="hideCurrentEpDelete()">Cancel</button>' +
          '</div>' +
        '</div>' +
      '</div>' +

      /* Episode editor — uses form-group styling */
      '<div id="episode-editor" style="display:none;padding:1.5rem;background:var(--surface-raised);border:1px solid var(--border-subtle);margin-bottom:1.5rem;">' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.25rem;">' +
          '<div class="form-group" style="margin-bottom:0;">' +
            '<label for="ep-date">Date</label>' +
            '<input type="date" id="ep-date" value="' + esc(currentEp.date || '') + '">' +
          '</div>' +
          '<div class="form-group" style="margin-bottom:0;">' +
            '<label for="ep-host">Host</label>' +
            '<select id="ep-host">' + hostOptions + '</select>' +
          '</div>' +
        '</div>' +
        (members.length ?
          '<div class="form-group" style="margin-bottom:1.25rem;">' +
            '<label>Who attended?</label>' +
            '<div style="display:flex;flex-wrap:wrap;gap:0.5rem 1.5rem;padding-top:0.25rem;">' + attendeeCheckboxes + '</div>' +
          '</div>'
        : '') +
        guestSection +
        '<div style="display:flex;gap:0.75rem;">' +
          '<button class="btn btn-primary" onclick="saveEpisodeDetails()">Save</button>' +
          '<button class="btn btn-ghost" onclick="toggleEpisodeEditor()">Cancel</button>' +
        '</div>' +
      '</div>' +

      '<div class="episode-album-grid" id="current-album-grid">' + albumsHtml + '</div>' +

      '<div id="add-album-form" style="display:none;margin-top:0;">' +
        '<p class="add-album-form-title">Add selection for this episode</p>' +
        '<div class="add-album-row">' +
          '<div>' +
            '<label for="add-contributor">Contributor</label>' +
            '<select id="add-contributor">' + contribOptions + '</select>' +
          '</div>' +
          '<div><label for="add-artist">Artist</label><input type="text" id="add-artist" placeholder="Artist name" oninput="fetchAlbumArt()"></div>' +
          '<div><label for="add-album-title">Album</label><input type="text" id="add-album-title" placeholder="Album title" oninput="fetchAlbumArt()"></div>' +
          '<div><label for="add-play-order">Order</label><input type="number" id="add-play-order" placeholder="#" min="1" max="99"></div>' +
          '<div style="display:flex;align-items:flex-end;gap:0.75rem;">' +
            '<div class="art-preview" id="art-preview" title="Album art preview"><div class="art-preview-icon"></div></div>' +
            '<button type="button" class="btn btn-primary" onclick="addAlbum()">Add</button>' +
          '</div>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:1rem;margin-top:0.5rem;flex-wrap:wrap;">' +
          '<p class="form-hint" style="margin:0;">Art is fetched automatically as you type.</p>' +
          '<button id="art-change-cover" type="button" class="btn btn-ghost" style="display:none;font-size:0.75rem;padding:0.2rem 0.6rem;" onclick="openArtUrlInput()">Change cover</button>' +
        '</div>' +
        '<div id="art-url-input-wrap" style="display:none;margin-top:0.5rem;max-width:480px;">' +
          '<div style="display:flex;gap:0.5rem;align-items:center;">' +
            '<input type="url" id="art-url-input" placeholder="Paste image URL" style="flex:1;margin:0;font-size:0.85rem;">' +
            '<button type="button" class="btn btn-primary" style="font-size:0.78rem;" onclick="applyPastedArt()">Apply</button>' +
            '<button type="button" class="btn btn-ghost"  style="font-size:0.78rem;" onclick="cancelArtUrlInput()">Cancel</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';

  checkMembership();
  renderThisSeason(season, otherEps, vinylsByEp);
}

function renderThisSeason(season, episodes, vinylsByEp) {
  var wrap    = document.getElementById('this-season-wrap');
  var members = groupData.members || [];
  if (!episodes.length) { wrap.innerHTML = ''; return; }

  var html = episodes.map(function(ep) {
    var epVinyls     = vinylsByEp[ep.id] || [];
    var dateLabel    = ep.date ? monthLabel(ep.date) : '';
    var attendeeList = ep.attendees || [];
    var badge        = ep.status === 'upcoming'
      ? '<span class="tag">Upcoming</span>'
      : '<span class="tag">Completed</span>';

    episodeSeasonMap[ep.id] = { seasonId: season.id, isArchive: false };

    var albumsHtml = epVinyls.map(function(v) {
      return albumSleeveHtml(v.artist, v.album_title, v.contributor_username, v.art_url, v.id, v.play_order);
    }).join('');

    var albumTags = epVinyls.map(function(v) {
      return '<span class="tag" style="font-size:0.72rem;font-weight:normal;">' +
        esc(v.artist) + ' &mdash; <em>' + esc(v.album_title) + '</em></span>';
    }).join('');

    var hostLine = ep.host_username
      ? '<p class="text-xs text-muted" style="margin-top:0.2rem;">Hosted by ' + esc(ep.host_username) +
        (attendeeList.length ? ' &middot; ' + attendeeList.map(esc).join(', ') : '') + '</p>'
      : (attendeeList.length
          ? '<p class="text-xs text-muted" style="margin-top:0.2rem;">' + attendeeList.map(esc).join(', ') + '</p>'
          : '');

    return '<details class="season">' +
      '<summary>' +
        '<div style="flex:1;min-width:0;">' +
          '<div style="display:flex;align-items:baseline;gap:0.75rem;">' +
            '<span class="season-title">Episode ' + ep.number +
              (dateLabel ? ' &mdash; ' + dateLabel : '') + '</span>' +
          '</div>' +
          hostLine +
          (albumTags ? '<div style="display:flex;flex-wrap:wrap;gap:0.35rem;margin-top:0.4rem;">' + albumTags + '</div>' : '') +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:0.75rem;flex-shrink:0;">' +
          '<button class="ep-edit-btn" title="Edit episode" style="' + (isMember ? '' : 'display:none;') + 'background:none;border:none;cursor:pointer;padding:0.25rem 0.5rem;font-size:1rem;color:var(--text-muted);" onclick="event.stopPropagation();toggleEpInlineEditor(\'' + ep.id + '\')">&#9998;</button>' +
          badge + '<span class="season-chevron">&#9656;</span>' +
        '</div>' +
      '</summary>' +
      '<div style="padding-top:1.25rem;padding-left:1.5rem;">' +
        buildEpInlineEditor(ep, epVinyls, members) +
        (albumsHtml
          ? '<div class="episode-album-grid">' + albumsHtml + '</div>'
          : '<p class="text-muted text-sm">No albums recorded.</p>') +
      '</div>' +
    '</details>';
  }).join('');

  wrap.innerHTML =
    '<hr class="groove" style="margin:2rem 0;">' +
    '<p class="label mb-4">Season ' + season.number + ' &mdash; ' + season.year + '</p>' +
    '<div style="padding-left:1.5rem;">' + html + '</div>';
}

/* ── Archive ───────────────────────────────────────────────── */
function renderArchive() {
  /* Seasons already arrive in DESC order (newest first) from the API */
  var seasons = groupData.seasons.filter(function(s) { return s.status !== 'active'; });
  var el      = document.getElementById('archive-content');

  if (!seasons.length) {
    el.innerHTML = '<p class="text-muted text-sm">No archive yet — completed seasons will appear here.</p>';
    return;
  }

  el.innerHTML = seasons.map(function(s, idx) {
    var epCount = s.episode_count || 0;
    return '<details class="season" id="season-' + s.id + '"' + (idx === 0 ? ' open' : '') +
           ' ontoggle="onSeasonToggle(this, \'' + s.id + '\')">' +
      '<summary>' +
        '<div>' +
          '<span class="season-title">Season ' + s.number + ' — ' + s.year + '</span>' +
          '<p class="text-xs text-muted mt-1">' + epCount + ' episode' + (epCount !== 1 ? 's' : '') + '</p>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:1.5rem;">' +
          '<span class="season-meta">Completed</span>' +
          '<span class="season-chevron">&#9656;</span>' +
        '</div>' +
      '</summary>' +
      '<div class="episodes-list" id="eps-' + s.id + '" style="padding-left:1.5rem;">' +
        '<p class="text-muted text-sm" style="padding:1rem 0;">Loading&hellip;</p>' +
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

  var res  = await fetch('/api/seasons/' + seasonId + '/episodes');
  var data = await res.json();
  /* Episodes come DESC from API — reverse to show EP 1, 2, 3... in archive */
  var episodes = (data.episodes || []).slice().reverse();
  var vinyls   = data.vinyls || [];

  var vinylsByEp = {};
  vinyls.forEach(function(v) {
    if (!vinylsByEp[v.episode_id]) vinylsByEp[v.episode_id] = [];
    vinylsByEp[v.episode_id].push(v);
  });

  var season = groupData.seasons.find(function(s) { return s.id === seasonId; });
  var sNum   = season ? season.number : '?';

  var members = groupData.members || [];

  var html = episodes.map(function(ep) {
    var epVinyls     = vinylsByEp[ep.id] || [];
    var dateLabel    = ep.date ? monthLabel(ep.date) : '';
    var attendeeList = ep.attendees || [];

    episodeSeasonMap[ep.id] = { seasonId: seasonId, isArchive: true };

    var albumsHtml = epVinyls.map(function(v) {
      return albumSleeveHtml(v.artist, v.album_title, v.contributor_username, v.art_url, v.id, v.play_order);
    }).join('');

    var albumTags = epVinyls.map(function(v) {
      return '<span class="tag" style="font-size:0.72rem;font-weight:normal;">' +
        esc(v.artist) + ' &mdash; <em>' + esc(v.album_title) + '</em></span>';
    }).join('');

    var hostLine = ep.host_username
      ? '<p class="text-xs text-muted" style="margin-top:0.2rem;">Hosted by ' + esc(ep.host_username) +
        (attendeeList.length ? ' &middot; ' + attendeeList.map(esc).join(', ') : '') + '</p>'
      : (attendeeList.length
          ? '<p class="text-xs text-muted" style="margin-top:0.2rem;">' + attendeeList.map(esc).join(', ') + '</p>'
          : '');

    return '<details class="season">' +
      '<summary>' +
        '<div style="flex:1;min-width:0;">' +
          '<span class="season-title">Episode ' + ep.number +
            (dateLabel ? ' &mdash; ' + dateLabel : '') + '</span>' +
          hostLine +
          (albumTags ? '<div style="display:flex;flex-wrap:wrap;gap:0.35rem;margin-top:0.4rem;">' + albumTags + '</div>' : '') +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:0.75rem;flex-shrink:0;">' +
          '<button class="ep-edit-btn" title="Edit episode" style="' + (isMember ? '' : 'display:none;') + 'background:none;border:none;cursor:pointer;padding:0.25rem 0.5rem;font-size:1rem;color:var(--text-muted);" onclick="event.stopPropagation();toggleEpInlineEditor(\'' + ep.id + '\')">&#9998;</button>' +
          '<span class="season-chevron">&#9656;</span>' +
        '</div>' +
      '</summary>' +
      '<div style="padding-top:1.25rem;padding-left:1.5rem;">' +
        buildEpInlineEditor(ep, epVinyls, members) +
        (albumsHtml
          ? '<div class="episode-album-grid">' + albumsHtml + '</div>'
          : '<p class="text-muted text-sm">No albums recorded.</p>') +
      '</div>' +
    '</details>';
  }).join('');

  var container = document.getElementById('eps-' + seasonId);
  container.innerHTML = html ||
    '<p class="text-muted text-sm" style="padding:1rem 0;">No episodes recorded yet.</p>';
}

/* ── Auth state / membership ────────────────────────────────── */
function checkMembership() {
  if (!groupData || !currentUser) return;
  var member    = groupData.members.find(function(m) { return m.id === currentUser.id; });
  isMember      = !!member;
  var isFounder = member && member.role === 'founder';

  document.getElementById('state-guest').style.display = 'none';
  if (isMember) {
    var form    = document.getElementById('add-album-form');
    if (form) form.style.display = '';
    var actions = document.getElementById('episode-actions');
    if (actions) actions.style.display = 'flex';
    var startBtn = document.getElementById('start-ep-btn');
    if (startBtn) startBtn.style.display = '';
    /* Pre-select the logged-in user in the contributor dropdown */
    var contribSel = document.getElementById('add-contributor');
    if (contribSel && currentUser) contribSel.value = currentUser.username;
    /* Show edit pencils on all completed episodes */
    document.querySelectorAll('.ep-edit-btn').forEach(function(btn) { btn.style.display = ''; });
    /* Show remove buttons on current-episode album sleeves */
    document.querySelectorAll('.vinyl-del-btn').forEach(function(btn) { btn.style.display = ''; });
  } else {
    document.getElementById('state-nonmember').style.display = '';
  }

  if (isFounder) {
    document.getElementById('invite-section').style.display = '';
    document.getElementById('danger-section').style.display = '';
  }

  document.getElementById('nav-auth-link').textContent = currentUser.username;
}

/* ── Episode management ─────────────────────────────────────── */
function toggleEpisodeEditor() {
  var ed = document.getElementById('episode-editor');
  if (!ed) return;
  ed.style.display = ed.style.display === 'none' ? '' : 'none';
}

function toggleAddGuestForm() {
  var form = document.getElementById('add-guest-form');
  var btn  = document.getElementById('add-guest-btn');
  if (!form || !btn) return;
  var isOpen = form.style.display !== 'none';
  form.style.display = isOpen ? 'none' : '';
  btn.style.display  = isOpen ? '' : 'none';
  if (!isOpen) {
    var inp = document.getElementById('guest-name-input');
    if (inp) { inp.value = ''; inp.focus(); }
  }
}

async function submitAddGuest() {
  if (!currentEpisodeId) return;
  var inp  = document.getElementById('guest-name-input');
  var name = inp ? inp.value.trim() : '';
  if (!name) return;

  try {
    var res = await fetch('/api/episodes/' + currentEpisodeId + '/guests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name }),
    });
    if (!res.ok) {
      var err = await res.json();
      alert(err.error || 'Could not add guest.');
      return;
    }
    var editorWasOpen = (document.getElementById('episode-editor') || {}).style.display !== 'none';
    await loadCurrentSeason();
    if (editorWasOpen) {
      var ed = document.getElementById('episode-editor');
      if (ed) ed.style.display = '';
    }
  } catch (e) {
    alert('Could not add guest.');
  }
}

function toggleEpInlineEditor(epId) {
  var ed = document.getElementById('ep-editor-' + epId);
  if (!ed) return;
  ed.style.display = ed.style.display === 'none' ? '' : 'none';
}

async function saveEpInline(epId) {
  var dateEl    = document.getElementById('ep-date-' + epId);
  var hostEl    = document.getElementById('ep-host-' + epId);
  var checked   = document.querySelectorAll('[name="ep-att-' + epId + '"]:checked');
  var attendees = Array.from(checked).map(function(b) { return b.value; });

  try {
    var results = await Promise.all([
      fetch('/api/episodes/' + epId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date:          dateEl ? (dateEl.value || null) : null,
          host_username: hostEl ? (hostEl.value || null) : null,
        }),
      }),
      fetch('/api/episodes/' + epId + '/attendees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernames: attendees }),
      }),
    ]);
    if (!results[0].ok || !results[1].ok) { alert('Could not save changes.'); return; }

    var info = episodeSeasonMap[epId];
    if (info) {
      if (info.isArchive) {
        loadedSeasons[info.seasonId] = false;
        loadSeasonEpisodes(info.seasonId);
      } else {
        loadCurrentSeason();
      }
    }
  } catch(e) {
    alert('Could not save changes.');
  }
}

async function saveEpisodeDetails() {
  if (!currentEpisodeId) return;
  var dateEl  = document.getElementById('ep-date');
  var hostEl  = document.getElementById('ep-host');
  var checked = document.querySelectorAll('input[name="ep-attendee"]:checked');
  var attendees = Array.from(checked).map(function(b) { return b.value; });

  try {
    var results = await Promise.all([
      fetch('/api/episodes/' + currentEpisodeId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date:          dateEl ? (dateEl.value || null) : null,
          host_username: hostEl ? (hostEl.value || null) : null,
        }),
      }),
      fetch('/api/episodes/' + currentEpisodeId + '/attendees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernames: attendees }),
      }),
    ]);
    if (!results[0].ok || !results[1].ok) { alert('Could not save changes.'); return; }
    await loadCurrentSeason();
  } catch(e) {
    alert('Could not save changes.');
  }
}

async function confirmNewEpisode() {
  if (!currentSeasonId) return;
  var msg = currentEpisodeNumber
    ? 'This will close Episode ' + currentEpisodeNumber + ' and start Episode ' + (currentEpisodeNumber + 1) + '. Continue?'
    : 'Start the first episode of this season?';
  if (!confirm(msg)) return;

  try {
    var res = await fetch('/api/seasons/' + currentSeasonId + '/episodes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (!res.ok) { var e = await res.json(); alert(e.error || 'Could not create episode.'); return; }
    await loadCurrentSeason();
  } catch(e) {
    alert('Could not create episode.');
  }
}

/* ── Delete episode ─────────────────────────────────────────── */
function showCurrentEpDelete() {
  document.getElementById('del-confirm-current').style.display = '';
}
function hideCurrentEpDelete() {
  var el = document.getElementById('del-confirm-current');
  if (el) el.style.display = 'none';
  var inp = document.getElementById('del-input-current');
  if (inp) inp.value = '';
  var btn = document.getElementById('del-btn-current');
  if (btn) { btn.disabled = true; btn.style.opacity = '0.4'; btn.style.cursor = 'not-allowed'; }
}
function checkDeleteCurrentInput() {
  var inp = document.getElementById('del-input-current');
  var btn = document.getElementById('del-btn-current');
  if (!inp || !btn) return;
  var ok = inp.value.toLowerCase() === 'delete';
  btn.disabled = !ok;
  btn.style.opacity = ok ? '1' : '0.4';
  btn.style.cursor  = ok ? 'pointer' : 'not-allowed';
}
async function executeDeleteCurrentEpisode() {
  if (!currentEpisodeId) return;
  try {
    var res = await fetch('/api/episodes/' + currentEpisodeId, { method: 'DELETE' });
    if (!res.ok) { var e = await res.json(); alert(e.error || 'Could not delete episode.'); return; }
    await loadCurrentSeason();
  } catch(e) { alert('Could not delete episode.'); }
}

function checkDeleteInput(epId) {
  var inp = document.getElementById('del-input-' + epId);
  var btn = document.getElementById('del-btn-' + epId);
  if (!inp || !btn) return;
  var ok = inp.value.toLowerCase() === 'delete';
  btn.disabled = !ok;
  btn.style.opacity = ok ? '1' : '0.4';
  btn.style.cursor  = ok ? 'pointer' : 'not-allowed';
}
async function executeDeleteEpisode(epId) {
  try {
    var res = await fetch('/api/episodes/' + epId, { method: 'DELETE' });
    if (!res.ok) { var e = await res.json(); alert(e.error || 'Could not delete episode.'); return; }
    var info = episodeSeasonMap[epId];
    if (info && info.isArchive) {
      loadedSeasons[info.seasonId] = false;
      loadSeasonEpisodes(info.seasonId);
    } else {
      loadCurrentSeason();
    }
  } catch(e) { alert('Could not delete episode.'); }
}

/* ── Episode inline editor builder ──────────────────────────── */
function buildEpInlineEditor(ep, epVinyls, members) {
  var hostOptions = '<option value="">— not set —</option>' +
    members.map(function(m) {
      var sel = ep.host_username === m.username ? ' selected' : '';
      return '<option value="' + esc(m.username) + '"' + sel + '>' + esc(m.username) + '</option>';
    }).join('');

  var attendeeList = ep.attendees || [];
  var attendeeCheckboxes = members.filter(function(m) { return !m.is_guest; }).map(function(m) {
    var chk = attendeeList.indexOf(m.username) !== -1 ? ' checked' : '';
    return '<label style="display:flex;align-items:center;gap:0.4rem;cursor:pointer;">' +
      '<input type="checkbox" name="ep-att-' + ep.id + '" value="' + esc(m.username) + '"' + chk + '> ' +
      '<span style="font-size:0.88rem;">' + esc(m.username) + '</span>' +
    '</label>';
  }).join('');

  var contribOptions = '<option value="">Select contributor…</option>' +
    members.map(function(m) {
      return '<option value="' + esc(m.username) + '">' + esc(m.username) + '</option>';
    }).join('');

  var albumsHtml = epVinyls.map(function(v) {
    return albumSleeveHtml(v.artist, v.album_title, v.contributor_username, v.art_url, v.id, v.play_order, true);
  }).join('');

  var id = ep.id;
  return (
    '<div id="ep-editor-' + id + '" style="display:none;padding:1.25rem;background:var(--surface-raised);border:1px solid var(--border-subtle);margin-bottom:1.25rem;">' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.25rem;">' +
        '<div class="form-group" style="margin-bottom:0;"><label>Date</label>' +
          '<input type="date" id="ep-date-' + id + '" value="' + esc(ep.date || '') + '"></div>' +
        '<div class="form-group" style="margin-bottom:0;"><label>Host</label>' +
          '<select id="ep-host-' + id + '">' + hostOptions + '</select></div>' +
      '</div>' +
      (members.length
        ? '<div class="form-group" style="margin-bottom:1.25rem;"><label>Who attended?</label>' +
            '<div style="display:flex;flex-wrap:wrap;gap:0.5rem 1.5rem;padding-top:0.25rem;">' + attendeeCheckboxes + '</div></div>'
        : '') +
      '<div style="display:flex;gap:0.75rem;margin-bottom:1.5rem;">' +
        '<button class="btn btn-primary" style="font-size:0.78rem;" onclick="saveEpInline(\'' + id + '\')">Save</button>' +
        '<button class="btn btn-ghost"   style="font-size:0.78rem;" onclick="toggleEpInlineEditor(\'' + id + '\')">Cancel</button>' +
      '</div>' +
      '<div style="border-top:1px solid var(--border-subtle);padding-top:1.25rem;">' +
        '<p class="label mb-3">Selections</p>' +
        '<div class="episode-album-grid ep-albums-wrap" id="ep-grid-' + id + '">' +
          (albumsHtml || '<p class="text-muted text-sm" style="grid-column:1/-1;padding-bottom:0.5rem;">No albums recorded.</p>') +
        '</div>' +
        '<div class="add-album-row" style="margin-top:1.25rem;">' +
          '<div>' +
            '<label>Contributor</label>' +
            '<select id="ep-add-contributor-' + id + '">' + contribOptions + '</select>' +
          '</div>' +
          '<div><label>Artist</label><input type="text" id="ep-add-artist-' + id + '" placeholder="Artist name" oninput="fetchEpAlbumArt(\'' + id + '\')"></div>' +
          '<div><label>Album</label><input type="text" id="ep-add-album-title-' + id + '" placeholder="Album title" oninput="fetchEpAlbumArt(\'' + id + '\')"></div>' +
          '<div><label>Order</label><input type="number" id="ep-add-play-order-' + id + '" placeholder="#" min="1" max="99"></div>' +
          '<div style="display:flex;align-items:flex-end;gap:0.75rem;">' +
            '<div class="art-preview" id="ep-art-preview-' + id + '" title="Album art preview"><div class="art-preview-icon"></div></div>' +
            '<button type="button" class="btn btn-primary" onclick="addEpAlbum(\'' + id + '\')">Add</button>' +
          '</div>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:1rem;margin-top:0.5rem;flex-wrap:wrap;">' +
          '<p class="form-hint" style="margin:0;">Art is fetched automatically as you type.</p>' +
          '<button id="ep-art-change-cover-' + id + '" type="button" class="btn btn-ghost" style="display:none;font-size:0.75rem;padding:0.2rem 0.6rem;" onclick="openEpArtUrlInput(\'' + id + '\')">Change cover</button>' +
        '</div>' +
        '<div id="ep-art-url-input-wrap-' + id + '" style="display:none;margin-top:0.5rem;max-width:480px;">' +
          '<div style="display:flex;gap:0.5rem;align-items:center;">' +
            '<input type="url" id="ep-art-url-input-' + id + '" placeholder="Paste image URL" style="flex:1;margin:0;font-size:0.85rem;">' +
            '<button type="button" class="btn btn-primary" style="font-size:0.78rem;" onclick="applyEpPastedArt(\'' + id + '\')">Apply</button>' +
            '<button type="button" class="btn btn-ghost"  style="font-size:0.78rem;" onclick="cancelEpArtUrlInput(\'' + id + '\')">Cancel</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div style="margin-top:1.25rem;padding-top:1.25rem;border-top:1px solid var(--border-subtle);">' +
        '<div id="del-confirm-' + id + '" style="display:none;margin-bottom:0.5rem;">' +
          '<p class="text-xs text-muted" style="margin-bottom:0.5rem;">Type <strong>delete</strong> to permanently remove this episode and all its albums.</p>' +
          '<div style="display:flex;gap:0.75rem;align-items:center;flex-wrap:wrap;">' +
            '<input type="text" id="del-input-' + id + '" placeholder="delete" style="width:130px;margin:0;" oninput="checkDeleteInput(\'' + id + '\')">' +
            '<button id="del-btn-' + id + '" class="btn" style="font-size:0.78rem;background:var(--accent-bright);color:#fff;border-color:var(--accent-bright);opacity:0.4;cursor:not-allowed;" disabled onclick="executeDeleteEpisode(\'' + id + '\')">Delete Forever</button>' +
            '<button class="btn btn-ghost" style="font-size:0.78rem;" onclick="document.getElementById(\'del-confirm-' + id + '\').style.display=\'none\'">Cancel</button>' +
          '</div>' +
        '</div>' +
        '<button class="ep-edit-btn" style="font-size:0.78rem;background:none;border:none;cursor:pointer;color:var(--accent-bright);padding:0;" onclick="document.getElementById(\'del-confirm-' + id + '\').style.display=\'\'">Delete Episode</button>' +
      '</div>' +
    '</div>'
  );
}

/* ── Episode inline editor – art & add album ─────────────────── */
var epArtTimers     = {};
var epArtLastStates = {};

function fetchEpAlbumArt(epId) {
  clearTimeout(epArtTimers[epId]);
  var artist  = (document.getElementById('ep-add-artist-'      + epId) || {}).value || '';
  var album   = (document.getElementById('ep-add-album-title-' + epId) || {}).value || '';
  var preview = document.getElementById('ep-art-preview-' + epId);
  if (!preview) return;
  artist = artist.trim(); album = album.trim();
  if (!artist || !album) { setEpArtPreviewEmpty(epId, preview); return; }
  var last = epArtLastStates[epId] || {};
  if (artist === last.artist && album === last.album) return;
  epArtTimers[epId] = setTimeout(function() {
    var cur = epArtLastStates[epId] || {};
    if (artist === cur.artist && album === cur.album) return;
    epArtLastStates[epId] = { artist: artist, album: album };
    preview.classList.add('loading');
    preview.innerHTML = '';
    fetch('/api/artwork?artist=' + encodeURIComponent(artist) + '&album=' + encodeURIComponent(album))
      .then(function(r) { return r.json(); })
      .then(function(data) {
        preview.classList.remove('loading');
        var imgUrl  = data.thumbnailUrl || data.imageUrl;
        var fullUrl = data.imageUrl     || data.thumbnailUrl;
        if (imgUrl) {
          preview.innerHTML = '<img src="' + esc(imgUrl) + '" alt="Album art">';
          preview.dataset.artUrl = fullUrl;
          showEpChangeCoverBtn(epId, data.confidence);
        } else {
          setEpArtPreviewEmpty(epId, preview);
        }
      }).catch(function() {
        preview.classList.remove('loading');
        setEpArtPreviewEmpty(epId, preview);
      });
  }, 600);
}

function setEpArtPreviewEmpty(epId, preview) {
  if (!preview) preview = document.getElementById('ep-art-preview-' + epId);
  if (preview) { preview.innerHTML = '<div class="art-preview-icon"></div>'; delete preview.dataset.artUrl; }
  var btn = document.getElementById('ep-art-change-cover-' + epId);
  if (btn) btn.style.display = 'none';
  var wrap = document.getElementById('ep-art-url-input-wrap-' + epId);
  if (wrap) wrap.style.display = 'none';
}

function showEpChangeCoverBtn(epId, confidence) {
  var btn = document.getElementById('ep-art-change-cover-' + epId);
  if (!btn) return;
  btn.textContent = confidence === 'medium' ? 'Wrong cover?' : 'Change cover';
  btn.style.display = '';
}

function openEpArtUrlInput(epId) {
  var wrap = document.getElementById('ep-art-url-input-wrap-' + epId);
  var inp  = document.getElementById('ep-art-url-input-'      + epId);
  if (wrap) wrap.style.display = '';
  if (inp)  inp.focus();
}

function cancelEpArtUrlInput(epId) {
  var wrap = document.getElementById('ep-art-url-input-wrap-' + epId);
  var inp  = document.getElementById('ep-art-url-input-'      + epId);
  if (wrap) wrap.style.display = 'none';
  if (inp)  inp.value = '';
}

function applyEpPastedArt(epId) {
  var inp     = document.getElementById('ep-art-url-input-'  + epId);
  var preview = document.getElementById('ep-art-preview-'    + epId);
  if (!inp || !preview) return;
  var url = inp.value.trim();
  if (url) {
    preview.innerHTML = '<img src="' + esc(url) + '" alt="Album art">';
    preview.dataset.artUrl = url;
    epArtLastStates[epId] = {};
  }
  cancelEpArtUrlInput(epId);
}

async function addEpAlbum(epId) {
  var artist    = ((document.getElementById('ep-add-artist-'      + epId) || {}).value || '').trim();
  var album     = ((document.getElementById('ep-add-album-title-' + epId) || {}).value || '').trim();
  var preview   = document.getElementById('ep-art-preview-'    + epId);
  var artUrl    = preview ? (preview.dataset.artUrl || null) : null;
  var contribEl = document.getElementById('ep-add-contributor-' + epId);
  var orderEl   = document.getElementById('ep-add-play-order-'  + epId);
  var contributor = contribEl ? contribEl.value : '';
  var orderVal  = parseInt((orderEl ? orderEl.value : ''), 10);
  var playOrder = Number.isFinite(orderVal) && orderVal > 0 ? orderVal : null;
  if (!artist || !album) return;

  var res = await fetch('/api/episodes/' + epId + '/vinyls', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      artist:               artist,
      album_title:          album,
      art_url:              artUrl,
      contributor_username: contributor || null,
      play_order:           playOrder,
    }),
  });

  if (res.ok) {
    var data = await res.json();
    var grid = document.getElementById('ep-grid-' + epId);
    if (grid) {
      var noMsg = grid.querySelector('p.text-muted');
      if (noMsg) noMsg.remove();
      var tmp = document.createElement('div');
      tmp.innerHTML = albumSleeveHtml(data.artist, data.album_title, data.contributor_username, artUrl, data.id, data.play_order, true);
      grid.appendChild(tmp.firstChild);
    }
    if (document.getElementById('ep-add-artist-'      + epId)) document.getElementById('ep-add-artist-'      + epId).value = '';
    if (document.getElementById('ep-add-album-title-' + epId)) document.getElementById('ep-add-album-title-' + epId).value = '';
    if (document.getElementById('ep-add-play-order-'  + epId)) document.getElementById('ep-add-play-order-'  + epId).value = '';
    epArtLastStates[epId] = {};
    setEpArtPreviewEmpty(epId);
  } else {
    var err = await res.json();
    alert(err.error || 'Could not add album.');
  }
}

/* ── Edit group ─────────────────────────────────────────────── */
function toggleGroupEditor() {
  var editor = document.getElementById('group-editor');
  var isOpen = editor.style.display !== 'none';
  if (isOpen) {
    editor.style.display = 'none';
    cancelDeleteGroup();
  } else {
    var g = groupData.group;
    document.getElementById('edit-group-name').value        = g.name        || '';
    document.getElementById('edit-group-location').value    = g.location    || '';
    document.getElementById('edit-group-description').value = g.description || '';
    document.getElementById('edit-group-error').style.display = 'none';
    editor.style.display = '';
  }
}

async function saveGroupEdit() {
  var errEl = document.getElementById('edit-group-error');
  errEl.style.display = 'none';

  var name        = document.getElementById('edit-group-name').value.trim();
  var location    = document.getElementById('edit-group-location').value.trim();
  var description = document.getElementById('edit-group-description').value.trim();

  if (!name) { errEl.textContent = 'Name cannot be empty.'; errEl.style.display = ''; return; }

  try {
    var res  = await fetch('/api/groups/' + GROUP_SLUG, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, location: location || null, description: description || null }),
    });
    var data = await res.json();
    if (!res.ok) { errEl.textContent = data.error || 'Could not save changes.'; errEl.style.display = ''; return; }

    groupData.group.name        = data.name;
    groupData.group.location    = data.location;
    groupData.group.description = data.description;
    renderHero();
    toggleGroupEditor();
  } catch (e) {
    errEl.textContent = 'Could not save changes.'; errEl.style.display = '';
  }
}

/* ── Delete group ───────────────────────────────────────────── */
function showDeleteGroupConfirm() {
  document.getElementById('delete-group-confirm').style.display = '';
}
function cancelDeleteGroup() {
  var confirm = document.getElementById('delete-group-confirm');
  if (confirm) confirm.style.display = 'none';
  var inp = document.getElementById('delete-group-input');
  if (inp) inp.value = '';
  var btn = document.getElementById('delete-group-btn');
  if (btn) { btn.disabled = true; btn.style.opacity = '0.4'; btn.style.cursor = 'not-allowed'; }
}
function checkDeleteGroupInput() {
  var inp = document.getElementById('delete-group-input');
  var btn = document.getElementById('delete-group-btn');
  var ok  = inp.value.toLowerCase() === 'delete';
  btn.disabled = !ok;
  btn.style.opacity = ok ? '1' : '0.4';
  btn.style.cursor  = ok ? 'pointer' : 'not-allowed';
}
async function executeDeleteGroup() {
  try {
    var res = await fetch('/api/groups/' + GROUP_SLUG, { method: 'DELETE' });
    if (!res.ok) { var e = await res.json(); alert(e.error || 'Could not delete group.'); return; }
    window.location.href = '/groups.html';
  } catch(e) { alert('Could not delete group.'); }
}

/* ── Album art ──────────────────────────────────────────────── */
var artTimer      = null;
var artLastArtist = '';
var artLastAlbum  = '';

function fetchAlbumArt() {
  clearTimeout(artTimer);
  var artist  = (document.getElementById('add-artist')      || {}).value || '';
  var album   = (document.getElementById('add-album-title') || {}).value || '';
  var preview = document.getElementById('art-preview');
  if (!preview) return;
  artist = artist.trim(); album = album.trim();
  if (!artist || !album) { setArtPreviewEmpty(preview); return; }
  if (artist === artLastArtist && album === artLastAlbum) return;
  artTimer = setTimeout(function() {
    if (artist === artLastArtist && album === artLastAlbum) return;
    artLastArtist = artist; artLastAlbum = album;
    preview.classList.add('loading');
    preview.innerHTML = '';
    fetch('/api/artwork?artist=' + encodeURIComponent(artist) + '&album=' + encodeURIComponent(album))
      .then(function(r) { return r.json(); })
      .then(function(data) {
        preview.classList.remove('loading');
        var imgUrl  = data.thumbnailUrl || data.imageUrl;
        var fullUrl = data.imageUrl     || data.thumbnailUrl;
        if (imgUrl) {
          preview.innerHTML = '<img src="' + esc(imgUrl) + '" alt="Album art">';
          preview.dataset.artUrl = fullUrl;
          showChangeCoverBtn(data.confidence);
        } else {
          setArtPreviewEmpty(preview);
        }
      }).catch(function() {
        preview.classList.remove('loading');
        setArtPreviewEmpty(preview);
      });
  }, 600);
}

function setArtPreviewEmpty(preview) {
  preview.innerHTML = '<div class="art-preview-icon"></div>';
  delete preview.dataset.artUrl;
  var btn = document.getElementById('art-change-cover');
  if (btn) btn.style.display = 'none';
  var urlWrap = document.getElementById('art-url-input-wrap');
  if (urlWrap) urlWrap.style.display = 'none';
}

function showChangeCoverBtn(confidence) {
  var btn = document.getElementById('art-change-cover');
  if (!btn) return;
  btn.textContent = confidence === 'medium' ? 'Wrong cover?' : 'Change cover';
  btn.style.display = '';
}

function openArtUrlInput() {
  var wrap = document.getElementById('art-url-input-wrap');
  if (wrap) { wrap.style.display = ''; document.getElementById('art-url-input').focus(); }
}

function cancelArtUrlInput() {
  var wrap  = document.getElementById('art-url-input-wrap');
  var input = document.getElementById('art-url-input');
  if (wrap)  wrap.style.display = 'none';
  if (input) input.value = '';
}

function applyPastedArt() {
  var input   = document.getElementById('art-url-input');
  var preview = document.getElementById('art-preview');
  if (!input || !preview) return;
  var url = input.value.trim();
  if (url) {
    preview.innerHTML = '<img src="' + esc(url) + '" alt="Album art">';
    preview.dataset.artUrl = url;
    artLastArtist = ''; artLastAlbum = '';
  }
  cancelArtUrlInput();
}

async function addAlbum() {
  if (!currentEpisodeId) return;
  var artist      = (document.getElementById('add-artist').value      || '').trim();
  var album       = (document.getElementById('add-album-title').value || '').trim();
  var artUrl      = document.getElementById('art-preview').dataset.artUrl || null;
  var contribSel  = document.getElementById('add-contributor');
  var contributor = contribSel ? contribSel.value : '';
  var orderVal    = parseInt(document.getElementById('add-play-order').value, 10);
  var playOrder   = Number.isFinite(orderVal) && orderVal > 0 ? orderVal : null;
  if (!artist || !album) return;

  var res = await fetch('/api/episodes/' + currentEpisodeId + '/vinyls', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      artist:               artist,
      album_title:          album,
      art_url:              artUrl,
      contributor_username: contributor || null,
      play_order:           playOrder,
    }),
  });

  if (res.ok) {
    document.getElementById('add-artist').value      = '';
    document.getElementById('add-album-title').value = '';
    document.getElementById('add-play-order').value  = '';
    document.getElementById('art-preview').innerHTML = '<div class="art-preview-icon"></div>';
    delete document.getElementById('art-preview').dataset.artUrl;
    await loadCurrentSeason();
  } else {
    var err = await res.json();
    alert(err.error || 'Could not add album.');
  }
}

async function deleteVinyl(vinylId, btn) {
  if (!confirm('Remove this album from the episode?')) return;
  btn.disabled = true;
  var res = await fetch('/api/vinyls/' + vinylId, { method: 'DELETE' });
  if (res.ok) {
    var sleeve = btn.closest('.album-sleeve');
    if (sleeve && sleeve.closest('.ep-albums-wrap')) {
      sleeve.remove();
    } else {
      await loadCurrentSeason();
    }
  } else {
    btn.disabled = false;
    var err = await res.json();
    alert(err.error || 'Could not remove album.');
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
    errEl.style.display   = 'none';
    success.style.display = 'none';
  }
}

async function sendInvite() {
  var username = (document.getElementById('invite-username').value || '').trim();
  var role     = (document.getElementById('invite-role') || {}).value || 'member';
  var errEl    = document.getElementById('invite-error');
  var success  = document.getElementById('invite-success');
  errEl.style.display   = 'none';
  success.style.display = 'none';
  if (!username) { errEl.textContent = 'Enter a username.'; errEl.style.display = ''; return; }

  var res  = await fetch('/api/groups/' + GROUP_SLUG + '/invite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: username, role: role }),
  });
  var data = await res.json();
  if (res.ok) {
    document.getElementById('invite-username').value = '';
    success.textContent   = 'Invitation sent to ' + data.invited + ' as ' + (data.role || 'member') + '.';
    success.style.display = '';
  } else {
    errEl.textContent   = data.error || 'Could not send invitation.';
    errEl.style.display = '';
  }
}

/* ── Tab switching ──────────────────────────────────────────── */
function switchTab(name) {
  ['now', 'archive'].forEach(function(t) {
    document.getElementById('tab-' + t).classList.toggle('active', t === name);
  });
  document.querySelectorAll('.section-tab').forEach(function(btn, i) {
    btn.classList.toggle('active', ['now', 'archive'][i] === name);
  });
}

/* ── Album art — click-to-load / re-fetch ────────────────────── */
async function fetchSleeveArt(sleeve) {
  var vinylId = sleeve.dataset.vinylId;
  if (!vinylId || sleeve.dataset.artLoading) return;
  sleeve.dataset.artLoading = '1';
  sleeve.style.cursor = 'wait';
  try {
    var res  = await fetch('/api/vinyls/' + vinylId + '/art', { method: 'POST' });
    var data = await res.json();
    if (!data.art_url) { sleeve.style.cursor = 'default'; delete sleeve.dataset.artLoading; return; }
    var imgContainer = sleeve.querySelector('.album-sleeve-image');
    if (!imgContainer) { sleeve.style.cursor = 'default'; return; }
    var img = document.createElement('img');
    img.src     = data.art_url;
    img.alt     = (sleeve.dataset.artist || '') + ' — ' + (sleeve.dataset.album || '');
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    imgContainer.innerHTML = '';
    imgContainer.appendChild(img);
    sleeve.style.cursor = 'default';
    sleeve.onclick = null;
    delete sleeve.dataset.artLoading;
  } catch(e) {
    sleeve.style.cursor = 'pointer';
    delete sleeve.dataset.artLoading;
  }
}

/* ── Vinyl Search ───────────────────────────────────────────── */
var searchTimer   = null;
var searchResults = [];
var sortField     = 'season_number';
var sortDir       = 'desc';
var searchPage    = 0;
var SEARCH_PAGE_SIZE = 20;

var SORT_COLS = [
  { field: 'album_title',         label: 'Album' },
  { field: 'artist',              label: 'Artist' },
  { field: 'season_number',       label: 'Season' },
  { field: 'contributor_username', label: 'Contributor' },
];

function onVinylSearch(value) {
  var clearBtn = document.getElementById('vinyl-search-clear');
  if (clearBtn) clearBtn.style.display = value ? '' : 'none';

  clearTimeout(searchTimer);
  var q = value.trim();
  if (!q) {
    searchResults = [];
    var resultsEl = document.getElementById('vinyl-search-results');
    if (resultsEl) { resultsEl.style.display = 'none'; resultsEl.innerHTML = ''; }
    return;
  }
  searchTimer = setTimeout(function() { runVinylSearch(q); }, 350);
}

async function runVinylSearch(q) {
  var resultsEl = document.getElementById('vinyl-search-results');
  if (!resultsEl) return;
  resultsEl.style.display = '';
  resultsEl.innerHTML = '<p class="search-empty">Searching&hellip;</p>';

  try {
    var res  = await fetch('/api/groups/' + GROUP_SLUG + '/search?q=' + encodeURIComponent(q));
    var data = await res.json();
    searchResults = data.results || [];
    searchPage    = 0;

    if (!searchResults.length) {
      resultsEl.innerHTML = '<p class="search-empty">No results for &ldquo;' + esc(q) + '&rdquo;</p>';
      return;
    }

    renderSearchResults();
  } catch(e) {
    resultsEl.innerHTML = '<p class="search-empty">Could not load results.</p>';
  }
}

function setSearchSort(field) {
  if (sortField === field) {
    sortDir = sortDir === 'asc' ? 'desc' : 'asc';
  } else {
    sortField = field;
    sortDir   = 'asc';
  }
  searchPage = 0;
  renderSearchResults();
}

function setSearchPage(page) {
  searchPage = page;
  renderSearchResults();
  var el = document.getElementById('vinyl-search-results');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function renderSearchResults() {
  var resultsEl = document.getElementById('vinyl-search-results');
  if (!resultsEl || !searchResults.length) return;

  var sorted = searchResults.slice().sort(function(a, b) {
    var av, bv;
    if (sortField === 'season_number') {
      av = (a.season_number || 0) * 1000 + (a.episode_number || 0);
      bv = (b.season_number || 0) * 1000 + (b.episode_number || 0);
    } else {
      av = String(a[sortField] || '').toLowerCase();
      bv = String(b[sortField] || '').toLowerCase();
    }
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1  : -1;
    return 0;
  });

  var total      = sorted.length;
  var totalPages = Math.ceil(total / SEARCH_PAGE_SIZE);
  var page       = Math.min(searchPage, totalPages - 1);
  var start      = page * SEARCH_PAGE_SIZE;
  var end        = Math.min(start + SEARCH_PAGE_SIZE, total);
  var pageSlice  = sorted.slice(start, end);

  var arrow = sortDir === 'asc' ? ' &#8593;' : ' &#8595;';

  var sortBar =
    '<div class="search-sort-bar">' +
      '<span class="search-sort-label">Sort</span>' +
      SORT_COLS.map(function(c) {
        var active = sortField === c.field;
        return '<button class="search-sort-btn' + (active ? ' active' : '') + '"' +
          ' onclick="setSearchSort(\'' + c.field + '\')">' +
          c.label + (active ? arrow : '') +
        '</button>';
      }).join('') +
      '<span class="search-sort-count">' + (start + 1) + '&ndash;' + end + ' of ' + total + '</span>' +
    '</div>';

  var rows = pageSlice.map(function(v) {
    var artHtml = v.art_url
      ? '<img src="' + esc(v.art_url) + '" alt="' + esc(v.artist) + '">'
      : '<div class="search-result-art-placeholder"></div>';
    return '<div class="search-result">' +
      '<div class="search-result-art">' + artHtml + '</div>' +
      '<div class="search-result-info">' +
        '<div class="search-result-album"><em>' + esc(v.album_title) + '</em></div>' +
        '<div class="search-result-artist">' + esc(v.artist) + '</div>' +
        '<div class="search-result-meta">' +
          'S' + esc(v.season_number) + ' &middot; Ep ' + esc(v.episode_number) +
          (v.contributor_username ? ' &middot; ' + esc(v.contributor_username) : '') +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');

  var pagination = '';
  if (totalPages > 1) {
    var btns = '';
    if (page > 0) {
      btns += '<button class="search-page-btn" onclick="setSearchPage(' + (page - 1) + ')">&larr;</button>';
    }
    for (var i = 0; i < totalPages; i++) {
      btns += '<button class="search-page-btn' + (i === page ? ' active' : '') + '"' +
        ' onclick="setSearchPage(' + i + ')">' + (i + 1) + '</button>';
    }
    if (page < totalPages - 1) {
      btns += '<button class="search-page-btn" onclick="setSearchPage(' + (page + 1) + ')">&rarr;</button>';
    }
    pagination = '<div class="search-pagination">' + btns + '</div>';
  }

  resultsEl.innerHTML = sortBar + '<div class="search-results">' + rows + '</div>' + pagination;
}

function clearVinylSearch() {
  var inp = document.getElementById('vinyl-search-input');
  if (inp) { inp.value = ''; inp.focus(); }
  var clearBtn = document.getElementById('vinyl-search-clear');
  if (clearBtn) clearBtn.style.display = 'none';
  searchResults = [];
  sortField  = 'season_number';
  sortDir    = 'desc';
  searchPage = 0;
  var resultsEl = document.getElementById('vinyl-search-results');
  if (resultsEl) { resultsEl.style.display = 'none'; resultsEl.innerHTML = ''; }
}

/* ── Helpers ────────────────────────────────────────────────── */
function albumSleeveHtml(artist, album, contributor, artUrl, vinylId, playOrder, canDelete) {
  var imgHtml = artUrl
    ? '<img src="' + esc(artUrl) + '" alt="' + esc(artist) + ' — ' + esc(album) + '" style="width:100%;height:100%;object-fit:cover;display:block;">'
    : '<div class="album-sleeve-placeholder" aria-hidden="true"><div class="album-sleeve-placeholder-disc"></div></div>';
  var clickable = !artUrl && vinylId;
  var extra = (clickable ? ' onclick="fetchSleeveArt(this)" style="cursor:pointer;" title="Click to load art"' : '') +
              (vinylId   ? ' data-vinyl-id="' + esc(vinylId) + '"' : '');
  var delBtn = (canDelete && vinylId)
    ? '<button class="vinyl-del-btn" onclick="deleteVinyl(\'' + esc(vinylId) + '\', this)" title="Remove album">Remove</button>'
    : '';
  var changeArtBtn = (canDelete && vinylId)
    ? '<button class="vinyl-change-art-btn" onclick="fetchSleeveArt(this.closest(\'.album-sleeve\'))" title="Re-fetch cover art">Change cover</button>'
    : '';
  var rightMeta = (playOrder || contributor)
    ? '<div class="album-sleeve-meta-right">' +
        (playOrder ? '<p class="album-sleeve-number">#' + playOrder + '</p>' : '') +
        (contributor ? '<p class="album-sleeve-contributor">' + esc(contributor) + '</p>' : '') +
      '</div>'
    : '';
  return '<div class="album-sleeve"' + extra + ' data-artist="' + esc(artist) + '" data-album="' + esc(album) + '">' +
    '<div class="album-sleeve-image">' + imgHtml + '</div>' +
    '<div class="album-sleeve-footer">' +
      '<div class="album-sleeve-meta">' +
        '<div class="album-sleeve-meta-left">' +
          '<p class="album-sleeve-label">' + esc(artist) + '</p>' +
          '<p class="album-sleeve-title"><em>' + esc(album) + '</em></p>' +
        '</div>' +
        rightMeta +
      '</div>' +
      delBtn +
      changeArtBtn +
    '</div>' +
  '</div>';
}

function emptySleeveHtml() {
  return '<div class="album-sleeve" style="opacity:0.2;cursor:default;">' +
    '<div class="album-sleeve-image"><div class="album-sleeve-placeholder" aria-hidden="true"><div class="album-sleeve-placeholder-disc"></div></div></div>' +
  '</div>';
}

function monthLabel(dateStr) {
  var d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

function esc(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function groupSlugFromURL() {
  var match = window.location.pathname.match(/^\/group\/([^/]+)\/?$/);
  if (match) return decodeURIComponent(match[1]);
  return new URLSearchParams(window.location.search).get('g') || null;
}
