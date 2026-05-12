import type { Request, Response } from 'express'
import { settingsService } from './settings.service'
import { Theme } from '@prisma/client'

const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/
const VALID_THEMES: Theme[] = [Theme.light, Theme.dark, Theme.system]
const VALID_LOGO_MIME = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']
const MAX_LOGO_SIZE = 2 * 1024 * 1024

const COLOR_FIELDS = [
  'colorPrimary',
  'colorPrimaryHover',
  'colorPrimaryActive',
  'colorAccent',
  'colorBgPrimary',
  'colorBgSecondary',
  'colorSurface',
  'colorTextPrimary',
  'colorTextSecondary',
  'colorTextMuted',
  'colorTextInverse',
  'colorBorderDefault',
  'colorBorderStrong',
] as const

export const settingsController = {
  async getSettings(req: Request, res: Response) {
    try {
      if (!req.companyId) return res.status(403).json({ error: 'Empresa não identificada' })
      const settings = await settingsService.getSettings(req.companyId)
      return res.status(200).json(settings)
    } catch {
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  },

  async getLogo(req: Request, res: Response) {
    try {
      if (!req.companyId) return res.status(403).json({ error: 'Empresa não identificada' })
      const data = await settingsService.getLogo(req.companyId)
      return res.status(200).json(data)
    } catch {
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  },

  async updateSettings(req: Request, res: Response) {
    try {
      if (!req.companyId) return res.status(403).json({ error: 'Empresa não identificada' })

      const { companyName, defaultTheme, ...colors } = req.body

      if (defaultTheme !== undefined && !VALID_THEMES.includes(defaultTheme)) {
        return res.status(400).json({
          error: 'defaultTheme inválido. Use: light, dark ou system',
        })
      }

      for (const field of COLOR_FIELDS) {
        const value = colors[field]
        if (value !== undefined && !HEX_COLOR_REGEX.test(value)) {
          return res.status(400).json({
            error: `Cor inválida para ${field}. Use formato hex #rrggbb`,
          })
        }
      }

      const data: import('./settings.service').UpdateSettingsData = {}
      if (companyName !== undefined) data.companyName = String(companyName)
      if (defaultTheme !== undefined) data.defaultTheme = defaultTheme as Theme
      for (const field of COLOR_FIELDS) {
        if (colors[field] !== undefined) data[field] = colors[field] as string
      }

      const settings = await settingsService.updateSettings(req.companyId, data)
      return res.status(200).json(settings)
    } catch {
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  },

  async updateLogo(req: Request, res: Response) {
    try {
      if (!req.companyId) return res.status(403).json({ error: 'Empresa não identificada' })

      const { logo } = req.body

      if (!logo) {
        return res.status(400).json({ error: 'Campo logo é obrigatório' })
      }

      const match = (logo as string).match(/^data:([^;]+);base64,(.+)$/)
      if (!match) {
        return res.status(400).json({ error: 'Logo deve ser uma imagem em base64 válida' })
      }

      const mime = match[1]
      const base64Data = match[2]

      if (!VALID_LOGO_MIME.includes(mime)) {
        return res.status(400).json({
          error: 'Formato inválido. Use PNG, JPG, SVG ou WEBP',
        })
      }

      const sizeInBytes = Math.ceil((base64Data.length * 3) / 4)
      if (sizeInBytes > MAX_LOGO_SIZE) {
        return res.status(400).json({ error: 'Logo deve ter no máximo 2MB' })
      }

      await settingsService.updateLogo(req.companyId, logo as string)
      return res.status(200).json({ message: 'Logo atualizado com sucesso' })
    } catch {
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  },

  async deleteLogo(req: Request, res: Response) {
    try {
      if (!req.companyId) return res.status(403).json({ error: 'Empresa não identificada' })
      await settingsService.deleteLogo(req.companyId)
      return res.status(200).json({ message: 'Logo removido com sucesso' })
    } catch {
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  },
}
