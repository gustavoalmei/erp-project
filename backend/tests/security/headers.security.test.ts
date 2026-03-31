/**
 * Testes de Segurança — Headers HTTP e Configuração
 * Cobre: headers de segurança (Helmet), CORS, limite de body, content-type
 */

jest.mock('../../src/utils/prisma', () => ({
  prisma: {},
}))

import request, { Response } from 'supertest'
import { createApp } from '../../src/app'

const app = createApp()

// ─────────────────────────────────────────────────────────────
// Security Headers (Helmet)
// ─────────────────────────────────────────────────────────────

describe('Security Headers', () => {
  let res: Response

  beforeAll(async () => {
    res = await request(app).get('/health')
  })

  it('sets X-Content-Type-Options: nosniff (prevents MIME sniffing)', () => {
    expect(res.headers['x-content-type-options']).toBe('nosniff')
  })

  it('sets X-Frame-Options: SAMEORIGIN (prevents clickjacking)', () => {
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN')
  })

  it('sets Strict-Transport-Security with max-age=31536000 (HSTS)', () => {
    const hsts = res.headers['strict-transport-security']
    expect(hsts).toBeDefined()
    expect(hsts).toContain('max-age=31536000')
    expect(hsts).toContain('includeSubDomains')
  })

  it('removes X-Powered-By header (hides technology stack)', () => {
    expect(res.headers['x-powered-by']).toBeUndefined()
  })

  it('sets X-DNS-Prefetch-Control: off', () => {
    expect(res.headers['x-dns-prefetch-control']).toBe('off')
  })

  it('sets Referrer-Policy', () => {
    expect(res.headers['referrer-policy']).toBeDefined()
  })
})

// ─────────────────────────────────────────────────────────────
// CORS Configuration
// ─────────────────────────────────────────────────────────────

describe('CORS Security', () => {
  it('allows configured origin (localhost:5173)', async () => {
    const res = await request(app)
      .get('/health')
      .set('Origin', 'http://localhost:5173')

    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173')
  })

  it('does not reflect back unauthorized origin', async () => {
    const res = await request(app)
      .get('/health')
      .set('Origin', 'https://malicious-site.com')

    expect(res.headers['access-control-allow-origin']).not.toBe('https://malicious-site.com')
  })

  it('does not use wildcard (*) for CORS origin', async () => {
    const res = await request(app).get('/health')
    expect(res.headers['access-control-allow-origin']).not.toBe('*')
  })

  it('does not expose sensitive headers in Access-Control-Expose-Headers', async () => {
    const res = await request(app)
      .get('/health')
      .set('Origin', 'http://localhost:5173')

    const exposed = res.headers['access-control-expose-headers'] ?? ''
    expect(exposed.toLowerCase()).not.toContain('authorization')
    expect(exposed.toLowerCase()).not.toContain('cookie')
  })
})

// ─────────────────────────────────────────────────────────────
// Request Security
// ─────────────────────────────────────────────────────────────

describe('Request Security', () => {
  it('enforces 1MB body size limit (returns 413 for oversized payload)', async () => {
    const oversizedBody = { data: 'x'.repeat(2 * 1024 * 1024) } // ~2MB

    const res = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify(oversizedBody))

    expect(res.status).toBe(413)
  })

  it('returns JSON content-type on API error responses', async () => {
    const res = await request(app)
      .get('/api/auth/verify')
      .set('Authorization', 'Bearer invalid')

    expect(res.headers['content-type']).toMatch(/application\/json/)
    expect(res.headers['content-type']).not.toContain('text/html')
  })

  it('does not expose internal stack traces in error responses', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'wrong' })

    const body = JSON.stringify(res.body)
    expect(body).not.toMatch(/at\s+\w+\s+\(.*\.ts:\d+/)  // stack trace pattern
    expect(body).not.toContain('node_modules')
    expect(body).not.toContain('__dirname')
  })
})

// ─────────────────────────────────────────────────────────────
// Health / Info Exposure
// ─────────────────────────────────────────────────────────────

describe('Information Disclosure', () => {
  it('health endpoint does not expose environment details', async () => {
    const res = await request(app).get('/health')

    const body = JSON.stringify(res.body)
    expect(body).not.toContain('DATABASE_URL')
    expect(body).not.toContain('JWT_SECRET')
    expect(body).not.toContain('process.env')
    expect(res.body.status).toBe('OK')
  })

  it('404 response does not expose internal paths', async () => {
    const res = await request(app).get('/api/nonexistent-endpoint-xyz')

    const body = JSON.stringify(res.body ?? res.text)
    expect(body).not.toContain('/home/')
    expect(body).not.toContain('node_modules')
  })
})
