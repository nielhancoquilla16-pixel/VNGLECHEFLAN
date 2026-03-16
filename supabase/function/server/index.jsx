import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const app = new Hono();

// Enable logger
app.use('*', logger());

// Enable CORS for all routes
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  }),
);

// Health check endpoint
app.get('/make-server-65f4d79e/health', (c) => {
  return c.json({ status: 'ok' });
});

export default app;
