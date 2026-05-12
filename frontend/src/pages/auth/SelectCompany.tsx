import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, ChevronRight, LogOut, Plus, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function SelectCompanyPage() {
  const { companies, selectCompany, createCompany, logout, showToast } = useAuth()
  const [selecting, setSelecting] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleSelect = async (companyId: number) => {
    setSelecting(companyId)
    try {
      await selectCompany(companyId)
      navigate('/dashboard', { replace: true })
    } catch {
      showToast({ type: 'error', message: 'Erro ao selecionar empresa' })
      setSelecting(null)
    }
  }

  const handleCreate = async () => {
    if (newName.trim().length < 2) {
      showToast({ type: 'error', message: 'Nome deve ter ao menos 2 caracteres' })
      return
    }
    setSubmitting(true)
    try {
      await createCompany(newName.trim())
      showToast({ type: 'success', message: 'Empresa criada com sucesso' })
      setNewName('')
      setCreating(false)
    } catch {
      showToast({ type: 'error', message: 'Erro ao criar empresa' })
    } finally {
      setSubmitting(false)
    }
  }

  const ROLE_LABELS: Record<string, string> = {
    ADMIN: 'Administrador',
    MANAGER: 'Gerente',
    SUPERVISOR: 'Supervisor',
    OPERATOR: 'Operador',
    VIEWER: 'Visualizador',
  }

  return (
    <div className="min-h-svh grid lg:grid-cols-[1fr_480px]">
      <div className="hidden lg:flex flex-col justify-between bg-muted p-12 bg-neutral-400" />

      <div className="flex flex-col gap-8 items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-sm flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-color-text-primary">Selecione a empresa</h1>
            <p className="text-sm text-color-text-muted">
              Escolha com qual empresa você deseja trabalhar agora.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {companies.map((company) => (
              <button
                key={company.id}
                onClick={() => handleSelect(company.id)}
                disabled={selecting !== null || submitting}
                className="
                  flex items-center gap-4 w-full rounded-xl border border-color-border-default
                  bg-color-surface px-4 py-3 text-left
                  hover:border-color-primary hover:bg-color-bg-secondary
                  transition-colors duration-150
                  disabled:opacity-60 disabled:cursor-not-allowed
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-color-primary
                "
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-color-bg-secondary border border-color-border-default">
                  {selecting === company.id ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-color-primary border-t-transparent" />
                  ) : (
                    <Building2 className="h-5 w-5 text-color-text-secondary" />
                  )}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-medium text-color-text-primary truncate">{company.name}</span>
                  <span className="text-xs text-color-text-muted">
                    {ROLE_LABELS[company.role] ?? company.role}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-color-text-muted" />
              </button>
            ))}

            {companies.length === 0 && !creating && (
              <p className="text-sm text-color-text-muted text-center py-4">
                Nenhuma empresa associada a esta conta.
              </p>
            )}

            {creating ? (
              <div className="flex flex-col gap-2 rounded-xl border border-color-primary bg-color-bg-secondary px-4 py-3">
                <span className="text-sm font-medium text-color-text-primary">Nova empresa</span>
                <Input
                  autoFocus
                  placeholder="Nome da empresa"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreate()
                    if (e.key === 'Escape') { setCreating(false); setNewName('') }
                  }}
                  disabled={submitting}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={handleCreate}
                    disabled={submitting || newName.trim().length < 2}
                  >
                    {submitting ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      'Criar'
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { setCreating(false); setNewName('') }}
                    disabled={submitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setCreating(true)}
                disabled={selecting !== null}
                className="
                  flex items-center gap-3 w-full rounded-xl border border-dashed border-color-border-default
                  px-4 py-3 text-left text-sm text-color-text-muted
                  hover:border-color-primary hover:text-color-primary
                  transition-colors duration-150
                  disabled:opacity-60 disabled:cursor-not-allowed
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-color-primary
                "
              >
                <Plus className="h-4 w-4 shrink-0" />
                Criar nova empresa
              </button>
            )}
          </div>

          <Button
            variant="ghost"
            className="w-full gap-2 text-color-text-muted hover:text-color-text-primary"
            onClick={() => logout()}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
    </div>
  )
}
