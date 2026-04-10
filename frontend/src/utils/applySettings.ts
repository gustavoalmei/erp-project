import type { SystemSettings } from '@/types'

export const CSS_VAR_MAP: Record<string, string> = {
  colorPrimary: '--color-primary',
  colorPrimaryHover: '--color-primary-hover',
  colorPrimaryActive: '--color-primary-active',
  colorAccent: '--color-accent',
  colorBgPrimary: '--color-bg-primary',
  colorBgSecondary: '--color-bg-secondary',
  colorSurface: '--color-surface',
  colorTextPrimary: '--color-text-primary',
  colorTextSecondary: '--color-text-secondary',
  colorTextMuted: '--color-text-muted',
  colorTextInverse: '--color-text-inverse',
  colorBorderDefault: '--color-border-default',
  colorBorderStrong: '--color-border-strong',
}

export function applySettingsColors(settings: Partial<SystemSettings>) {
  Object.entries(CSS_VAR_MAP).forEach(([key, cssVar]) => {
    const value = settings[key as keyof SystemSettings]
    if (typeof value === 'string') {
      document.documentElement.style.setProperty(cssVar, value)
    }
  })
}
