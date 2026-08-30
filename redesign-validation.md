# Validação do redesenho editorial

## Rotas verificadas

As rotas públicas `/`, `/projetos`, `/sobre` e `/contato`, além das rotas administrativas `/admin`, `/admin/projetos` e `/admin/aparencia`, foram verificadas em desktop (1280×720) e em mobile (390×844). As capturas confirmaram a presença da nova navegação, da vitrine de projetos, dos estados vazios, do formulário de contato e do menu administrativo responsivo.

| Critério | Evidência de validação | Resultado |
|---|---|---|
| Contraste WCAG AA | Script `scripts/check-contrast.mjs`: texto/fundo 9,05:1, texto secundário/fundo 6,26:1, foco/fundo 4,67:1 e botão 8,77:1 | Aprovado |
| Foco visível | Regra global `:focus-visible` com anel de 3px em `--color-focus` | Aprovado |
| Skip link | Link para `#main-content` no layout público | Aprovado |
| Teclado e menu móvel | Botão nativo, `aria-expanded`, `Escape` fecha o diálogo e restaura foco no acionador | Aprovado |
| Filtros de projetos | Botões com `aria-pressed` e região com `aria-live` | Aprovado |
| Formulário de contato | Labels, `aria-invalid`, mensagens `role=alert` e URL encoding | Aprovado |
| Movimento reduzido | Regra global `prefers-reduced-motion` | Aprovado |
| Conteúdo de mídia | Alt text de imagens, título de iframe e transcrição de áudio | Aprovado |
| Painel móvel | Navegação reorganizada em grade, sem rolagem horizontal | Aprovado |

## Automação

O teste `server/accessibility.redesign.test.ts` protege os elementos críticos do redesenho, incluindo foco, redução de movimento, skip link, retorno de foco após `Escape`, menu, filtros e formulário de contato. A suíte Vitest completa executou **18 testes aprovados** antes deste checkpoint.
