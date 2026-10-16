import Image from 'next/image';
import type { ImageRef } from '@/types/content';
import { Scene } from './Scene';

/** Renders the owner's photo when one is set, otherwise the illustrated scene. */
export function Picture({ image, sizes, priority = false, className = '' }: { image: ImageRef; sizes: string; priority?: boolean; className?: string }) {
  if (image.src) {
    return (
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-cover transition-transform duration-500 motion-reduce:transition-none ${className}`}
      />
    );
  }
  return (
    <Scene image={image} priority={priority} className={`absolute inset-0 transition-transform duration-500 motion-reduce:transition-none ${className}`} />
  );
}
