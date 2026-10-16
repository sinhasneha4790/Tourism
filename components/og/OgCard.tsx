import { ImageResponse } from 'next/og';

export const OG_SIZE = { width: 1200, height: 630 };

/** Shared Open Graph card in Mistrail colours, rendered at build time. */
export function ogCard({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 72,
        background: '#17221C',
        color: '#fff',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ width: 72, height: 72, borderRadius: 999, background: '#E6EEF0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 22, height: 22, borderRadius: 999, background: '#B5462E' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 44, fontWeight: 800 }}>mistrail</div>
          <div style={{ fontSize: 18, letterSpacing: 6, color: '#E9A07F' }}>INTO THE NORTHEAST</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 24, letterSpacing: 4, color: '#E9A07F', textTransform: 'uppercase' }}>{eyebrow}</div>
        <div style={{ fontSize: title.length > 40 ? 64 : 80, fontWeight: 800, lineHeight: 1.02, maxWidth: 1000 }}>{title}</div>
        <div style={{ fontSize: 28, color: '#A9B6AF' }}>{subtitle}</div>
      </div>
      <div style={{ position: 'absolute', right: 0, bottom: 0, width: 1200, height: 18, background: '#E9A07F', display: 'flex' }} />
    </div>,
    OG_SIZE,
  );
}
