import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  normalizeAlbumText,
  scoreAlbumMatch,
  getBestMusicBrainzMatch,
  confidenceLevel,
  getAlbumArtwork,
} from '../src/album-art.js';

// ── Helpers ───────────────────────────────────────────────────────────────

function rg(overrides) {
  return {
    id: 'test-id',
    title: 'Test Album',
    'primary-type': 'Album',
    'secondary-types': [],
    'artist-credit': [{ name: 'Test Artist', artist: { name: 'Test Artist' } }],
    score: 100,
    ...overrides,
  };
}

// ── normalizeAlbumText ────────────────────────────────────────────────────

describe('normalizeAlbumText', () => {
  it('lowercases input', () => {
    expect(normalizeAlbumText('THE BEATLES')).toBe('beatles');
  });

  it('removes leading "The"', () => {
    expect(normalizeAlbumText('The Beatles')).toBe('beatles');
  });

  it('strips accents', () => {
    expect(normalizeAlbumText('Björk')).toBe('bjork');
  });

  it('removes punctuation', () => {
    expect(normalizeAlbumText("It's a Beautiful Day")).toBe('it s beautiful day');
  });

  it('strips parenthesised "Deluxe Edition"', () => {
    expect(normalizeAlbumText('Abbey Road (Deluxe Edition)')).toBe('abbey road');
  });

  it('strips bracketed "Remastered"', () => {
    expect(normalizeAlbumText('Abbey Road [2019 Remastered]')).toBe('abbey road');
  });

  it('strips "Anniversary Edition" without parens', () => {
    expect(normalizeAlbumText('Kind of Blue Anniversary Edition')).toBe('kind of blue');
  });

  it('handles empty string', () => {
    expect(normalizeAlbumText('')).toBe('');
  });

  it('collapses extra whitespace', () => {
    expect(normalizeAlbumText('  Dark   Side  ')).toBe('dark side');
  });
});

// ── scoreAlbumMatch ───────────────────────────────────────────────────────

describe('scoreAlbumMatch', () => {
  it('returns high score for exact artist + album match', () => {
    const candidate = rg({ title: 'Abbey Road', 'artist-credit': [{ name: 'The Beatles' }] });
    expect(scoreAlbumMatch(candidate, 'The Beatles', 'Abbey Road')).toBeGreaterThanOrEqual(85);
  });

  it('returns medium score for close artist + exact album', () => {
    const candidate = rg({ title: 'Abbey Road', 'artist-credit': [{ name: 'Beatles' }] });
    const s = scoreAlbumMatch(candidate, 'The Beatles', 'Abbey Road');
    expect(s).toBeGreaterThanOrEqual(65);
    expect(s).toBeLessThan(100);
  });

  it('penalises "Single" primary type', () => {
    const album  = rg({ title: 'Something', 'primary-type': 'Album' });
    const single = rg({ title: 'Something', 'primary-type': 'Single' });
    expect(scoreAlbumMatch(single, 'The Beatles', 'Something')).toBeLessThan(
      scoreAlbumMatch(album, 'The Beatles', 'Something')
    );
  });

  it('penalises "EP" primary type', () => {
    const album = rg({ title: 'My EP', 'primary-type': 'Album' });
    const ep    = rg({ title: 'My EP', 'primary-type': 'EP' });
    expect(scoreAlbumMatch(ep, 'Artist', 'My EP')).toBeLessThan(
      scoreAlbumMatch(album, 'Artist', 'My EP')
    );
  });

  it('penalises tribute albums heavily', () => {
    const tribute = rg({ title: 'Tribute to The Beatles' });
    expect(scoreAlbumMatch(tribute, 'The Beatles', 'Abbey Road')).toBeLessThan(65);
  });

  it('penalises karaoke albums', () => {
    const karaoke = rg({ title: 'Come Together', 'secondary-types': ['Karaoke'] });
    const normal  = rg({ title: 'Come Together' });
    expect(scoreAlbumMatch(karaoke, 'The Beatles', 'Come Together')).toBeLessThan(
      scoreAlbumMatch(normal, 'The Beatles', 'Come Together')
    );
  });

  it('penalises "Various Artists" when a specific artist is given', () => {
    const va = rg({ 'artist-credit': [{ name: 'Various Artists' }] });
    expect(scoreAlbumMatch(va, 'The Beatles', 'Abbey Road')).toBeLessThan(50);
  });

  it('does NOT penalise "Various Artists" when query artist is also various', () => {
    const va = rg({ title: 'Now 90s', 'artist-credit': [{ name: 'Various Artists' }] });
    const score = scoreAlbumMatch(va, 'Various Artists', 'Now 90s');
    expect(score).toBeGreaterThan(50);
  });

  it('penalises Live when album title does not include "live"', () => {
    const live    = rg({ title: 'Abbey Road', 'secondary-types': ['Live'] });
    const regular = rg({ title: 'Abbey Road' });
    expect(scoreAlbumMatch(live, 'The Beatles', 'Abbey Road')).toBeLessThan(
      scoreAlbumMatch(regular, 'The Beatles', 'Abbey Road')
    );
  });

  it('does NOT penalise Live when target album includes "live"', () => {
    const live = rg({ title: 'Live at the BBC', 'secondary-types': ['Live'] });
    expect(scoreAlbumMatch(live, 'The Beatles', 'Live at the BBC')).toBeGreaterThan(50);
  });

  it('score is clamped between 0 and 100', () => {
    const s = scoreAlbumMatch(rg(), 'any', 'any');
    expect(s).toBeGreaterThanOrEqual(0);
    expect(s).toBeLessThanOrEqual(100);
  });
});

// ── confidenceLevel ───────────────────────────────────────────────────────

describe('confidenceLevel', () => {
  it('returns high for score >= 85', () => { expect(confidenceLevel(85)).toBe('high'); });
  it('returns medium for score 65–84', () => { expect(confidenceLevel(70)).toBe('medium'); });
  it('returns low for score < 65', () => { expect(confidenceLevel(50)).toBe('low'); });
});

// ── getBestMusicBrainzMatch ───────────────────────────────────────────────

describe('getBestMusicBrainzMatch', () => {
  it('returns null for empty results', () => {
    expect(getBestMusicBrainzMatch([], 'Beatles', 'Abbey Road')).toBeNull();
  });

  it('returns null when best score is below 65', () => {
    const results = [rg({ title: 'Completely Different', 'artist-credit': [{ name: 'Nobody' }] })];
    expect(getBestMusicBrainzMatch(results, 'Beatles', 'Abbey Road')).toBeNull();
  });

  it('picks the highest-scoring result', () => {
    const good = rg({ id: 'good', title: 'Abbey Road', 'artist-credit': [{ name: 'The Beatles' }] });
    const bad  = rg({ id: 'bad',  title: 'Random Album', 'artist-credit': [{ name: 'Other Band' }] });
    const match = getBestMusicBrainzMatch([bad, good], 'The Beatles', 'Abbey Road');
    expect(match).not.toBeNull();
    expect(match.releaseGroup.id).toBe('good');
    expect(match.confidence).toBe('high');
  });
});

// ── getAlbumArtwork ───────────────────────────────────────────────────────

describe('getAlbumArtwork', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  const caaImage = { imageUrl: 'https://caa.example/img.jpg', thumbnailUrl: 'https://caa.example/thumb.jpg' };
  const rgResult = {
    'release-groups': [
      rg({ id: 'rg-1', title: 'Abbey Road', 'artist-credit': [{ name: 'The Beatles' }], score: 95 }),
    ],
  };

  function mockFetch(rgData, caaData) {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      const u = String(url);
      if (u.includes('musicbrainz.org/ws/2/release-group')) {
        return { ok: true, status: 200, json: async () => rgData };
      }
      if (u.includes('coverartarchive.org/release-group')) {
        if (!caaData) return { ok: false, status: 404, json: async () => ({}) };
        return { ok: true, status: 200, json: async () => ({ images: [{ front: true, types: ['Front'], image: caaImage.imageUrl, thumbnails: { '500': caaImage.thumbnailUrl } }] }) };
      }
      return { ok: false, status: 404, json: async () => ({}) };
    });
  }

  const mockEnv = () => ({
    MUSICBRAINZ_USER_AGENT: 'test/1.0',
    DB: {
      prepare: () => ({
        bind: () => ({
          first: async () => null,
          run: async () => {},
        }),
      }),
    },
  });

  it('returns imageUrl from Cover Art Archive on high-confidence match', async () => {
    mockFetch(rgResult, true);
    const result = await getAlbumArtwork({ artist: 'The Beatles', album: 'Abbey Road' }, mockEnv());
    expect(result.imageUrl).toBe(caaImage.imageUrl);
    expect(result.source).toBe('cover-art-archive');
    expect(result.confidence).toBe('high');
  });

  it('returns no-art result when MB returns no results', async () => {
    mockFetch({ 'release-groups': [] }, false);
    const result = await getAlbumArtwork({ artist: 'Unknown', album: 'Unknown Album' }, mockEnv());
    expect(result.imageUrl).toBeNull();
    expect(result.source).toBe('none');
  });

  it('returns no-art result when CAA returns 404', async () => {
    mockFetch(rgResult, false);
    const result = await getAlbumArtwork({ artist: 'The Beatles', album: 'Abbey Road' }, mockEnv());
    expect(result.imageUrl).toBeNull();
  });

  it('returns no-art on API failure without throwing', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network error'));
    const result = await getAlbumArtwork({ artist: 'The Beatles', album: 'Abbey Road' }, mockEnv());
    expect(result.imageUrl).toBeNull();
    expect(result.source).toBe('none');
  });

  it('returns no-art for empty artist', async () => {
    const result = await getAlbumArtwork({ artist: '', album: 'Abbey Road' }, mockEnv());
    expect(result.imageUrl).toBeNull();
  });

  it('returns no-art for empty album', async () => {
    const result = await getAlbumArtwork({ artist: 'The Beatles', album: '' }, mockEnv());
    expect(result.imageUrl).toBeNull();
  });

  it('serves manual override before API lookup', async () => {
    const env = {
      MUSICBRAINZ_USER_AGENT: 'test/1.0',
      DB: {
        prepare: (sql) => ({
          bind: () => ({
            first: async () =>
              sql.includes('album_art_overrides')
                ? { image_url: 'https://manual.example/art.jpg', thumbnail_url: null }
                : null,
            run: async () => {},
          }),
        }),
      },
    };
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const result = await getAlbumArtwork({ artist: 'The Beatles', album: 'Abbey Road' }, env);
    expect(result.imageUrl).toBe('https://manual.example/art.jpg');
    expect(result.source).toBe('manual');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('serves cache before API lookup', async () => {
    const cached = {
      imageUrl:     'https://cached.example/art.jpg',
      thumbnailUrl: null,
      source:       'cover-art-archive',
      confidence:   'high',
    };
    const futureDate = new Date(Date.now() + 86_400_000).toISOString();
    const env = {
      MUSICBRAINZ_USER_AGENT: 'test/1.0',
      DB: {
        prepare: (sql) => ({
          bind: () => ({
            first: async () => {
              if (sql.includes('album_art_overrides')) return null;
              if (sql.includes('album_art_cache'))
                return { result_json: JSON.stringify(cached), expires_at: futureDate };
              return null;
            },
            run: async () => {},
          }),
        }),
      },
    };
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const result = await getAlbumArtwork({ artist: 'The Beatles', album: 'Abbey Road' }, env);
    expect(result.imageUrl).toBe(cached.imageUrl);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
