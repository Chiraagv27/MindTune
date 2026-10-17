function md5(value: string): string {
  function rotl(x: number, n: number) {
    return (x << n) | (x >>> (32 - n));
  }
  function add(a: number, b: number) {
    return (a + b) >>> 0;
  }

  const bytes: number[] = [];
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code < 128) bytes.push(code);
    else if (code < 2048) bytes.push(192 | (code >> 6), 128 | (code & 63));
    else bytes.push(224 | (code >> 12), 128 | ((code >> 6) & 63), 128 | (code & 63));
  }

  const bitLength = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  const lo = bitLength >>> 0;
  const hi = Math.floor(bitLength / 0x100000000);
  for (let i = 0; i < 4; i += 1) bytes.push((lo >>> (8 * i)) & 0xff);
  for (let i = 0; i < 4; i += 1) bytes.push((hi >>> (8 * i)) & 0xff);

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  const s = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ];
  const k = Array.from({ length: 64 }, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000));

  for (let offset = 0; offset < bytes.length; offset += 64) {
    const m = Array.from({ length: 16 }, (_, i) =>
      bytes[offset + i * 4] |
      (bytes[offset + i * 4 + 1] << 8) |
      (bytes[offset + i * 4 + 2] << 16) |
      (bytes[offset + i * 4 + 3] << 24),
    );

    let a = a0;
    let b = b0;
    let c = c0;
    let d = d0;

    for (let i = 0; i < 64; i += 1) {
      let f = 0;
      let g = 0;
      if (i < 16) {
        f = (b & c) | (~b & d);
        g = i;
      } else if (i < 32) {
        f = (d & b) | (~d & c);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        f = b ^ c ^ d;
        g = (3 * i + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = (7 * i) % 16;
      }
      const next = add(add(add(a, f), k[i]), m[g]);
      a = d;
      d = c;
      c = b;
      b = add(b, rotl(next, s[i]));
    }

    a0 = add(a0, a);
    b0 = add(b0, b);
    c0 = add(c0, c);
    d0 = add(d0, d);
  }

  const words = [a0, b0, c0, d0];
  return words.map((word) =>
    [0, 8, 16, 24].map((shift) => ((word >>> shift) & 0xff).toString(16).padStart(2, '0')).join(''),
  ).join('');
}

/**
 * RoboHash "set1" robots, the same set as the RoboHash tab on
 * https://vinicius73.github.io/gravatar-url-generator/#/
 */
export function robotAvatarUrl(seed: string, size = 200) {
  const hash = md5(seed.trim().toLowerCase() || 'mindtune');
  return `https://robohash.org/${hash}?set=set1&size=${size}x${size}`;
}

/** Standard Gravatar for account email (used on Profile / settings). */
export function gravatarUrl(email: string, size = 256) {
  const hash = md5(email.trim().toLowerCase() || 'mindtune');
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon&r=g`;
}

/** Ignore locally drawn stand-ins so the picture stays a RoboHash robot. */
export function usableAvatarUrl(url: string | null | undefined) {
  if (!url || url.startsWith('data:')) return null;
  return url;
}

/** A different RoboHash robot on every call. */
export function randomRobotAvatarUrl(size = 128) {
  const seed = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return robotAvatarUrl(seed, size);
}

export function preloadRobot(url: string) {
  return new Promise<void>((resolve, reject) => {
    const img = new Image();
    const timer = window.setTimeout(() => {
      img.onload = null;
      img.onerror = null;
      reject(new Error('Robot took too long to load'));
    }, 8000);
    img.onload = () => {
      window.clearTimeout(timer);
      resolve();
    };
    img.onerror = () => {
      window.clearTimeout(timer);
      reject(new Error('Could not load robot'));
    };
    img.src = url;
  });
}

const AVATAR_CACHE_PREFIX = 'promptperfect:avatar:';

export function readCachedAvatar(userId: string) {
  if (typeof window === 'undefined') return null;
  try {
    return usableAvatarUrl(window.localStorage.getItem(`${AVATAR_CACHE_PREFIX}${userId}`));
  } catch {
    return null;
  }
}

export function writeCachedAvatar(userId: string, url: string | null | undefined) {
  if (typeof window === 'undefined') return;
  const key = `${AVATAR_CACHE_PREFIX}${userId}`;
  try {
    const next = usableAvatarUrl(url);
    if (next) window.localStorage.setItem(key, next);
    else window.localStorage.removeItem(key);
    window.dispatchEvent(new CustomEvent('pp-avatar-updated', { detail: { userId } }));
  } catch {
    // Ignore private-mode storage failures.
  }
}

/** Saved RoboHash (or custom URL) first, then email-stable robot fallback. */
export function resolveAvatarSrc(
  seed: string,
  avatarUrl?: string | null,
  userId?: string,
  size = 64,
): string {
  const saved = usableAvatarUrl(avatarUrl) ?? (userId ? readCachedAvatar(userId) : null);
  const normalizedSeed = seed.trim() || userId || 'mindtune';
  return saved ?? robotAvatarUrl(normalizedSeed, size);
}
