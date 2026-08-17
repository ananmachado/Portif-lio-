import { ThemeConfig } from '../types';

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  colors: {
    bg: '#FAF9F6',
    surface: '#FFFFFF',
    textPrimary: '#1C1917',
    textSecondary: '#57534E',
    primary: '#2563EB',
    secondary: '#4F46E5',
    accent: '#D97706',
    border: '#E7E5E4',
    focus: '#2563EB',
    success: '#16A34A',
    warning: '#D97706',
    error: '#DC2626',
  },
  typography: {
    fontHeading: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
    fontBody: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
    scaleRatio: 1.25,
    baseSize: '16px',
  },
  shape: {
    borderRadius: '12px',
    borderWidth: '1px',
    shadowStyle: 'soft',
  },
  layout: {
    maxContainerWidth: '1200px',
    gridGap: '24px',
    cardColumns: '3',
  },
  motion: {
    duration: '250ms',
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
    reducedMotion: true,
  },
  uxVoice: {
    tone: 'direto',
    ctaProject: 'Ver projeto',
    emptyStateProjectsMessage: 'Nenhum projeto foi publicado nesta categoria ainda.',
    contactIntroText: 'Entre em contato diretamente para parcerias, orçamentos ou conversar sobre novos projetos.',
  },
};

export const PRESET_THEMES: { name: string; description: string; config: ThemeConfig }[] = [
  {
    name: 'Minimalista Neutro',
    description: 'Design limpo, focado no conteúdo com tons neutros e acolhedores.',
    config: DEFAULT_THEME_CONFIG,
  },
  {
    name: 'Editorial Clássico',
    description: 'Tipografia marcante serifada, visual sofisticado de revista autoral.',
    config: {
      ...DEFAULT_THEME_CONFIG,
      colors: {
        bg: '#F5F2EB',
        surface: '#FDFAF5',
        textPrimary: '#141210',
        textSecondary: '#4A4640',
        primary: '#8C2B1D',
        secondary: '#2C3E35',
        accent: '#B87333',
        border: '#E0DACE',
        focus: '#8C2B1D',
        success: '#2B663A',
        warning: '#B87333',
        error: '#991B1B',
      },
      typography: {
        fontHeading: 'Georgia, serif',
        fontBody: 'system-ui, -apple-system, sans-serif',
        scaleRatio: 1.333,
        baseSize: '16px',
      },
      shape: {
        borderRadius: '2px',
        borderWidth: '1px',
        shadowStyle: 'none',
      },
      uxVoice: {
        ...DEFAULT_THEME_CONFIG.uxVoice,
        tone: 'academico',
        ctaProject: 'Explorar',
      },
    },
  },
  {
    name: 'Brutalista Contemporâneo',
    description: 'Alto contraste, bordas retas e fortes, presença gráfica marcante.',
    config: {
      ...DEFAULT_THEME_CONFIG,
      colors: {
        bg: '#F3F4F6',
        surface: '#FFFFFF',
        textPrimary: '#000000',
        textSecondary: '#374151',
        primary: '#000000',
        secondary: '#2563EB',
        accent: '#FACC15',
        border: '#000000',
        focus: '#000000',
        success: '#15803D',
        warning: '#B45309',
        error: '#B91C1C',
      },
      typography: {
        fontHeading: '"Space Grotesk", system-ui, sans-serif',
        fontBody: 'system-ui, sans-serif',
        scaleRatio: 1.25,
        baseSize: '16px',
      },
      shape: {
        borderRadius: '0px',
        borderWidth: '2px',
        shadowStyle: 'sharp',
      },
      uxVoice: {
        ...DEFAULT_THEME_CONFIG.uxVoice,
        tone: 'experimental',
        ctaProject: 'Abrir projeto',
      },
    },
  },
  {
    name: 'Terracota Orgânico',
    description: 'Cores quentes e naturais, formas suaves e atmosfera acolhedora.',
    config: {
      ...DEFAULT_THEME_CONFIG,
      colors: {
        bg: '#FAF5F0',
        surface: '#FFFFFF',
        textPrimary: '#2B2118',
        textSecondary: '#665444',
        primary: '#C85A32',
        secondary: '#556B2F',
        accent: '#D4A373',
        border: '#EADBCF',
        focus: '#C85A32',
        success: '#4A7C59',
        warning: '#D4A373',
        error: '#A43030',
      },
      shape: {
        borderRadius: '20px',
        borderWidth: '1px',
        shadowStyle: 'soft',
      },
      uxVoice: {
        ...DEFAULT_THEME_CONFIG.uxVoice,
        tone: 'informal',
        ctaProject: 'Conhecer',
      },
    },
  },
  {
    name: 'Monocromático Escuro',
    description: 'Atmosfera noturna elegante com contraste alto e legível.',
    config: {
      ...DEFAULT_THEME_CONFIG,
      colors: {
        bg: '#0F172A',
        surface: '#1E293B',
        textPrimary: '#F8FAFC',
        textSecondary: '#94A3B8',
        primary: '#38BDF8',
        secondary: '#818CF8',
        accent: '#F59E0B',
        border: '#334155',
        focus: '#38BDF8',
        success: '#4ADE80',
        warning: '#FBBF24',
        error: '#F87171',
      },
      shape: {
        borderRadius: '12px',
        borderWidth: '1px',
        shadowStyle: 'deep',
      },
      uxVoice: {
        ...DEFAULT_THEME_CONFIG.uxVoice,
        tone: 'profissional',
        ctaProject: 'Descobrir',
      },
    },
  },
];

export function applyThemeToCSS(config: ThemeConfig) {
  const root = document.documentElement;
  const { colors, typography, shape, layout, motion } = config;

  root.style.setProperty('--theme-bg', colors.bg);
  root.style.setProperty('--theme-surface', colors.surface);
  root.style.setProperty('--theme-text-primary', colors.textPrimary);
  root.style.setProperty('--theme-text-secondary', colors.textSecondary);
  root.style.setProperty('--theme-primary', colors.primary);
  root.style.setProperty('--theme-secondary', colors.secondary);
  root.style.setProperty('--theme-accent', colors.accent);
  root.style.setProperty('--theme-border', colors.border);
  root.style.setProperty('--theme-focus', colors.focus);
  root.style.setProperty('--theme-success', colors.success);
  root.style.setProperty('--theme-warning', colors.warning);
  root.style.setProperty('--theme-error', colors.error);

  root.style.setProperty('--theme-font-heading', typography.fontHeading);
  root.style.setProperty('--theme-font-body', typography.fontBody);
  root.style.setProperty('--theme-base-size', typography.baseSize);

  root.style.setProperty('--theme-radius', shape.borderRadius);
  root.style.setProperty('--theme-border-width', shape.borderWidth);

  root.style.setProperty('--theme-max-width', layout.maxContainerWidth);
  root.style.setProperty('--theme-gap', layout.gridGap);

  root.style.setProperty('--theme-duration', motion.duration);
  root.style.setProperty('--theme-easing', motion.easing);

  // Box shadow mapping
  let shadowVal = 'none';
  if (shape.shadowStyle === 'soft') {
    shadowVal = '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)';
  } else if (shape.shadowStyle === 'sharp') {
    shadowVal = '4px 4px 0px 0px var(--theme-border)';
  } else if (shape.shadowStyle === 'deep') {
    shadowVal = '0 10px 30px -5px rgba(0, 0, 0, 0.3)';
  }
  root.style.setProperty('--theme-shadow', shadowVal);
}

// WCAG Contrast ratio helper
function getLuminance(hex: string): number {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return 0.5;

  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const a = [r, g, b].map((v) => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

export function calculateContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

export function getWCAGStatus(ratio: number): { passAA: boolean; passAAA: boolean; label: string } {
  const passAA = ratio >= 4.5;
  const passAAA = ratio >= 7;
  let label = 'Inadequado (WCAG Falha)';
  if (passAAA) label = 'Excelente (WCAG AAA)';
  else if (passAA) label = 'Adequado (WCAG AA)';

  return { passAA, passAAA, label };
}
