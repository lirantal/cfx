/**
 * Global theme configuration for the CLI.
 * Change the colors here to apply throughout the application.
 */
export const theme = {
  /**
   * Primary accent color used throughout the UI.
   * Supported values: standard terminal colors like 'cyan', 'blue', 'magenta', 'green', etc.
   * or hex colors like '#ff6600'
   */
  primaryColor: '#ff6600',
  
  /**
   * Success color used for completed states and checkmarks.
   * A warm lime green that harmonizes with the Cloudflare orange.
   */
  successColor: '#66cc33'
} as const

export type ThemeColor = typeof theme.primaryColor

