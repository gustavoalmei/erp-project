import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Area, AreaChart, XAxis, YAxis, CartesianGrid } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '../../components/ui/chart'
import { dashboardService } from '@/services/api.ts'
import {
  AlertTriangle,
  Clock,
  DollarSign,
  Package,
  Sun,
  TrendingDown,
  TrendingUp,
  User,
} from 'lucide-react'

type Summary = Awaited<ReturnType<typeof dashboardService.getSummary>>

export function Dashboard() {
  const [data, setData] = useState<Summary | null>(null)

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  useEffect(() => {
    dashboardService
      .getSummary()
      .then(setData)
      .catch(() => {})
  }, [])

  const monthlyRevenue = data?.monthlyRevenue ?? []
  const currentMonth = new Date().getMonth()
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const growth = (() => {
    const cur = monthlyRevenue[currentMonth]?.revenue ?? 0
    const prev = monthlyRevenue[lastMonth]?.revenue ?? 0
    if (prev === 0) return 0
    return Math.round(((cur - prev) / prev) * 1000) / 10
  })()

  const cards = [
    {
      title: 'Total Produtos',
      value: data?.stats.totalStockUnits ?? 0,
      icon: <Package />,
    },
    {
      title: 'Total de Vendas',
      value: formatPrice(data?.stats.totalRevenue ?? 0),
      icon: <DollarSign />,
    },
    {
      title: 'Total de Clientes',
      value: data?.stats.totalCustomers ?? 0,
      icon: <User />,
    },
    {
      title: 'Ticket Médio',
      value: formatPrice(data?.stats.averageTicket ?? 0),
      icon: <DollarSign />,
    },
  ]

  const subCards = [
    {
      title: 'Vendas Hoje',
      value: formatPrice(data?.today.totalRevenue ?? 0),
      icon: <Sun />,
      subValue: `${data?.today.totalSales ?? 0} vendas`,
    },
    {
      title: 'Vendas Pendentes',
      value: data?.pending.count ?? 0,
      icon: <Clock />,
      subValue: formatPrice(data?.pending.totalPending ?? 0),
    },
    {
      title: 'Estoque Baixo',
      value: data?.lowStock.count ?? 0,
      icon: <AlertTriangle />,
      subValue: 'Produtos abaixo de 10 un',
    },
    {
      title: 'Crescimento',
      value: growth > 0 ? `+${growth}` : growth,
      icon:
        growth >= 0 ? (
          <TrendingUp className="text-green-500" />
        ) : (
          <TrendingDown className="text-red-500" />
        ),
      subValue: 'vs mês anterior',
      color: growth >= 0 ? 'text-green-500' : 'text-red-500',
    },
  ]

  const chartConfig = {
    month: { label: 'Mês', theme: { light: '#f24987', dark: '#f24987' } },
    revenue: { label: 'Receita', theme: { light: '#f24987', dark: '#f24987' } },
    expenses: { label: 'Despesas', theme: { light: '#b2bf4b', dark: '#b2bf4b' } },
  } satisfies ChartConfig

  const revenueData = monthlyRevenue.map((item) => ({ ...item, expenses: 0 }))

  return (
    <Card className="p-4 border-color-border-default cursor-default">
      <section className="grid gap-6 grid-cols-1 md:grid-cols-2 min-[1400px]:grid-cols-4">
        {cards.map((card) => (
          <Card
            key={card.title}
            className="flex gap-0 bg-color-surface border-color-border-default overflow-auto"
          >
            <CardHeader>
              <CardTitle className="flex justify-between items-start font-bold text-xl text-color-text-primary">
                {card.title}
                <div className="bg-color-bg-secondary dark:bg-color-bg-primary p-2 rounded-lg text-color-primary">
                  {card.icon}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-start items-center gap-2 text-3xl sm:text-2xl md:text-3xl lg:text-4xl text-color-text-primary font-bold truncate">
              <span>{card.value}</span>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 grid-cols-1 md:grid-cols-2 min-[1400px]:grid-cols-4">
        {subCards.map((subCard) => (
          <Card
            key={subCard.title}
            className="flex gap-0 bg-color-surface border-color-border-default"
          >
            <CardHeader>
              <CardTitle className="flex justify-between items-start font-bold text-xl text-color-text-primary">
                {subCard.title}
                <div className="bg-color-bg-secondary dark:bg-color-bg-primary p-2 rounded-lg text-color-primary">
                  {subCard.icon}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span
                className={`text-3xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-color-text-primary ${subCard.color} truncate`}
              >
                {subCard.value}
              </span>
              <p className="text-sm text-color-text-muted truncate">{subCard.subValue}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6">
        <Card className="bg-color-surface border-color-border-default overflow-auto">
          <CardHeader>
            <CardTitle className="font-bold text-xl text-color-text-primary">
              Receita Mensal
            </CardTitle>
            <CardDescription className="font-medium text-sm text-color-text-muted">
              Receita ao longo dos meses de {new Date().getFullYear()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-expenses)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-expenses)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border-default)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  cursor={{ stroke: 'tex-white', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-revenue)"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="var(--color-expenses)"
                  strokeWidth={2}
                  fill="url(#expensesGradient)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-color-surface border-color-border-default overflow-auto">
          <CardHeader>
            <CardTitle className="font-bold text-xl text-color-text-primary">
              Top 10 Produtos
            </CardTitle>
            <CardDescription className="font-medium text-sm text-color-text-muted">
              Top 10 produtos mais vendidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table className="text-color-text-primary">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[250px] font-bold">Produto</TableHead>
                  <TableHead className="min-w-[100px] font-bold">Preço</TableHead>
                  <TableHead className="min-w-[100px] font-bold text-center">Estoque</TableHead>
                  <TableHead className="min-w-[120px] text-center font-bold">
                    Total Vendido
                  </TableHead>
                  <TableHead className="min-w-[150px] text-center font-bold">Valor Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.topProducts ?? []).map((product) => (
                  <TableRow key={product.id} className="hover:bg-color-bg-secondary">
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{formatPrice(product.price)}</TableCell>
                    <TableCell className="text-center">{product.stock}</TableCell>
                    <TableCell className="text-center">{product.totalSold}</TableCell>
                    <TableCell className="text-center">
                      {formatPrice(product.totalSold * product.price)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-color-surface border-color-border-default overflow-auto">
          <CardHeader>
            <CardTitle className="font-bold text-xl text-color-text-primary">
              Top 10 Clientes
            </CardTitle>
            <CardDescription className="font-medium text-sm text-color-text-muted">
              Top 10 clientes que mais gastaram
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table className="text-color-text-primary">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px] font-bold">Nome</TableHead>
                  <TableHead className="min-w-[100px] font-bold text-center">Total Gasto</TableHead>
                  <TableHead className="min-w-[150px] font-bold text-center">
                    Total de Compras
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.topCustomers ?? []).map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-color-bg-secondary">
                    <TableCell>{customer.name}</TableCell>
                    <TableCell className="text-center">
                      {formatPrice(customer.totalSpent)}
                    </TableCell>
                    <TableCell className="text-center">{customer.totalPurchases}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-color-surface border-color-border-default overflow-auto">
          <CardHeader>
            <CardTitle className="font-bold text-xl text-color-text-primary">
              Últimas Vendas
            </CardTitle>
            <CardDescription className="font-medium text-sm text-color-text-muted">
              Top 10 produtos mais vendidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table className="text-color-text-primary">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[250px] font-bold">Produto</TableHead>
                  <TableHead className="min-w-[100px] font-bold text-center">Preço</TableHead>
                  <TableHead className="min-w-[100px] font-bold text-center">Estoque</TableHead>
                  <TableHead className="min-w-[120px] text-center font-bold">
                    Total Vendido
                  </TableHead>
                  <TableHead className="min-w-[150px] text-center font-bold">Valor Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.topProducts ?? []).map((product) => (
                  <TableRow key={product.id} className="hover:bg-color-bg-secondary">
                    <TableCell>{product.name}</TableCell>
                    <TableCell className="text-center">{formatPrice(product.price)}</TableCell>
                    <TableCell className="text-center">{product.stock}</TableCell>
                    <TableCell className="text-center">{product.totalSold}</TableCell>
                    <TableCell className="text-center">
                      {formatPrice(product.totalSold * product.price)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-color-surface border-color-border-default overflow-auto">
          <CardHeader>
            <CardTitle className="font-bold text-xl text-color-text-primary">
              Produtos Estoque Baixo
            </CardTitle>
            <CardDescription className="font-medium text-sm text-color-text-muted">
              Lista de produtos com estoque baixo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table className="text-color-text-primary">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px] font-bold">Nome</TableHead>
                  <TableHead className="min-w-[100px] font-bold text-center">Estoque</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.lowStock.products ?? []).map((product) => (
                  <TableRow key={product.id} className="hover:bg-color-bg-secondary">
                    <TableCell>{product.name}</TableCell>
                    <TableCell className="text-center">{product.stock}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </Card>
  )
}
