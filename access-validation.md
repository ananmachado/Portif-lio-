# Validação de login, cadastro e papéis

| Perfil ou cenário | Evidência | Comportamento confirmado |
|---|---|---|
| Visitante | Navegação em sessão sem credenciais para `/entrar` exibiu os links **Cadastrar** e **Entrar**, além do botão de login. A visita direta a `/admin` exibiu “Você precisa estar autenticado” e apenas o link “Entrar como administrador”. | O visitante pode iniciar cadastro/login, mas não recebe o painel. |
| Usuário comum | Testes unitários em `server/accessControl.test.ts` confirmaram que `canAccessAdmin("user")` é falso, que o destino padrão é `/conta` e que uma tentativa de retorno para `/admin/usuarios` é substituída por `/conta`. A página `AdminPage` usa a mesma regra compartilhada para bloquear a interface. | O usuário comum permanece na conta e não alcança rotas administrativas. |
| Administrador | Capturas de `/conta`, `/admin-login` e `/admin/usuarios` com sessão administrativa confirmaram o selo de administrador, os botões de acesso ao painel e a lista de usuários com gestão de papéis. | O administrador acessa o painel e pode promover/revogar papéis de outras contas, com confirmação. |

## Resultado técnico

Foram executados `npx tsc --noEmit` e `pnpm test` com **24 testes aprovados**. As rotas `/entrar`, `/cadastro`, `/conta`, `/admin-login`, `/admin` e `/admin/usuarios` responderam HTTP 200 no smoke test local.
