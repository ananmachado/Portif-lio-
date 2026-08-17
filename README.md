# Portfólio Pessoal Autoral

Sistema completo de portfólio autoral com gerenciador de conteúdo (CMS), editor de blocos dinâmicos, personalização de design tokens, auditor de acessibilidade WCAG 2.2 AA e integração com Supabase.

---

## 🚀 1. Objetivo do Projeto

O **Portfólio Pessoal Autoral** é uma infraestrutura completa para que profissionais criativos (designers, pesquisadores, fotógrafos, artistas e desenvolvedores) administrem seus próprios conteúdos por meio de uma área administrativa protegida e customizável.

A aplicação separa claramente **Conteúdo**, **Estrutura**, **Design System (Tokens)**, **Comportamento** e **Dados**.

---

## 🛠️ 2. Tecnologias Utilizadas

- **Front-end**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Motion.
- **Back-end & Persistência**: Supabase Database (PostgreSQL), Supabase Auth, Supabase Storage, Row Level Security (RLS).
- **Acessibilidade**: WCAG 2.2 AA, WAI-ARIA, Navegação por Teclado, Auditor de Contraste Automático, Suporte a `prefers-reduced-motion`.

---

## 📁 3. Estrutura do Projeto

```text
/
├── .env.example                # Exemplo de variáveis de ambiente do Supabase
├── metadata.json               # Metadados da aplicação
├── README.md                   # Documentação detalhada do projeto
├── package.json                # Dependências e scripts npm
└── src/
    ├── main.tsx                # Ponto de entrada do React
    ├── App.tsx                 # Roteador principal e layout base
    ├── index.css               # Importação do Tailwind e variáveis CSS Globais
    ├── types/
    │   └── index.ts            # Interfaces TypeScript (Projeto, Bloco, Categoria, ThemeConfig)
    ├── lib/
    │   ├── theme.ts            # Gerenciador de Design Tokens, Presets e Calculadora de Contraste WCAG
    │   └── supabase.ts         # Cliente Supabase, Fallback LocalStore e Script SQL completo
    ├── context/
    │   └── PortfolioContext.tsx # Estado global do portfólio (Categorias, Projetos, Blocos, Auth, Toasts)
    └── components/
        ├── common/             # Componentes reutilizáveis (Header, Footer, SkipLink, Modal, Toast)
        ├── public/             # Páginas públicas (About, Projects, ProjectDetail, Contact, BlockRenderer)
        └── admin/              # Área administrativa (Dashboard, Settings, Categories, Projects, BlockEditor, Appearance, DatabaseSetup)
```

---

## 🔑 4. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto contendo suas chaves públicas do Supabase:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-supabase
```

*Nota: Se as variáveis não forem configuradas de início, a aplicação ativará automaticamente o modo de simulação com armazenamento local persistente (LocalStorage).*

---

## 🗄️ 5. Configuração do Banco de Dados Supabase (SQL & RLS)

Acesse o **SQL Editor** no painel do seu projeto Supabase e execute o script abaixo:

```sql
-- 1. CONFIGURAÇÕES
CREATE TABLE IF NOT EXISTS public.portfolio_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  portfolio_name TEXT NOT NULL DEFAULT 'Meu Portfólio Autoral',
  tagline TEXT,
  about_title TEXT,
  about_text TEXT,
  short_bio TEXT,
  profile_image TEXT,
  whatsapp TEXT,
  email_public TEXT,
  location TEXT,
  social_links JSONB DEFAULT '[]'::jsonb,
  ux_voice TEXT DEFAULT 'direto',
  theme_config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. CATEGORIAS
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  display_order INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. PROJETOS
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  cover_image TEXT,
  year TEXT,
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'publicado')),
  featured BOOLEAN DEFAULT false,
  display_order INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. BLOCOS DE CONTEÚDO
CREATE TABLE IF NOT EXISTS public.project_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('texto', 'imagem', 'youtube', 'audio')),
  content TEXT,
  media_url TEXT,
  alt_text TEXT,
  caption TEXT,
  transcript TEXT,
  display_order INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS POLICIES
ALTER TABLE public.portfolio_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver configuracoes" ON public.portfolio_settings FOR SELECT USING (true);
CREATE POLICY "Ver categorias" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Ver projetos publicados" ON public.projects FOR SELECT USING (status = 'publicado' OR auth.uid() = owner_id);
CREATE POLICY "Ver blocos" ON public.project_blocks FOR SELECT USING (true);
```

---

## 🎨 6. Design System & Acessibilidade

1. **Tokens Dinâmicos**: Injeção em tempo real de CSS Custom Properties (`--theme-bg`, `--theme-surface`, `--theme-primary`, `--theme-radius`, etc.).
2. **Auditor WCAG 2.2 AA**: O painel de Aparência calcula dinamicamente a razão de contraste (e.g. `8.25:1 AAA`) entre cor do texto e fundo, notificando se o contraste for inferior a `4.5:1`.
3. **Navegação por Teclado & Leitor de Tela**:
   - Link de atalho no topo ("Pular para o conteúdo principal").
   - Foco visível destruturado ativado (`:focus-visible`).
   - Modais com captura de evento `Escape` e reordenadores acessíveis via botões Mover para cima/baixo.
