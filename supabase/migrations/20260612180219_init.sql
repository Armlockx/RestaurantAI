-- profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  telefone text,
  role text not null default 'customer' check (role in ('customer', 'staff', 'admin')),
  created_at timestamptz not null default now()
);

-- menu
create table if not exists public.menu_categories (
  id text primary key,
  nome text not null,
  ordem int not null default 0
);

create table if not exists public.menu_items (
  id text primary key,
  category_id text not null references public.menu_categories(id),
  slug text not null unique,
  nome text not null,
  descricao text not null default '',
  ingredientes text,
  porcao text,
  preco_centavos int not null,
  tags jsonb not null default '[]'::jsonb,
  imagem_url text not null default '',
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

-- orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  guest_session_id uuid,
  status text not null default 'pending' check (status in ('pending','confirmed','preparing','ready','delivered','cancelled')),
  cliente_nome text not null,
  cliente_telefone text not null,
  entrega_tipo text not null,
  endereco text,
  pagamento text not null,
  observacoes text,
  total_centavos int not null,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id text references public.menu_items(id) on delete set null,
  nome_snapshot text not null,
  preco_snapshot_centavos int not null,
  quantidade int not null default 1 check (quantidade > 0)
);

-- conversations
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  guest_session_id uuid,
  started_at timestamptz not null default now()
);

create table if not exists public.conversation_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  raw_content text,
  cart_actions jsonb,
  tokens_in int,
  tokens_out int,
  model text,
  latency_ms int,
  created_at timestamptz not null default now()
);

-- audit
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  guest_session_id uuid,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- indexes
create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_orders_guest on public.orders(guest_session_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_conv_user on public.conversations(user_id);
create index if not exists idx_conv_guest on public.conversations(guest_session_id);

-- RLS
alter table public.profiles enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_messages enable row level security;
alter table public.audit_logs enable row level security;

-- profiles: users read/update own
create policy profiles_select_own on public.profiles for select using (auth.uid() = id);
create policy profiles_update_own on public.profiles for update using (auth.uid() = id);

-- menu: public read
create policy menu_cat_read on public.menu_categories for select using (true);
create policy menu_items_read on public.menu_items for select using (ativo = true);

-- orders: customers see own
create policy orders_select_own on public.orders for select using (auth.uid() = user_id);
create policy order_items_select_own on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
);

-- staff read all orders
create policy orders_staff_select on public.orders for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('staff','admin'))
);
create policy orders_staff_update on public.orders for update using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('staff','admin'))
);

-- conversations: own only
create policy conv_select_own on public.conversations for select using (auth.uid() = user_id);
create policy conv_msg_select_own on public.conversation_messages for select using (
  exists (select 1 from public.conversations c where c.id = conversation_id and c.user_id = auth.uid())
);

-- staff read conversations
create policy conv_staff_select on public.conversations for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('staff','admin'))
);
create policy conv_msg_staff_select on public.conversation_messages for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('staff','admin'))
);

-- Realtime
alter publication supabase_realtime add table public.orders;

-- trigger: create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nome, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome', new.email), 'customer')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
