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
    return albumSleeveHtml(v.artist, v.album_title, v.contributor_username, v.art_url, v.id);
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
          '<div style="display:flex;align-items:flex-end;gap:0.75rem;">' +
            '<div class="art-preview" id="art-preview" title="Album art preview"><div class="art-preview-icon"></div></div>' +
            '<button type="button" class="btn btn-primary" onclick="addAlbum()">Add</button>' +
          '</div>' +
        '</div>' +
        '<p class="form-hint mt-2">Art is fetched automatically from the iTunes catalog as you type.</p>' +
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
      return albumSleeveHtml(v.artist, v.album_title, v.contributor_username, v.art_url, v.id);
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

    var hostOptions = '<option value="">— not set —</option>' +
      members.map(function(m) {
        var sel = ep.host_username === m.username ? ' selected' : '';
        return '<option value="' + esc(m.username) + '"' + sel + '>' + esc(m.username) + '</option>';
      }).join('');

    var attendeeCheckboxes = members.map(function(m) {
      var chk = attendeeList.indexOf(m.username) !== -1 ? ' checked' : '';
      return '<label style="display:flex;align-items:center;gap:0.4rem;cursor:pointer;">' +
        '<input type="checkbox" name="ep-att-' + ep.id + '" value="' + esc(m.username) + '"' + chk + '> ' +
        '<span style="font-size:0.88rem;">' + esc(m.username) + '</span>' +
      '</label>';
    }).join('');

    var inlineEditor =
      '<div id="ep-editor-' + ep.id + '" style="display:none;padding:1.25rem;background:var(--surface-raised);border:1px solid var(--border-subtle);margin-bottom:1.25rem;">' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.25rem;">' +
          '<div class="form-group" style="margin-bottom:0;"><label>Date</label>' +
            '<input type="date" id="ep-date-' + ep.id + '" value="' + esc(ep.date || '') + '"></div>' +
          '<div class="form-group" style="margin-bottom:0;"><label>Host</label>' +
            '<select id="ep-host-' + ep.id + '">' + hostOptions + '</select></div>' +
        '</div>' +
        (members.length
          ? '<div class="form-group" style="margin-bottom:1.25rem;"><label>Who attended?</label>' +
              '<div style="display:flex;flex-wrap:wrap;gap:0.5rem 1.5rem;padding-top:0.25rem;">' + attendeeCheckboxes + '</div></div>'
          : '') +
        '<div style="display:flex;gap:0.75rem;">' +
          '<button class="btn btn-primary" style="font-size:0.78rem;" onclick="saveEpInline(\'' + ep.id + '\')">Save</button>' +
          '<button class="btn btn-ghost" style="font-size:0.78rem;" onclick="toggleEpInlineEditor(\'' + ep.id + '\')">Cancel</button>' +
        '</div>' +
        '<div style="margin-top:1.25rem;padding-top:1.25rem;border-top:1px solid var(--border-subtle);">' +
          '<div id="del-confirm-' + ep.id + '" style="display:none;margin-bottom:0.5rem;">' +
            '<p class="text-xs text-muted" style="margin-bottom:0.5rem;">Type <strong>delete</strong> to permanently remove this episode and all its albums.</p>' +
            '<div style="display:flex;gap:0.75rem;align-items:center;flex-wrap:wrap;">' +
              '<input type="text" id="del-input-' + ep.id + '" placeholder="delete" style="width:130px;margin:0;" oninput="checkDeleteInput(\'' + ep.id + '\')">' +
              '<button id="del-btn-' + ep.id + '" class="btn" style="font-size:0.78rem;background:var(--accent-bright);color:#fff;border-color:var(--accent-bright);opacity:0.4;cursor:not-allowed;" disabled onclick="executeDeleteEpisode(\'' + ep.id + '\')">Delete Forever</button>' +
              '<button class="btn btn-ghost" style="font-size:0.78rem;" onclick="document.getElementById(\'del-confirm-' + ep.id + '\').style.display=\'none\'">Cancel</button>' +
            '</div>' +
          '</div>' +
          '<button class="ep-edit-btn" style="font-size:0.78rem;background:none;border:none;cursor:pointer;color:var(--accent-bright);padding:0;" onclick="document.getElementById(\'del-confirm-' + ep.id + '\').style.display=\'\'">Delete Episode</button>' +
        '</div>' +
      '</div>';

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
        inlineEditor +
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
      return albumSleeveHtml(v.artist, v.album_title, v.contributor_username, v.art_url, v.id);
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

    var hostOptions = '<option value="">— not set —</option>' +
      members.map(function(m) {
        var sel = ep.host_username === m.username ? ' selected' : '';
        return '<option value="' + esc(m.username) + '"' + sel + '>' + esc(m.username) + '</option>';
      }).join('');

    var attendeeCheckboxes = members.map(function(m) {
      var chk = attendeeList.indexOf(m.username) !== -1 ? ' checked' : '';
      return '<label style="display:flex;align-items:center;gap:0.4rem;cursor:pointer;">' +
        '<input type="checkbox" name="ep-att-' + ep.id + '" value="' + esc(m.username) + '"' + chk + '> ' +
        '<span style="font-size:0.88rem;">' + esc(m.username) + '</span>' +
      '</label>';
    }).join('');

    var inlineEditor =
      '<div id="ep-editor-' + ep.id + '" style="display:none;padding:1.25rem;background:var(--surface-raised);border:1px solid var(--border-subtle);margin-bottom:1.25rem;">' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.25rem;">' +
          '<div class="form-group" style="margin-bottom:0;"><label>Date</label>' +
            '<input type="date" id="ep-date-' + ep.id + '" value="' + esc(ep.date || '') + '"></div>' +
          '<div class="form-group" style="margin-bottom:0;"><label>Host</label>' +
            '<select id="ep-host-' + ep.id + '">' + hostOptions + '</select></div>' +
        '</div>' +
        (members.length
          ? '<div class="form-group" style="margin-bottom:1.25rem;"><label>Who attended?</label>' +
              '<div style="display:flex;flex-wrap:wrap;gap:0.5rem 1.5rem;padding-top:0.25rem;">' + attendeeCheckboxes + '</div></div>'
          : '') +
        '<div style="display:flex;gap:0.75rem;">' +
          '<button class="btn btn-primary" style="font-size:0.78rem;" onclick="saveEpInline(\'' + ep.id + '\')">Save</button>' +
          '<button class="btn btn-ghost" style="font-size:0.78rem;" onclick="toggleEpInlineEditor(\'' + ep.id + '\')">Cancel</button>' +
        '</div>' +
        '<div style="margin-top:1.25rem;padding-top:1.25rem;border-top:1px solid var(--border-subtle);">' +
          '<div id="del-confirm-' + ep.id + '" style="display:none;margin-bottom:0.5rem;">' +
            '<p class="text-xs text-muted" style="margin-bottom:0.5rem;">Type <strong>delete</strong> to permanently remove this episode and all its albums.</p>' +
            '<div style="display:flex;gap:0.75rem;align-items:center;flex-wrap:wrap;">' +
              '<input type="text" id="del-input-' + ep.id + '" placeholder="delete" style="width:130px;margin:0;" oninput="checkDeleteInput(\'' + ep.id + '\')">' +
              '<button id="del-btn-' + ep.id + '" class="btn" style="font-size:0.78rem;background:var(--accent-bright);color:#fff;border-color:var(--accent-bright);opacity:0.4;cursor:not-allowed;" disabled onclick="executeDeleteEpisode(\'' + ep.id + '\')">Delete Forever</button>' +
              '<button class="btn btn-ghost" style="font-size:0.78rem;" onclick="document.getElementById(\'del-confirm-' + ep.id + '\').style.display=\'none\'">Cancel</button>' +
            '</div>' +
          '</div>' +
          '<button class="ep-edit-btn" style="font-size:0.78rem;background:none;border:none;cursor:pointer;color:var(--accent-bright);padding:0;" onclick="document.getElementById(\'del-confirm-' + ep.id + '\').style.display=\'\'">Delete Episode</button>' +
        '</div>' +
      '</div>';

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
        inlineEditor +
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

/* ── Delete group ───────────────────────────────────────────── */
function showDeleteGroupConfirm() {
  document.getElementById('delete-group-confirm').style.display = '';
}
function cancelDeleteGroup() {
  document.getElementById('delete-group-confirm').style.display = 'none';
  document.getElementById('delete-group-input').value = '';
  var btn = document.getElementById('delete-group-btn');
  btn.disabled = true; btn.style.opacity = '0.4'; btn.style.cursor = 'not-allowed';
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

/* ── Album art (iTunes) ─────────────────────────────────────── */
var artTimer = null;
function fetchAlbumArt() {
  clearTimeout(artTimer);
  var artist  = (document.getElementById('add-artist')      || {}).value || '';
  var album   = (document.getElementById('add-album-title') || {}).value || '';
  var preview = document.getElementById('art-preview');
  if (!preview) return;
  artist = artist.trim(); album = album.trim();
  if (!artist || !album) { preview.innerHTML = '<div class="art-preview-icon"></div>'; return; }
  artTimer = setTimeout(function() {
    preview.classList.add('loading');
    preview.innerHTML = '';
    fetch('https://itunes.apple.com/search?term=' + encodeURIComponent(artist + ' ' + album) + '&media=music&entity=album&limit=5')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        preview.classList.remove('loading');
        if (data.results && data.results.length) {
          var target = album.toLowerCase();
          var best = data.results.find(function(r) {
            return (r.collectionName || '').toLowerCase() === target;
          }) || data.results.find(function(r) {
            return (r.collectionName || '').toLowerCase().indexOf(target) !== -1;
          }) || data.results[0];
          var art = best.artworkUrl100.replace('100x100bb', '600x600bb');
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
  var artist      = (document.getElementById('add-artist').value      || '').trim();
  var album       = (document.getElementById('add-album-title').value || '').trim();
  var artUrl      = document.getElementById('art-preview').dataset.artUrl || null;
  var contribSel  = document.getElementById('add-contributor');
  var contributor = contribSel ? contribSel.value : '';
  if (!artist || !album) return;

  var res = await fetch('/api/episodes/' + currentEpisodeId + '/vinyls', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      artist:               artist,
      album_title:          album,
      art_url:              artUrl,
      contributor_username: contributor || null,
    }),
  });

  if (res.ok) {
    document.getElementById('add-artist').value      = '';
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

/* ── Album art — click-to-load ───────────────────────────────── */
async function fetchSleeveArt(sleeve) {
  var vinylId = sleeve.dataset.vinylId;
  if (!vinylId || sleeve.dataset.artLoading) return;
  sleeve.dataset.artLoading = '1';
  sleeve.style.cursor = 'wait';
  try {
    var res  = await fetch('/api/vinyls/' + vinylId + '/art', { method: 'POST' });
    var data = await res.json();
    if (!data.art_url) { sleeve.style.cursor = 'default'; return; }
    var placeholder = sleeve.querySelector('.album-sleeve-placeholder');
    if (!placeholder) return;
    var img = document.createElement('img');
    img.src = data.art_url;
    img.alt = (sleeve.dataset.artist || '') + ' — ' + (sleeve.dataset.album || '');
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    placeholder.replaceWith(img);
    sleeve.style.cursor = 'default';
    sleeve.onclick = null;
  } catch(e) {
    sleeve.style.cursor = 'pointer';
    delete sleeve.dataset.artLoading;
  }
}

/* ── Helpers ────────────────────────────────────────────────── */
function albumSleeveHtml(artist, album, contributor, artUrl, vinylId) {
  var imgHtml = artUrl
    ? '<img src="' + esc(artUrl) + '" alt="' + esc(artist) + ' — ' + esc(album) + '" style="width:100%;height:100%;object-fit:cover;display:block;">'
    : '<div class="album-sleeve-placeholder" aria-hidden="true"><div class="album-sleeve-placeholder-disc"></div></div>';
  var clickable = !artUrl && vinylId;
  var extra = (clickable ? ' onclick="fetchSleeveArt(this)" style="cursor:pointer;" title="Click to load art"' : '') +
              (vinylId   ? ' data-vinyl-id="' + esc(vinylId) + '"' : '');
  return '<div class="album-sleeve"' + extra + ' data-artist="' + esc(artist) + '" data-album="' + esc(album) + '">' +
    '<div class="album-sleeve-image">' + imgHtml + '</div>' +
    '<div class="album-sleeve-footer">' +
      '<p class="album-sleeve-label">' + esc(artist) + '</p>' +
      '<p class="album-sleeve-title"><em>' + esc(album) + '</em></p>' +
      (contributor ? '<p class="album-sleeve-contributor">' + esc(contributor) + '</p>' : '') +
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
  return new URLSearchParams(window.location.search).get('group') || 'the-original';
}
