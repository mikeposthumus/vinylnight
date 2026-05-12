/**
 * Vinylnight Workers API
 * Handles auth and data routes. Static assets are served via the [assets] binding.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (!url.pathname.startsWith('/api/')) {
      return env.ASSETS.fetch(request);
    }

    try {
      return await route(request, url, env);
    } catch (err) {
      return json({ error: 'Internal server error' }, 500);
    }
  },
};

async function route(request, url, env) {
  const path = url.pathname;
  const method = request.method;

  if (path === '/api/auth/register' && method === 'POST') return handleRegister(request, env);
  if (path === '/api/auth/login'    && method === 'POST') return handleLogin(request, env);
  if (path === '/api/auth/logout'   && method === 'POST') return handleLogout(request, env);
  if (path === '/api/auth/me'       && method === 'GET')  return handleMe(request, env);

  if (path === '/api/profile'       && method === 'GET')  return handleGetProfile(request, env);
  if (path === '/api/profile'       && method === 'PUT')  return handleUpdateProfile(request, env);

  if (path.match(/^\/api\/users\/[^/]+$/)                         && method === 'GET')  return handleGetUser(request, env, path);
  if (path.match(/^\/api\/users\/[^/]+\/vinyls$/)                 && method === 'GET')  return handleUserVinyls(request, env, path, url);

  if (path === '/api/groups'        && method === 'GET')  return handleListGroups(request, env);
  if (path.match(/^\/api\/groups\/[^/]+$/) && method === 'GET') return handleGetGroup(request, env, path);
  if (path.match(/^\/api\/groups\/[^/]+\/current-episode$/) && method === 'GET') return handleCurrentEpisode(request, env, path);
  if (path.match(/^\/api\/groups\/[^/]+\/invite$/) && method === 'POST') return handleInvite(request, env, path);

  if (path === '/api/me/invitations'                              && method === 'GET')  return handleMyInvitations(request, env);
  if (path === '/api/me/vinyls'                                  && method === 'GET')  return handleMyVinyls(request, env, url);
  if (path.match(/^\/api\/invitations\/[^/]+\/accept$/)          && method === 'POST') return handleAcceptInvitation(request, env, path);
  if (path.match(/^\/api\/invitations\/[^/]+\/decline$/)         && method === 'POST') return handleDeclineInvitation(request, env, path);

  if (path.match(/^\/api\/seasons\/[^/]+\/episodes$/) && method === 'GET')  return handleSeasonEpisodes(request, env, path);
  if (path.match(/^\/api\/seasons\/[^/]+\/episodes$/) && method === 'POST') return handleCreateEpisode(request, env, path);

  if (path.match(/^\/api\/episodes\/[^/]+$/)              && method === 'PUT')  return handleUpdateEpisode(request, env, path);
  if (path.match(/^\/api\/episodes\/[^/]+\/vinyls$/)      && method === 'POST') return handleAddVinyl(request, env, path);
  if (path.match(/^\/api\/episodes\/[^/]+\/attendees$/)   && method === 'POST') return handleSetAttendees(request, env, path);

  return json({ error: 'Not found' }, 404);
}

// ── Auth ─────────────────────────────────────────────────────────────

async function handleRegister(request, env) {
  const body = await parseBody(request);
  const { username, email, password } = body ?? {};

  if (!username || !email || !password) {
    return json({ error: 'username, email, and password are required' }, 400);
  }
  if (!/^[a-zA-Z0-9-]{1,32}$/.test(username)) {
    return json({ error: 'Username must be 1-32 letters, numbers, or hyphens' }, 400);
  }

  const existing = await env.DB.prepare(
    'SELECT id FROM users WHERE email = ? OR username = ?'
  ).bind(email.toLowerCase(), username).first();
  if (existing) return json({ error: 'Email or username already taken' }, 409);

  const id = crypto.randomUUID();
  const hash = await hashPassword(password);

  await env.DB.prepare(
    'INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)'
  ).bind(id, username, email.toLowerCase(), hash).run();

  const token = await createSession(env, id);
  return json({ user: { id, username, email } }, 201, sessionCookie(token));
}

async function handleLogin(request, env) {
  const body = await parseBody(request);
  const { email, password } = body ?? {};

  if (!email || !password) return json({ error: 'email and password are required' }, 400);

  const user = await env.DB.prepare(
    'SELECT id, username, email, password_hash FROM users WHERE email = ?'
  ).bind(email.toLowerCase()).first();

  let passwordOk = false;
  try { passwordOk = await verifyPassword(password, user.password_hash); } catch {}
  if (!user || !passwordOk) {
    return json({ error: 'Invalid email or password' }, 401);
  }

  const token = await createSession(env, user.id);
  return json(
    { user: { id: user.id, username: user.username, email: user.email } },
    200,
    sessionCookie(token)
  );
}

async function handleLogout(request, env) {
  const token = getSessionToken(request);
  if (token) {
    await env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(token).run();
  }
  return json({ ok: true }, 200, clearCookie());
}

async function handleMe(request, env) {
  const user = await requireAuth(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const [topAlbums, groups, recentVinyls] = await Promise.all([
    env.DB.prepare(
      'SELECT rank, artist, album_title FROM user_top_albums WHERE user_id = ? ORDER BY rank'
    ).bind(user.id).all(),

    env.DB.prepare(`
      SELECT g.id, g.name, g.slug, gm.role
      FROM group_members gm
      JOIN groups g ON g.id = gm.group_id
      WHERE gm.user_id = ? AND gm.status = 'active'
    `).bind(user.id).all(),

    env.DB.prepare(`
      SELECT v.artist, v.album_title, v.art_url, v.added_at,
             e.number AS episode_number, s.number AS season_number,
             g.name AS group_name, g.slug AS group_slug
      FROM episode_vinyls v
      JOIN episodes e ON e.id = v.episode_id
      JOIN seasons s ON s.id = e.season_id
      JOIN groups g ON g.id = s.group_id
      WHERE v.contributed_by = ?
      ORDER BY v.added_at DESC
      LIMIT 9
    `).bind(user.id).all(),
  ]);

  return json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar_url: user.avatar_url,
      location: user.location,
      bio: user.bio,
    },
    topAlbums:    topAlbums.results,
    groups:       groups.results,
    recentVinyls: recentVinyls.results,
  });
}

// ── Profile ───────────────────────────────────────────────────────────

async function handleGetProfile(request, env) {
  const user = await requireAuth(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);
  return handleMe(request, env);
}

async function handleUpdateProfile(request, env) {
  const user = await requireAuth(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const body = await parseBody(request);
  const { username, bio, location, avatar_url, topAlbums } = body ?? {};

  if (username !== undefined) {
    if (!/^[a-zA-Z0-9-]{1,32}$/.test(username)) {
      return json({ error: 'Invalid username format' }, 400);
    }
    const clash = await env.DB.prepare(
      'SELECT id FROM users WHERE username = ? AND id != ?'
    ).bind(username, user.id).first();
    if (clash) return json({ error: 'Username already taken' }, 409);
  }

  await env.DB.prepare(`
    UPDATE users SET
      username   = COALESCE(?, username),
      bio        = COALESCE(?, bio),
      location   = COALESCE(?, location),
      avatar_url = COALESCE(?, avatar_url)
    WHERE id = ?
  `).bind(username ?? null, bio ?? null, location ?? null, avatar_url ?? null, user.id).run();

  if (Array.isArray(topAlbums)) {
    const allowed = topAlbums.slice(0, 3);
    await env.DB.prepare('DELETE FROM user_top_albums WHERE user_id = ?').bind(user.id).run();
    for (let i = 0; i < allowed.length; i++) {
      const { artist, album_title } = allowed[i];
      if (artist && album_title) {
        await env.DB.prepare(
          'INSERT INTO user_top_albums (id, user_id, rank, artist, album_title) VALUES (?, ?, ?, ?, ?)'
        ).bind(crypto.randomUUID(), user.id, i + 1, artist, album_title).run();
      }
    }
  }

  return json({ ok: true });
}

// ── Users (public) ───────────────────────────────────────────────────

async function handleGetUser(request, env, path) {
  const username = path.split('/').pop();
  const user = await env.DB.prepare(
    'SELECT id, username, location, bio, avatar_url FROM users WHERE username = ?'
  ).bind(username).first();
  if (!user) return json({ error: 'User not found' }, 404);

  const [groups, topAlbums, recentVinyls] = await Promise.all([
    env.DB.prepare(`
      SELECT g.name, g.slug, gm.role
      FROM group_members gm
      JOIN groups g ON g.id = gm.group_id
      WHERE gm.user_id = ? AND gm.status = 'active'
      ORDER BY gm.joined_at
    `).bind(user.id).all(),

    env.DB.prepare(
      'SELECT rank, artist, album_title FROM user_top_albums WHERE user_id = ? ORDER BY rank'
    ).bind(user.id).all(),

    env.DB.prepare(`
      SELECT v.artist, v.album_title, v.art_url, v.added_at,
             e.date AS episode_date, e.number AS episode_number,
             s.number AS season_number,
             g.name AS group_name, g.slug AS group_slug
      FROM episode_vinyls v
      JOIN episodes e ON e.id = v.episode_id
      JOIN seasons s ON s.id = e.season_id
      JOIN groups g ON g.id = s.group_id
      WHERE v.contributed_by = ?
      ORDER BY v.added_at DESC
      LIMIT 9
    `).bind(user.id).all(),
  ]);

  return json({
    user,
    groups:       groups.results,
    topAlbums:    topAlbums.results,
    recentVinyls: recentVinyls.results,
  });
}

async function handleUserVinyls(request, env, path, url) {
  const username = path.split('/')[3];
  const user = await env.DB.prepare('SELECT id FROM users WHERE username = ?').bind(username).first();
  if (!user) return json({ error: 'User not found' }, 404);

  const PAGE = 9;
  const offset = Math.max(0, parseInt(url.searchParams.get('offset') || '0', 10));

  const rows = await env.DB.prepare(`
    SELECT v.artist, v.album_title, v.art_url, v.added_at,
           e.number AS episode_number, s.number AS season_number,
           g.name AS group_name, g.slug AS group_slug
    FROM episode_vinyls v
    JOIN episodes e ON e.id = v.episode_id
    JOIN seasons s ON s.id = e.season_id
    JOIN groups g ON g.id = s.group_id
    WHERE v.contributed_by = ?
    ORDER BY v.added_at DESC
    LIMIT ? OFFSET ?
  `).bind(user.id, PAGE, offset).all();

  return json({ vinyls: rows.results, hasMore: rows.results.length === PAGE });
}

// ── Groups ────────────────────────────────────────────────────────────

async function handleListGroups(request, env) {
  const groups = await env.DB.prepare(`
    SELECT g.*,
      COUNT(DISTINCT CASE WHEN gm.status = 'active' THEN gm.id END) AS member_count,
      COUNT(DISTINCT e.id) AS episode_count
    FROM groups g
    LEFT JOIN group_members gm ON gm.group_id = g.id
    LEFT JOIN seasons s ON s.group_id = g.id
    LEFT JOIN episodes e ON e.season_id = s.id
    GROUP BY g.id
    ORDER BY g.created_at
  `).all();
  return json({ groups: groups.results });
}

async function handleGetGroup(request, env, path) {
  const slug = path.split('/').pop();
  const group = await env.DB.prepare('SELECT * FROM groups WHERE slug = ?').bind(slug).first();
  if (!group) return json({ error: 'Group not found' }, 404);

  const members = await env.DB.prepare(`
    SELECT u.id, u.username, u.avatar_url, gm.role, gm.joined_at
    FROM group_members gm
    JOIN users u ON u.id = gm.user_id
    WHERE gm.group_id = ? AND gm.status = 'active'
    ORDER BY gm.joined_at
  `).bind(group.id).all();

  const genres = await env.DB.prepare(
    'SELECT genre FROM group_genres WHERE group_id = ?'
  ).bind(group.id).all();

  const seasons = await env.DB.prepare(`
    SELECT s.*, COUNT(e.id) AS episode_count
    FROM seasons s
    LEFT JOIN episodes e ON e.season_id = s.id
    WHERE s.group_id = ?
    GROUP BY s.id
    ORDER BY s.number DESC
  `).bind(group.id).all();

  return json({
    group,
    members: members.results,
    genres: genres.results.map(r => r.genre),
    seasons: seasons.results,
  });
}

// ── Episodes & Vinyls ─────────────────────────────────────────────────

async function handleCurrentEpisode(request, env, path) {
  const slug = path.split('/')[3];
  const group = await env.DB.prepare('SELECT id FROM groups WHERE slug = ?').bind(slug).first();
  if (!group) return json({ error: 'Group not found' }, 404);

  const episode = await env.DB.prepare(`
    SELECT e.*, s.number AS season_number, u.username AS host_username
    FROM episodes e
    JOIN seasons s ON s.id = e.season_id
    LEFT JOIN users u ON u.id = e.host_id
    WHERE s.group_id = ? AND e.status = 'current'
    LIMIT 1
  `).bind(group.id).first();

  if (!episode) return json({ episode: null });

  const vinyls = await env.DB.prepare(`
    SELECT v.*, u.username AS contributor_username
    FROM episode_vinyls v
    JOIN users u ON u.id = v.contributed_by
    WHERE v.episode_id = ?
    ORDER BY v.added_at
  `).bind(episode.id).all();

  const attendeeCount = await env.DB.prepare(
    'SELECT COUNT(*) AS count FROM episode_attendees WHERE episode_id = ?'
  ).bind(episode.id).first();

  return json({ episode, vinyls: vinyls.results, attendeeCount: attendeeCount.count });
}

async function handleSeasonEpisodes(request, env, path) {
  const seasonId = path.split('/')[3];

  const episodes = await env.DB.prepare(`
    SELECT e.*, u.username AS host_username,
      (SELECT COUNT(*) FROM episode_attendees WHERE episode_id = e.id) AS attendee_count
    FROM episodes e
    LEFT JOIN users u ON u.id = e.host_id
    WHERE e.season_id = ?
    ORDER BY e.number DESC
  `).bind(seasonId).all();

  if (!episodes.results.length) return json({ episodes: [], vinyls: [] });

  const episodeIds = episodes.results.map(e => `'${e.id}'`).join(',');

  const [vinylsResult, attendeesResult] = await Promise.all([
    env.DB.prepare(`
      SELECT v.*, u.username AS contributor_username
      FROM episode_vinyls v
      JOIN users u ON u.id = v.contributed_by
      WHERE v.episode_id IN (${episodeIds})
      ORDER BY v.episode_id, v.added_at
    `).all(),
    env.DB.prepare(`
      SELECT ea.episode_id, u.username
      FROM episode_attendees ea
      JOIN users u ON u.id = ea.user_id
      WHERE ea.episode_id IN (${episodeIds})
      ORDER BY u.username
    `).all(),
  ]);

  const attendeesByEp = {};
  attendeesResult.results.forEach(a => {
    if (!attendeesByEp[a.episode_id]) attendeesByEp[a.episode_id] = [];
    attendeesByEp[a.episode_id].push(a.username);
  });

  const episodesOut = episodes.results.map(e =>
    Object.assign({}, e, { attendees: attendeesByEp[e.id] || [] })
  );

  return json({ episodes: episodesOut, vinyls: vinylsResult.results });
}

async function handleCreateEpisode(request, env, path) {
  const user = await requireAuth(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const seasonId = path.split('/')[3];
  const season = await env.DB.prepare(
    'SELECT * FROM seasons WHERE id = ?'
  ).bind(seasonId).first();
  if (!season) return json({ error: 'Season not found' }, 404);

  const membership = await env.DB.prepare(
    "SELECT role FROM group_members WHERE group_id = ? AND user_id = ? AND status = 'active'"
  ).bind(season.group_id, user.id).first();
  if (!membership) return json({ error: 'Not a member of this group' }, 403);

  const last = await env.DB.prepare(
    'SELECT COALESCE(MAX(number), 0) AS max_num FROM episodes WHERE season_id = ?'
  ).bind(seasonId).first();
  const nextNumber = (last?.max_num || 0) + 1;

  await env.DB.prepare(
    "UPDATE episodes SET status = 'completed' WHERE season_id = ? AND status = 'current'"
  ).bind(seasonId).run();

  const id = crypto.randomUUID();
  await env.DB.prepare(
    "INSERT INTO episodes (id, season_id, number, status) VALUES (?, ?, ?, 'current')"
  ).bind(id, seasonId, nextNumber).run();

  return json({ id, number: nextNumber }, 201);
}

async function handleUpdateEpisode(request, env, path) {
  const user = await requireAuth(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const episodeId = path.split('/')[3];
  const episode = await env.DB.prepare(`
    SELECT e.id, s.group_id FROM episodes e
    JOIN seasons s ON s.id = e.season_id WHERE e.id = ?
  `).bind(episodeId).first();
  if (!episode) return json({ error: 'Episode not found' }, 404);

  const membership = await env.DB.prepare(
    "SELECT id FROM group_members WHERE group_id = ? AND user_id = ? AND status = 'active'"
  ).bind(episode.group_id, user.id).first();
  if (!membership) return json({ error: 'Not a member' }, 403);

  const body = await parseBody(request);
  const { date, host_username } = body ?? {};

  let hostId = null;
  if (host_username) {
    const host = await env.DB.prepare('SELECT id FROM users WHERE username = ?').bind(host_username).first();
    hostId = host?.id ?? null;
  }

  await env.DB.prepare('UPDATE episodes SET date = ?, host_id = ? WHERE id = ?')
    .bind(date || null, hostId, episodeId).run();

  return json({ ok: true });
}

async function handleSetAttendees(request, env, path) {
  const user = await requireAuth(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const episodeId = path.split('/')[3];
  const episode = await env.DB.prepare(`
    SELECT e.id, s.group_id FROM episodes e
    JOIN seasons s ON s.id = e.season_id WHERE e.id = ?
  `).bind(episodeId).first();
  if (!episode) return json({ error: 'Episode not found' }, 404);

  const membership = await env.DB.prepare(
    "SELECT id FROM group_members WHERE group_id = ? AND user_id = ? AND status = 'active'"
  ).bind(episode.group_id, user.id).first();
  if (!membership) return json({ error: 'Not a member' }, 403);

  const body = await parseBody(request);
  const { usernames } = body ?? {};
  if (!Array.isArray(usernames)) return json({ error: 'usernames array required' }, 400);

  await env.DB.prepare('DELETE FROM episode_attendees WHERE episode_id = ?').bind(episodeId).run();

  for (const username of usernames) {
    const attendee = await env.DB.prepare('SELECT id FROM users WHERE username = ?').bind(username).first();
    if (attendee) {
      await env.DB.prepare(
        'INSERT OR IGNORE INTO episode_attendees (episode_id, user_id) VALUES (?, ?)'
      ).bind(episodeId, attendee.id).run();
    }
  }

  return json({ ok: true });
}

async function handleAddVinyl(request, env, path) {
  const user = await requireAuth(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const episodeId = path.split('/')[3];
  const episode = await env.DB.prepare(
    "SELECT id FROM episodes WHERE id = ? AND status IN ('current', 'upcoming')"
  ).bind(episodeId).first();
  if (!episode) return json({ error: 'Episode not found or not open' }, 404);

  const body = await parseBody(request);
  const { artist, album_title, art_url } = body ?? {};
  if (!artist || !album_title) return json({ error: 'artist and album_title are required' }, 400);

  const existing = await env.DB.prepare(
    'SELECT id FROM episode_vinyls WHERE episode_id = ? AND contributed_by = ?'
  ).bind(episodeId, user.id).first();
  if (existing) return json({ error: 'You already added a vinyl for this episode' }, 409);

  const id = crypto.randomUUID();
  await env.DB.prepare(
    'INSERT INTO episode_vinyls (id, episode_id, contributed_by, artist, album_title, art_url) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(id, episodeId, user.id, artist, album_title, art_url ?? null).run();

  return json({ id, artist, album_title, contributor_username: user.username }, 201);
}

async function handleInvite(request, env, path) {
  const user = await requireAuth(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const slug = path.split('/')[3];
  const group = await env.DB.prepare('SELECT id FROM groups WHERE slug = ?').bind(slug).first();
  if (!group) return json({ error: 'Group not found' }, 404);

  const membership = await env.DB.prepare(
    "SELECT role FROM group_members WHERE group_id = ? AND user_id = ? AND status = 'active'"
  ).bind(group.id, user.id).first();
  if (!membership || membership.role !== 'founder') {
    return json({ error: 'Only founders can invite members' }, 403);
  }

  const body = await parseBody(request);
  const { username } = body ?? {};
  if (!username) return json({ error: 'username is required' }, 400);

  const invitee = await env.DB.prepare(
    'SELECT id, username FROM users WHERE username = ?'
  ).bind(username).first();
  if (!invitee) return json({ error: 'User not found' }, 404);
  if (invitee.id === user.id) return json({ error: 'You cannot invite yourself' }, 400);

  const alreadyMember = await env.DB.prepare(
    "SELECT id FROM group_members WHERE group_id = ? AND user_id = ? AND status = 'active'"
  ).bind(group.id, invitee.id).first();
  if (alreadyMember) return json({ error: 'User is already a member' }, 409);

  const alreadyInvited = await env.DB.prepare(
    "SELECT id FROM group_invitations WHERE group_id = ? AND invited_user_id = ? AND status = 'pending'"
  ).bind(group.id, invitee.id).first();
  if (alreadyInvited) return json({ error: 'Invitation already pending for this user' }, 409);

  await env.DB.prepare(
    'INSERT INTO group_invitations (id, group_id, invited_user_id, invited_by, status) VALUES (?, ?, ?, ?, ?)'
  ).bind(crypto.randomUUID(), group.id, invitee.id, user.id, 'pending').run();

  return json({ ok: true, invited: invitee.username }, 201);
}

async function handleMyVinyls(request, env, url) {
  const user = await requireAuth(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const PAGE = 9;
  const offset = Math.max(0, parseInt(url.searchParams.get('offset') || '0', 10));

  const rows = await env.DB.prepare(`
    SELECT v.artist, v.album_title, v.art_url, v.added_at,
           e.number AS episode_number, s.number AS season_number,
           g.name AS group_name, g.slug AS group_slug
    FROM episode_vinyls v
    JOIN episodes e ON e.id = v.episode_id
    JOIN seasons s ON s.id = e.season_id
    JOIN groups g ON g.id = s.group_id
    WHERE v.contributed_by = ?
    ORDER BY v.added_at DESC
    LIMIT ? OFFSET ?
  `).bind(user.id, PAGE, offset).all();

  return json({ vinyls: rows.results, hasMore: rows.results.length === PAGE });
}

async function handleMyInvitations(request, env) {
  const user = await requireAuth(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const invitations = await env.DB.prepare(`
    SELECT gi.id, gi.created_at,
           g.name AS group_name, g.slug AS group_slug,
           u.username AS invited_by
    FROM group_invitations gi
    JOIN groups g ON g.id = gi.group_id
    JOIN users u ON u.id = gi.invited_by
    WHERE gi.invited_user_id = ? AND gi.status = 'pending'
    ORDER BY gi.created_at DESC
  `).bind(user.id).all();

  return json({ invitations: invitations.results });
}

async function handleAcceptInvitation(request, env, path) {
  const user = await requireAuth(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const id = path.split('/')[3];
  const invitation = await env.DB.prepare(
    "SELECT * FROM group_invitations WHERE id = ? AND invited_user_id = ? AND status = 'pending'"
  ).bind(id, user.id).first();
  if (!invitation) return json({ error: 'Invitation not found' }, 404);

  await env.DB.prepare(
    "INSERT INTO group_members (id, group_id, user_id, role, status) VALUES (?, ?, ?, 'member', 'active')"
  ).bind(crypto.randomUUID(), invitation.group_id, user.id).run();

  await env.DB.prepare(
    "UPDATE group_invitations SET status = 'accepted' WHERE id = ?"
  ).bind(id).run();

  return json({ ok: true });
}

async function handleDeclineInvitation(request, env, path) {
  const user = await requireAuth(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const id = path.split('/')[3];
  const invitation = await env.DB.prepare(
    "SELECT id FROM group_invitations WHERE id = ? AND invited_user_id = ? AND status = 'pending'"
  ).bind(id, user.id).first();
  if (!invitation) return json({ error: 'Invitation not found' }, 404);

  await env.DB.prepare(
    "UPDATE group_invitations SET status = 'declined' WHERE id = ?"
  ).bind(id).run();

  return json({ ok: true });
}

// ── Helpers ───────────────────────────────────────────────────────────

async function requireAuth(request, env) {
  const token = getSessionToken(request);
  if (!token) return null;

  const session = await env.DB.prepare(
    "SELECT user_id FROM sessions WHERE id = ? AND expires_at > datetime('now')"
  ).bind(token).first();
  if (!session) return null;

  return env.DB.prepare(
    'SELECT id, username, email, avatar_url, location, bio FROM users WHERE id = ?'
  ).bind(session.user_id).first();
}

async function createSession(env, userId) {
  const token = crypto.randomUUID() + crypto.randomUUID();
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  await env.DB.prepare(
    'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)'
  ).bind(token, userId, expires).run();
  return token;
}

function getSessionToken(request) {
  const cookie = request.headers.get('Cookie') ?? '';
  const match = cookie.match(/vn_session=([^;]+)/);
  return match ? match[1] : null;
}

function sessionCookie(token) {
  return { 'Set-Cookie': `vn_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${30 * 24 * 60 * 60}` };
}

function clearCookie() {
  return { 'Set-Cookie': 'vn_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0' };
}

async function hashPassword(password) {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100_000 },
    key, 256
  );
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const hashHex = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('');
  return `pbkdf2:${saltHex}:${hashHex}`;
}

async function verifyPassword(password, stored) {
  const [, saltHex, hashHex] = stored.split(':');
  const salt = Uint8Array.from(saltHex.match(/../g).map(h => parseInt(h, 16)));
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100_000 },
    key, 256
  );
  const candidate = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('');
  return candidate === hashHex;
}

async function parseBody(request) {
  try { return await request.json(); } catch { return null; }
}

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS, ...extraHeaders },
  });
}
