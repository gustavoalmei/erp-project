import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  await prisma.stockMovement.deleteMany()
  await prisma.saleItem.deleteMany()
  await prisma.sale.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.systemSettings.deleteMany()
  await prisma.userCompany.deleteMany()
  await prisma.company.deleteMany()
  await prisma.user.deleteMany()

  console.log('🗑️  Dados antigos removidos')

  // ========== SUPERADMIN ==========
  const hashedPassword = await bcrypt.hash('123456', 10)

  await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'super@erp.com',
      password: hashedPassword,
      isSuperAdmin: true,
    },
  })

  console.log('✅ Superadmin criado')

  // ========== EMPRESA ==========
  const company = await prisma.company.create({
    data: { name: 'Empresa Demo' },
  })

  await prisma.systemSettings.create({
    data: { companyId: company.id },
  })

  console.log('✅ Empresa criada')

  // ========== USUÁRIOS DA EMPRESA ==========
  const admin = await prisma.user.create({
    data: { name: 'Admin', email: 'admin@erp.com', password: hashedPassword },
  })
  const gestor = await prisma.user.create({
    data: { name: 'Gestor', email: 'gestor@erp.com', password: hashedPassword },
  })
  const supervisor = await prisma.user.create({
    data: { name: 'Supervisor', email: 'supervisor@erp.com', password: hashedPassword },
  })
  const operator = await prisma.user.create({
    data: { name: 'Operador', email: 'operador@erp.com', password: hashedPassword },
  })
  const viewer = await prisma.user.create({
    data: { name: 'Visualizador', email: 'viewer@erp.com', password: hashedPassword },
  })

  await prisma.userCompany.createMany({
    data: [
      { userId: admin.id, companyId: company.id, role: 'ADMIN' },
      { userId: gestor.id, companyId: company.id, role: 'MANAGER' },
      { userId: supervisor.id, companyId: company.id, role: 'SUPERVISOR' },
      { userId: operator.id, companyId: company.id, role: 'OPERATOR' },
      { userId: viewer.id, companyId: company.id, role: 'VIEWER' },
    ],
  })

  console.log('✅ Usuários criados e vinculados')

  // ========== CATEGORIAS ==========
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Eletrônicos', companyId: company.id } }),
    prisma.category.create({ data: { name: 'Informática', companyId: company.id } }),
    prisma.category.create({ data: { name: 'Games', companyId: company.id } }),
    prisma.category.create({ data: { name: 'Periféricos', companyId: company.id } }),
    prisma.category.create({ data: { name: 'Áudio', companyId: company.id } }),
  ])

  console.log('✅ Categorias criadas')

  // ========== PRODUTOS ==========
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Notebook Dell Inspiron',
        description: 'i5, 8GB RAM, 256GB SSD',
        price: 3500.0,
        stock: 15,
        sku: 'NOTE-DELL-001',
        categoryId: categories[0].id,
        companyId: company.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Monitor LG 24"',
        description: 'Full HD, IPS',
        price: 850.0,
        stock: 25,
        sku: 'MON-LG-24',
        categoryId: categories[0].id,
        companyId: company.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'SSD Kingston 480GB',
        description: 'SATA III',
        price: 280.0,
        stock: 50,
        sku: 'SSD-KING-480',
        categoryId: categories[1].id,
        companyId: company.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Memória RAM 8GB DDR4',
        description: '2666MHz',
        price: 180.0,
        stock: 40,
        sku: 'RAM-8GB-DDR4',
        categoryId: categories[1].id,
        companyId: company.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Controle Xbox',
        description: 'Wireless',
        price: 350.0,
        stock: 30,
        sku: 'CTRL-XBOX-001',
        categoryId: categories[2].id,
        companyId: company.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Webcam Logitech C920',
        description: 'Full HD 1080p',
        price: 450.0,
        stock: 8,
        sku: 'WEB-LOG-C920',
        categoryId: categories[2].id,
        companyId: company.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Mouse Gamer Razer',
        description: 'RGB, 16000 DPI',
        price: 250.0,
        stock: 60,
        sku: 'MOUSE-RAZ-001',
        categoryId: categories[3].id,
        companyId: company.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Teclado Mecânico Redragon',
        description: 'RGB, Switch Blue',
        price: 320.0,
        stock: 35,
        sku: 'TEC-RED-001',
        categoryId: categories[3].id,
        companyId: company.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Mousepad Gamer',
        description: 'Grande, RGB',
        price: 80.0,
        stock: 5,
        sku: 'PAD-GAM-001',
        categoryId: categories[3].id,
        companyId: company.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Headset HyperX Cloud',
        description: '7.1 Surround',
        price: 380.0,
        stock: 20,
        sku: 'HEAD-HYP-001',
        categoryId: categories[4].id,
        companyId: company.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Microfone Blue Yeti',
        description: 'USB, Condensador',
        price: 1200.0,
        stock: 3,
        sku: 'MIC-BLUE-001',
        categoryId: categories[4].id,
        companyId: company.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Caixa de Som JBL',
        description: 'Bluetooth, 20W',
        price: 280.0,
        stock: 45,
        sku: 'SOM-JBL-001',
        categoryId: categories[4].id,
        companyId: company.id,
      },
    }),
  ])

  console.log('✅ Produtos criados')

  // ========== CLIENTES ==========
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'João Silva',
        email: 'joao@email.com',
        phone: '11999999999',
        document: '12345678900',
        address: 'Rua A, 123, São Paulo - SP',
        companyId: company.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Maria Santos',
        email: 'maria@email.com',
        phone: '11988888888',
        document: '98765432100',
        address: 'Av. B, 456, Rio de Janeiro - RJ',
        companyId: company.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Pedro Oliveira',
        email: 'pedro@email.com',
        phone: '11977777777',
        document: '11122233344',
        address: 'Rua C, 789, Belo Horizonte - MG',
        companyId: company.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Ana Costa',
        email: 'ana@email.com',
        phone: '11966666666',
        document: '55566677788',
        address: 'Av. D, 321, Curitiba - PR',
        companyId: company.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Carlos Mendes',
        email: 'carlos@email.com',
        phone: '11955555555',
        document: '99988877766',
        address: 'Rua E, 654, Porto Alegre - RS',
        companyId: company.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Beatriz Lima',
        email: 'beatriz@email.com',
        phone: '11944444444',
        document: '33344455566',
        address: 'Av. F, 987, Brasília - DF',
        companyId: company.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Rafael Souza',
        email: 'rafael@email.com',
        phone: '11933333333',
        document: '77788899900',
        address: 'Rua G, 147, Salvador - BA',
        companyId: company.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Juliana Alves',
        email: 'juliana@email.com',
        phone: '11922222222',
        document: '11133355577',
        address: 'Av. H, 258, Recife - PE',
        companyId: company.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Fernando Rocha',
        email: 'fernando@email.com',
        phone: '11911111111',
        document: '44455566677',
        address: 'Rua I, 369, Fortaleza - CE',
        companyId: company.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Camila Ferreira',
        email: 'camila@email.com',
        phone: '11900000000',
        document: '88899900011',
        address: 'Av. J, 741, Manaus - AM',
        companyId: company.id,
      },
    }),
  ])

  console.log('✅ Clientes criados')

  // ========== VENDAS ==========
  const today = new Date()

  for (let monthsAgo = 11; monthsAgo >= 0; monthsAgo--) {
    const salesInMonth = Math.floor(Math.random() * 5) + 3

    for (let i = 0; i < salesInMonth; i++) {
      const saleDate = new Date(today)
      saleDate.setMonth(saleDate.getMonth() - monthsAgo)
      saleDate.setDate(Math.floor(Math.random() * 28) + 1)

      const customer = customers[Math.floor(Math.random() * customers.length)]
      const itemCount = Math.floor(Math.random() * 3) + 1

      const items = []
      let total = 0

      for (let j = 0; j < itemCount; j++) {
        const product = products[Math.floor(Math.random() * products.length)]
        const quantity = Math.floor(Math.random() * 3) + 1
        const unitPrice = Number(product.price)
        const subtotal = unitPrice * quantity

        items.push({ productId: product.id, quantity, unitPrice, subtotal })
        total += subtotal
      }

      const sale = await prisma.sale.create({
        data: {
          customerId: customer.id,
          userId: operator.id,
          companyId: company.id,
          total,
          status: Math.random() > 0.1 ? 'COMPLETED' : 'PENDING',
          createdAt: saleDate,
        },
      })

      for (const item of items) {
        await prisma.saleItem.create({
          data: {
            saleId: sale.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
          },
        })

        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })

        await prisma.stockMovement.create({
          data: {
            productId: item.productId,
            type: 'OUT',
            quantity: item.quantity,
            reason: `Venda #${sale.id}`,
            userId: operator.id,
            createdAt: saleDate,
          },
        })
      }
    }
  }

  console.log('✅ Vendas criadas')
  console.log('🎉 Seed concluído com sucesso!')
  console.log('')
  console.log('📋 Credenciais:')
  console.log('   Superadmin: super@erp.com / 123456')
  console.log('   Admin:      admin@erp.com / 123456')
  console.log('   Gestor:     gestor@erp.com / 123456')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
