/**
 * Testes de Segurança — Autorização e Controle de Acesso
 * Cobre: rotas sem autenticação (401), role USER tentando acessar admin (403),
 *        escalação de privilégio, IDOR básico
 */

jest.mock('../../src/utils/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    customer: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    sale: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      aggregate: jest.fn().mockResolvedValue({ _sum: { total: null } }),
      count: jest.fn().mockResolvedValue(0),
      groupBy: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
    },
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}))

import request from 'supertest'
import jwt from 'jsonwebtoken'
import { createApp } from '../../src/app'
import { prisma } from '../../src/utils/prisma'

const app = createApp({ authRateLimitMax: 1000, apiRateLimitMax: 10000 })

const TEST_SECRET = process.env.JWT_SECRET!
const userToken = jwt.sign({ userId: 1, role: 'USER' }, TEST_SECRET, {
  algorithm: 'HS256',
  expiresIn: '1h',
})
const adminToken = jwt.sign({ userId: 2, role: 'ADMIN' }, TEST_SECRET, {
  algorithm: 'HS256',
  expiresIn: '1h',
})

const auth = (token: string) => ({ Authorization: `Bearer ${token}` })

// ─────────────────────────────────────────────────────────────
// 401 — Unauthenticated access
// ─────────────────────────────────────────────────────────────

describe('Unauthenticated Access (expects 401)', () => {
  const protectedRoutes: [string, string][] = [
    ['GET', '/api/auth/verify'],
    ['GET', '/api/customers'],
    ['GET', '/api/customers/1'],
    ['POST', '/api/customers'],
    ['PUT', '/api/customers/1'],
    ['DELETE', '/api/customers/1'],
    ['GET', '/api/sales'],
    ['GET', '/api/sales/1'],
    ['POST', '/api/sales'],
    ['GET', '/api/users/me'],
    ['GET', '/api/users/all'],
    ['PATCH', '/api/users/me/password'],
    ['POST', '/api/products'],
    ['PUT', '/api/products/1'],
    ['DELETE', '/api/products/1'],
  ]

  it.each(protectedRoutes)('%s %s returns 401 without token', async (method, route) => {
    const res = await (request(app) as any)[method.toLowerCase()](route)
    expect(res.status).toBe(401)
  })
})

// ─────────────────────────────────────────────────────────────
// 403 — Authenticated but insufficient role (USER → admin routes)
// ─────────────────────────────────────────────────────────────

describe('Insufficient Role — USER accessing admin routes (expects 403)', () => {
  const adminOnlyRoutes: [string, string][] = [
    ['GET', '/api/customers'],
    ['GET', '/api/customers/1'],
    ['GET', '/api/customers/top-customers'],
    ['POST', '/api/customers'],
    ['PUT', '/api/customers/1'],
    ['DELETE', '/api/customers/1'],
    ['GET', '/api/sales'],
    ['GET', '/api/sales/1'],
    ['GET', '/api/sales/stats'],
    ['GET', '/api/sales/total'],
    ['GET', '/api/sales/today'],
    ['GET', '/api/sales/pending'],
    ['GET', '/api/sales/monthly-revenue'],
    ['POST', '/api/sales'],
    ['GET', '/api/users/all'],
    ['PUT', '/api/users/1'],
    ['DELETE', '/api/users/1'],
    ['POST', '/api/products'],
    ['PUT', '/api/products/1'],
    ['DELETE', '/api/products/1'],
  ]

  it.each(adminOnlyRoutes)('%s %s returns 403 for USER role', async (method, route) => {
    const res = await (request(app) as any)[method.toLowerCase()](route).set(auth(userToken))

    expect(res.status).toBe(403)
    expect(res.body.error).toBe('Acesso negado')
  })
})

// ─────────────────────────────────────────────────────────────
// ADMIN access — must not return 401 or 403
// ─────────────────────────────────────────────────────────────

describe('Admin Access — ADMIN role must pass auth gates', () => {
  beforeEach(() => {
    ;(prisma.customer.findMany as jest.Mock).mockResolvedValue([])
    ;(prisma.sale.findMany as jest.Mock).mockResolvedValue([])
    ;(prisma.user.findMany as jest.Mock).mockResolvedValue([])
  })

  it('ADMIN can list customers', async () => {
    const res = await request(app).get('/api/customers').set(auth(adminToken))
    expect(res.status).not.toBe(401)
    expect(res.status).not.toBe(403)
  })

  it('ADMIN can list sales', async () => {
    const res = await request(app).get('/api/sales').set(auth(adminToken))
    expect(res.status).not.toBe(401)
    expect(res.status).not.toBe(403)
  })

  it('ADMIN can list all users', async () => {
    const res = await request(app).get('/api/users/all').set(auth(adminToken))
    expect(res.status).not.toBe(401)
    expect(res.status).not.toBe(403)
  })
})

// ─────────────────────────────────────────────────────────────
// Role Escalation Prevention
// ─────────────────────────────────────────────────────────────

describe('Role Escalation Prevention', () => {
  it('public register endpoint always assigns USER role', async () => {
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
    ;(prisma.user.create as jest.Mock).mockResolvedValue({
      id: 1,
      name: 'Hacker',
      email: 'hacker@test.com',
      role: 'USER',
    })

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Hacker', email: 'hacker@test.com', password: 'ValidPass123!', role: 'ADMIN' })

    expect(res.status).not.toBe(500)
    if (res.status === 201) {
      expect(res.body.user?.role).toBe('USER')
      expect(res.body.user?.role).not.toBe('ADMIN')
    }
  })

  it('USER cannot update another user via /api/users/:id', async () => {
    const res = await request(app)
      .put('/api/users/999')
      .set(auth(userToken))
      .send({ name: 'Evil', email: 'evil@test.com', role: 'ADMIN' })

    expect(res.status).toBe(403)
  })

  it('USER cannot delete another user', async () => {
    const res = await request(app).delete('/api/users/999').set(auth(userToken))
    expect(res.status).toBe(403)
  })
})

// ─────────────────────────────────────────────────────────────
// IDOR — Insecure Direct Object Reference
// ─────────────────────────────────────────────────────────────

describe('IDOR Prevention', () => {
  it('USER cannot access customer data (requires admin)', async () => {
    const res = await request(app).get('/api/customers/1').set(auth(userToken))
    expect(res.status).toBe(403)
  })

  it('USER cannot access other users data via /api/users/all', async () => {
    const res = await request(app).get('/api/users/all').set(auth(userToken))
    expect(res.status).toBe(403)
  })

  it('authenticated USER can only access their own profile (/me)', async () => {
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      name: 'User',
      email: 'user@test.com',
      role: 'USER',
      avatar: null,
    })

    const res = await request(app).get('/api/users/me').set(auth(userToken))
    // Should access their own profile
    expect(res.status).not.toBe(403)
  })
})

// ─────────────────────────────────────────────────────────────
// Token Replay / Misuse
// ─────────────────────────────────────────────────────────────

describe('Token Misuse', () => {
  it('USER token cannot be used to access admin-gated data', async () => {
    const res = await request(app).get('/api/sales/stats').set(auth(userToken))

    expect(res.status).toBe(403)
  })

  it('rejects malformed Authorization header format', async () => {
    const res = await request(app).get('/api/customers').set('Authorization', userToken) // Missing "Bearer " prefix

    expect(res.status).toBe(401)
  })
})
