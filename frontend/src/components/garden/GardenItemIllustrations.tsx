import React from 'react';

interface IllustrationProps {
  itemId: string;
  rotation?: number;
  stage?: 'seed' | 'sprout' | 'growing' | 'bloom';
  isWatered?: boolean;
  className?: string;
}

export const GardenItemIllustration: React.FC<IllustrationProps> = ({
  itemId,
  rotation = 0,
  stage = 'bloom',
  isWatered = false,
  className = 'w-full h-full'
}) => {
  const transformStyle = {
    transform: `rotate(${rotation}deg)`,
    transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
  };

  // If item is in early growth stage (seed/sprout/growing), render botanical life cycle
  if (itemId.startsWith('seed-') || stage === 'seed') {
    return (
      <svg viewBox="0 0 64 64" fill="none" className={className} style={transformStyle}>
        {/* Soil mound */}
        <ellipse cx="32" cy="46" rx="20" ry="8" fill={isWatered ? "#3e2723" : "#5d4037"} />
        <ellipse cx="32" cy="46" rx="14" ry="5" fill={isWatered ? "#2b1b17" : "#4e342e"} />
        {/* Seeds nestled in soil */}
        <ellipse cx="30" cy="44" rx="3.5" ry="2" fill="#d97706" transform="rotate(-15 30 44)" />
        <ellipse cx="35" cy="45" rx="3" ry="2" fill="#b45309" transform="rotate(20 35 45)" />
        {/* Tiny golden growth glow */}
        <circle cx="32" cy="43" r="3" fill="#fde047" opacity="0.4" />
      </svg>
    );
  }

  if (stage === 'sprout') {
    return (
      <svg viewBox="0 0 64 64" fill="none" className={className} style={transformStyle}>
        {/* Soil mound */}
        <ellipse cx="32" cy="50" rx="18" ry="7" fill={isWatered ? "#3e2723" : "#5d4037"} />
        {/* Sprout stem */}
        <path d="M32 50V34" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" />
        {/* Two baby cotyledon leaves */}
        <path d="M32 36C26 32 24 38 32 38" fill="#22c55e" stroke="#16a34a" strokeWidth="1" />
        <path d="M32 36C38 32 40 38 32 38" fill="#4ade80" stroke="#22c55e" strokeWidth="1" />
        {/* Water dew droplet */}
        {isWatered && <circle cx="32" cy="30" r="2" fill="#38bdf8" opacity="0.9" />}
      </svg>
    );
  }

  if (stage === 'growing') {
    return (
      <svg viewBox="0 0 64 64" fill="none" className={className} style={transformStyle}>
        {/* Soil base */}
        <ellipse cx="32" cy="52" rx="16" ry="6" fill={isWatered ? "#3e2723" : "#5d4037"} />
        {/* Robust stem */}
        <path d="M32 52V26" stroke="#15803d" strokeWidth="3.5" strokeLinecap="round" />
        {/* Emerging foliage leaves */}
        <path d="M32 42C20 38 18 48 32 46" fill="#16a34a" />
        <path d="M32 36C44 32 46 42 32 40" fill="#22c55e" />
        <path d="M32 30C22 24 24 32 32 30" fill="#4ade80" />
        {/* Closed flower bud */}
        <ellipse cx="32" cy="22" rx="4" ry="6" fill="#86efac" stroke="#16a34a" strokeWidth="1.5" />
        <circle cx="32" cy="20" r="2.5" fill="#facc15" opacity="0.7" />
      </svg>
    );
  }

  // Fully Mature Blooming Stage & Decor Catalog
  switch (itemId) {
    case 'vp-marigold':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} style={transformStyle}>
          <ellipse cx="32" cy="54" rx="8" ry="3" fill="#2d2822" opacity="0.3" />
          <path d="M32 54V32" stroke="#2e7d32" strokeWidth="3.5" strokeLinecap="round" />
          {/* Marigold foliage */}
          <path d="M32 46C24 42 22 48 22 48M32 42C40 38 42 44 42 44" stroke="#1b5e20" strokeWidth="2.5" strokeLinecap="round" />
          {/* Dense ruffled Marigold bloom */}
          <circle cx="32" cy="24" r="14" fill="#ea580c" />
          <circle cx="32" cy="24" r="11" fill="#f97316" />
          <circle cx="32" cy="24" r="8" fill="#f59e0b" />
          <circle cx="32" cy="24" r="5" fill="#fbbf24" />
          <circle cx="32" cy="24" r="2.5" fill="#fef08a" />
        </svg>
      );

    case 'vp-sunflower':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} style={transformStyle}>
          <ellipse cx="32" cy="54" rx="8" ry="3" fill="#2d2822" opacity="0.3" />
          <path d="M32 54V30" stroke="#15803d" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M32 44C22 40 20 48 20 48M32 38C44 34 44 42 44 42" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />
          {/* Radiant sunflower petals */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => (
            <ellipse
              key={deg}
              cx="32"
              cy="22"
              rx="4"
              ry="11"
              transform={`rotate(${deg} 32 22)`}
              fill="#fbbf24"
              stroke="#f59e0b"
              strokeWidth="0.8"
            />
          ))}
          {/* Seed core */}
          <circle cx="32" cy="22" r="7.5" fill="#78350f" stroke="#451a03" strokeWidth="1" />
          <circle cx="32" cy="22" r="5" fill="#92400e" />
          <circle cx="30" cy="20" r="1.5" fill="#b45309" opacity="0.8" />
        </svg>
      );

    case 'vp-rose':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} style={transformStyle}>
          <ellipse cx="32" cy="54" rx="8" ry="3" fill="#2d2822" opacity="0.3" />
          <path d="M32 54V30" stroke="#15803d" strokeWidth="3.5" strokeLinecap="round" />
          {/* Thorns & serrated leaves */}
          <path d="M32 46L29 44M32 40L35 38" stroke="#166534" strokeWidth="2" strokeLinecap="round" />
          <path d="M32 44C22 40 22 48 22 48M32 36C42 32 42 40 42 40" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" />
          {/* Layered Rose petals */}
          <circle cx="32" cy="22" r="12" fill="#e11d48" />
          <path d="M24 20C24 14 36 12 38 18C40 24 30 28 26 24" fill="#f43f5e" />
          <path d="M30 18C30 14 36 14 36 18C36 22 32 22 30 20" fill="#fda4af" />
        </svg>
      );

    case 'vp-daisy':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} style={transformStyle}>
          <ellipse cx="32" cy="54" rx="8" ry="3" fill="#2d2822" opacity="0.3" />
          <path d="M32 54V28" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />
          <path d="M32 44C24 40 24 48 24 48" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" />
          {/* White petals */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
            <ellipse
              key={deg}
              cx="32"
              cy="24"
              rx="3.5"
              ry="10"
              transform={`rotate(${deg} 32 24)`}
              fill="#ffffff"
              stroke="#e2e8f0"
              strokeWidth="0.8"
            />
          ))}
          {/* Center disc */}
          <circle cx="32" cy="24" r="6" fill="#facc15" stroke="#eab308" strokeWidth="1" />
          <circle cx="32" cy="24" r="4" fill="#f59e0b" />
        </svg>
      );

    case 'vp-monstera':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} style={transformStyle}>
          <circle cx="32" cy="54" r="7" fill="#2d2822" opacity="0.3" />
          <path d="M32 54V28" stroke="#1b4d2e" strokeWidth="3" strokeLinecap="round" />
          <path
            d="M32 28C22 18 14 26 15 38C15.8 47 25 50 32 44C39 50 48.2 47 49 38C50 26 42 18 32 28Z"
            fill="#2e8b57"
          />
          <path d="M32 28C24 16 18 22 20 32M32 28C40 16 46 22 44 32" stroke="#1b4d2e" strokeWidth="2" strokeLinecap="round" />
          {/* Fenestrations */}
          <ellipse cx="26" cy="32" rx="2" ry="4" transform="rotate(-25 26 32)" fill="#fbf9f4" />
          <ellipse cx="38" cy="32" rx="2" ry="4" transform="rotate(25 38 32)" fill="#fbf9f4" />
          <ellipse cx="25" cy="40" rx="1.5" ry="3" transform="rotate(-35 25 40)" fill="#fbf9f4" />
          <ellipse cx="39" cy="40" rx="1.5" ry="3" transform="rotate(35 39 40)" fill="#fbf9f4" />
          <path d="M32 28V46" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case 'vp-lavender':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} style={transformStyle}>
          <circle cx="32" cy="54" r="6" fill="#2d2822" opacity="0.3" />
          <path d="M32 54V24M26 54L23 28M38 54L41 28" stroke="#3f6212" strokeWidth="2" strokeLinecap="round" />
          {[
            { cx: 32, cy: 16 }, { cx: 32, cy: 21 }, { cx: 32, cy: 26 }, { cx: 32, cy: 31 },
            { cx: 23, cy: 20 }, { cx: 23, cy: 25 }, { cx: 23, cy: 30 },
            { cx: 41, cy: 20 }, { cx: 41, cy: 25 }, { cx: 41, cy: 30 }
          ].map((pos, i) => (
            <ellipse key={i} cx={pos.cx} cy={pos.cy} rx="3" ry="2" fill="#9333ea" stroke="#7e22ce" strokeWidth="0.5" />
          ))}
          <path d="M22 48C28 44 32 52 32 52C32 52 36 44 42 48" stroke="#4d7c0f" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'vp-hibiscus':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} style={transformStyle}>
          <ellipse cx="32" cy="54" rx="8" ry="3" fill="#2d2822" opacity="0.3" />
          <path d="M32 54V28" stroke="#15803d" strokeWidth="3" strokeLinecap="round" />
          <circle cx="32" cy="24" r="14" fill="#dc2626" />
          <circle cx="32" cy="24" r="10" fill="#ef4444" />
          <circle cx="32" cy="24" r="6" fill="#f87171" />
          {/* Long prominent golden stamen */}
          <path d="M32 24L38 12" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="38" cy="12" r="2.5" fill="#fde047" />
        </svg>
      );

    case 'vp-bonsai':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} style={transformStyle}>
          <ellipse cx="32" cy="52" rx="14" ry="4" fill="#3f3f46" stroke="#27272a" strokeWidth="1.5" />
          <path d="M32 50C30 40 38 36 34 26" stroke="#713f12" strokeWidth="5" strokeLinecap="round" />
          <path d="M35 34C42 30 44 26 44 24M32 38C24 35 20 30 20 28" stroke="#713f12" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="34" cy="20" rx="9" ry="5" fill="#15803d" />
          <ellipse cx="44" cy="23" rx="7" ry="4" fill="#16a34a" />
          <ellipse cx="20" cy="27" rx="7" ry="4" fill="#15803d" />
        </svg>
      );

    /* TERRAIN TILES & LANDSCAPE */
    case 'tile-soil-bed':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} style={transformStyle}>
          <rect x="4" y="4" width="56" height="56" rx="12" fill={isWatered ? "#3e2723" : "#5d4037"} stroke="#3e2723" strokeWidth="2" />
          {/* Organic rich soil ridges */}
          <path d="M12 18H52M12 32H52M12 46H52" stroke={isWatered ? "#271612" : "#4e342e"} strokeWidth="3" strokeLinecap="round" strokeDasharray="6 4" />
          {isWatered && <circle cx="48" cy="16" r="3" fill="#38bdf8" opacity="0.6" />}
        </svg>
      );

    case 'tile-cobblestone':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} style={transformStyle}>
          <rect x="4" y="4" width="56" height="56" rx="10" fill="#78716c" stroke="#57534e" strokeWidth="2" />
          {/* Natural pavers */}
          <rect x="8" y="8" width="22" height="22" rx="4" fill="#a8a29e" stroke="#57534e" strokeWidth="1" />
          <rect x="34" y="8" width="22" height="22" rx="4" fill="#928e88" stroke="#57534e" strokeWidth="1" />
          <rect x="8" y="34" width="22" height="22" rx="4" fill="#928e88" stroke="#57534e" strokeWidth="1" />
          <rect x="34" y="34" width="22" height="22" rx="4" fill="#a8a29e" stroke="#57534e" strokeWidth="1" />
        </svg>
      );

    case 'tile-stepping-stone':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} style={transformStyle}>
          <ellipse cx="26" cy="26" rx="16" ry="12" fill="#d6d3d1" stroke="#78716c" strokeWidth="2" />
          <ellipse cx="42" cy="44" rx="12" ry="9" fill="#a8a29e" stroke="#78716c" strokeWidth="1.5" />
          <circle cx="20" cy="42" r="4" fill="#78716c" opacity="0.4" />
        </svg>
      );

    case 'tile-pond':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} style={transformStyle}>
          {/* Sparkling water basin */}
          <ellipse cx="32" cy="32" rx="26" ry="22" fill="#0284c7" stroke="#0369a1" strokeWidth="3" />
          <ellipse cx="32" cy="32" rx="21" ry="17" fill="#38bdf8" opacity="0.8" />
          {/* Floating water lily pad */}
          <circle cx="24" cy="28" r="8" fill="#16a34a" />
          <path d="M24 28L32 26" stroke="#0284c7" strokeWidth="2" />
          {/* Lotus flower */}
          <circle cx="23" cy="27" r="3.5" fill="#f472b6" />
          <circle cx="23" cy="27" r="1.5" fill="#fef08a" />
          {/* Subtle water ripple */}
          <ellipse cx="42" cy="38" rx="7" ry="3" stroke="#e0f2fe" strokeWidth="1.5" fill="none" />
        </svg>
      );

    case 'dec-fountain':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} style={transformStyle}>
          <ellipse cx="32" cy="50" rx="22" ry="8" fill="#64748b" stroke="#334155" strokeWidth="2" />
          <ellipse cx="32" cy="50" rx="18" ry="6" fill="#38bdf8" />
          {/* Center stone column */}
          <rect x="28" y="24" width="8" height="26" rx="2" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
          {/* Upper tier basin */}
          <ellipse cx="32" cy="24" rx="12" ry="4" fill="#64748b" stroke="#334155" strokeWidth="1.5" />
          <ellipse cx="32" cy="24" rx="9" ry="3" fill="#38bdf8" />
          {/* Water spray jets */}
          <path d="M32 20C30 10 20 14 20 22M32 20C34 10 44 14 44 22" stroke="#e0f2fe" strokeWidth="2" strokeLinecap="round" />
          <circle cx="32" cy="12" r="2" fill="#bae6fd" />
        </svg>
      );

    case 'dec-bench':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} style={transformStyle}>
          <ellipse cx="32" cy="52" rx="18" ry="4" fill="#2d2822" opacity="0.3" />
          {/* Cast iron legs */}
          <path d="M16 52V36M48 52V36M22 52V36M42 52V36" stroke="#27272a" strokeWidth="2.5" strokeLinecap="round" />
          {/* Wooden slatted seat */}
          <rect x="12" y="34" width="40" height="7" rx="2" fill="#d97706" stroke="#92400e" strokeWidth="1.5" />
          {/* Wooden backrest */}
          <rect x="12" y="22" width="40" height="9" rx="2" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
        </svg>
      );

    case 'dec-lantern':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} style={transformStyle}>
          <ellipse cx="32" cy="54" rx="10" ry="4" fill="#2d2822" opacity="0.3" />
          {/* Stone pagoda base */}
          <rect x="28" y="44" width="8" height="10" rx="1" fill="#78716c" stroke="#44403c" strokeWidth="1.5" />
          {/* Firebox with warm amber glow */}
          <rect x="24" y="26" width="16" height="18" rx="3" fill="#fef08a" stroke="#44403c" strokeWidth="2" />
          <circle cx="32" cy="35" r="5" fill="#f59e0b" />
          {/* Pagoda roof */}
          <path d="M16 26L32 14L48 26Z" fill="#57534e" stroke="#292524" strokeWidth="2" />
          <circle cx="32" cy="12" r="2.5" fill="#78716c" />
        </svg>
      );

    case 'dec-cottage':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} style={transformStyle}>
          <ellipse cx="32" cy="54" rx="24" ry="6" fill="#2d2822" opacity="0.3" />
          {/* Cottage stone walls */}
          <rect x="14" y="26" width="36" height="26" rx="3" fill="#fed7aa" stroke="#c2410c" strokeWidth="2" />
          {/* Thatched roof */}
          <path d="M8 28L32 10L56 28Z" fill="#b45309" stroke="#78350f" strokeWidth="2.5" />
          {/* Wooden door */}
          <rect x="26" y="36" width="12" height="16" rx="2" fill="#92400e" stroke="#451a03" strokeWidth="1.5" />
          <circle cx="35" cy="44" r="1" fill="#fef08a" />
          {/* Window */}
          <rect x="18" y="32" width="6" height="8" rx="1" fill="#7dd3fc" stroke="#0369a1" strokeWidth="1" />
        </svg>
      );

    case 'dec-fence':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} style={transformStyle}>
          {/* Horizontal rails */}
          <rect x="6" y="26" width="52" height="4" rx="1" fill="#d97706" stroke="#92400e" strokeWidth="1" />
          <rect x="6" y="42" width="52" height="4" rx="1" fill="#d97706" stroke="#92400e" strokeWidth="1" />
          {/* Vertical pickets */}
          {[12, 24, 36, 48].map(x => (
            <path key={x} d={`M${x} 52V18L${x + 4} 14L${x + 8} 18V52Z`} fill="#fde68a" stroke="#b45309" strokeWidth="1.2" />
          ))}
        </svg>
      );

    case 'dec-pot-terracotta':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} style={transformStyle}>
          <ellipse cx="32" cy="54" rx="10" ry="3" fill="#2d2822" opacity="0.3" />
          <path d="M22 28L25 50H39L42 28Z" fill="#c2410c" stroke="#7c2d12" strokeWidth="2" />
          <rect x="20" y="24" width="24" height="6" rx="2" fill="#ea580c" stroke="#7c2d12" strokeWidth="1.5" />
          <ellipse cx="32" cy="24" rx="10" ry="2.5" fill="#451a03" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} style={transformStyle}>
          <circle cx="32" cy="32" r="20" fill="#10b981" opacity="0.8" />
          <circle cx="32" cy="32" r="10" fill="#047857" />
        </svg>
      );
  }
};
