import type { ImageRef } from '@/types/content';

/**
 * Illustrated landscape used in place of photography until the owner supplies
 * credited photos. Pure SVG: no network requests, scales to any card.
 */
export function Scene({ image, className = '', label = true }: { image: ImageRef; className?: string; label?: boolean }) {
  const [sky, land] = image.tint ?? ['#E6EEF0', '#2E4A50'];
  const id = `${image.scene}-${sky.slice(1)}-${land.slice(1)}`;
  return (
    <svg
      viewBox="0 0 400 260"
      preserveAspectRatio="xMidYMid slice"
      className={`block h-full w-full ${className}`}
      role={label ? 'img' : undefined}
      aria-label={label ? image.alt : undefined}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky} />
          <stop offset="1" stopColor="#F6F8F7" />
        </linearGradient>
        <linearGradient id={`land-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={land} stopOpacity="0.55" />
          <stop offset="1" stopColor={land} />
        </linearGradient>
      </defs>
      <rect width="400" height="260" fill={`url(#sky-${id})`} />
      <circle cx="300" cy="70" r="26" fill="#F3C9B4" opacity="0.9" />
      <path d="M0 150 L60 95 L110 130 L170 70 L230 125 L290 85 L350 120 L400 95 L400 260 L0 260Z" fill={land} opacity="0.25" />
      <path d="M0 175 Q70 125 140 160 T280 150 T400 150 L400 260 L0 260Z" fill={land} opacity="0.5" />
      <SceneDetail kind={image.scene} land={land} id={id} />
    </svg>
  );
}

function SceneDetail({ kind, land, id }: { kind: ImageRef['scene']; land: string; id: string }) {
  const fill = `url(#land-${id})`;
  switch (kind) {
    case 'river':
      return (
        <>
          <path d="M0 200 Q100 170 200 195 T400 185 L400 260 L0 260Z" fill={fill} />
          <path d="M0 230 Q120 205 220 225 T400 215 L400 240 Q300 250 200 240 T0 250Z" fill="#E6EEF0" opacity="0.85" />
        </>
      );
    case 'forest':
      return (
        <>
          <path d="M0 200 Q120 175 220 195 T400 190 L400 260 L0 260Z" fill={fill} />
          {[30, 70, 105, 150, 250, 290, 330, 370].map((x, i) => (
            <path key={x} d={`M${x} ${215 - (i % 3) * 8} l14 -46 l14 46Z`} fill={land} opacity="0.9" />
          ))}
        </>
      );
    case 'monastery':
      return (
        <>
          <path d="M120 95 L160 55 L200 95Z M230 85 L265 50 L300 85Z" fill="#FFFFFF" opacity="0.85" />
          <path d="M0 205 Q120 180 220 200 T400 195 L400 260 L0 260Z" fill={fill} />
          <rect x="170" y="150" width="70" height="40" fill="#F7EBD9" />
          <path d="M162 152 L205 128 L248 152Z" fill="#B5462E" />
          <rect x="198" y="168" width="14" height="22" fill="#5A3A10" />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={110 + i * 14} y={140 + (i % 2) * 4} width="10" height="7" fill={['#B5462E', '#F3C9B4', '#2F6B5E', '#E9A07F', '#6E8C93'][i]} />
          ))}
        </>
      );
    case 'lake':
      return (
        <>
          <path d="M0 190 Q120 165 220 185 T400 180 L400 260 L0 260Z" fill={fill} />
          <ellipse cx="200" cy="222" rx="150" ry="20" fill="#E6EEF0" opacity="0.9" />
          <ellipse cx="160" cy="220" rx="40" ry="4" fill="#FFFFFF" opacity="0.8" />
        </>
      );
    case 'tea':
      return (
        <>
          <path d="M0 185 Q120 160 220 180 T400 175 L400 260 L0 260Z" fill={fill} />
          {[200, 215, 230, 245].map((y) => (
            <path key={y} d={`M0 ${y} Q100 ${y - 12} 200 ${y} T400 ${y}`} stroke="#9DB8AE" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.8" />
          ))}
        </>
      );
    case 'village':
      return (
        <>
          <path d="M0 195 Q120 170 220 190 T400 185 L400 260 L0 260Z" fill={fill} />
          {[90, 150, 230, 290].map((x, i) => (
            <g key={x}>
              <rect x={x} y={170 - i * 3} width="34" height="24" fill="#F7EBD9" />
              <path d={`M${x - 6} ${172 - i * 3} L${x + 17} ${152 - i * 3} L${x + 40} ${172 - i * 3}Z`} fill={i % 2 ? '#B5462E' : '#2E4A50'} />
            </g>
          ))}
        </>
      );
    case 'festival':
      return (
        <>
          <path d="M0 200 Q120 180 220 195 T400 190 L400 260 L0 260Z" fill={fill} />
          <path d="M40 120 Q200 160 360 120" stroke="#5A3A10" strokeWidth="1.5" fill="none" />
          {Array.from({ length: 12 }, (_, i) => {
            const x = 52 + i * 26;
            const y = 120 + Math.sin((i / 11) * Math.PI) * 20;
            return <path key={i} d={`M${x} ${y} l8 14 l8 -14Z`} fill={['#B5462E', '#E9A07F', '#2F6B5E', '#F3C9B4'][i % 4]} />;
          })}
          {[130, 200, 270].map((x) => (
            <circle key={x} cx={x} cy="205" r="9" fill="#17221C" opacity="0.8" />
          ))}
        </>
      );
    default:
      return <path d="M0 200 Q120 175 220 195 T400 190 L400 260 L0 260Z" fill={fill} />;
  }
}
