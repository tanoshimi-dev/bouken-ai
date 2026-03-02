import { serve } from '@hono/node-server';
import app from './app.js';
import { env } from './lib/env.js';

const port = env.PORT;

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`API server running on http://localhost:${info.port}`);
});

export default app;
