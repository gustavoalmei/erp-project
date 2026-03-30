import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './modules/auth/auth.routes'
import categoriesRoutes from './modules/categories/categories.routes'
import productsRoutes from './modules/products/products.routes'
import customersRoutes from './modules/customers/customers.routes'
import salesRoutes from './modules/sales/sales.routes'
import usersRoutes from './modules/users/users.routes'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.get('/health', (req, res) => {
  res.json({ status: 'OK' })
})

// Rotas
app.use('/api/auth', authRoutes)
app.use('/api/categories', categoriesRoutes)
app.use('/api/products', productsRoutes)
app.use('/api/customers', customersRoutes)
app.use('/api/sales', salesRoutes)
app.use('/api/users', usersRoutes)

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`)
})
