import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import type { Customer, Product } from "../../types/index.ts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "../../components/ui/chart"
import { dashboardService, productService, saleService } from "@/services/api.ts";
import { AlertTriangle, Clock, DollarSign, Package, Sun, TrendingDown, TrendingUp, User } from "lucide-react";

interface TopProduct extends Product {
  totalSold: string;
}

interface TopCustomers extends Customer {
  totalSpent: number;
  totalPurchases: number
}

export function Dashboard() {
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomers[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [salesTotal, setSalesTotal] = useState(0);
  const [salesStats, setSalesStats] = useState({
    totalRevenue: 0,
    totalSales: 0,
    averageTicket: 0,
  });
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [todaySales, setTodaySales] = useState({ totalRevenue: 0, totalSales: 0 });
  const [pendingSales, setPendingSales] = useState({ totalPending: 0, count: 0 });
  const [lowStock, setLowStock] = useState({ count: 0, products: [] });
  const [growth, setGrowth] = useState(0);

  const loadData = async () => {
    // Vendas de hoje
    const today = await saleService.getTodaySales();
    setTodaySales(today);

    // Vendas pendentes
    const pending = await saleService.getPendingSales();
    setPendingSales(pending);

    // Estoque baixo
    const stock: any = await productService.getLowStock(10);
    setLowStock(stock);

    // Crescimento (calcular com monthly revenue)
    const monthlyData = await saleService.getMonthlyRevenue();
    const currentMonth = new Date().getMonth(); // 0-11
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;

    const currentRevenue = monthlyData[currentMonth]?.revenue || 0;
    const lastRevenue = monthlyData[lastMonth]?.revenue || 0;

    const growthPercent = lastRevenue > 0
      ? ((currentRevenue - lastRevenue) / lastRevenue) * 100
      : 0;

    setGrowth(Math.round(growthPercent * 10) / 10); // 1 casa decimal
  };

  const loadRevenueData = async () => {
    const data = await saleService.getMonthlyRevenue(2025);

    // Se você não tem expenses, pode adicionar 0 ou remover do gráfico
    const formattedData = data.map(item => ({
      ...item,
      expenses: 0, // ← Adicione lógica de expenses se tiver
    }));

    setRevenueData(formattedData);
  };

  const returnFormatPrice = (price: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  }

  const fetchProduts = async () => {
    const response = await productService.getAll()
    const initialValue = 0;
    const values = response.reduce((val1, val2) => val1 + val2.stock, initialValue)
    setTotalProducts(values)
  }

  const fetchTopProducts = async (limit: number = 10) => {
    const data = await dashboardService.getTopProducts(limit);
    setTopProducts(data);
  };

  const fetchTopCustomers = async (limit: number = 10) => {
    const data = await dashboardService.getTopCustomers(limit);
    setTopCustomers(data);
  };

  const fetchSalesTotal = async () => {
    const data = await dashboardService.getSalesTotal();
    setSalesTotal(data.totalRevenue);
  };

  const fetchSalesStats = async () => {
    const response = await saleService.getStats()
    const data = response.data;
    setSalesStats(data);
  };

  const cards = [
    {
      title: "Total Produtos",
      value: totalProducts,
      icon: <Package />,
    },
    {
      title: "Total de Vendas",
      value: returnFormatPrice(salesTotal),
      icon: <DollarSign />,
    },
    {
      title: "Total de Clientes",
      value: topCustomers.length,
      icon: <User />,
    },
    {
      title: "Ticket Médio",
      value: returnFormatPrice(salesStats.averageTicket),
      icon: <DollarSign />,
    },
  ]

  const subCards = [
    {
      title: "Vendas Hoje",
      value: returnFormatPrice(todaySales.totalRevenue),
      icon: <Sun />,
      subValue: `${todaySales.totalSales} vendas`,
    },
    {
      title: "Vendas Pendentes",
      value: pendingSales.count,
      icon: <Clock />,
      subValue: returnFormatPrice(pendingSales.totalPending),
    },
    {
      title: "Estoque Baixo",
      value: lowStock.count,
      icon: <AlertTriangle />,
      subValue: 'Produtos abaixo de 10 un',
    },
    {
      title: "Crescimento",
      value: growth > 0 ? '+' + growth : growth,
      icon: growth >= 0 ? (
        <TrendingUp className="text-green-500" />
      ) : (
        <TrendingDown className="text-red-500" />
      ),
      subValue: 'vs mês anterior',
      color: growth >= 0 ? 'text-green-500' : 'text-red-500',
    },
  ]

  const chartConfig = {
    month: {
      label: "Mês",
      theme: {
        light: "#f24987",
        dark: "#f24987",
      },
    },
    revenue: {
      label: "Receita",
      theme: {
        light: "#f24987",
        dark: "#f24987",
      },
    },
    expenses: {
      label: "Despesas",
      theme: {
        light: "#b2bf4b",
        dark: "#b2bf4b",
      },
    },
  } satisfies ChartConfig

  useEffect(() => {
    fetchTopProducts();
    fetchTopCustomers();
    fetchProduts();
    fetchSalesTotal()
    fetchSalesStats()
    loadData();
    loadRevenueData();
  }, []);

  return (
    <Card className="p-4 border-color-border-default cursor-default">
      <section className="grid gap-6 grid-cols-1 md:grid-cols-2 min-[1400px]:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title} className="flex gap-0 bg-color-surface border-color-border-default overflow-auto">
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
          <Card key={subCard.title} className="flex gap-0 bg-color-surface border-color-border-default">
            <CardHeader>
              <CardTitle className="flex justify-between items-start font-bold text-xl text-color-text-primary">
                {subCard.title}
                <div className="bg-color-bg-secondary dark:bg-color-bg-primary p-2 rounded-lg text-color-primary">
                  {subCard.icon}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className={`text-3xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-color-text-primary ${subCard.color} truncate`}>{subCard.value}</span>
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
            <CardDescription className="
          font-medium
          text-sm
          text-color-text-muted
          ">
              Receita ao longo dos meses de 2025
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={chartConfig}
              className="h-[300px] w-full"
            >
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
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-default)" vertical={false} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  cursor={{ stroke: "tex-white", strokeWidth: 1, strokeDasharray: "4 4" }}
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
      </section >

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-color-surface border-color-border-default overflow-auto">
          <CardHeader>
            <CardTitle className="font-bold text-xl text-color-text-primary">
              Top 10 Produtos
            </CardTitle>
            <CardDescription className="
          font-medium 
          text-sm 
          text-color-text-muted
          ">
              Top 10 produtos mais vendidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table className="text-color-text-primary">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[250px] font-bold">Produto</TableHead>
                  <TableHead className="min-w-[100px] font-bold">Preço</TableHead>
                  <TableHead className="min-ww-[100px] font-bold text-center">Estoque</TableHead>
                  <TableHead className="min-w-[120px] text-center font-bold">
                    Total Vendido
                  </TableHead>
                  <TableHead className="min-w-[150px] text-center font-bold">
                    Valor Total
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.map((product) => (
                  <TableRow key={product.id} className="hover:bg-color-bg-secondary">
                    <TableCell>
                      {product.name}
                    </TableCell>
                    <TableCell>
                      {returnFormatPrice(product.price)}
                    </TableCell>
                    <TableCell className="text-center">
                      {product.stock}
                    </TableCell>
                    <TableCell className="text-center">
                      {product.totalSold}
                    </TableCell>
                    <TableCell className="text-center">
                      {
                        returnFormatPrice(Number(product.totalSold) * product.price)
                      }
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
            <CardDescription className="
          font-medium 
          text-sm 
          text-color-text-muted
          ">
              Top 10 Clientes que mais gastaram
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table className="text-color-text-primary">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px] font-bold">Nome</TableHead>
                  <TableHead className="min-w-[100px] font-bold text-center">Total Gasto</TableHead>
                  <TableHead className="min-w-[150px] font-bold text-center">Total de Compras</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCustomers.map((customers) => (
                  <TableRow key={customers.id} className="hover:bg-color-bg-secondary">
                    <TableCell>
                      {customers.name}
                    </TableCell>
                    <TableCell className="text-center">
                      {returnFormatPrice(customers.totalSpent)}
                    </TableCell>
                    <TableCell className="text-center">
                      {customers.totalPurchases}
                    </TableCell>
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
            <CardDescription className="
          font-medium 
          text-sm 
          text-color-text-muted
          ">
              Top 10 produtos mais vendidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table className="text-color-text-primary">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[250px] font-bold">Produto</TableHead>
                  <TableHead className="min-w-[100px] font-bold text-center">Preço</TableHead>
                  <TableHead className="min-ww-[100px] font-bold text-center">Estoque</TableHead>
                  <TableHead className="min-w-[120px] text-center font-bold">
                    Total Vendido
                  </TableHead>
                  <TableHead className="min-w-[150px] text-center font-bold">
                    Valor Total
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.map((product) => (
                  <TableRow key={product.id} className="hover:bg-color-bg-secondary">
                    <TableCell>
                      {product.name}
                    </TableCell>
                    <TableCell className="text-center">
                      {returnFormatPrice(product.price)}
                    </TableCell>
                    <TableCell className="text-center">
                      {product.stock}
                    </TableCell>
                    <TableCell className="text-center">
                      {product.totalSold}
                    </TableCell>
                    <TableCell className="text-center">
                      {
                        returnFormatPrice(Number(product.totalSold) * product.price)
                      }
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
            <CardDescription className="
          font-medium 
          text-sm 
          text-color-text-muted
          ">
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
                {lowStock.products.map((product: Product) => (
                  <TableRow key={product.id} className="hover:bg-color-bg-secondary">
                    <TableCell>
                      {product.name}
                    </TableCell>
                    <TableCell className="text-center">
                      {product.stock}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

    </Card >
  );
}