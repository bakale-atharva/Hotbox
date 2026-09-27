/**
 * Hotbox brand tokens, shared with the admin panel (admin/app/globals.css).
 * Keep the hex values in sync between the two.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1c1917',
    textSecondary: '#78716c',
    background: '#fffaf5',
    backgroundElement: '#f5efe9',
    backgroundSelected: '#ede5dd',
    card: '#ffffff',
    border: '#ede5dd',
    input: '#e7ddd3',
    primary: '#e4572e',
    primaryForeground: '#ffffff',
    secondary: '#fdeee6',
    secondaryForeground: '#9a3412',
    destructive: '#dc2626',
    statusPending: '#d97706',
    statusCooking: '#e4572e',
    statusOutForDelivery: '#2563eb',
    statusDelivered: '#16a34a',
    statusCancelled: '#78716c',
  },
  dark: {
    text: '#f5f0eb',
    textSecondary: '#a8a29e',
    background: '#12100e',
    backgroundElement: '#262120',
    backgroundSelected: '#2e2826',
    card: '#1c1917',
    border: '#2e2826',
    input: '#3a3330',
    primary: '#f06a40',
    primaryForeground: '#ffffff',
    secondary: '#2a211c',
    secondaryForeground: '#fdba9a',
    destructive: '#ef4444',
    statusPending: '#fbbf24',
    statusCooking: '#f06a40',
    statusOutForDelivery: '#60a5fa',
    statusDelivered: '#4ade80',
    statusCancelled: '#a8a29e',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
export type Theme = (typeof Colors)['light' | 'dark'];

/** Matches the admin panel's `--radius` (0.875rem = 14px). */
export const Radius = {
  sm: 8,
  md: 11,
  lg: 14,
  xl: 20,
  pill: 999,
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const MaxContentWidth = 800;
