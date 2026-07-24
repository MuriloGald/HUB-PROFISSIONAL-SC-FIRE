# SC Fire CRM (teste)

Versão de teste, separada do módulo `/crm` do Hub, de um **CRM com agente SDR de IA** para
WhatsApp. Adaptada do projeto de referência [`CRM-IA`](../../Claude_Code_Version/CRM-IA)
(`Claude_Code_Version/`), com a identidade visual da SC Fire (cor `#ff4b2b`, tipografia
Outfit + Inter, logo) e conteúdo/copy ajustados para o negócio de segurança contra
incêndio (laudos, PPCI, treinamentos de brigada) no lugar do contexto original de educação.

App **100% local**, sem Lovable. React + Vite + TypeScript + Tailwind, com backend
Supabase **próprio** (opcional) — independente do Next.js do Hub (`src/`) ao lado.

---

## Rodar agora (backend real, local)

O app roda com um **servidor real** (Node) que faz autenticação de verdade (login/senha
com hash) e **salva os dados em disco** (`server/data.json`). Não precisa de Docker nem
de contas externas.

```bash
npm install
npm start      # sobe o servidor (porta 8787) + o site (porta 5173) juntos
```

Abra <http://localhost:5173>.

**Conta oficial (já criada):**

| Papel | E-mail | Senha |
|---|---|---|
| Administrador | `galdinomus@gmail.com` | `scfire2026` |

> Troque a senha depois em **Perfil → Trocar senha**. Você também pode criar novas contas
> em **Criar conta** — elas entram como “pendente” e um administrador aprova na tela **Admin**.

O que funciona de verdade: login/cadastro persistentes, aprovação de usuários, onboarding
em 4 passos, configuração do agente + Playground de IA (Gemini), instâncias de WhatsApp,
e **CRM Kanban com dados reais** (crie leads em “Novo lead”, arraste entre etapas — tudo salvo).

### Rodar em dois terminais (alternativa)

```bash
npm run server   # terminal 1 — API em http://localhost:8787
npm run dev      # terminal 2 — site em http://localhost:5173
```

### Modo demonstração (opcional)

Para uma versão só-frontend com dados de exemplo em memória, rode com `VITE_USE_MOCK=true`:

```bash
VITE_USE_MOCK=true npm run dev
```

### Fazer a IA responder (grátis, com Google Gemini)

1. Pegue uma **chave grátis** em <https://aistudio.google.com/app/apikey>.
2. No app, vá em **Agente IA** → cole a chave em *Integração de IA — Google Gemini* → **Testar chave**.
3. Use o **Playground** na mesma tela: escreva como um lead e o agente responde ao vivo,
   usando o prompt montado a partir da configuração (ver `src/lib/promptBuilder.ts`).

> A chave fica salva apenas no seu navegador (localStorage) no modo demo. Em produção,
> configure-a como secret no backend (`supabase secrets set GEMINI_API_KEY=...`), nunca no frontend.

### Conectar o WhatsApp (UaiZapi)

Vá em **WhatsApp** → *Conexão UaiZapi (API)* → informe **Base URL** e **Token** da sua conta →
**Testar conexão**. O envio real de mensagens deve passar pela edge function `send-message`
(evita CORS e mantém o token fora do navegador).

---

## Conectar seu Supabase (produção, fora do Lovable)

1. Crie um projeto grátis em <https://supabase.com>.
2. Copie o `.env`:
   ```bash
   cp .env.example .env
   ```
   Preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (Project Settings → API).
   Ao preencher, o app **sai do modo mock automaticamente**.
3. Aplique o schema (tabelas, RLS, `has_role`, trigger de signup):
   - Via SQL Editor do Supabase: cole `supabase/migrations/0001_init.sql` e depois
     `supabase/migrations/0002_policies.sql`; **ou**
   - Via CLI:
     ```bash
     npm i -g supabase
     supabase link --project-ref SEU_REF
     supabase db push
     ```
4. Torne-se admin (após se cadastrar pelo app):
   ```sql
   insert into public.user_roles (user_id, role)
   select id, 'admin' from auth.users where email = 'galdinomus@gmail.com'
   on conflict do nothing;
   ```
5. (Opcional) Suba as edge functions e configure os secrets:
   ```bash
   supabase functions deploy whatsapp-connect send-message ai-agent whatsapp-webhook
   supabase secrets set UAIZAPI_BASE_URL=... UAIZAPI_TOKEN=... LOVABLE_AI_API_KEY=... AI_API_URL=...
   ```

---

## Publicar online (grátis) — opcional

Este app é um site estático (Vite SPA) e no modo demo roda **sem backend**.

> **Importante:** se for versionar/publicar separadamente do Hub, defina o **Root
> Directory / Base directory** como `crm-ia-teste` ao conectar o repositório na
> Vercel/Netlify.

- **Vercel:** importe o repositório em <https://vercel.com/new> — detecta Vite automaticamente
  (`vercel.json` já cuida das rotas SPA).
- **Netlify:** <https://app.netlify.com/start> — build `npm run build`, publish `dist`
  (já vem em `netlify.toml`).

## Estrutura

```
src/
  lib/backend/     # camada única de backend: mock (memória) OU supabase (real)
  lib/promptBuilder.ts   # monta o prompt do agente SDR
  hooks/           # useAuth, useToast
  components/      # ui/ (kit), layout/ (sidebar, header), RouteGuards
  pages/           # Login, Signup, Paywall, Dashboard, Configuracao,
                   # AgenteIA, WhatsApp, CRM, Perfil, Admin
  types/domain.ts  # tipos do domínio
supabase/
  migrations/      # schema + RLS + has_role + trigger
  functions/       # edge functions (padrão {ok,data,error}, verify_jwt em config.toml)
```

## Scripts

- `npm run dev` — servidor de desenvolvimento
- `npm run build` — build de produção (type-check + Vite)
- `npm run preview` — pré-visualiza o build
- `npm run typecheck` — checagem de tipos

## Convenções

- Cor primária **fire-red `#ff4b2b`** e demais cores só via tokens em `src/index.css`
  (nunca hardcoded) — alinhado a `Identidade Visual/mostruario.html`.
- Tipografia: **Outfit** (títulos) + **Inter** (corpo), como no restante da SC Fire.
- Erros ao usuário sempre traduzidos (`src/lib/translateError.ts`).
- Edge functions: HTTP 200 com `{ ok, data, error }`; parse seguro (`text()` antes de `JSON.parse`).
