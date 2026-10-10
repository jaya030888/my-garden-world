import React from 'react';

interface IllustrationProps {
  itemId: string;
  rotation?: number;
  className?: string;
}

export const GardenItemIllustration: React.FC<IllustrationProps> = ({
  itemId,
  rotation = 0,
  className = 'w-full h-full'
}) => {
  const transformStyle = {
    transform: `rotate(${rotation}deg)`,
    transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
  };

  switch (itemId) {
    case 'vp-monstera':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} style={transformStyle}>
          <circle cx="32" cy="54" r="7" fill="#2d2822" opacity="0.3" />
          <path d="M32 54V28" stroke="#1b4d2e" strokeWidth="3" strokeLinecap="round" />
          <path
            d="M32 28C22 18 14 26 15 38C15.8 47 25 50 32 44C39 50 48.2 47 49 38C50 26 42 18 32 28Z"
            fill="#2e8b57"
          />
          <path
            d="M32 28C24 16 18 22 20 32M32 28C40 16 46 22 44 32"
            stroke="#1b4d2e"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Fenestrations / holes */}
          <ellipse cx="26" cy="32" rx="2" ry="4" transform="rotate(-25 26 32)" fill="#fbf9f4" />
          <ellipse cx="38" cy="32" rx="2" ry="4" transform="rotate(25 38 32)" fill="#fbf9f4" />
          <ellipse cx="25" cy="40" rx="1.5" ry="3" transform="rotate(-35 25 40)" fill="#fbf9f4" />
          <ellipse cx="39" cy="40" rx="1.5" ry="3" transform="rotate(35 39 40)" fill="#fbf9f4" />
          <path d="M32 28V46" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case 'vp-sunflower':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} style={transformStyle}>
          <circle cx="32" cy="54" r="6" fill="#2d2822" opacity="0.3" />
          <path d="M32 54V32" stroke="#22643a" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M32 42C24 40 22 46 22 46" stroke="#2e8b57" strokeWidth="2.5" strokeLinecap="round" />
          {/* Petals */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => (
            <ellipse
              key={deg}
              cx="32"
              cy="24"
              rx="4"
              ry="11"
              transform={`rotate(${deg} 32 24)`}
              fill="#fbbf24"
              stroke="#f59e0b"
              strokeWidth="0.8"
            />
          ))}
          {/* Center disc */}
          <circle cx="32" cy="24" r="7.5" fill="#78350f" stroke="#451a03" strokeWidth="1" />
          <circle cx="32" cy="24" r="5" fill="#92400e" />
          <circle cx="30" cy="22" r="1.5" fill="#b45309" opacity="0.8" />
        </svg>
      );

    case 'vp-lavender':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} style={transformStyle}>
          <circle cx="32" cy="54" r="6" fill="#2d2822" opacity="0.3" />
          {/* Stems */}
          <path d="M32 54V24M26 54L23 28M38 54L41 28" stroke="#3f6212" strokeWidth="2" strokeLinecap="round" />
          {/* Flowers */}
          {[
            { cx: 32, cy: 16 }, { cx: 32, cy: 21 }, { cx: 32, cy: 26 }, { cx: 32, cy: 31 },
            { cx: 23, cy: 20 }, { cx: 23, cy: 25 }, { cx: 23, cy: 30 },
            { cx: 41, cy: 20 }, { cx: 41, cy: 25 }, { cx: 41, cy: 30 }
          ].map((pos, i) => (
            <ellipse key={i} cx={pos.cx} cy={pos.cy} rx="3" ry="2" fill="#9333ea" stroke="#7e22ce" strokeWidth="0.5" />
          ))}
          {/* Foliage base */}
          <path d="M22 48C28 44 32 52 32 52C32 52 36 44 42 48" stroke="#4d7c0f" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'vp-bonsai':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} style={transformStyle}>
          <ellipse cx="32" cy="52" rx="14" ry="4" fill="#3f3f46" stroke="#27272a" strokeWidth="1.5" />
          <path d="M32 50C30 40 38 36 34 26" stroke="#713f12" strokeWidth="5" strokeLinecap="round" />
          <path d="M35 34C42 30 44 26 44 24M32 38C24 35 20 30 20 28" stroke="#713f12" strokeWidth="3" strokeLinecap="round" />
          {/* Cloud foliage */}
          <ellipse cx="34" cy="20" rx="9" ry="5" fill="#15803d" />
          <ellipse cx="44" cy="23" rx="7" ry="4" fill="#16a34a" />
          <ellipse cx="20" cy="27" rx="7" ry="4" fill="#15803d" />
        </svg>
      );

    case 'pot-terracotta':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} style={transformStyle}>
          <ellipse cx="32" cy="54" rx="12" ry="4" fill="#2d2822" opacity="0.3" />
          <path d="M20 32H44L40 50H24L20 32Z" fill="#c2410c" stroke="#9a3412" strokeWidth="1.5" />
          <rect x="18" y="27" width="28" height="6" rx="2" fill="#ea580c" stroke="#9a3412" strokeWidth="1.5" />
          <ellipse cx="32" cy="27" rx="13" ry="3" fill="#7c2d12" />
        </svg>
      );

    case 'pot-ceramic-teal':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} style={transformStyle}>
          <ellipse cx="32" cy="54" rx="12" ry="4" fill="#2d2822" opacity="0.3" />
          <path d="M21 30H43C43 45 39 52 32 52C25 52 21 45 21 30Z" fill="#0d9488" stroke="#115e59" strokeWidth="1.5" />
          <ellipse cx="32" cy="30" rx="11" ry="3" fill="#14b8a6" stroke="#115e59" strokeWidth="1.2" />
          <path d="M25 38C29 40 35 40 39 38" stroke="#ccfbf1" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case 'pot-marble-gold':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} style={transformStyle}>
          <ellipse cx="32" cy="54" rx="13" ry="4" fill="#2d2822" opacity="0.3" />
          <rect x="20" y="28" width="24" height="24" rx="4" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
          <rect x="18" y="25" width="28" height="5" rx="1.5" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
          <rect x="20" y="48" width="24" height="3" rx="1" fill="#f59e0b" />
          <path d="M26 34L32 44L38 36" stroke="#e2e8f0" strokeWidth="1" strokeLinecap="round" />
        </svg>
      );

    case 'dec-birdbath':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} style={transformStyle}>
          <ellipse cx="32" cy="55" rx="12" ry="4" fill="#2d2822" opacity="0.3" />
          <path d="M29 52H35V38H29V52Z" fill="#64748b" stroke="#475569" strokeWidth="1.2" />
          <path d="M26 53H38V55H26V53Z" fill="#475569" />
          {/* Basin */}
          <ellipse cx="32" cy="35" rx="16" ry="6" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
          <ellipse cx="32" cy="34" rx="13" ry="4" fill="#38bdf8" />
          {/* Bird */}
          <path d="M41 29C43 27 46 29 44 32C42 32 40 31 41 29Z" fill="#0284c7" />
        </svg>
      );

    case 'dec-solar-lantern':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} style={transformStyle}>
          <ellipse cx="32" cy="55" rx="8" ry="3" fill="#2d2822" opacity="0.3" />
          <path d="M32 54V22" stroke="#1c1917" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M32 22C32 20 37 18 39 21V25" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" />
          {/* Lantern Cage */}
          <rect x="34" y="24" width="10" height="14" rx="2" fill="#fed7aa" stroke="#292524" strokeWidth="1.5" />
          <circle cx="39" cy="31" r="3" fill="#f59e0b" />
          <path d="M37 22H41L39 19L37 22Z" fill="#292524" />
        </svg>
      );

    case 'dec-zen-fountain':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} style={transformStyle}>
          <ellipse cx="32" cy="54" rx="14" ry="4" fill="#2d2822" opacity="0.3" />
          {/* Stone Basin */}
          <ellipse cx="32" cy="46" rx="14" ry="7" fill="#52525b" stroke="#27272a" strokeWidth="1.5" />
          <ellipse cx="32" cy="44" rx="11" ry="5" fill="#0284c7" />
          {/* Bamboo Spout */}
          <path d="M24 26V42" stroke="#65a30d" strokeWidth="3" strokeLinecap="round" />
          <path d="M24 30L34 35" stroke="#84cc16" strokeWidth="3" strokeLinecap="round" />
          {/* Water Stream */}
          <path d="M33 36C33 40 32 43 32 44" stroke="#7dd3fc" strokeWidth="1.5" strokeDasharray="2 2" />
        </svg>
      );

    case 'dec-stepping-stones':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} style={transformStyle}>
          <ellipse cx="24" cy="26" rx="9" ry="6" fill="#78716c" stroke="#57534e" strokeWidth="1.5" />
          <ellipse cx="40" cy="38" rx="11" ry="7" fill="#a8a29e" stroke="#78716c" strokeWidth="1.5" />
          <ellipse cx="25" cy="48" rx="8" ry="5" fill="#78716c" stroke="#57534e" strokeWidth="1.5" />
          <circle cx="37" cy="24" r="3" fill="#22c55e" opacity="0.6" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} style={transformStyle}>
          <circle cx="32" cy="32" r="16" fill="#22c55e" opacity="0.2" stroke="#16a34a" strokeWidth="2" />
          <path d="M32 42V22M24 28C28 22 36 22 40 28" stroke="#15803d" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
};
