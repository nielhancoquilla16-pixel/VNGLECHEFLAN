# Backend (Supabase)

This folder contains a minimal Node.js + Express backend that connects to Supabase.

## Setup

1. Copy the example env file:

   ```bash
   cp .env.example .env
   ```

2. Fill in `SUPABASE_URL` and `SUPABASE_KEY` (use your Supabase project's anon key).

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the server:

   ```bash
   npm run dev
   ```

## API

- `GET /api/health` — health check
- `GET /api/products` — reads from the Supabase `products` table

> Adjust the table name(s) to match your schema.
