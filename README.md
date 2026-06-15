# RestaurantAI

AI-powered restaurant menu and ordering app built with **Next.js**, **Supabase**, and **Groq**. Customers browse the menu, chat with an assistant to place orders, manage a cart, and checkout as a guest or logged-in user. Staff can manage orders, conversations, and menu items from an admin panel.

Live stack: **Vercel** (app + API + Analytics) + **Supabase** (Postgres, Auth, Realtime).

## Features

- **Menu** — Grid catalog loaded from Supabase (SSR + fallback data for local dev)
- **Shopping cart** — Client-side cart with localStorage persistence
- **AI assistant** — Groq-powered chat that answers menu questions and adds items to the cart via structured actions
- **Checkout** — Guest checkout with name, phone, delivery type, and payment method
- **Auth** — Email + password, 6-digit email OTP, and magic link (secondary); guest session merge on login
- **Header** — Global navigation with logged-in user info, role badge, and admin links for staff
- **Admin** — `/admin/orders`, `/admin/conversations`, `/admin/menu` (staff/admin roles)
- **Realtime** — Order status updates via Supabase Realtime
- **Audit** — Conversation and order events stored for review
- **Analytics** — [Vercel Web Analytics](https://vercel.com/docs/analytics) (`@vercel/analytics`) in the root layout

## Tech stack

| Layer     | Technology                                 |
| --------- | ------------------------------------------ |
| Frontend  | Next.js 15 (App Router), React, TypeScript |
| Backend   | Next.js Route Handlers                     |
| Database  | Supabase Postgres + RLS                    |
| Auth      | Supabase Auth (`@supabase/ssr`)            |
| AI        | Groq API (`llama-3.3-70b-versatile`)       |
| Deploy    | Vercel                                     |
| Analytics | Vercel Web Analytics (`@vercel/analytics`) |

## Getting started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Groq](https://groq.com) API key

### 1. Clone and install

```bash
git clone https://github.com/Armlockx/RestaurantAI.git
cd RestaurantAI
npm install
```

### 2. Environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

| Variable                        | Description                                                                      |
| ------------------------------- | -------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL                                                             |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key                                                         |
| `NEXT_PUBLIC_SITE_URL`          | App URL (`http://localhost:3000` locally)                                        |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server-only; required for admin role checks; never expose to the browser         |
| `GROQ_API_KEY`                  | Groq API key (server-only)                                                       |
| `CRON_SECRET`                   | Secret for Vercel cron jobs                                                      |
| `DEMO_ADMIN`                    | Set `true` for admin without Supabase auth (dev only); use `false` in production |

### 3. Database setup

Apply migrations and seed the menu:

```bash
# With Supabase CLI (linked project)
npx supabase db push
npx supabase db execute --file supabase/seed.sql
```

Or run the SQL files in the Supabase SQL Editor:

- `supabase/migrations/20260612180219_init.sql`
- `supabase/seed.sql`

If you use **Supabase GitHub integration**, the migration filename must match the version recorded in `supabase_migrations.schema_migrations` on the remote project.

### 4. Supabase Auth

In **Authentication → Providers → Email**, enable:

- Email sign-in
- Email + password (for admin and returning users)

In **Authentication → URL Configuration**, add:

- Site URL: your app URL
- Redirect URLs: `http://localhost:3000/auth/callback`, `https://your-domain.vercel.app/auth/callback`, `https://your-domain.vercel.app/auth/reset`

For **6-digit OTP**, include `{{ .Token }}` in the Magic Link email template. The same template can keep `{{ .ConfirmationURL }}` for magic link login.

For **production email delivery**, configure custom SMTP under **Project Settings → Authentication → SMTP** (e.g. Resend, Brevo) to avoid the default rate limits.

Create an admin user and promote in SQL:

```sql
update public.profiles
set role = 'admin'
where id = 'YOUR_USER_UUID';
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Authentication

Primary login methods (header **Entrar** or `/auth/login`):

| Method            | Flow                                                                 |
| ----------------- | -------------------------------------------------------------------- |
| Email + password  | `signInWithPassword` — best for admin daily use                      |
| 6-digit OTP       | `signInWithOtp` → enter code from email — no link click required     |
| Magic link        | Collapsible alternative — unique link opens in the same browser      |

After login, the header shows your email and role badge (Cliente / Staff / Admin). Staff and admin users see **Pedidos**, **Conversas**, and **Cardápio admin** in the navigation.

## Deploy on Vercel

1. Import this repository on [Vercel](https://vercel.com).
2. Add all environment variables from `.env.example` (use production URLs and secrets).
3. Set `DEMO_ADMIN=false`.
4. Deploy — `vercel.json` includes a daily cron for conversation cleanup (LGPD).
5. **Analytics** — `@vercel/analytics` is wired in `app/layout.tsx` via `<Analytics />`. Enable Web Analytics in the Vercel project dashboard (no extra env vars required for the default integration).
6. Add your production URL to Supabase Auth redirect URLs.

### Production checklist

- [ ] `SUPABASE_SERVICE_ROLE_KEY` set on Vercel (admin panel role checks depend on it)
- [ ] `DEMO_ADMIN=false`
- [ ] Supabase Auth redirect URLs include production domain
- [ ] Custom SMTP configured (recommended)
- [ ] Admin user has `profiles.role = 'admin'`
- [ ] Vercel Web Analytics enabled in project settings
- [ ] `CRON_SECRET` set for conversation cleanup cron

## Project structure

```
app/                 # Pages and API routes
  admin/             # Staff panel (orders, conversations, menu)
  auth/              # Login, callback, password reset (planned)
components/          # React UI (menu, cart, chat, checkout, header, admin)
lib/                 # Supabase clients, Groq, orders, cart logic
supabase/
  migrations/        # Database schema + RLS
  seed.sql           # Menu seed data
public/img/          # Menu images
middleware.ts        # Guest session cookie + auth refresh
```

## API routes

| Method | Route              | Purpose                                     |
| ------ | ------------------ | ------------------------------------------- |
| POST   | `/api/chat`        | Groq proxy + conversation audit             |
| POST   | `/api/orders`      | Create order (server-side price validation) |
| GET    | `/api/orders`      | List user/guest orders                      |
| PATCH  | `/api/orders/[id]` | Update order status (staff)                 |
| POST   | `/api/guest/merge` | Link guest history to logged-in user        |

## Security notes

- Never commit `.env.local` or expose `GROQ_API_KEY` / `SUPABASE_SERVICE_ROLE_KEY` in the client.
- RLS is enabled on all public tables.
- Order prices are validated on the server against `menu_items`.
- Vercel Analytics collects anonymous page-view data; no PII is sent by default.

## License

Private project — All rights reserved.
