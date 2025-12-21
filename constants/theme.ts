/**
 * Theme constants - synced with web color palette
 * Light/Dark mode support
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    // Core
    background: '#FFFFFF',
    foreground: '#020817',
    text: '#020817',

    // Primary - Navy
    primary: '#0f172a',
    primaryForeground: '#f8fafc',

    // Secondary
    secondary: '#f1f5f9',
    secondaryForeground: '#0f172a',

    // Muted
    muted: '#f1f5f9',
    mutedForeground: '#64748b',

    // Accent
    accent: '#f1f5f9',
    accentForeground: '#0f172a',

    // Destructive (Errors/Delete)
    destructive: '#ef4444',
    destructiveForeground: '#FFFFFF',

    // Border
    border: '#e2e8f0',

    // Ring (Focus)
    ring: '#020817',

    // Status Colors
    success: '#22c55e',
    warning: '#f59e0b',
    info: '#3b82f6',

    // Tab/Icon
    tint: '#0f172a',
    icon: '#64748b',
    tabIconDefault: '#64748b',
    tabIconSelected: '#0f172a',
  },
  dark: {
    // Core
    background: '#020817',
    foreground: '#f8fafc',
    text: '#f8fafc',

    // Primary
    primary: '#f8fafc',
    primaryForeground: '#020817',

    // Secondary
    secondary: '#1e293b',
    secondaryForeground: '#f8fafc',

    // Muted
    muted: '#1e293b',
    mutedForeground: '#94a3b8',

    // Accent
    accent: '#1e293b',
    accentForeground: '#f8fafc',

    // Destructive
    destructive: '#7f1d1d',
    destructiveForeground: '#fef2f2',

    // Border
    border: '#1e293b',

    // Ring
    ring: '#f8fafc',

    // Status Colors
    success: '#16a34a',
    warning: '#d97706',
    info: '#2563eb',

    // Tab/Icon
    tint: '#f8fafc',
    icon: '#94a3b8',
    tabIconDefault: '#94a3b8',
    tabIconSelected: '#f8fafc',
  },
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Type helpers
export type ColorScheme = keyof typeof Colors;
export type ThemeColors = typeof Colors.light;

export default Colors;
