import React from 'react';

// Glassy, theme-aware letter avatar for contacts without a photo.
// Shows the first letter of the name on a frosted gradient matching the icon style.
// Hue is derived from the name so each contact is distinct, but stays in the violet/blue family.
function hueFor(name: string): number {
  let h = 0;
  for (let i = 0; i < (name || '').length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  // bias toward the brand violet–blue–cyan arc (200–280)
  return 200 + (h % 80);
}

export function LetterAvatar({
  name,
  init,
  size = 40,
  radius,
  className = '',
  style = {},
}: {
  name?: string;
  init?: string;
  size?: number;
  radius?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const letter = (init || (name || '?').trim()[0] || '?');
  const hue = hueFor(name || letter);
  const r = radius != null ? radius : Math.round(size * 0.34);
  const grad = `linear-gradient(155deg, hsl(${hue} 90% 72%), hsl(${hue + 24} 78% 52%))`;
  return (
    <div
      className={`letter-avatar relative flex-shrink-0 overflow-hidden flex items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: r,
        background: grad,
        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.5), inset 0 0 0 1px rgba(255,255,255,0.28), 0 4px 12px rgba(110,84,252,0.22)',
        ...style,
      }}
    >
      {/* gloss highlight */}
      <span
        className="absolute pointer-events-none"
        style={{ left: '-15%', top: '-25%', width: '85%', height: '85%', borderRadius: '50%', background: 'radial-gradient(circle at 32% 32%, rgba(255,255,255,0.6), rgba(255,255,255,0) 68%)' }}
      />
      <span
        className="relative"
        style={{ color: 'rgba(255,255,255,0.97)', fontWeight: 700, fontSize: Math.round(size * 0.42), lineHeight: 1, textShadow: '0 1px 2px rgba(60,40,140,0.28)' }}
      >
        {letter}
      </span>
    </div>
  );
}
