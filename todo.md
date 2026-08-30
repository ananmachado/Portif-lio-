# Portfólio Autoral — TODO

## Schema & Backend
- [x] Criar tabelas: portfolio_settings, categories, projects, project_blocks no schema Drizzle
- [x] Gerar migration e aplicar via webdev_execute_sql
- [x] Criar helpers de DB em server/db.ts
- [x] Criar routers tRPC: settings, categories, projects, blocks, upload
- [x] Endpoint de upload de mídia via S3 (imagens e áudios)
- [x] Proteção de rotas admin com adminProcedure

## Design System & Layout
- [x] Tokens CSS (cores, tipografia, spacing, radius, sombras, motion) em index.css
- [x] Fontes Google (Inter + DM Serif Display) no index.html
- [x] ThemeProvider com aplicação dinâmica de tokens do banco (PortfolioContext)
- [x] Layout público com Header, Nav, Skip Link e Footer
- [x] Layout admin com sidebar (AdminLayout)

## Front-end Público
- [x] Página Home (apresentação, bio, links, projetos em destaque)
- [x] Página Projetos com filtro por categoria (acessível por teclado, aria-pressed)
- [x] Página individual de projeto com slug (/projetos/:slug)
- [x] Renderização de blocos: Texto, Imagem, YouTube, Áudio
- [x] Página Sobre
- [x] Página Contato com formulário WhatsApp (URL encoding correto)
- [x] Página 404 acessível com link de retorno
- [x] Skip link "Pular para o conteúdo principal"
- [x] Menu mobile acessível (aria-expanded, foco, ESC, aria-modal)
- [x] Estados loading/empty/error em todos os componentes de dados

## Área Administrativa
- [x] Rota /admin protegida (invisível para visitantes)
- [x] Dashboard com cards de acesso às seções
- [x] Gerenciamento de Categorias (CRUD + ordenação + exclusão segura com estratégias)
- [x] Gerenciamento de Projetos (CRUD + status + capa + categoria + ordenação)
- [x] Editor de blocos de projeto (Texto, Imagem, YouTube, Áudio)
- [x] Reordenação de blocos via botões mover para cima/baixo
- [x] Painel Sobre (editar nome, bio, foto de perfil, links)
- [x] Painel Contato (editar WhatsApp, redes sociais, texto intro)
- [x] Painel Aparência (cores, tipografia, forma, layout, motion, linguagem)
- [x] Preview em tempo real das alterações de aparência
- [x] Painel Configurações (nome do portfólio, tagline, favicon)
- [x] Confirmação antes de exclusão de projetos e categorias
- [x] Feedback de ações (toast para salvar, publicar, excluir, erro)

## SEO & Infraestrutura
- [x] Tag title dinâmica por página (useSEO hook)
- [x] Meta description dinâmica
- [x] Open Graph por projeto (título, descrição, imagem de capa)
- [x] URLs com slug legível (/projetos/nome-do-projeto)
- [x] Favicon configurável via painel

## Acessibilidade
- [x] HTML semântico (header, nav, main, section, article, footer)
- [x] Navegação por teclado em todos os componentes
- [x] Foco visível sem outline:none sem alternativa
- [x] Contraste WCAG 2.2 AA nos tokens padrão
- [x] Labels em todos os campos de formulário
- [x] Mensagens de erro acessíveis (não só por cor)
- [x] prefers-reduced-motion respeitado
- [x] Touch targets adequados para mobile
- [x] Alt text configurável em imagens
- [x] Transcrição em blocos de áudio

## Testes
- [x] Vitest: procedures de settings, categories, projects, blocks (14 testes passando)
- [x] Vitest: validação de slug, auth guard, ordenação

## Redesenho inspirado na referência visual
- [x] Analisar a arquitetura visual, navegação, tipografia e responsividade do site de referência fornecido
- [x] Reestruturar a experiência pública com nova direção visual preservando todas as rotas e funcionalidades existentes
- [x] Adaptar páginas de projetos, detalhes, sobre e contato ao novo sistema visual
- [x] Harmonizar o painel administrativo com a nova identidade visual sem alterar seus recursos de gestão
- [x] Verificar layout desktop e mobile, testes e acessibilidade após o redesenho
- [x] Executar e registrar a validação de acessibilidade pós-redesenho para foco, teclado, contraste, skip link, menu móvel, formulários e estados de erro
- [x] Executar e registrar um smoke test das rotas públicas e do painel em desktop e mobile
- [x] Comprovar contraste WCAG, foco visível e comportamento de teclado na versão final do redesenho

## Login, cadastro e papéis de acesso
- [x] Mapear o fluxo atual de autenticação e o controle de papéis existente
- [x] Criar páginas públicas de login e cadastro com orientação por perfil
- [x] Implementar experiência de usuário autenticado com perfil e opção de sair
- [x] Criar gestão administrativa de usuários e promoção/revogação segura de administradores
- [x] Validar que usuários comuns não acessam rotas administrativas
- [x] Cobrir os fluxos de acesso por perfil com testes e verificação visual
- [x] Adicionar testes para o bloqueio de usuário comum e a liberação de administrador nas rotas administrativas
- [x] Executar e registrar verificação visual das telas de login, cadastro, conta e gestão de usuários por perfil
- [x] Registrar cenários de visitante, usuário comum e administrador, distinguindo as checagens visuais e automatizadas por papel

## Visibilidade do acesso administrativo
- [x] Mapear os pontos atuais de acesso ao painel administrativo
- [x] Destacar o acesso administrativo na navegação e na página inicial
- [x] Validar que o destaque respeita os papéis de usuário e administrador
- [x] Testar a lógica de exibição do atalho administrativo para visitante, usuário comum e administrador
- [x] Registrar a validação visual e funcional dos atalhos administrativos nos três estados de papel
