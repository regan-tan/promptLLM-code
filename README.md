# LLM Prompt Library (MVP)

Minimal full-stack prompt-sharing app with:
- Next.js backend + React frontend
- Supabase Postgres
- JWT auth with hashed passwords
- CRUD prompts
- Case-insensitive full-text search across prompt `title` + `body`
- User-created tags and tag filters
- Save search + share search URL

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Create your env file:
```bash
cp .env.example .env.local
```

3. Fill in:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`

4. Run the SQL migration in your Supabase SQL editor:
- `supabase/migrations/001_init.sql`

5. Start app:
```bash
npm run dev
```

Open `http://localhost:3000`.

## API (versioned)

Auth:
- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

Prompts:
- `GET /api/v1/prompts?q=&tags=&page=&limit=`
- `POST /api/v1/prompts`
- `GET /api/v1/prompts/:id`
- `PATCH /api/v1/prompts/:id`
- `DELETE /api/v1/prompts/:id`
- `GET /api/v1/prompts/tags`

## Test

Run one happy-path unit test:
```bash
npm test
```
