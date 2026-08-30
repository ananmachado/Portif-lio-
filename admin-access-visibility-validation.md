# Validação de visibilidade do acesso administrativo

| Estado | Evidência | Resultado |
|---|---|---|
| Visitante | Navegação sem sessão autenticada exibiu `Cadastrar`, `Admin` e `Entrar`; a página inicial exibiu o link “Já é administrador? Entre no painel”, todos apontando para `/admin-login`. | Acesso administrativo está claro sem expor `/admin`. |
| Usuário comum | `server/adminShortcut.test.ts` confirmou que o atalho de login é exibido para `user` e aponta para `/admin-login`. `server/accessControl.test.ts` confirmou que esse papel não acessa o painel e retorna para `/conta`. A integração final é verificada por `server/adminShortcut.integration.test.ts`, que confirma o uso dessa regra na navegação e na Home. | Usuário comum tem orientação de acesso e permanece protegido. |
| Administrador | A captura da Home na sessão administrativa exibiu `Painel` na navegação — sem o link `Admin` extra — e o botão “Acessar painel”. Os testes confirmaram que o atalho extra de `/admin-login` não é renderizado para `admin`. | Administrador recebe acesso direto ao painel, sem links redundantes. |

## Testes

As validações finais executaram TypeScript sem erros e incluem regras de atalho administrativo, controle de acesso por papel, integração de navegação/Home e política de promoção/revogação de administradores.
