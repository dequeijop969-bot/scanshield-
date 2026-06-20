# 🚀 Guia de Migração — ScanShield para Vercel + Supabase

## O que foi feito neste ZIP
- ✅ Removido @base44/sdk completamente
- ✅ Auth substituído por Supabase Auth
- ✅ Banco de dados substituído por Supabase (PostgreSQL)
- ✅ Upload de imagens substituído por Supabase Storage
- ✅ Gemini API agora roda no backend seguro (Vercel Functions)
- ✅ Stripe: checkout, webhook, cancelamento migrados para Vercel Functions
- ✅ Página de Login criada
- ✅ Rotas protegidas configuradas

---

## PASSO 1 — Configurar Supabase (10 min)

1. Acesse **supabase.com** → New Project
2. Anote: **URL do projeto** e **anon key** (em Settings > API)
3. Vá em **SQL Editor** → cole o conteúdo de `supabase-setup.sql` → Run
4. Vá em **Authentication > Providers** → ative Email e Google (opcional)

---

## PASSO 2 — Pegar a chave Gemini (5 min)

1. Acesse **aistudio.google.com**
2. Clique em **Get API Key** → **Create API key**
3. Copie a chave (começa com `AIza...`)

---

## PASSO 3 — Subir no GitHub (2 min)

```bash
# Na pasta do projeto descompactado:
git init
git add .
git commit -m "Migração Base44 → Supabase + Vercel"
git remote add origin https://github.com/SEU_USUARIO/scanshield.git
git push -u origin main
```

---

## PASSO 4 — Configurar na Vercel (10 min)

1. Acesse **vercel.com** → seu projeto ScanShield
2. Vá em **Settings > Environment Variables**
3. Adicione UMA POR UMA (copie do `.env.example`):

| Variável | Onde pegar |
|---|---|
| `VITE_SUPABASE_URL` | Supabase > Settings > API |
| `VITE_SUPABASE_ANON_KEY` | Supabase > Settings > API |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe > Developers > API Keys |
| `GEMINI_API_KEY` | Google AI Studio |
| `STRIPE_SECRET_KEY` | Stripe > Developers > API Keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe > Developers > Webhooks |
| `STRIPE_DEFAULT_PRICE_ID` | Stripe > Products (seu price_id) |
| `SUPABASE_URL` | Supabase > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase > Settings > API (service_role) |

4. Clique em **Redeploy**

---

## PASSO 5 — Configurar Webhook do Stripe (5 min)

1. Stripe > Developers > Webhooks > **Add endpoint**
2. URL: `https://SEU-SITE.vercel.app/api/stripeWebhook`
3. Eventos: `checkout.session.completed`, `customer.subscription.deleted`, `customer.subscription.updated`
4. Copie o **Signing secret** → coloque em `STRIPE_WEBHOOK_SECRET` na Vercel

---

## ✅ Pronto! Seu site está no ar com custo zero.

Dúvidas? Cada arquivo novo está em:
- `src/api/supabaseClient.js` — cliente Supabase
- `src/api/base44Client.js` — camada de compatibilidade
- `src/api/entities.js` — banco de dados
- `src/lib/AuthContext.jsx` — autenticação
- `src/pages/Login.jsx` — tela de login
- `api/analyze.js` — IA Gemini (backend)
- `api/createCheckout.js` — Stripe checkout
- `api/stripeWebhook.js` — Stripe webhook
- `api/cancelSubscription.js` — cancelar assinatura
- `api/adminStats.js` — painel admin
