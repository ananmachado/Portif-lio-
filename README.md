# Portfólio Autoral — Vercel + Supabase

Projeto full-stack com:

- `client/`: React + Vite;
- `server/`: Express + tRPC;
- `api/`: entrada serverless do Vercel;
- `supabase/`: SQL do banco e permissões;
- `drizzle/` e `shared/`: tipos compartilhados.

## Autenticação

A autenticação foi organizada em um único fluxo server-side:

1. o navegador envia somente e-mail e senha para `POST /api/auth/login`;
2. a função Express no Vercel autentica no Supabase Auth;
3. o servidor sincroniza a conta em `public.users`;
4. a administradora é identificada por `OWNER_EMAIL` ou por `role = 'admin'` já existente;
5. access token e refresh token ficam em cookies HTTP-only;
6. o frontend chama tRPC com `credentials: "include"` e nunca recebe uma chave do Supabase.

Não existe `VITE_SUPABASE_*`, `VITE_OWNER_USER_ID` nem sessão Supabase em `localStorage`/`sessionStorage`.

O `vite.config.ts` também desativa o prefixo público padrão `VITE_*`. Somente variáveis explicitamente prefixadas com `PUBLIC_CLIENT_` poderiam ser expostas ao navegador, e o projeto atualmente não usa nenhuma.

## Variáveis obrigatórias na Vercel

Configure em **Vercel → Project → Settings → Environment Variables**:

```text
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY
SUPABASE_STORAGE_BUCKET
OWNER_EMAIL
```

Valor recomendado do bucket:

```text
SUPABASE_STORAGE_BUCKET=portfolio-media
```

`OWNER_EMAIL` deve ser exatamente o e-mail usado pela aluna em **Supabase → Authentication → Users**. A versão corrigida também aceita `ADMIN_EMAIL` como fallback server-side para não quebrar projetos Vercel antigos, mas `OWNER_EMAIL` continua sendo o nome recomendado.

Nunca coloque a `sb_secret_...` em uma variável do frontend ou no GitHub.

## Banco

Para um banco novo, rode `supabase/schema.sql` no SQL Editor.

Para um banco que já possui as tabelas, rode `supabase/fix_portfolio_api_access.sql` para garantir o acesso server-side da Secret key à Data API.

## Teste depois do deploy

Abra:

```text
https://SEU-SITE.vercel.app/api/health
```

Quando a configuração estiver completa, a resposta deve ter `ok: true`. Além das variáveis, o endpoint testa se a função da Vercel consegue realmente ler `public.users` usando a chave de servidor. Nenhum valor de chave nem dado de usuário é retornado.

Depois teste:

```text
https://SEU-SITE.vercel.app/admin-login
```

Mais detalhes em `VERCEL_SUPABASE.md`.
