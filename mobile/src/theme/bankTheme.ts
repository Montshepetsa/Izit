// Digital Private Bank Theme System
// See: Design System Specification: The Architectural Analyst

export const bankTheme = {
  // Surfaces
  background: '#f8f9fb', // The canvas
  surface: '#f8f9fb', // For main backgrounds
  surfaceContainerLow: '#f3f4f6',
  surfaceContainerLowest: '#ffffff', // Cards
  surfaceContainerHigh: '#e7e8ea', // Headers/sidebars
  // Glass
  glass: 'rgba(255,255,255,0.7)',
  glassBlur: 20,
  // Primary
  primary: '#003d9b',
  primaryContainer: '#0052cc',
  onPrimary: '#ffffff',
  // Secondary
  secondary: '#006d37',
  // Tertiary
  tertiary: '#6c3500',
  // Error
  error: '#ba1a1a',
  // Outline
  outline: '#bfc2c7',
  outlineVariant: 'rgba(191,194,199,0.2)',
  // Text
  onSurface: '#191c1e',
  onSurfaceVariant: '#44474f',
  // Shadows
  shadow: 'rgba(25,28,30,0.06)', // 6% opacity
  // Gradients
  ctaGradient: ['#003d9b', '#0052cc'],
  // Typography
  fonts: {
    display: 'Manrope',
    body: 'Inter',
  },
  // Radii
  radii: {
    md: 12, // 0.75rem
    lg: 16, // 1rem
    xl: 24, // 1.5rem
  },
  // Spacing
  spacing: {
    section: 24,
    card: 16,
    gap: 16,
    headlineBreathing: 48,
  },
};
