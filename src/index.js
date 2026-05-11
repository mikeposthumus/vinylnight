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

  if (path === '/api/groups'        && method === 'GET')  return handleListGroups(request, env);
  if (path.match(/^\/api\/groups\/[^/]+$/) && method === 'GET') return handleGetGroup(request, env, path);
  if (path.match(/^\/api\/groups\/[^/]+\/current-episode$/) && method === 'GET') return handleCurrentEpisode(request, env, path);
  if (path.match(/^\/api\/groups\/[^/]+\/join$/) && method === 'POST') return handleJoinRequest(request, env, path);

  if (path.match(/^\/api\/seasons\/[^/]+\/episodes$/) && method === 'GET') return handleSeasonEpisodes(request, env, path);

  if (path.match(/^\/api\/episodes\/[^/]+\/vinyls$/) && method === 'POST') return handleAddVinyl(request, env, path);

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

  if (!user || !(await verifyPassword(password, user.password_hash))) {
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

  const topAlbums = await env.DB.prepare(
    'SELECT rank, artist, album_title FROM user_top_albums WHERE user_id = ? ORDER BY rank'
  ).bind(user.id).all();

  const groups = await env.DB.prepare(`
    SELECT g.id, g.name, g.slug, gm.role
    FROM group_members gm
    JOIN groups g ON g.id = gm.group_id
    WHERE gm.user_id = ? AND gm.status = 'active'
  `).bind(user.id).all();

  return json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar_url: user.avatar_url,
      location: user.location,
      bio: user.bio,
    },
    topAlbums: topAlbums.results,
    groups: groups.results,
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

  const episodeIds = episodes.results.map(e => `'${e.id}'`).join(',');
  let vinyls = [];
  if (episodeIds.length) {
    const result = await env.DB.prepare(`
      SELECT v.*, u.username AS contributor_username
      FROM episode_vinyls v
      JOIN users u ON u.id = v.contributed_by
      WHERE v.episode_id IN (${episodeIds})
      ORDER BY v.episode_id, v.added_at
    `).all();
    vinyls = result.results;
  }

  return json({ episodes: episodes.results, vinyls });
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

async function handleJoinRequest(request, env, path) {
  const user = await requireAuth(request, env);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const slug = path.split('/')[3];
  const group = await env.DB.prepare('SELECT id FROM groups WHERE slug = ?').bind(slug).first();
  if (!group) return json({ error: 'Group not found' }, 404);

  const existing = await env.DB.prepare(
    'SELECT id, status FROM group_members WHERE group_id = ? AND user_id = ?'
  ).bind(group.id, user.id).first();
  if (existing) return json({ error: 'Already a member or request pending' }, 409);

  const id = crypto.randomUUID();
  await env.DB.prepare(
    "INSERT INTO group_members (id, group_id, user_id, role, status) VALUES (?, ?, ?, 'member', 'pending')"
  ).bind(id, group.id, user.id).run();

  return json({ ok: true }, 201);
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
