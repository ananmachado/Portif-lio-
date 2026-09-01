# Login do admin — diagnóstico rápido

Esta versão mantém a autenticação inteiramente server-side. Não use `VITE_SUPABASE_*` e não coloque a Secret key no frontend.

## 1. Vercel > Settings > Environment Variables

A produção precisa ter:

- `SUPABASE_URL` = Project URL do Supabase da aluna
- `SUPABASE_PUBLISHABLE_KEY` = `sb_publishable_...` (ou `SUPABASE_ANON_KEY` legado)
- `SUPABASE_SECRET_KEY` = `sb_secret_...` (ou `SUPABASE_SERVICE_ROLE_KEY` legado)
- `SUPABASE_STORAGE_BUCKET` = `portfolio-media`
- `OWNER_EMAIL` = exatamente o e-mail da conta administradora em Supabase Auth

`ADMIN_EMAIL` também é aceito como fallback server-only, mas prefira `OWNER_EMAIL`.

Depois de alterar qualquer variável, faça um novo deploy da Production.

## 2. Supabase > Authentication > Users

Confirme que a conta existe, usa o mesmo e-mail de `OWNER_EMAIL` e tem senha válida. Em projetos que exigem confirmação de e-mail, a conta também precisa estar confirmada.

## 3. Supabase > SQL Editor

Se as tabelas ainda não existem, rode `supabase/schema.sql`.

Se as tabelas já existem, rode `supabase/fix_portfolio_api_access.sql`.

## 4. Teste a Vercel

Abra:

`https://SEU-SITE.vercel.app/api/health`

Resultado correto:

- `ok: true`
- `supabase.urlConfigured: true`
- `supabase.publishableKeyConfigured: true`
- `supabase.secretKeyConfigured: true`
- `supabase.ownerEmailConfigured: true`
- `database.ok: true`

Se `database.ok` for falso, a própria mensagem agora informa se o problema é Secret key, permissão ou tabela.

## 5. Login

Abra `/admin-login` e entre com a conta de Supabase Auth. Esta versão preserva um `role = admin` já existente em `public.users` e promove automaticamente a conta cujo e-mail coincide com `OWNER_EMAIL`/`ADMIN_EMAIL`.
