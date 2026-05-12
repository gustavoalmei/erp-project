import { prisma } from '../../utils/prisma'
import { Theme } from '@prisma/client'

const DEFAULT_SETTINGS = {
  companyName: 'Minha Empresa',
  logoBase64: null as string | null,
  defaultTheme: Theme.system,
  colorPrimary: '#f24987',
  colorPrimaryHover: '#db3f78',
  colorPrimaryActive: '#c53569',
  colorAccent: '#b2bf4b',
  colorBgPrimary: '#ffffff',
  colorBgSecondary: '#f7f7f7',
  colorSurface: '#ffffff',
  colorTextPrimary: '#262626',
  colorTextSecondary: '#5f6b73',
  colorTextMuted: '#8c959c',
  colorTextInverse: '#ffffff',
  colorBorderDefault: '#d9d9d9',
  colorBorderStrong: '#5f6b73',
}

export interface UpdateSettingsData {
  companyName?: string
  defaultTheme?: Theme
  colorPrimary?: string
  colorPrimaryHover?: string
  colorPrimaryActive?: string
  colorAccent?: string
  colorBgPrimary?: string
  colorBgSecondary?: string
  colorSurface?: string
  colorTextPrimary?: string
  colorTextSecondary?: string
  colorTextMuted?: string
  colorTextInverse?: string
  colorBorderDefault?: string
  colorBorderStrong?: string
}

export const settingsService = {
  async getSettings(companyId: number) {
    const settings = await prisma.systemSettings.upsert({
      where: { companyId },
      create: { companyId, ...DEFAULT_SETTINGS },
      update: {},
    })
    const { logoBase64, ...rest } = settings
    return { ...rest, hasLogo: !!logoBase64 }
  },

  async getLogo(companyId: number) {
    const settings = await prisma.systemSettings.findUnique({
      where: { companyId },
      select: { logoBase64: true },
    })
    return { logoBase64: settings?.logoBase64 ?? null }
  },

  async updateSettings(companyId: number, data: UpdateSettingsData) {
    const settings = await prisma.systemSettings.upsert({
      where: { companyId },
      create: { companyId, ...DEFAULT_SETTINGS, ...data },
      update: data,
    })
    const { logoBase64, ...rest } = settings
    return { ...rest, hasLogo: !!logoBase64 }
  },

  async updateLogo(companyId: number, logoBase64: string) {
    await prisma.systemSettings.upsert({
      where: { companyId },
      create: { companyId, ...DEFAULT_SETTINGS, logoBase64 },
      update: { logoBase64 },
    })
  },

  async deleteLogo(companyId: number) {
    await prisma.systemSettings.upsert({
      where: { companyId },
      create: { companyId, ...DEFAULT_SETTINGS },
      update: { logoBase64: null },
    })
  },
}
