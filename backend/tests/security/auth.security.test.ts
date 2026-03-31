/**
 * Testes de Segurança — Autenticação
 * Cobre: SQL Injection, NoSQL Injection, XSS, validação de inputs, ataques a JWT
 */

jest.mock('../../src/utils/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))

import request from 'supertest'
import jwt from 'jsonwebtoken'
import { createApp } from '../../src/app'
import { prisma } from '../../src/utils/prisma'

// High rate limit so functional tests don't interfere with each other
const app = createApp({ authRateLimitMax: 1000, apiRateLimitMax: 10000 })

const mockFindUnique = prisma.user.findUnique as jest.Mock
const mockCreate = prisma.user.create as jest.Mock
const TEST_SECRET = process.env.JWT_SECRET!

beforeEach(() => {
  mockFindUnique.mockResolvedValue(null)
  mockCreate.mockResolvedValue({ id: 1, name: 'Test', email: 'test@test.com', role: 'USER' })
})

// ─────────────────────────────────────────────────────────────
// SQL Injection
// ─────────────────────────────────────────────────────────────

describe('SQL Injection — /api/auth/login', () => {
  const sqlEmailPayloads = [
    ["' OR '1'='1", 'classic OR injection'],
    ["'; DROP TABLE users; --", 'DROP TABLE attack'],
    ["' UNION SELECT * FROM users --", 'UNION SELECT attack'],
    ["admin'--", 'comment injection'],
    ["' OR 1=1; --", 'numeric OR injection'],
    ["1' AND SLEEP(5)--", 'time-based blind injection'],
  ]

  it.each(sqlEmailPayloads)('rejects SQL payload in email: %s (%s)', async (payload) => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: payload, password: 'SomePass123!' })

    expect(res.status).not.toBe(500)
    expect([400, 401]).toContain(res.status)
  })

  it('handles SQL payload that mimics valid email format', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: "test@test.com' OR '1'='1", password: 'SomePass123!' })

    // Prisma uses parameterized queries — no injection, just 401
    expect(res.status).not.toBe(500)
    expect([400, 401]).toContain(res.status)
  })

  it('handles NoSQL object injection in email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: { $gt: '' }, password: 'SomePass123!' })

    expect(res.status).toBe(400)
    expect(res.status).not.toBe(500)
  })

  it('handles NoSQL object injection in password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: { $ne: null } })

    expect(res.status).toBe(400)
    expect(res.status).not.toBe(500)
  })

  it('handles array injection in email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: ['user@test.com', "' OR '1'='1"], password: 'pass' })

    expect(res.status).not.toBe(500)
  })
})

describe('SQL Injection — /api/auth/register', () => {
  it('handles SQL injection in name field without crashing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: "Robert'); DROP TABLE users; --",
        email: 'bobby@tables.com',
        password: 'weak', // fails password policy before hitting DB
      })

    expect(res.status).not.toBe(500)
  })

  it('handles XSS payload in name field without crashing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: "<script>alert('XSS')</script>",
        email: 'xss@test.com',
        password: 'weak',
      })

    expect(res.status).not.toBe(500)
  })

  it('handles HTML injection in name field', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: '<img src=x onerror=alert(1)>',
        email: 'html@test.com',
        password: 'weak',
      })

    expect(res.status).not.toBe(500)
  })
})

// ─────────────────────────────────────────────────────────────
// Input Validation
// ─────────────────────────────────────────────────────────────

describe('Input Validation — /api/auth/register', () => {
  it('rejects invalid email: missing @', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'notanemail', password: 'ValidPass123!' })

    expect(res.status).toBe(400)
    expect(res.body.error).toContain('Email inválido')
  })

  it('rejects invalid email: missing domain', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'user@', password: 'ValidPass123!' })

    expect(res.status).toBe(400)
  })

  it('rejects invalid email: with spaces', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'us er@test.com', password: 'ValidPass123!' })

    expect(res.status).toBe(400)
  })

  it('rejects weak password: no uppercase', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'user@test.com', password: 'weakpassword1!' })

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/senha/i)
  })

  it('rejects weak password: too short (under 12 chars)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'user@test.com', password: 'Short1!' })

    expect(res.status).toBe(400)
  })

  it('rejects weak password: no special character', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'user@test.com', password: 'ValidPass1234' })

    expect(res.status).toBe(400)
  })

  it('rejects weak password: no number', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'user@test.com', password: 'ValidPassword!' })

    expect(res.status).toBe(400)
  })

  it('rejects empty body', async () => {
    const res = await request(app).post('/api/auth/register').send({})
    expect(res.status).toBe(400)
  })

  it('rejects role escalation attempt via register body', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Hacker', email: 'hacker@test.com', password: 'ValidPass123!', role: 'ADMIN' })

    expect(res.status).not.toBe(500)
    if (res.status === 201) {
      // If created, role must be USER (never ADMIN from public register)
      expect(res.body.user?.role).toBe('USER')
      expect(res.body.user?.role).not.toBe('ADMIN')
    }
  })

  it('accepts valid strong registration data', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Valid User', email: 'valid@test.com', password: 'ValidPass123!' })

    expect(res.status).toBe(201)
    // Password must never be returned in response
    expect(JSON.stringify(res.body)).not.toMatch(/password|senha/i)
  })
})

describe('Input Validation — /api/auth/login', () => {
  it('rejects invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'notanemail', password: 'SomePass123!' })

    expect(res.status).toBe(400)
    expect(res.body.error).toContain('Email inválido')
  })

  it('rejects empty body', async () => {
    const res = await request(app).post('/api/auth/login').send({})
    expect(res.status).toBe(400)
  })

  it('does not reveal whether email exists (user enumeration prevention)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nonexistent@test.com', password: 'SomePass123!' })

    expect(res.status).toBe(401)
    // Generic message — must NOT reveal that the email doesn't exist
    expect(res.body.error).toBe('Credenciais inválidas')
    expect(res.body.error).not.toMatch(/não encontrado|não existe|email/i)
  })

  it('does not leak password hash in error responses', async () => {
    mockFindUnique.mockResolvedValue({
      id: 1,
      email: 'user@test.com',
      password: '$2b$10$hashedpasswordvalue',
      role: 'USER',
    })

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'WrongPass123!' })

    expect(JSON.stringify(res.body)).not.toContain('$2b$')
    expect(JSON.stringify(res.body)).not.toContain('password')
  })

  it('rejects oversized password without crashing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'A'.repeat(10000) })

    expect(res.status).not.toBe(500)
    expect([400, 401]).toContain(res.status)
  })
})

// ─────────────────────────────────────────────────────────────
// JWT Attacks
// ─────────────────────────────────────────────────────────────

describe('JWT Security', () => {
  it('rejects request with no Authorization header', async () => {
    const res = await request(app).get('/api/auth/verify')
    expect(res.status).toBe(401)
  })

  it('rejects non-Bearer scheme (Basic auth)', async () => {
    const res = await request(app)
      .get('/api/auth/verify')
      .set('Authorization', 'Basic dXNlcjpwYXNz')

    expect(res.status).toBe(401)
  })

  it('rejects completely invalid token string', async () => {
    const res = await request(app)
      .get('/api/auth/verify')
      .set('Authorization', 'Bearer not.a.real.token')

    expect(res.status).toBe(401)
  })

  it('rejects expired token', async () => {
    const now = Math.floor(Date.now() / 1000)
    const expiredToken = jwt.sign(
      { userId: 1, role: 'USER', iat: now - 7200, exp: now - 3600 },
      TEST_SECRET,
      { algorithm: 'HS256' },
    )

    const res = await request(app)
      .get('/api/auth/verify')
      .set('Authorization', `Bearer ${expiredToken}`)

    expect(res.status).toBe(401)
  })

  it('rejects token signed with wrong secret (secret confusion attack)', async () => {
    const wrongToken = jwt.sign(
      { userId: 1, role: 'ADMIN' },
      'attacker-controlled-wrong-secret',
      { algorithm: 'HS256', expiresIn: '1h' },
    )

    const res = await request(app)
      .get('/api/auth/verify')
      .set('Authorization', `Bearer ${wrongToken}`)

    expect(res.status).toBe(401)
  })

  it('rejects algorithm-none attack (CVE-2015-9235)', async () => {
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url')
    const payload = Buffer.from(
      JSON.stringify({ userId: 1, role: 'ADMIN', iat: Math.floor(Date.now() / 1000) }),
    ).toString('base64url')
    const noneToken = `${header}.${payload}.`

    const res = await request(app)
      .get('/api/auth/verify')
      .set('Authorization', `Bearer ${noneToken}`)

    expect(res.status).toBe(401)
  })

  it('rejects tampered payload — role escalation from USER to ADMIN', async () => {
    const validToken = jwt.sign(
      { userId: 1, role: 'USER' },
      TEST_SECRET,
      { algorithm: 'HS256', expiresIn: '1h' },
    )

    const parts = validToken.split('.')
    const escalatedPayload = Buffer.from(
      JSON.stringify({ userId: 1, role: 'ADMIN' }),
    ).toString('base64url')
    const tamperedToken = `${parts[0]}.${escalatedPayload}.${parts[2]}`

    const res = await request(app)
      .get('/api/auth/verify')
      .set('Authorization', `Bearer ${tamperedToken}`)

    expect(res.status).toBe(401)
  })

  it('rejects tampered payload — userId escalation to admin user', async () => {
    const validToken = jwt.sign(
      { userId: 99, role: 'USER' },
      TEST_SECRET,
      { algorithm: 'HS256', expiresIn: '1h' },
    )

    const parts = validToken.split('.')
    const tamperedPayload = Buffer.from(
      JSON.stringify({ userId: 1, role: 'USER' }),
    ).toString('base64url')
    const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`

    const res = await request(app)
      .get('/api/auth/verify')
      .set('Authorization', `Bearer ${tamperedToken}`)

    expect(res.status).toBe(401)
  })

  it('rejects token with stripped signature', async () => {
    const validToken = jwt.sign(
      { userId: 1, role: 'USER' },
      TEST_SECRET,
      { algorithm: 'HS256', expiresIn: '1h' },
    )

    const parts = validToken.split('.')
    const strippedToken = `${parts[0]}.${parts[1]}.`

    const res = await request(app)
      .get('/api/auth/verify')
      .set('Authorization', `Bearer ${strippedToken}`)

    expect(res.status).toBe(401)
  })

  it('accepts valid signed token', async () => {
    const validToken = jwt.sign(
      { userId: 1, role: 'USER' },
      TEST_SECRET,
      { algorithm: 'HS256', expiresIn: '1h' },
    )

    const res = await request(app)
      .get('/api/auth/verify')
      .set('Authorization', `Bearer ${validToken}`)

    expect(res.status).toBe(200)
  })
})
