/**
 * Ando Chashitsu Design System
 * Zen aesthetic with matcha, cream, and amber
 */

export const colors = {
  // Zen Palette
  matcha: '#738065',
  matchaDark: '#5C6654',
  cream: '#FDFCF8',
  amber: '#FFBF00',
  white: '#FFFFFF',
  nearBlack: '#1A1A1A',

  // Neutrals
  stone200: '#E7E5E4',
  stone300: '#D7D5D3',
  stone400: '#A1A1A1',

  // Status
  success: '#738065',
  pending: '#FFBF00',
};

export const typography = {
  // Font families - Playfair & Inter
  playfair: '"Playfair Display", serif',
  inter: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',

  // Headers - Playfair Display
  h1: {
    fontSize: '48px',
    lineHeight: '56px',
    fontFamily: '"Playfair Display", serif',
    fontWeight: 600,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontSize: '36px',
    lineHeight: '44px',
    fontFamily: '"Playfair Display", serif',
    fontWeight: 600,
    letterSpacing: '-0.01em',
  },
  h3: {
    fontSize: '28px',
    lineHeight: '36px',
    fontFamily: '"Playfair Display", serif',
    fontWeight: 600,
  },

  // Body - Inter
  body: {
    fontSize: '16px',
    lineHeight: '24px',
    fontFamily: '"Inter", sans-serif',
    fontWeight: 400,
  },
  bodySmall: {
    fontSize: '14px',
    lineHeight: '22px',
    fontFamily: '"Inter", sans-serif',
    fontWeight: 400,
  },
  label: {
    fontSize: '12px',
    lineHeight: '18px',
    fontFamily: '"Inter", sans-serif',
    fontWeight: 500,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
};

export const spacing = {
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
};

export const borderRadius = {
  sm: '12px',
  md: '20px',
  lg: '48px',
  full: '9999px',
};

export const shadows = {
  sm: '0 2px 4px rgba(0,0,0,0.05)',
  md: '0 4px 12px rgba(0,0,0,0.08)',
  lg: '0 12px 32px rgba(0,0,0,0.12)',
  inner: 'inset 0 2px 4px rgba(0,0,0,0.03)',
};

export const getCSSVariables = () => `
  --color-matcha: ${colors.matcha};
  --color-matcha-dark: ${colors.matchaDark};
  --color-cream: ${colors.cream};
  --color-amber: ${colors.amber};
  --color-white: ${colors.white};
  --color-near-black: ${colors.nearBlack};

  --spacing-xs: ${spacing.xs};
  --spacing-sm: ${spacing.sm};
  --spacing-md: ${spacing.md};
  --spacing-lg: ${spacing.lg};
  --spacing-xl: ${spacing.xl};
  --spacing-xxl: ${spacing.xxl};

  --radius-sm: ${borderRadius.sm};
  --radius-md: ${borderRadius.md};
  --radius-lg: ${borderRadius.lg};
`;

// Stage mapping: Hardware stages (1-6) to User-facing views
export const stageMapping = {
  // Preparation view (stages 1-4)
  PREPARATION: {
    name: 'Preparation',
    stages: [1, 2, 3, 4],
    message: 'Ando is Crafting',
    color: colors.amber,
  },
  // Fulfillment view (stages 5-6)
  FULFILLMENT: {
    name: 'Fulfillment',
    stages: [5, 6],
    message: 'Ready for Pickup',
    color: colors.matcha,
  },
};
