export const isValidCPF = (cpf: string) => {
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false
  const calc = (digits: string, factor: number) =>
    digits.split('').reduce((sum, d) => sum + Number(d) * factor--, 0)
  const mod = (n: number) => (n % 11 < 2 ? 0 : 11 - (n % 11))
  const d1 = mod(calc(cpf.slice(0, 9), 10))
  const d2 = mod(calc(cpf.slice(0, 10), 11))
  return d1 === Number(cpf[9]) && d2 === Number(cpf[10])
}

export const isValidCNPJ = (cnpj: string) => {
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const mod = (sum: number) => (sum % 11 < 2 ? 0 : 11 - (sum % 11))
  const sum = (digits: string, w: number[]) =>
    w.reduce((acc, wt, i) => acc + Number(digits[i]) * wt, 0)
  const d1 = mod(sum(cnpj, weights1))
  const d2 = mod(sum(cnpj, weights2))
  return d1 === Number(cnpj[12]) && d2 === Number(cnpj[13])
}

export const isValidDocument = (doc: string) => {
  if (doc.length === 11) return isValidCPF(doc)
  if (doc.length === 14) return isValidCNPJ(doc)
  return false
}
