/**
 * Testes de Segurança — Brute Force / Rate Limiting
 * Cobre: proteção contra força bruta em login e registro, bypass via IP spoofing
 */

jest.mock('../../src/utils/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
    },
  },
}))

import request from 'supertest'
import { createApp } from '../../src/app'

const RATE_LIMIT = 5

// Each test creates its own app instance for isolated rate limit state
const newApp = () =>
  createApp({
    authRateLimitMax: RATE_LIMIT,
    authRateLimitWindowMs: 60 * 1000,
    apiRateLimitMax: 10000,
  })

describe('Brute Force — Login', () => {
  it('returns 429 after exceeding login limit', async () => {
    const app = newApp()
    const payload = { email: 'attacker@test.com', password: 'WrongPass1!' }

    for (let i = 0; i < RATE_LIMIT; i++) {
      const res = await request(app).post('/api/auth/login').send(payload)
      expect(res.status).toBe(401) // each attempt fails but is counted
    }

    const blocked = await request(app).post('/api/auth/login').send(payload)
    expect(blocked.status).toBe(429)
  })

  it('includes error message in 429 response', async () => {
    const app = newApp()

    for (let i = 0; i <= RATE_LIMIT; i++) {
      await request(app).post('/api/auth/login').send({ email: 'test@test.com', password: 'wrong' })
    }

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'wrong' })

    expect(res.status).toBe(429)
    expect(res.body.error).toMatch(/tentativas|muitas/i)
  })

  it('does not allow X-Forwarded-For header to bypass rate limit', async () => {
    const app = newApp()

    // Exhaust rate limit from default IP (127.0.0.1 in supertest)
    for (let i = 0; i < RATE_LIMIT; i++) {
      await request(app).post('/api/auth/login').send({ email: 'test@test.com', password: 'wrong' })
    }

    // Attempt bypass by spoofing a different IP via X-Forwarded-For
    // Without `trust proxy`, Express ignores this header and uses the real IP
    const bypass = await request(app)
      .post('/api/auth/login')
      .set('X-Forwarded-For', '1.2.3.4')
      .send({ email: 'test@test.com', password: 'wrong' })

    // Should still be rate limited (same real IP)
    expect(bypass.status).toBe(429)
  })

  it('different email addresses share the same IP-based rate limit bucket', async () => {
    const app = newApp()

    // Attacker tries multiple different emails from same IP
    const emails = [
      'victim1@test.com',
      'victim2@test.com',
      'victim3@test.com',
      'victim4@test.com',
      'victim5@test.com',
    ]

    for (const email of emails) {
      await request(app).post('/api/auth/login').send({ email, password: 'guess' })
    }

    // 6th request (from same IP) must be rate limited regardless of email
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'victim6@test.com', password: 'guess' })

    expect(res.status).toBe(429)
  })
})

describe('Brute Force — Register', () => {
  it('returns 429 after exceeding register limit', async () => {
    const app = newApp()

    for (let i = 0; i < RATE_LIMIT; i++) {
      await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: `user${i}@test.com`, password: 'weak' })
    }

    const blocked = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'extra@test.com', password: 'weak' })

    expect(blocked.status).toBe(429)
  })
})

describe('Rate Limit Isolation', () => {
  it('login and register share the same rate limit bucket', async () => {
    const app = newApp()

    // Use up some of the limit on /login
    for (let i = 0; i < Math.floor(RATE_LIMIT / 2); i++) {
      await request(app).post('/api/auth/login').send({ email: 'test@test.com', password: 'wrong' })
    }

    // Use up the rest on /register
    for (let i = 0; i < Math.ceil(RATE_LIMIT / 2); i++) {
      await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: `reg${i}@test.com`, password: 'weak' })
    }

    // Should now be rate limited on either endpoint
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'wrong' })

    expect(loginRes.status).toBe(429)
  })
})
