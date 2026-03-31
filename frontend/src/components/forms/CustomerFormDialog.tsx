import { useEffect, useState } from 'react'
import { z } from 'zod'
import { customerService } from '@/services/api'
import type { Customer, CustomerForm } from '@/types'
import { isValidDocument } from '@/utils/document'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Field, FieldError } from '@/components/ui/field'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'react-toastify'

const EMPTY_FORM: CustomerForm = {
  name: '',
  email: '',
  phone: '',
  document: '',
  address: '',
}

const customerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório.'),
  email: z.string().min(1, 'E-mail é obrigatório.').email('E-mail inválido.'),
  phone: z.string().min(1, 'Telefone é obrigatório.'),
  document: z
    .string()
    .min(1, 'CPF/CNPJ é obrigatório.')
    .refine(isValidDocument, 'CPF/CNPJ inválido.'),
  address: z.string().optional(),
})

type FieldErrors = Partial<Record<keyof CustomerForm, string>>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: Customer | null
  onSaved: () => void
}

export function CustomerFormDialog({ open, onOpenChange, editing, onSaved }: Props) {
  const [form, setForm] = useState<CustomerForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  useEffect(() => {
    if (!open) return
    setFieldErrors({})
    if (!editing) {
      setForm(EMPTY_FORM)
      return
    }
    customerService
      .getById(editing.id)
      .then((response) => {
        const data = response.data
        setForm({
          name: data.name,
          email: data.email,
          phone: data.phone,
          document: data.document,
          address: data.address ?? '',
        })
      })
      .catch((error) => {
        const axiosError = error as { response?: { data?: { error?: string } } }
        toast.error(axiosError.response?.data?.error || 'Erro ao carregar cliente.')
        onOpenChange(false)
      })
  }, [open, editing, onOpenChange])

  const formatDocument = (value: string) => {
    const d = value.replace(/\D/g, '').slice(0, 14)
    if (d.length <= 11) {
      return d
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
    }
    return d
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
      .replace(/(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, '$1.$2.$3/$4-$5')
  }

  const formatPhone = (value: string) => {
    const d = value.replace(/\D/g, '').slice(0, 11)
    if (d.length <= 10) {
      return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2')
    }
    return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2')
  }

  const handleChange = (field: keyof CustomerForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleDocumentChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 14)
    setForm((prev) => ({ ...prev, document: digits }))
    if (digits && !isValidDocument(digits)) {
      setFieldErrors((prev) => ({ ...prev, document: 'CPF/CNPJ inválido.' }))
    } else {
      setFieldErrors((prev) => ({ ...prev, document: undefined }))
    }
  }

  const validate = () => {
    const result = customerSchema.safeParse(form)
    if (!result.success) {
      const errors: FieldErrors = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof CustomerForm
        if (!errors[field]) errors[field] = issue.message
      }
      setFieldErrors(errors)
      toast.error(result.error.issues[0].message)
      return false
    }
    setFieldErrors({})
    return true
  }

  const handleSave = async () => {
    if (!validate()) return
    try {
      setSaving(true)
      if (editing) {
        await customerService.update(editing.id, form)
        toast.success('Cliente atualizado com sucesso.')
      } else {
        await customerService.create(form)
        toast.success('Cliente criado com sucesso.')
      }
      onOpenChange(false)
      onSaved()
    } catch {
      toast.error('Erro ao salvar cliente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-color-bg-secondary border-color-border-default max-w-lg text-color-text-primary">
        <DialogHeader>
          <DialogTitle className="text-color-text-primary">
            {editing ? 'Editar Cliente' : 'Novo Cliente'}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Field data-invalid={!!fieldErrors.name || undefined}>
                <Label className="text-color-text-primary">Nome *</Label>
                <Input
                  placeholder="Nome completo"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="bg-color-surface border-color-border-default text-color-text-primary"
                />
                <FieldError>{fieldErrors.name}</FieldError>
              </Field>
            </div>
            <div className="col-span-2">
              <Field data-invalid={!!fieldErrors.email || undefined}>
                <Label className="text-color-text-primary">E-mail *</Label>
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="bg-color-surface border-color-border-default text-color-text-primary"
                />
                <FieldError>{fieldErrors.email}</FieldError>
              </Field>
            </div>
            <div>
              <Field data-invalid={!!fieldErrors.phone || undefined}>
                <Label className="text-color-text-primary">Telefone *</Label>
                <Input
                  placeholder="(00) 00000-0000"
                  value={formatPhone(form.phone)}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="bg-color-surface border-color-border-default text-color-text-primary"
                />
                <FieldError>{fieldErrors.phone}</FieldError>
              </Field>
            </div>
            <div>
              <Field data-invalid={!!fieldErrors.document || undefined}>
                <Label className="text-color-text-primary">CPF/CNPJ *</Label>
                <Input
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  value={formatDocument(form.document)}
                  onChange={(e) => handleDocumentChange(e.target.value)}
                  className="bg-color-surface border-color-border-default text-color-text-primary"
                />
                <FieldError>{fieldErrors.document}</FieldError>
              </Field>
            </div>
            <div className="col-span-2">
              <Label className="text-color-text-primary">Endereço</Label>
              <Input
                placeholder="Rua, número, bairro, cidade"
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="bg-color-surface border-color-border-default text-color-text-primary"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-color-text-secondary hover:text-color-text-primary"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-color-primary hover:bg-color-primary-hover dark:text-color-text-primary text-color-text-inverse"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
