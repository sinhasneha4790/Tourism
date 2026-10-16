import type { ImageRef } from '@/types/content';
import { sceneUrl } from '@/lib/scene-svg';

/**
 * Illustrated landscape used in place of photography until the owner supplies credited photos.
 * Rendered as a lazily loaded, long-cached SVG image (see app/scene/…/route.ts).
 */
export function Scene({ image, className = '', label = true, priority = false }: { image: ImageRef; className?: string; label?: boolean; priority?: boolean }) {
  const [sky, land] = image.tint ?? ['#E6EEF0', '#2E4A50'];
  return (
    // eslint-disable-next-line @next/next/no-img-element -- tiny vector illustrations; next/image adds nothing here
    <img
      src={sceneUrl(image.scene, sky, land)}
      alt={label ? image.alt : ''}
      width={400}
      height={260}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      className={`block h-full w-full object-cover ${className}`}
    />
  );
}
