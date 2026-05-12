// MusicBrainz + Cover Art Archive album art service

const MB_API  = 'https://musicbrainz.org/ws/2';
const CAA_API = 'https://coverartarchive.org';
const DEFAULT_UA = 'vinylnight/1.0 (https://vinylnight.net)';

const NO_ART = Object.freeze({ imageUrl: null, source: 'none', confidence: 'none' });

// ── Text normalisation ────────────────────────────────────────────────────

export function normalizeAlbumText(value) {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')          // strip combining accents
    .replace(/\s*[\(\[][^\)\]]*(?:deluxe|remaster(?:ed)?|anniversary|edition|bonus|expanded|special|explicit|clean)[^\)\]]*[\)\]]/gi, '')
    .replace(/\b(?:deluxe|remaster(?:ed)?|anniversary|expanded|special)\s*(?:edition)?\b/gi, '')
    .replace(/[^\w\s]/g, ' ')                 // punctuation → space
    .replace(/\b(?:the|an|a)\b/g, ' ')        // articles
    .replace(/\s+/g, ' ')
    .trim();
}

// Jaccard similarity on word sets
function wordSimilarity(a, b) {
  const aw = new Set(a.split(/\s+/).filter(Boolean));
  const bw = new Set(b.split(/\s+/).filter(Boolean));
  if (!aw.size && !bw.size) return 1;
  if (!aw.size || !bw.size) return 0;
  const hits = [...aw].filter(w => bw.has(w)).length;
  return hits / (new Set([...aw, ...bw]).size);
}

function rgArtistName(rg) {
  const credits = rg['artist-credit'];
  if (!credits?.length) return '';
  return credits.map(c => (typeof c === 'string' ? c : c.name || c.artist?.name || '')).join('');
}

// ── Scoring ───────────────────────────────────────────────────────────────

export function scoreAlbumMatch(candidate, targetArtist, targetAlbum) {
  const nTargetArtist = normalizeAlbumText(targetArtist);
  const nTargetAlbum  = normalizeAlbumText(targetAlbum);
  const nCandArtist   = normalizeAlbumText(rgArtistName(candidate));
  const nCandAlbum    = normalizeAlbumText(candidate.title || '');

  let score = 0;

  // Artist match  (0 – 40)
  if (nCandArtist && nTargetArtist) {
    score += nCandArtist === nTargetArtist
      ? 40
      : Math.round(wordSimilarity(nCandArtist, nTargetArtist) * 30);
  }

  // Album title match  (0 – 35)
  score += nCandAlbum === nTargetAlbum
    ? 35
    : Math.round(wordSimilarity(nCandAlbum, nTargetAlbum) * 25);

  // MusicBrainz search-relevance hint  (0 – 10)
  score += Math.round((Number(candidate.score) || 0) / 100 * 10);

  // Primary type
  const primaryType = (candidate['primary-type'] || '').toLowerCase();
  if      (primaryType === 'album')  score += 10;
  else if (primaryType === 'single') score -= 15;
  else if (primaryType === 'ep')     score -= 10;

  // Various Artists penalty
  const rawArtist = rgArtistName(candidate).toLowerCase();
  if ((rawArtist.includes('various') || rawArtist === 'va') &&
      nTargetArtist && !nTargetArtist.includes('various')) {
    score -= 20;
  }

  // Secondary type penalties
  const secondary = (candidate['secondary-types'] || []).map(t => t.toLowerCase());
  const titleLower = (candidate.title || '').toLowerCase();

  for (const st of secondary) {
    if (st === 'live'        && !nTargetAlbum.includes('live'))                  score -= 10;
    if (st === 'compilation' && !/(compil|greatest hits|collection)/.test(nTargetAlbum)) score -= 10;
    if (st === 'soundtrack'  && !/(soundtrack)/.test(nTargetAlbum))              score -= 10;
    if (st === 'karaoke')                                                          score -= 25;
    if (st === 'remix')                                                            score -= 10;
  }

  if (/\b(?:tribute|made famous by|karaoke)\b/.test(titleLower)) score -= 20;

  return Math.max(0, Math.min(100, score));
}

export function confidenceLevel(score) {
  if (score >= 85) return 'high';
  if (score >= 65) return 'medium';
  return 'low';
}

// ── MusicBrainz ───────────────────────────────────────────────────────────

export async function searchMusicBrainzReleaseGroups({ artist, album }, ua) {
  const safeArtist = artist.replace(/"/g, '');
  const safeAlbum  = album.replace(/"/g, '');
  const query = `artist:"${safeArtist}" AND releasegroup:"${safeAlbum}"`;
  const url   = `${MB_API}/release-group/?query=${encodeURIComponent(query)}&fmt=json&limit=10`;

  const res = await fetch(url, {
    headers: { 'User-Agent': ua || DEFAULT_UA },
    signal: AbortSignal.timeout(10_000),
  });

  if (res.status === 503) throw new Error('MusicBrainz rate limited');
  if (!res.ok) return [];

  const data = await res.json();
  return data['release-groups'] || [];
}

export function getBestMusicBrainzMatch(results, artist, album) {
  if (!results?.length) return null;

  let best = null;
  let bestScore = 0;

  for (const rg of results) {
    const s = scoreAlbumMatch(rg, artist, album);
    if (s > bestScore) { bestScore = s; best = rg; }
  }

  if (bestScore < 65) return null;

  return { releaseGroup: best, score: bestScore, confidence: confidenceLevel(bestScore) };
}

export async function getReleasesForReleaseGroup(releaseGroupId, ua) {
  const res = await fetch(
    `${MB_API}/release?release-group=${releaseGroupId}&fmt=json&limit=10`,
    { headers: { 'User-Agent': ua || DEFAULT_UA }, signal: AbortSignal.timeout(10_000) }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.releases || [];
}

// ── Cover Art Archive ─────────────────────────────────────────────────────

function selectBestImage(images) {
  if (!images?.length) return null;
  const front = images.find(i => i.front === true && (i.types || []).includes('Front'))
    ?? images.find(i => i.front === true)
    ?? images[0];
  if (!front) return null;
  const t = front.thumbnails || {};
  return {
    imageUrl:     front.image || null,
    thumbnailUrl: t['500'] ?? t['250'] ?? t['large'] ?? t['small'] ?? front.image ?? null,
  };
}

export async function getCoverArtForReleaseGroup(releaseGroupId, ua) {
  const res = await fetch(`${CAA_API}/release-group/${releaseGroupId}`, {
    headers: { 'User-Agent': ua || DEFAULT_UA },
    signal: AbortSignal.timeout(10_000),
  });
  if (res.status === 404) return null;
  if (!res.ok) return null;
  const data = await res.json();
  return selectBestImage(data.images || []);
}

export async function getCoverArtForRelease(releaseId, ua) {
  const res = await fetch(`${CAA_API}/release/${releaseId}`, {
    headers: { 'User-Agent': ua || DEFAULT_UA },
    signal: AbortSignal.timeout(10_000),
  });
  if (res.status === 404) return null;
  if (!res.ok) return null;
  const data = await res.json();
  return selectBestImage(data.images || []);
}

function sortReleases(releases) {
  return [...releases].sort((a, b) => {
    const aOff = (a.status || '').toLowerCase() === 'official' ? 0 : 1;
    const bOff = (b.status || '').toLowerCase() === 'official' ? 0 : 1;
    if (aOff !== bOff) return aOff - bOff;
    return (a.date || '9999').localeCompare(b.date || '9999');
  });
}

// ── Main lookup ───────────────────────────────────────────────────────────

export async function getAlbumArtwork({ artist, album }, env) {
  const ua          = env?.MUSICBRAINZ_USER_AGENT || DEFAULT_UA;
  const normArtist  = normalizeAlbumText(artist);
  const normAlbum   = normalizeAlbumText(album);

  if (!normArtist || !normAlbum) return { ...NO_ART };

  // 1. Manual override
  if (env?.DB) {
    const ov = await env.DB.prepare(
      'SELECT image_url, thumbnail_url FROM album_art_overrides WHERE normalized_artist = ? AND normalized_album = ?'
    ).bind(normArtist, normAlbum).first().catch(() => null);

    if (ov) {
      return { imageUrl: ov.image_url, thumbnailUrl: ov.thumbnail_url, source: 'manual', confidence: 'high' };
    }

    // 2. Cache
    const cacheKey = normArtist + '|' + normAlbum;
    const cached   = await env.DB.prepare(
      'SELECT result_json, expires_at FROM album_art_cache WHERE cache_key = ?'
    ).bind(cacheKey).first().catch(() => null);

    if (cached && cached.expires_at > new Date().toISOString()) {
      try { return JSON.parse(cached.result_json); } catch { /* fall through */ }
    }
  }

  // 3. MusicBrainz + Cover Art Archive
  let result = { ...NO_ART };

  try {
    const rgList = await searchMusicBrainzReleaseGroups({ artist, album }, ua);
    const match  = getBestMusicBrainzMatch(rgList, artist, album);

    if (match) {
      const { releaseGroup: rg, score, confidence } = match;
      const rgId     = rg.id;
      const rgArtist = rgArtistName(rg) || artist;
      const rgAlbum  = rg.title || album;

      let art       = await getCoverArtForReleaseGroup(rgId, ua);
      let releaseId = null;

      if (!art) {
        const releases = sortReleases(await getReleasesForReleaseGroup(rgId, ua));
        for (const rel of releases.slice(0, 3)) {
          art = await getCoverArtForRelease(rel.id, ua);
          if (art) { releaseId = rel.id; break; }
        }
      }

      if (art) {
        result = {
          imageUrl:      art.imageUrl,
          thumbnailUrl:  art.thumbnailUrl,
          source:        'cover-art-archive',
          confidence,
          matchedArtist: rgArtist,
          matchedAlbum:  rgAlbum,
          externalIds: {
            musicBrainzReleaseGroupId: rgId,
            ...(releaseId ? { musicBrainzReleaseId: releaseId } : {}),
          },
        };
      } else if (confidence !== 'low') {
        result = {
          imageUrl:      null,
          source:        'none',
          confidence,
          matchedArtist: rgArtist,
          matchedAlbum:  rgAlbum,
          externalIds:   { musicBrainzReleaseGroupId: rgId },
        };
      }
    }
  } catch {
    result = { ...NO_ART };
  }

  // 4. Cache result
  if (env?.DB) {
    const cacheKey  = normArtist + '|' + normAlbum;
    const ttlMs     = result.imageUrl ? 7 * 86_400_000 : 86_400_000;
    const expiresAt = new Date(Date.now() + ttlMs).toISOString();
    await env.DB.prepare(
      'INSERT OR REPLACE INTO album_art_cache (cache_key, result_json, expires_at) VALUES (?, ?, ?)'
    ).bind(cacheKey, JSON.stringify(result), expiresAt).run().catch(() => {});
  }

  return result;
}
