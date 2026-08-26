import { createClient } from '@supabase/supabase-js';
import { PortfolioSettings, Category, Project, ProjectBlock } from '../types';
import { DEFAULT_THEME_CONFIG } from './theme';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-supabase-project') &&
  supabaseUrl.startsWith('https://')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Initial Default Data for Local Fallback & First-time Boot
export const INITIAL_SETTINGS: PortfolioSettings = {
  id: 'settings-1',
  portfolio_name: 'Portfólio Autoral',
  tagline: 'Designer de Experiências Digitais & Pesquisa Visual',
  about_title: 'Sobre Meu Trabalho',
  about_text: 'Sou especialista em criar interfaces acessíveis, marcas autênticas e sistemas de design resilientes. Acredito na convergência entre clareza funcional, poética visual e acessibilidade universal.',
  short_bio: 'Investigo as interseções entre código, design editorial, arquitetura de informação e impacto social.',
  profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  whatsapp: '5511999999999',
  email_public: 'contato@portfolioautoral.design',
  location: 'São Paulo, Brasil',
  social_links: [
    { id: '1', platform: 'Behance', url: 'https://behance.net', label: 'Behance' },
    { id: '2', platform: 'GitHub', url: 'https://github.com', label: 'GitHub' },
    { id: '3', platform: 'LinkedIn', url: 'https://linkedin.com', label: 'LinkedIn' },
    { id: '4', platform: 'Instagram', url: 'https://instagram.com', label: 'Instagram' },
  ],
  ux_voice: 'direto',
  theme_config: DEFAULT_THEME_CONFIG,
};

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Design de Interfaces', slug: 'design-de-interfaces', description: 'Sistemas web, aplicativos e protótipos focados na experiência do usuário.', display_order: 1 },
  { id: 'cat-2', name: 'Identidade & Editorial', slug: 'identidade-e-editorial', description: 'Projetos gráficos, marca, livros e publicações digitais.', display_order: 2 },
  { id: 'cat-3', name: 'Pesquisa & UX', slug: 'pesquisa-e-ux', description: 'Estudos de usabilidade, mapeamento de jornadas e testes com usuários.', display_order: 3 },
  { id: 'cat-4', name: 'Projetos Experimentais', slug: 'projetos-experimentais', description: 'Explorações visuais, arte gerativa e áudio-design.', display_order: 4 },
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    category_id: 'cat-1',
    title: 'Sistema de Design Acessível para Educação Publica',
    slug: 'sistema-de-design-acessivel',
    short_description: 'Arquitetura de componentes e guias de acessibilidade WCAG 2.2 AA para uma plataforma educacional de grande alcance.',
    cover_image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
    year: '2025',
    status: 'publicado',
    featured: true,
    display_order: 1,
  },
  {
    id: 'proj-2',
    category_id: 'cat-2',
    title: 'Identidade Visual & Edição Especial: Arquivos Urbanos',
    slug: 'identidade-arquivos-urbanos',
    short_description: 'Projeto editorial e sistema tipográfico para catálogo fotográfico sobre memórias arquitetônicas no centro histórico.',
    cover_image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=1200&q=80',
    year: '2024',
    status: 'publicado',
    featured: true,
    display_order: 2,
  },
  {
    id: 'proj-3',
    category_id: 'cat-3',
    title: 'Pesquisa de Usabilidade: Navegação por Voz e Teclado',
    slug: 'pesquisa-navegacao-por-voz',
    short_description: 'Mapeamento das barreiras de usabilidade enfrentadas por leitores de tela em sites de serviços públicos.',
    cover_image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
    year: '2024',
    status: 'publicado',
    featured: false,
    display_order: 3,
  },
];

export const INITIAL_BLOCKS: ProjectBlock[] = [
  {
    id: 'blk-1',
    project_id: 'proj-1',
    type: 'texto',
    content: 'O objetivo principal deste projeto foi construir um sistema de componentes reutilizáveis focado em alta acessibilidade e performance. Foram desenvolvidos mais de 40 componentes com suporte total a leitores de tela, alto contraste e navegação via teclado.',
    display_order: 1,
  },
  {
    id: 'blk-2',
    project_id: 'proj-1',
    type: 'imagem',
    media_url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80',
    alt_text: 'Interface mostrando grade de componentes e testes de contraste em modo claro e escuro',
    caption: 'Grade de tokens de cor e componentes de botão validados perante contraste WCAG 2.2 AA.',
    display_order: 2,
  },
  {
    id: 'blk-3',
    project_id: 'proj-1',
    type: 'youtube',
    media_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    alt_text: 'Demonstração em vídeo da plataforma em uso com navegação via teclado',
    caption: 'Vídeo explicativo cobrindo o fluxo de navegação e atalhos de acessibilidade.',
    display_order: 3,
  },
  {
    id: 'blk-4',
    project_id: 'proj-1',
    type: 'audio',
    media_url: 'https://actions.google.com/sounds/v1/ambiences/outdoor_park.ogg',
    caption: 'Comentário em áudio sobre o processo de teste com usuários com deficiência visual.',
    transcript: 'Neste depoimento gravado durante os testes, o participante relata como a adição de landmarks semânticas e atalhos de navegação acelerou em 3x a conclusão das tarefas essenciais.',
    display_order: 4,
  },
  {
    id: 'blk-5',
    project_id: 'proj-2',
    type: 'texto',
    content: 'A publicação Arquivos Urbanos reúne 150 fotografias em preto e branco documentando fachadas do século XX. O sistema tipográfico utiliza duas famílias complementares para estabelecer hierarquia visual rigorosa.',
    display_order: 1,
  },
  {
    id: 'blk-6',
    project_id: 'proj-2',
    type: 'imagem',
    media_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
    alt_text: 'Livro aberto exibindo layout de página dupla com fotografias e textos em coluna tripla',
    caption: 'Vista da maquete impressa com acabamento em encadernação artesanal.',
    display_order: 2,
  },
];

// SQL Schema Definition for Supabase Database setup
export const SUPABASE_SQL_SCHEMA = `-- ====================================================================
-- SCHEMA COMPLETO PARA SUPABASE - PORTFÓLIO PESSOAL AUTORAL
-- Execute este script no SQL Editor do seu projeto Supabase
-- ====================================================================

-- 1. TABELA DE CONFIGURAÇÕES DO PORTFÓLIO
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

-- 2. TABELA DE CATEGORIAS
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  display_order INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TABELA DE PROJETOS
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

-- 4. TABELA DE BLOCOS DE CONTEÚDO
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

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.portfolio_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_blocks ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS: portfolio_settings
CREATE POLICY "Visitantes podem ver configuracoes" ON public.portfolio_settings
  FOR SELECT USING (true);

CREATE POLICY "Dono autenticado pode gerenciar configuracoes" ON public.portfolio_settings
  FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- POLÍTICAS: categories
CREATE POLICY "Visitantes podem ver categorias" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Dono autenticado pode gerenciar categorias" ON public.categories
  FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- POLÍTICAS: projects
CREATE POLICY "Visitantes podem ver apenas projetos publicados" ON public.projects
  FOR SELECT USING (status = 'publicado' OR auth.uid() = owner_id);

CREATE POLICY "Dono autenticado pode gerenciar projetos" ON public.projects
  FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- POLÍTICAS: project_blocks
CREATE POLICY "Visitantes podem ver blocos de projetos publicados" ON public.project_blocks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = project_blocks.project_id 
      AND (projects.status = 'publicado' OR projects.owner_id = auth.uid())
    )
  );

CREATE POLICY "Dono autenticado pode gerenciar blocos" ON public.project_blocks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = project_blocks.project_id 
      AND projects.owner_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = project_blocks.project_id 
      AND projects.owner_id = auth.uid()
    )
  );

-- ====================================================================
-- CONFIGURAÇÃO DO SUPABASE STORAGE (BUCKET 'portfolio-media')
-- ====================================================================
-- O bucket é público para leitura, mas upload/alteração/remoção exigem
-- uma sessão autenticada. A aplicação salva fotos em:
-- profile/<USER_ID>/<ARQUIVO>

INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-media', 'portfolio-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public can view portfolio media" ON storage.objects;
CREATE POLICY "Public can view portfolio media"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio-media');

DROP POLICY IF EXISTS "Users can upload their portfolio media" ON storage.objects;
CREATE POLICY "Users can upload their portfolio media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'portfolio-media'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can update their portfolio media" ON storage.objects;
CREATE POLICY "Users can update their portfolio media"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'portfolio-media'
  AND (storage.foldername(name))[2] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'portfolio-media'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can delete their portfolio media" ON storage.objects;
CREATE POLICY "Users can delete their portfolio media"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'portfolio-media'
  AND (storage.foldername(name))[2] = auth.uid()::text
);
`;
