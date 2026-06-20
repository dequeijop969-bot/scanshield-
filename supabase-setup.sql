-- =====================================================
-- SCANSHIELD — Setup do banco de dados no Supabase
-- Cole este SQL no SQL Editor do Supabase e execute
-- =====================================================

-- 1. Tabela de perfis de usuário
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  role text default 'user',
  is_premium boolean default false,
  subscription_id text,
  subscription_status text,
  plan_name text,
  plan_price_id text,
  cancel_at_period_end boolean default false,
  monthly_analyses int default 0,
  created_at timestamptz default now()
);

-- 2. Tabela de análises
create table public.screen_analyses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  image_url text,
  analysis_type text,
  risk_level text,
  risk_score numeric,
  title text,
  summary text,
  product_name text,
  price_found numeric,
  estimated_market_price numeric,
  price_verdict text,
  seller_info text,
  red_flags text[],
  green_flags text[],
  recommendations text[],
  detailed_analysis text,
  deepfake_probability numeric,
  deepfake_model_detected text,
  deepfake_artifacts text[],
  user_feedback text,
  real_risk_level text,
  created_at timestamptz default now()
);

-- 3. Habilitar Row Level Security
alter table public.profiles enable row level security;
alter table public.screen_analyses enable row level security;

-- 4. Políticas de segurança
create policy "Usuário vê e edita próprio perfil"
  on profiles for all
  using (auth.uid() = id);

create policy "Usuário vê e edita próprias análises"
  on screen_analyses for all
  using (auth.uid() = user_id);

-- 5. Criar perfil automaticamente ao registrar
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. Storage para uploads de imagens
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict do nothing;

create policy "Usuários autenticados podem fazer upload"
  on storage.objects for insert
  with check (auth.role() = 'authenticated');

create policy "Imagens são públicas para leitura"
  on storage.objects for select
  using (bucket_id = 'uploads');
