import Fastify from 'fastify';
import type { SupabaseClient } from '@supabase/supabase-js';
import { config } from './config/env.js';
import { createSupabaseClient } from './db/supabase.js';
import { registerHealthRoute } from './routes/health.js';
import { registerTelegramRoutes } from './channels/telegram/routes.js';

export interface BuildAppOptions {
  // Allow tests to inject a (real or fake) Supabase client.
  supabaseClient?: SupabaseClient | null;
}

export function buildApp(opts?: BuildAppOptions) {
  const app = Fastify({
    logger: { level: config.LOG_LEVEL },
    // Don't crash on large webhook payloads; default body limit is fine.
  });

  const client =
    opts?.supabaseClient !== undefined ? opts.supabaseClient : createSupabaseClient();

  registerHealthRoute(app);
  registerTelegramRoutes(app, client);

  return app;
}

async function main(): Promise<void> {
  const app = buildApp();
  const port = Number(config.PORT) || 3000;
  try {
    await app.listen({ port, host: '0.0.0.0' });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

// Only start the server when this module is run directly (not when imported
// by tests). Vitest sets process.env.VITEST.
if (!process.env.VITEST) {
  void main();
}
