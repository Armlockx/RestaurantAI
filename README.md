# RestaurantAI

AI-powered restaurant menu and ordering app built with **Next.js**, **Supabase**, and **Groq**. Customers browse the menu, chat with an assistant to place orders, manage a cart, and checkout as a guest or logged-in user. Staff can manage orders, conversations, and menu items from an admin panel.

Live stack: **Vercel** (app + API) + **Supabase** (Postgres, Auth, Realtime).

## Features

- **Menu** — Grid catalog loaded from Supabase (SSR + fallback data for local dev)
- **Shopping cart** — Client-side cart with localStorage persistence
- **AI assistant** — Groq-powered chat that answers menu questions and adds items to the cart via structured actions
- **Checkout** — Guest checkout with name, phone, delivery type, and payment method
- **Auth** — Supabase magic link; guest session merge on login
- **Admin** — `/admin/orders`, `/admin/conversations`, `/admin/menu` (staff/admin roles)
- **Realtime** — Order status updates via Supabase Realtime
- **Audit** — Conversation and order events stored for review

## Tech stack


| Layer    | Technology                                 |
| -------- | ------------------------------------------ |
| Frontend | Next.js 15 (App Router), React, TypeScript |
| Backend  | Next.js Route Handlers                     |
| Database | Supabase Postgres + RLS                    |
| Auth     | Supabase Auth (`@supabase/ssr`)            |
| AI       | Groq API (`llama-3.3-70b-versatile`)       |
| Deploy   | Vercel                                     |


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
| `SUPABASE_SERVICE_ROLE_KEY`     | Server-only; never expose to the browser                                         |
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

- `supabase/migrations/20250612000000_init.sql`
- `supabase/seed.sql`

### 4. Supabase Auth

In **Authentication → URL Configuration**, add:

- Site URL: your app URL
- Redirect URLs: `http://localhost:3000/auth/callback`, `https://*.vercel.app/auth/callback`

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

## Deploy on Vercel

1. Import this repository on [Vercel](https://vercel.com).
2. Add all environment variables from `.env.example` (use production URLs and secrets).
3. Set `DEMO_ADMIN=false`.
4. Deploy — `vercel.json` includes a daily cron for conversation cleanup (LGPD).

## Project structure

```
app/                 # Pages and API routes
components/          # React UI (menu, cart, chat, checkout, admin)
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

## License

Private project — All rights reserved.