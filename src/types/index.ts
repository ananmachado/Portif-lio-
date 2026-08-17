export type ProjectStatus = 'rascunho' | 'publicado';

export type BlockType = 'texto' | 'imagem' | 'youtube' | 'audio';

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  label: string;
}

export interface ThemeConfig {
  colors: {
    bg: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
    primary: string;
    secondary: string;
    accent: string;
    border: string;
    focus: string;
    success: string;
    warning: string;
    error: string;
  };
  typography: {
    fontHeading: string;
    fontBody: string;
    scaleRatio: number;
    baseSize: string;
  };
  shape: {
    borderRadius: string;
    borderWidth: string;
    shadowStyle: 'none' | 'soft' | 'sharp' | 'deep';
  };
  layout: {
    maxContainerWidth: string;
    gridGap: string;
    cardColumns: '1' | '2' | '3';
  };
  motion: {
    duration: string;
    easing: string;
    reducedMotion: boolean;
  };
  uxVoice: {
    tone: 'direto' | 'informal' | 'poetico' | 'academico' | 'experimental' | 'profissional' | 'minimalista';
    ctaProject: string;
    emptyStateProjectsMessage: string;
    contactIntroText: string;
  };
}

export interface PortfolioSettings {
  id: string;
  owner_id?: string;
  portfolio_name: string;
  tagline: string;
  about_title: string;
  about_text: string;
  short_bio: string;
  profile_image: string;
  whatsapp: string;
  email_public: string;
  location: string;
  social_links: SocialLink[];
  ux_voice: string;
  theme_config: ThemeConfig;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  owner_id?: string;
  name: string;
  slug: string;
  description?: string;
  display_order: number;
  created_at?: string;
}

export interface Project {
  id: string;
  owner_id?: string;
  category_id: string;
  title: string;
  slug: string;
  short_description: string;
  cover_image: string;
  year?: string;
  status: ProjectStatus;
  featured: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectBlock {
  id: string;
  project_id: string;
  type: BlockType;
  content?: string;
  media_url?: string;
  alt_text?: string;
  caption?: string;
  transcript?: string;
  display_order: number;
  created_at?: string;
}

export interface ContactFormData {
  name: string;
  subject: string;
  message: string;
  email?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}
