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
-  supabase command to run
```
create extension if not exists pgcrypto;

create table if not exists users (
  user_id uuid primary key default gen_random_uuid(),
  username text not null unique,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists prompts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  tags text[] not null default '{}',
  author_id uuid not null references users(user_id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists user_prompt (
  user_id uuid not null references users(user_id) on delete cascade,
  prompt_id uuid not null references prompts(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, prompt_id)
);

create or replace function touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_users_updated_at on users;
create trigger trg_users_updated_at
before update on users
for each row
execute function touch_updated_at();

drop trigger if exists trg_prompts_updated_at on prompts;
create trigger trg_prompts_updated_at
before update on prompts
for each row
execute function touch_updated_at();

create index if not exists idx_prompts_author_id on prompts(author_id);
create index if not exists idx_prompts_tags on prompts using gin(tags);
create index if not exists idx_prompts_fts on prompts
using gin (to_tsvector('simple', lower(coalesce(title, '') || ' ' || coalesce(body, ''))));

create or replace function search_prompts_ci(
  search_text text default '',
  tag_filters text[] default null,
  page_number integer default 1,
  page_size integer default 20
)
returns table (
  id uuid,
  title text,
  body text,
  tags text[],
  author_id uuid,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
stable
as $$
declare
  normalized_query text := lower(trim(coalesce(search_text, '')));
  normalized_tags text[];
  safe_page integer := greatest(page_number, 1);
  safe_size integer := greatest(least(page_size, 50), 1);
begin
  if tag_filters is null then
    normalized_tags := null;
  else
    select coalesce(array_agg(distinct lower(trim(tag))), '{}')
      into normalized_tags
    from unnest(tag_filters) as tag
    where trim(tag) <> '';

    if cardinality(normalized_tags) = 0 then
      normalized_tags := null;
    end if;
  end if;

  return query
  select
    p.id,
    p.title,
    p.body,
    p.tags,
    p.author_id,
    p.created_at,
    p.updated_at
  from prompts p
  where (
    normalized_query = ''
    or to_tsvector('simple', lower(coalesce(p.title, '') || ' ' || coalesce(p.body, '')))
       @@ plainto_tsquery('simple', normalized_query)
  )
  and (
    normalized_tags is null
    or p.tags && normalized_tags
  )
  order by p.created_at desc
  limit safe_size
  offset (safe_page - 1) * safe_size;
end;
$$;

create or replace function list_prompt_tags()
returns text[]
language sql
stable
as $$
  select coalesce(array_agg(tag order by tag), '{}')
  from (
    select distinct lower(trim(tag)) as tag
    from prompts, unnest(tags) as tag
    where trim(tag) <> ''
  ) distinct_tags;
$$;
```


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
