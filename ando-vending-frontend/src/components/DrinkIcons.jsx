/**
 * Ando Tea House — Drink Icon Components
 *
 * Each drink in the menu has an associated icon.
 * To add a new icon: create a component and register it in ICON_MAP.
 */

function MatchaIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Steam wisps */}
      <path d="M30 18 C30 12, 34 10, 34 4" stroke="#556B2F" strokeWidth="1" strokeLinecap="round" opacity="0.4">
        <animate attributeName="d" values="M30 18 C30 12, 34 10, 34 4;M30 18 C28 12, 32 8, 34 2;M30 18 C30 12, 34 10, 34 4" dur="3s" repeatCount="indefinite" />
      </path>
      <path d="M40 16 C40 10, 44 8, 44 2" stroke="#556B2F" strokeWidth="1" strokeLinecap="round" opacity="0.3">
        <animate attributeName="d" values="M40 16 C40 10, 44 8, 44 2;M40 16 C38 10, 42 6, 44 0;M40 16 C40 10, 44 8, 44 2" dur="3.5s" repeatCount="indefinite" />
      </path>
      <path d="M50 18 C50 12, 46 10, 46 4" stroke="#556B2F" strokeWidth="1" strokeLinecap="round" opacity="0.35">
        <animate attributeName="d" values="M50 18 C50 12, 46 10, 46 4;M50 18 C52 12, 48 8, 46 2;M50 18 C50 12, 46 10, 46 4" dur="2.8s" repeatCount="indefinite" />
      </path>
      {/* Bowl */}
      <path d="M16 32 Q16 60, 40 64 Q64 60, 64 32" stroke="#556B2F" strokeWidth="1.2" fill="none" />
      {/* Surface */}
      <ellipse cx="40" cy="32" rx="24" ry="6" stroke="#556B2F" strokeWidth="1.2" fill="rgba(85, 107, 47, 0.06)" />
      {/* Chasen whisk marks */}
      <path d="M32 30 Q40 36, 48 30" stroke="#556B2F" strokeWidth="0.6" fill="none" opacity="0.3" />
      <path d="M34 32 Q40 37, 46 32" stroke="#556B2F" strokeWidth="0.6" fill="none" opacity="0.2" />
    </svg>
  )
}

function HojichaIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Steam wisps — warmer, slower for roasted tea */}
      <path d="M32 20 C32 14, 36 12, 36 6" stroke="#8B7355" strokeWidth="1" strokeLinecap="round" opacity="0.35">
        <animate attributeName="d" values="M32 20 C32 14, 36 12, 36 6;M32 20 C30 14, 34 10, 36 4;M32 20 C32 14, 36 12, 36 6" dur="3.5s" repeatCount="indefinite" />
      </path>
      <path d="M40 18 C40 12, 44 10, 44 4" stroke="#8B7355" strokeWidth="1" strokeLinecap="round" opacity="0.25">
        <animate attributeName="d" values="M40 18 C40 12, 44 10, 44 4;M40 18 C38 12, 42 8, 44 2;M40 18 C40 12, 44 10, 44 4" dur="4s" repeatCount="indefinite" />
      </path>
      <path d="M48 20 C48 14, 44 12, 44 6" stroke="#8B7355" strokeWidth="1" strokeLinecap="round" opacity="0.3">
        <animate attributeName="d" values="M48 20 C48 14, 44 12, 44 6;M48 20 C50 14, 46 10, 44 4;M48 20 C48 14, 44 12, 44 6" dur="3.2s" repeatCount="indefinite" />
      </path>
      {/* Tall cup */}
      <path d="M22 28 L20 60 Q20 66, 40 68 Q60 66, 60 60 L58 28" stroke="#8B7355" strokeWidth="1.2" fill="none" />
      {/* Liquid surface */}
      <ellipse cx="40" cy="28" rx="18" ry="5" stroke="#8B7355" strokeWidth="1.2" fill="rgba(139, 115, 85, 0.08)" />
      {/* Roasted tea leaf accent */}
      <path d="M36 38 Q40 34, 44 38" stroke="#8B7355" strokeWidth="0.6" fill="none" opacity="0.25" />
      <path d="M34 42 Q40 37, 46 42" stroke="#8B7355" strokeWidth="0.6" fill="none" opacity="0.15" />
    </svg>
  )
}

const ICON_MAP = {
  matcha: MatchaIcon,
  hojicha: HojichaIcon,
}

/**
 * Renders the correct icon for a drink based on its `icon` key.
 * Falls back to MatchaIcon if the key isn't found.
 */
export default function DrinkIcon({ iconKey, className }) {
  const IconComponent = ICON_MAP[iconKey] || MatchaIcon
  return <IconComponent className={className} />
}
