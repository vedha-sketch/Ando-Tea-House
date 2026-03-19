/**
 * Ando Cafe Design System
 * Japanese-Hawaiian minimalism aesthetic
 */

export const colors = {
  // Primary palette
  bgCream: '#FAF7ED',
  textDark: '#282C15',
  brandGreen: '#15452D',
  linkGreen: '#113626',

  // Secondary
  cardLight: '#F2F2F2',
  cardOffWhite: '#FAF9F5',
  nearBlack: '#141413',
  accentTerracotta: 'rgba(217, 119, 87, 0.15)',

  // Status colors
  success: '#15452D',
  warning: '#D97757',
  error: '#D97757',
};

export const typography = {
  // Font families
  lufga: '"Lufga", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  inter: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',

  // Display (Lufga Light)
  h1: {
    fontSize: '74px',
    lineHeight: '74px',
    fontFamily: '"Lufga", sans-serif',
    fontWeight: 300,
    letterSpacing: 'normal',
  },
  h2: {
    fontSize: '80px',
    lineHeight: '80px',
    fontFamily: '"Lufga", sans-serif',
    fontWeight: 300,
    letterSpacing: 'normal',
  },
  h3: {
    fontSize: '35px',
    lineHeight: 'auto',
    fontFamily: '"Lufga", sans-serif',
    fontWeight: 300,
    letterSpacing: 'normal',
  },
  subheading: {
    fontSize: '20px',
    lineHeight: '24px',
    fontFamily: '"Lufga", sans-serif',
    fontWeight: 700,
    letterSpacing: 'normal',
  },
  ctaLabel: {
    fontSize: '12px',
    fontFamily: '"Lufga", sans-serif',
    fontWeight: 700,
    letterSpacing: '2px',
    textTransform: 'uppercase',
  },

  // Body (Inter)
  body: {
    fontSize: '16px',
    lineHeight: '25.6px',
    fontFamily: '"Inter", sans-serif',
    fontWeight: 400,
    letterSpacing: 'normal',
  },
  bodySmall: {
    fontSize: '14px',
    fontFamily: '"Inter", sans-serif',
    fontWeight: 400,
  },
  label: {
    fontSize: '12px',
    fontFamily: '"Inter", sans-serif',
    fontWeight: 400,
    letterSpacing: '2px',
    textTransform: 'uppercase',
  },
};

export const spacing = {
  xs: '10px',
  sm: '18px',
  md: '30px',
  lg: '60px',
  xl: '120px',
};

export const borderRadius = {
  nav: '10px',
  card: '18px',
  button: '10px',
  avatar: '50%',
};

export const getCSSVariables = () => `
  --bg-cream: ${colors.bgCream};
  --text-dark: ${colors.textDark};
  --brand-green: ${colors.brandGreen};
  --link-green: ${colors.linkGreen};
  --card-light: ${colors.cardLight};
  --card-offwhite: ${colors.cardOffWhite};
  --accent-terracotta: ${colors.accentTerracotta};

  --spacing-xs: ${spacing.xs};
  --spacing-sm: ${spacing.sm};
  --spacing-md: ${spacing.md};
  --spacing-lg: ${spacing.lg};
  --spacing-xl: ${spacing.xl};

  --radius-nav: ${borderRadius.nav};
  --radius-card: ${borderRadius.card};
  --radius-button: ${borderRadius.button};
  --radius-avatar: ${borderRadius.avatar};
`;
