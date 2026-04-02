import express from 'express'
import cors from 'cors'
import authRoutes from './modules/auth/auth.routes'
import categoriesRoutes from './modules/categories/categories.routes'
import productsRoutes from './modules/products/products.routes'
import customersRoutes from './modules/customers/customers.routes'
import salesRoutes from './modules/sales/sales.routes'
import usersRoutes from './modules/users/users.routes'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

export interface AppOptions {
  authRateLimitMax?: number
  authRateLimitWindowMs?: number
  apiRateLimitMax?: number
}

export function createApp(options: AppOptions = {}) {
  const app = express()

  app.use(
    cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
      credentials: true,
    }),
  )
  app.use(express.json({ limit: '1mb' }))
  app.use(
    helmet({
      hsts: { maxAge: 31536000, includeSubDomains: true },
    }),
  )

  app.get('/health', (_req, res) => {
    res.json({ status: 'OK' })
  })

  const authLimiter = rateLimit({
    windowMs: options.authRateLimitWindowMs ?? 15 * 60 * 1000,
    max: options.authRateLimitMax ?? 20,
    message: { error: 'Muitas tentativas. Tente novamente em 15 minutos.' },
  })

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: options.apiRateLimitMax ?? 300,
    message: { error: 'Muitas requisições. Tente novamente em 15 minutos.' },
  })

  app.use('/api/auth/login', authLimiter)
  app.use('/api/auth/register', authLimiter)
  app.use('/api', apiLimiter)

  app.use('/api/auth', authRoutes)
  app.use('/api/categories', categoriesRoutes)
  app.use('/api/products', productsRoutes)
  app.use('/api/customers', customersRoutes)
  app.use('/api/sales', salesRoutes)
  app.use('/api/users', usersRoutes)

  return app
}
