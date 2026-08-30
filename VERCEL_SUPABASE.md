# Deploy no Vercel + Supabase

## 1. Use este projeto inteiro

A raiz do GitHub precisa conter, entre outros:

```text
api/
client/
drizzle/
server/
shared/
supabase/
package.json
pnpm-lock.yaml
vercel.json
vite.config.ts
```

Não copie os arquivos de `server/` para `client/src/` ou `src/`. O backend precisa continuar fora do bundle do Vite.

## 2. Supabase

No projeto Supabase correto:

1. confirme que o projeto está ativo;
2. em **Authentication → Providers → Email**, deixe e-mail/senha habilitado;
3. em **Authentication → Users**, confirme que existe a conta da aluna;
4. em **Settings → API Keys**, copie:
   - Project URL;
   - Publishable key (`sb_publishable_...`);
   - Secret key (`sb_secret_...`).

A Secret key é exclusivamente de servidor. O Supabase rejeita uma `sb_secret_...` usada por código de navegador.

### Banco novo

Execute `supabase/schema.sql` no SQL Editor.

### Banco já existente

Execute `supabase/fix_portfolio_api_access.sql` no SQL Editor.

O servidor acessa as tabelas pelo Data API com a Secret key. O frontend não acessa diretamente as tabelas do Supabase.

## 3. Variáveis na Vercel

Em **Vercel → Project → Settings → Environment Variables**, configure em Production (e Preview se vocês usam Preview):

```text
SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
SUPABASE_STORAGE_BUCKET=portfolio-media
OWNER_EMAIL=email-exato-da-aluna@...
```

Não usar:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_SECRET_KEY
VITE_SUPABASE_ADMIN_EMAIL
VITE_OWNER_USER_ID
```

Mesmo que alguma variável `VITE_*` fique cadastrada por engano na Vercel, este projeto não usa o prefixo padrão `VITE_*` no bundle do navegador.

## 4. OWNER_EMAIL

`OWNER_EMAIL` deve ser exatamente o mesmo e-mail usado no Supabase Auth.

No login, se esse e-mail autenticar corretamente, o servidor sincroniza a linha em `public.users` e define `role = 'admin'`.

Se a tabela já tiver a conta, você pode conferir no SQL Editor:

```sql
select id, "openId", email, role
from public.users
order by id;
```

Se for necessário corrigir manualmente:

```sql
update public.users
set role = 'admin'
where lower(email) = lower('EMAIL_DA_ALUNA');
```

## 5. Sessão

O navegador envia apenas e-mail/senha para a API do próprio site.

O Vercel conversa com o Supabase Auth e grava os tokens de sessão em cookies HTTP-only. Esses tokens não ficam em `localStorage` nem `sessionStorage`, e o tRPC não envia uma chave Supabase no header a partir do navegador.

## 6. Redeploy

Depois de alterar variáveis, faça um novo deploy na Vercel. Se houver a opção, faça o redeploy sem reaproveitar cache de build.

## 7. Diagnóstico

Abra primeiro:

```text
/api/health
```

Exemplo esperado:

```json
{
  "ok": true,
  "service": "portfolio-api",
  "supabase": {
    "urlConfigured": true,
    "publishableKeyConfigured": true,
    "publishableKeyLooksValid": true,
    "secretKeyConfigured": true,
    "secretKeyLooksValid": true,
    "ownerEmailConfigured": true,
    "storageBucket": "portfolio-media"
  }
}
```

Se `ok` for `false`, a própria resposta mostra qual variável está faltando, sem revelar valores secretos.

Depois acesse `/admin-login`.

### Mensagens úteis

- `SUPABASE_PUBLISHABLE_KEY recebeu uma Secret key` → a chave foi colocada na variável errada.
- `SUPABASE_SECRET_KEY recebeu uma Publishable key` → as duas chaves foram invertidas.
- `Invalid login credentials` → conferir e-mail/senha em Supabase Auth.
- `não possui permissão de administrador` → conferir `OWNER_EMAIL` e `public.users.role`.
- `/api/health` retorna 404 → o deploy não está usando a arquitetura full-stack correta ou a rota serverless não foi publicada.
- `Forbidden use of secret API key in browser` → há código antigo publicado ou outro projeto/branch está sendo deployado; este projeto não envia a Secret key ao browser.
