import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // Limpar dados existentes (opcional)
  await prisma.stockMovement.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  console.log("🗑️  Dados antigos removidos");

  // ========== USUÁRIOS ==========
  const hashedPassword = await bcrypt.hash("123456", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@erp.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  const user = await prisma.user.create({
    data: {
      name: "Vendedor",
      email: "vendedor@erp.com",
      password: hashedPassword,
      role: "USER",
    },
  });

  console.log("✅ Usuários criados");

  // ========== CATEGORIAS ==========
  const categories = await Promise.all([
    prisma.category.create({ data: { name: "Eletrônicos" } }),
    prisma.category.create({ data: { name: "Informática" } }),
    prisma.category.create({ data: { name: "Games" } }),
    prisma.category.create({ data: { name: "Periféricos" } }),
    prisma.category.create({ data: { name: "Áudio" } }),
  ]);

  console.log("✅ Categorias criadas");

  // ========== PRODUTOS ==========
  const products = await Promise.all([
    // Eletrônicos
    prisma.product.create({
      data: {
        name: "Notebook Dell Inspiron",
        description: "i5, 8GB RAM, 256GB SSD",
        price: 3500.0,
        stock: 15,
        sku: "NOTE-DELL-001",
        categoryId: categories[0].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Monitor LG 24"',
        description: "Full HD, IPS",
        price: 850.0,
        stock: 25,
        sku: "MON-LG-24",
        categoryId: categories[0].id,
      },
    }),

    // Informática
    prisma.product.create({
      data: {
        name: "SSD Kingston 480GB",
        description: "SATA III",
        price: 280.0,
        stock: 50,
        sku: "SSD-KING-480",
        categoryId: categories[1].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Memória RAM 8GB DDR4",
        description: "2666MHz",
        price: 180.0,
        stock: 40,
        sku: "RAM-8GB-DDR4",
        categoryId: categories[1].id,
      },
    }),

    // Games
    prisma.product.create({
      data: {
        name: "Controle Xbox",
        description: "Wireless",
        price: 350.0,
        stock: 30,
        sku: "CTRL-XBOX-001",
        categoryId: categories[2].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Webcam Logitech C920",
        description: "Full HD 1080p",
        price: 450.0,
        stock: 8, // Estoque baixo
        sku: "WEB-LOG-C920",
        categoryId: categories[2].id,
      },
    }),

    // Periféricos
    prisma.product.create({
      data: {
        name: "Mouse Gamer Razer",
        description: "RGB, 16000 DPI",
        price: 250.0,
        stock: 60,
        sku: "MOUSE-RAZ-001",
        categoryId: categories[3].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Teclado Mecânico Redragon",
        description: "RGB, Switch Blue",
        price: 320.0,
        stock: 35,
        sku: "TEC-RED-001",
        categoryId: categories[3].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Mousepad Gamer",
        description: "Grande, RGB",
        price: 80.0,
        stock: 5, // Estoque baixo
        sku: "PAD-GAM-001",
        categoryId: categories[3].id,
      },
    }),

    // Áudio
    prisma.product.create({
      data: {
        name: "Headset HyperX Cloud",
        description: "7.1 Surround",
        price: 380.0,
        stock: 20,
        sku: "HEAD-HYP-001",
        categoryId: categories[4].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Microfone Blue Yeti",
        description: "USB, Condensador",
        price: 1200.0,
        stock: 3, // Estoque baixo
        sku: "MIC-BLUE-001",
        categoryId: categories[4].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Caixa de Som JBL",
        description: "Bluetooth, 20W",
        price: 280.0,
        stock: 45,
        sku: "SOM-JBL-001",
        categoryId: categories[4].id,
      },
    }),
  ]);

  console.log("✅ Produtos criados");

  // ========== CLIENTES ==========
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: "João Silva",
        email: "joao@email.com",
        phone: "11999999999",
        document: "12345678900",
        address: "Rua A, 123, São Paulo - SP",
      },
    }),
    prisma.customer.create({
      data: {
        name: "Maria Santos",
        email: "maria@email.com",
        phone: "11988888888",
        document: "98765432100",
        address: "Av. B, 456, Rio de Janeiro - RJ",
      },
    }),
    prisma.customer.create({
      data: {
        name: "Pedro Oliveira",
        email: "pedro@email.com",
        phone: "11977777777",
        document: "11122233344",
        address: "Rua C, 789, Belo Horizonte - MG",
      },
    }),
    prisma.customer.create({
      data: {
        name: "Ana Costa",
        email: "ana@email.com",
        phone: "11966666666",
        document: "55566677788",
        address: "Av. D, 321, Curitiba - PR",
      },
    }),
    prisma.customer.create({
      data: {
        name: "Carlos Mendes",
        email: "carlos@email.com",
        phone: "11955555555",
        document: "99988877766",
        address: "Rua E, 654, Porto Alegre - RS",
      },
    }),
    prisma.customer.create({
      data: {
        name: "Beatriz Lima",
        email: "beatriz@email.com",
        phone: "11944444444",
        document: "33344455566",
        address: "Av. F, 987, Brasília - DF",
      },
    }),
    prisma.customer.create({
      data: {
        name: "Rafael Souza",
        email: "rafael@email.com",
        phone: "11933333333",
        document: "77788899900",
        address: "Rua G, 147, Salvador - BA",
      },
    }),
    prisma.customer.create({
      data: {
        name: "Juliana Alves",
        email: "juliana@email.com",
        phone: "11922222222",
        document: "11133355577",
        address: "Av. H, 258, Recife - PE",
      },
    }),
    prisma.customer.create({
      data: {
        name: "Fernando Rocha",
        email: "fernando@email.com",
        phone: "11911111111",
        document: "44455566677",
        address: "Rua I, 369, Fortaleza - CE",
      },
    }),
    prisma.customer.create({
      data: {
        name: "Camila Ferreira",
        email: "camila@email.com",
        phone: "11900000000",
        document: "88899900011",
        address: "Av. J, 741, Manaus - AM",
      },
    }),
  ]);

  console.log("✅ Clientes criados");

  // ========== VENDAS ==========
  // Vamos criar vendas nos últimos 12 meses
  const today = new Date();

  for (let monthsAgo = 11; monthsAgo >= 0; monthsAgo--) {
    const salesInMonth = Math.floor(Math.random() * 5) + 3; // 3 a 7 vendas por mês

    for (let i = 0; i < salesInMonth; i++) {
      const saleDate = new Date(today);
      saleDate.setMonth(saleDate.getMonth() - monthsAgo);
      saleDate.setDate(Math.floor(Math.random() * 28) + 1);

      const customer = customers[Math.floor(Math.random() * customers.length)];
      const itemCount = Math.floor(Math.random() * 3) + 1; // 1 a 3 itens

      const items = [];
      let total = 0;

      for (let j = 0; j < itemCount; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const unitPrice = Number(product.price);
        const subtotal = unitPrice * quantity;

        items.push({
          productId: product.id,
          quantity,
          unitPrice,
          subtotal,
        });

        total += subtotal;
      }

      // Criar venda
      const sale = await prisma.sale.create({
        data: {
          customerId: customer.id,
          userId: user.id,
          total,
          status: Math.random() > 0.1 ? "COMPLETED" : "PENDING", // 90% completas
          createdAt: saleDate,
        },
      });

      // Criar itens da venda
      for (const item of items) {
        await prisma.saleItem.create({
          data: {
            saleId: sale.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
          },
        });

        // Atualizar estoque
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        // Criar movimentação
        await prisma.stockMovement.create({
          data: {
            productId: item.productId,
            type: "OUT",
            quantity: item.quantity,
            reason: `Venda #${sale.id}`,
            userId: user.id,
            createdAt: saleDate,
          },
        });
      }
    }
  }

  console.log("✅ Vendas criadas");
  console.log("🎉 Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
