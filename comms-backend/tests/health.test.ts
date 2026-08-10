import { describe, it, expect, afterEach } from 'vitest';
import { buildApp } from '../src/server.js';
import type { FastifyInstance } from 'fastify';

describe('GET /health', () => {
  let app: FastifyInstance | null = null;

  afterEach(async () => {
    if (app) await app.close();
    app = null;
  });

  it('returns 200 with status "ok"', async () => {
    // No Supabase client needed for the health check.
    app = buildApp({ supabaseClient: null });
    const response = await app.inject({ method: 'GET', url: '/health' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
  });
});
