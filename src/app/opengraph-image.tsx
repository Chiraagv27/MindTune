import { ImageResponse } from 'next/og';

import { SITE_NAME, SITE_TAGLINE } from '@/lib/site';

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 80,
          background: 'linear-gradient(145deg, #09090b 0%, #18181b 55%, #0c4a6e 100%)',
          color: '#fafafa',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7dd3fc' }}>
          {SITE_NAME}
        </div>
        <div style={{ marginTop: 24, fontSize: 64, fontWeight: 600, lineHeight: 1.1, maxWidth: 900 }}>
          Speak messy.
        </div>
        <div style={{ marginTop: 8, fontSize: 64, fontWeight: 400, lineHeight: 1.1, color: '#a1a1aa', maxWidth: 900 }}>
          Get precision.
        </div>
        <div style={{ marginTop: 40, fontSize: 26, color: '#d4d4d8', maxWidth: 820 }}>
          AI prompt optimizer with voice input, three tuning modes, library, and share links.
        </div>
      </div>
    ),
    { ...size },
  );
}
