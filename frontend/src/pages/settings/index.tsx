import { useEffect, useRef, useState } from 'react'
import { settingsService } from '@/services/api'
import type { SystemSettings } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings as SettingsIcon, Upload, X, RotateCcw, Save } from 'lucide-react'
import { toast } from 'react-toastify'
import { applySettingsColors, CSS_VAR_MAP } from '@/utils/applySettings'

type SettingsForm = Omit<SystemSettings, 'id' | 'hasLogo'>

const DEFAULT_SETTINGS: SettingsForm = {
  companyName: 'Minha Empresa',
  defaultTheme: 'system',
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

const COLOR_GROUPS = [
  {
    label: 'Cor Primária',
    fields: [
      { key: 'colorPrimary', label: 'Primária' },
      { key: 'colorPrimaryHover', label: 'Hover' },
      { key: 'colorPrimaryActive', label: 'Active' },
    ],
  },
  {
    label: 'Destaque (Accent)',
    fields: [{ key: 'colorAccent', label: 'Accent' }],
  },
  {
    label: 'Fundos',
    fields: [
      { key: 'colorBgPrimary', label: 'Fundo Principal' },
      { key: 'colorBgSecondary', label: 'Fundo Secundário' },
      { key: 'colorSurface', label: 'Superfície' },
    ],
  },
  {
    label: 'Textos',
    fields: [
      { key: 'colorTextPrimary', label: 'Texto Principal' },
      { key: 'colorTextSecondary', label: 'Texto Secundário' },
      { key: 'colorTextMuted', label: 'Texto Suave' },
      { key: 'colorTextInverse', label: 'Texto Inverso' },
    ],
  },
  {
    label: 'Bordas',
    fields: [
      { key: 'colorBorderDefault', label: 'Borda Padrão' },
      { key: 'colorBorderStrong', label: 'Borda Forte' },
    ],
  },
] as const

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 rounded-md cursor-pointer border border-color-border-default p-0.5 bg-color-surface"
      />
      <div className="flex flex-col gap-0.5 flex-1">
        <span className="text-xs text-color-text-secondary">{label}</span>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 text-xs font-mono bg-color-surface border-color-border-default text-color-text-primary"
          maxLength={7}
          placeholder="#000000"
        />
      </div>
    </div>
  )
}

export function Settings() {
  const [form, setForm] = useState<SettingsForm>(DEFAULT_SETTINGS)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [newLogo, setNewLogo] = useState<string | null>(null)
  const [removeLogoFlag, setRemoveLogoFlag] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const savedFormRef = useRef<SettingsForm | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    try {
      setLoading(true)
      const [settings, logoData] = await Promise.all([
        settingsService.getSettings(),
        settingsService.getLogo(),
      ])
      const { id: _id, hasLogo: _hasLogo, ...formData } = settings
      setForm(formData)
      savedFormRef.current = formData
      setLogoPreview(logoData.logoBase64)
    } catch {
      toast.error('Erro ao carregar configurações.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    return () => {
      // Revert CSS vars on unmount if user didn't save
      if (savedFormRef.current) {
        applySettingsColors(savedFormRef.current)
      }
    }
  }, [])

  const handleColorChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    const cssVar = CSS_VAR_MAP[field]
    if (cssVar) document.documentElement.style.setProperty(cssVar, value)
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error('Formato inválido. Use PNG, JPG, SVG ou WEBP.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo deve ter no máximo 2MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string
      setNewLogo(base64)
      setLogoPreview(base64)
      setRemoveLogoFlag(false)
    }
    reader.readAsDataURL(file)
  }

  const handleLogoRemove = () => {
    setLogoPreview(null)
    setNewLogo(null)
    setRemoveLogoFlag(true)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      if (removeLogoFlag) await settingsService.deleteLogo()
      if (newLogo) await settingsService.updateLogo(newLogo)
      await settingsService.updateSettings(form)

      savedFormRef.current = form
      setNewLogo(null)
      setRemoveLogoFlag(false)
      window.dispatchEvent(new CustomEvent('settings-updated'))
      toast.success('Configurações salvas com sucesso.')
    } catch {
      toast.error('Erro ao salvar configurações.')
    } finally {
      setSaving(false)
    }
  }

  const handleRestoreDefaults = async () => {
    setForm(DEFAULT_SETTINGS)
    applySettingsColors(DEFAULT_SETTINGS)
    try {
      setSaving(true)
      await settingsService.updateSettings(DEFAULT_SETTINGS)
      savedFormRef.current = DEFAULT_SETTINGS
      window.dispatchEvent(new CustomEvent('settings-updated'))
      toast.success('Configurações restauradas para o padrão.')
    } catch {
      toast.error('Erro ao restaurar configurações.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card className="p-4 border-color-border-default">
        <div className="flex items-center gap-3">
          <SettingsIcon className="w-6 h-6 text-color-text-primary" />
          <h1 className="text-2xl font-bold text-color-text-primary">Configurações</h1>
        </div>
        <p className="text-color-text-secondary mt-4">Carregando...</p>
      </Card>
    )
  }

  return (
    <Card className="p-4 border-color-border-default cursor-default">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <SettingsIcon className="w-6 h-6 text-color-text-primary" />
          <h1 className="text-2xl font-bold text-color-text-primary">Configurações</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={handleRestoreDefaults}
            disabled={saving}
            className="flex items-center gap-2 text-color-text-secondary hover:text-color-text-primary"
          >
            <RotateCcw className="w-4 h-4" />
            Restaurar padrões
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-color-primary hover:bg-color-primary-hover text-color-text-primary"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Bloco 1 — Identidade */}
        <Card className="border-color-border-default shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-color-text-primary text-base">Identidade</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {/* Logo */}
            <div className="flex flex-col gap-2">
              <Label className="text-color-text-primary">Logo da empresa</Label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-lg border border-color-border-default bg-color-surface flex items-center justify-center overflow-hidden">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo da empresa"
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <span className="text-xs text-color-text-muted text-center px-2">Sem logo</span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 border border-color-border-default text-color-text-primary hover:bg-color-surface"
                  >
                    <Upload className="w-4 h-4" />
                    Enviar logo
                  </Button>
                  {logoPreview && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogoRemove}
                      className="flex items-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <X className="w-4 h-4" />
                      Remover
                    </Button>
                  )}
                  <p className="text-xs text-color-text-muted">PNG, JPG, SVG ou WEBP · máx. 2MB</p>
                </div>
              </div>
            </div>

            {/* Nome da empresa */}
            <div className="flex flex-col gap-2 max-w-sm">
              <Label className="text-color-text-primary">Nome da empresa</Label>
              <Input
                value={form.companyName}
                onChange={(e) => setForm((prev) => ({ ...prev, companyName: e.target.value }))}
                className="bg-color-surface border-color-border-default text-color-text-primary"
                placeholder="Minha Empresa"
              />
            </div>
          </CardContent>
        </Card>

        {/* Bloco 2 — Aparência */}
        <Card className="border-color-border-default shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-color-text-primary text-base">Aparência</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {/* Color pickers por grupo */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {COLOR_GROUPS.map((group) => (
                <div key={group.label} className="flex flex-col gap-3">
                  <p className="text-sm font-medium text-color-text-primary">{group.label}</p>
                  {group.fields.map((field) => (
                    <ColorField
                      key={field.key}
                      label={field.label}
                      value={form[field.key as keyof SettingsForm] as string}
                      onChange={(v) => handleColorChange(field.key, v)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Card>
  )
}
