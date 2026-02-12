# Leistungserfassung

Next.js Projekt mit TypeScript, Tailwind CSS, Supabase und Vercel Deployment.

## Setup

### 1. Environment Variables

Kopiere `.env.local.example` zu `.env.local` und fülle die Werte aus:

```bash
cp .env.local.example .env.local
```

Dann die Werte aus deinem Supabase Dashboard eintragen:
- **SUPABASE_URL**: Settings → API → Project URL
- **SUPABASE_SERVICE_ROLE_KEY**: Settings → API → Service Role Key

### 2. Development Server starten

```bash
npm run dev
```

Die App läuft dann auf [http://localhost:3000](http://localhost:3000)

### 3. Supabase Database Schema

Erstelle die benötigten Tabellen in deinem Supabase Dashboard unter **SQL Editor**.

Beispiel für eine `users` Tabelle:

```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_users_email ON users(email);
```

### 4. Vercel Deployment

1. Verbinde das GitHub Repository mit Vercel
2. Setze die Environment Variables in Vercel:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Deploy!

## Nützliche Befehle

```bash
# Development Server
npm run dev

# Production Build
npm run build
npm run start

# TypeScript prüfen
npm run type-check

# Linting
npm run lint
```

## Projektstruktur

```
leistungserfassung/
├── app/
│   ├── api/          # API Routes
│   ├── components/   # React Components
│   └── ...           # Pages
├── public/           # Statische Assets
└── types/            # TypeScript Types
```
