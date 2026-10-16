import { isHex, isSceneKind, sceneSvg } from '@/lib/scene-svg';

/** Serves illustrated scenes as cacheable SVG images: /scene/hills/E6EEF0/2E4A50.svg */
export async function GET(_req: Request, { params }: { params: Promise<{ kind: string; sky: string; land: string }> }) {
  const { kind, sky, land } = await params;
  const landHex = land.replace(/\.svg$/, '');
  if (!isSceneKind(kind) || !isHex(sky) || !isHex(landHex)) return new Response('Not found', { status: 404 });
  return new Response(sceneSvg(kind, sky, landHex), {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'",
    },
  });
}
