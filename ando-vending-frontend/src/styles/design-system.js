/**
 * Ando Tea House — Design System Tokens
 *
 * Centralized design tokens used across the app.
 * CSS files use these values directly as hardcoded hex/rem values
 * for simplicity — this file serves as the reference document
 * and is available for any JS-level usage.
 */

export const colors = {
  // Primary palette
  cream: '#F2F0E9',       // Page backgrounds
  forest: '#697062',      // Primary CTA buttons, active states
  olive: '#556B2F',       // Eyebrow text, accent labels, secondary icons
  muted: '#9c9a8e',       // Subtitles, helper text, placeholders
  text: '#1a1a1a',        // Primary text color
  matcha: '#738065',      // Progress ring, liquid fill accents

  // Glassmorphism
  cardBg: 'rgba(255, 255, 255, 0.55)',
  cardBorder: 'rgba(255, 255, 255, 0.5)',

  // Status
  error: '#b91c1c',
  errorBg: 'rgba(254, 226, 226, 0.7)',

  // Neutrals
  ringBg: '#eae7df',
  footerText: '#b5b3aa',
  disabled: '#c5c3ba',
}

export const typography = {
  playfair: '"Playfair Display", serif',
  inter: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
}

export const spacing = {
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
}

export const borderRadius = {
  sm: '14px',
  md: '24px',
  lg: '36px',
  pill: '50px',
}
