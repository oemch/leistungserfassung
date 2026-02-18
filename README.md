# Leistungserfassung

Next.js 16 project (TypeScript, Tailwind CSS). Supabase backend, deployment on Vercel.

---

## Local Installation

### Prerequisites

- Node.js 18+
- npm

### 1. Clone the repository

```bash
git clone <repo-url>
cd leistungserfassung
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment variables

Copy the example env file and fill in the values:

```bash
cp .env.local.example .env.local
```

**Required variables:**

| Variable | Description | Where to find |
|----------|-------------|---------------|
| `SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key (server-side) | Supabase Dashboard → Settings → API → Service Role Key |

**Optional variables (for AI suggestions):**

| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | API key from [console.groq.com](https://console.groq.com) (Free Tier) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google AI API key (alternative to Groq) |

The app works without these keys; AI suggestions for work items are disabled in that case.

### 4. Start the dev server

```bash
npm run dev
```

App: [http://localhost:3000](http://localhost:3000)

---

## Supabase

### Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`

### Database schema

Tables are created via SQL in the Supabase Dashboard (SQL Editor).

**Required tables (example schema):**

- **time_entries** – Time entries: `id`, `date`, `start_time`, `end_time`, `label`, `comment`, `is_billable`, `user_slug`, `created_at`
- **favorites** – Favorites: `id`, `user_slug`, `label`, `bg`, `fg`, `sort_order`
- **leistungen** – Work item catalog: `id`, `label`, `sort_order`
- **persons** – User data: `user_slug`, `display_name`, `target_hours_per_week`
- **users** – optional, for API `/api/users`
- **suggestions** – Suggestions: see `supabase/README.md`

### Suggestions table

```sql
-- see supabase/migrations/20260216000000_create_suggestions.sql
-- or supabase/README.md
```

If the `suggestions` table is missing: run the SQL from `supabase/migrations/20260216000000_create_suggestions.sql` in the SQL Editor.

### Implementation in code

- **Client:** `lib/supabase-server.ts` – creates the admin client with Service Role Key
- **Usage:** All API routes use `getSupabaseAdmin()` from `lib/supabase-server.ts`
- **Tables:** `time_entries`, `favorites`, `leistungen`, `persons`, `suggestions`, `users`
- **No Supabase Auth:** User selection happens in the frontend; `user_slug` identifies the user

---

## Vercel

### Deployment

1. Connect your repository to Vercel (GitHub/GitLab/Bitbucket)
2. Create the project – Next.js is detected automatically
3. Set environment variables in the Vercel Dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - optional: `GROQ_API_KEY` or `GOOGLE_GENERATIVE_AI_API_KEY`
4. Deploy (automatically triggered on push)

### Configuration

- **Framework:** Next.js (auto-detected)
- **Build Command:** `npm run build` (default)
- **Output Directory:** `.next` (default)
- **Node.js:** 18.x (recommended)

---

## Scripts

```bash
npm run dev        # Development server (port 3000)
npm run build      # Production build
npm run start      # Production server (after build)
npm run type-check # TypeScript check
npm run lint       # ESLint
```

---

## Project structure

```
leistungserfassung/
├── app/
│   ├── api/              # API routes (Next.js Route Handlers)
│   ├── components/       # React components
│   ├── mobile/           # Mobile route
│   └── ...
├── hooks/                # React hooks
├── lib/                  # Shared utils, Supabase client, constants
├── public/
│   └── fonts/            # Local fonts (Coop)
├── supabase/
│   ├── migrations/       # SQL migrations
│   └── README.md        # Supabase-specific notes
├── .env.local.example   # Environment variables template
└── next.config.ts
```

---

## Important notes

- **`.env.local`** is not versioned – only `.env.local.example` is committed
- **Service Role Key** has full database access – never use it in the frontend
- **Demo reset:** API route `/api/demo/reset` resets time entries and favorites to sample data (for demo/dev only)
