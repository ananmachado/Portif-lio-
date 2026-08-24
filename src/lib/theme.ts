import { ThemeConfig } from '../types';

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  colors: { bg: '#FAF9F6', surface: '#FFFFFF', textPrimary: '#1C1917', textSecondary: '#57534E', primary: '#2563EB', secondary: '#4F46E5', accent: '#D97706', border: '#E7E5E4', focus: '#2563EB', success: '#16A34A', warning: '#D97706', error: '#DC2626' },
  typography: { fontHeading: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif', fontBody: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif', scaleRatio: 1.25, baseSize: '16px' },
  shape: { borderRadius: '12px', borderWidth: '1px', shadowStyle: 'soft' },
  layout: { maxContainerWidth: '1200px', gridGap: '24px', cardColumns: '3' },
  motion: { duration: '250ms', easing: 'cubic-bezier(0.16, 1, 0.3, 1)', reducedMotion: true },
  brand: { logoMode: 'initial', showTagline: true, headerStyle: 'glass', headerPadding: 'normal' },
  navigation: { projectsLabel: 'Projetos', aboutLabel: 'Sobre', contactLabel: 'Contato', adminLabel: 'Admin', authenticatedAdminLabel: 'Painel Admin', showAdminLink: true },
  components: { buttonStyle: 'solid', cardStyle: 'bordered', hoverLift: true },
  accessibility: { underlineLinks: false, strongFocus: true, minimumTextSize: '16px' },
  uxVoice: { tone: 'direto', ctaProject: 'Ver projeto', emptyStateProjectsMessage: 'Nenhum projeto foi publicado nesta categoria ainda.', contactIntroText: 'Entre em contato diretamente para parcerias, orçamentos ou conversar sobre novos projetos.' },
};

export function normalizeThemeConfig(input?: Partial<ThemeConfig> | null): ThemeConfig {
  const value = input || {};
  return {
    ...DEFAULT_THEME_CONFIG,
    ...value,
    colors: { ...DEFAULT_THEME_CONFIG.colors, ...(value.colors || {}) },
    typography: { ...DEFAULT_THEME_CONFIG.typography, ...(value.typography || {}) },
    shape: { ...DEFAULT_THEME_CONFIG.shape, ...(value.shape || {}) },
    layout: { ...DEFAULT_THEME_CONFIG.layout, ...(value.layout || {}) },
    motion: { ...DEFAULT_THEME_CONFIG.motion, ...(value.motion || {}) },
    brand: { ...DEFAULT_THEME_CONFIG.brand, ...(value.brand || {}) },
    navigation: { ...DEFAULT_THEME_CONFIG.navigation, ...(value.navigation || {}) },
    components: { ...DEFAULT_THEME_CONFIG.components, ...(value.components || {}) },
    accessibility: { ...DEFAULT_THEME_CONFIG.accessibility, ...(value.accessibility || {}) },
    uxVoice: { ...DEFAULT_THEME_CONFIG.uxVoice, ...(value.uxVoice || {}) },
  } as ThemeConfig;
}

export const PRESET_THEMES: { name: string; description: string; config: ThemeConfig }[] = [
  { name: 'Minimalista Neutro', description: 'Limpo, neutro e acolhedor.', config: DEFAULT_THEME_CONFIG },
  { name: 'Editorial Clássico', description: 'Serifas e aparência de revista autoral.', config: normalizeThemeConfig({ colors: { bg: '#F5F2EB', surface: '#FDFAF5', textPrimary: '#141210', textSecondary: '#4A4640', primary: '#8C2B1D', secondary: '#2C3E35', accent: '#B87333', border: '#E0DACE', focus: '#8C2B1D', success: '#2B663A', warning: '#B87333', error: '#991B1B' }, typography: { fontHeading: 'Georgia, serif', fontBody: 'system-ui, sans-serif', scaleRatio: 1.333 }, shape: { borderRadius: '2px', shadowStyle: 'none' }, uxVoice: { tone: 'academico', ctaProject: 'Explorar' } }) },
  { name: 'Brutalista', description: 'Contraste alto, bordas fortes e visual gráfico.', config: normalizeThemeConfig({ colors: { bg: '#F3F4F6', surface: '#FFFFFF', textPrimary: '#000000', textSecondary: '#374151', primary: '#000000', secondary: '#2563EB', accent: '#FACC15', border: '#000000', focus: '#000000', success: '#15803D', warning: '#B45309', error: '#B91C1C' }, typography: { fontHeading: '"Space Grotesk", system-ui, sans-serif' }, shape: { borderRadius: '0px', borderWidth: '2px', shadowStyle: 'sharp' }, components: { buttonStyle: 'outline', cardStyle: 'bordered', hoverLift: false }, uxVoice: { tone: 'experimental', ctaProject: 'Abrir projeto' } }) },
  { name: 'Terracota', description: 'Quente, orgânico e acolhedor.', config: normalizeThemeConfig({ colors: { bg: '#FAF5F0', surface: '#FFFFFF', textPrimary: '#2B2118', textSecondary: '#665444', primary: '#C85A32', secondary: '#556B2F', accent: '#D4A373', border: '#EADBCF', focus: '#C85A32', success: '#4A7C59', warning: '#D4A373', error: '#A43030' }, shape: { borderRadius: '20px', shadowStyle: 'soft' }, uxVoice: { tone: 'informal', ctaProject: 'Conhecer' } }) },
  { name: 'Escuro', description: 'Noturno, elegante e de alto contraste.', config: normalizeThemeConfig({ colors: { bg: '#0F172A', surface: '#1E293B', textPrimary: '#F8FAFC', textSecondary: '#CBD5E1', primary: '#38BDF8', secondary: '#818CF8', accent: '#F59E0B', border: '#334155', focus: '#38BDF8', success: '#4ADE80', warning: '#FBBF24', error: '#F87171' }, shape: { borderRadius: '12px', shadowStyle: 'deep' }, brand: { headerStyle: 'glass' }, uxVoice: { tone: 'profissional', ctaProject: 'Descobrir' } }) },
];

export function applyThemeToCSS(input?: Partial<ThemeConfig> | null) {
  const config = normalizeThemeConfig(input);
  const root = document.documentElement;
  const { colors, typography, shape, layout, motion, brand, components, accessibility } = config;
  Object.entries({ '--theme-bg': colors.bg, '--theme-surface': colors.surface, '--theme-text-primary': colors.textPrimary, '--theme-text-secondary': colors.textSecondary, '--theme-primary': colors.primary, '--theme-secondary': colors.secondary, '--theme-accent': colors.accent, '--theme-border': colors.border, '--theme-focus': colors.focus, '--theme-success': colors.success, '--theme-warning': colors.warning, '--theme-error': colors.error, '--theme-font-heading': typography.fontHeading, '--theme-font-body': typography.fontBody, '--theme-base-size': typography.baseSize, '--theme-radius': shape.borderRadius, '--theme-border-width': shape.borderWidth, '--theme-max-width': layout.maxContainerWidth, '--theme-gap': layout.gridGap, '--theme-duration': motion.duration, '--theme-easing': motion.easing, '--theme-header-padding': brand.headerPadding === 'compact' ? '12px' : brand.headerPadding === 'large' ? '24px' : '16px', '--theme-button-radius': shape.borderRadius, '--theme-card-radius': shape.borderRadius, '--theme-hover-lift': components.hoverLift ? 'translateY(-2px)' : 'none', '--theme-min-text-size': accessibility.minimumTextSize }).forEach(([key, val]) => root.style.setProperty(key, val));
  const shadow = shape.shadowStyle === 'soft' ? '0 4px 20px -2px rgba(0,0,0,.05),0 2px 6px -1px rgba(0,0,0,.03)' : shape.shadowStyle === 'sharp' ? '4px 4px 0 var(--theme-border)' : shape.shadowStyle === 'deep' ? '0 10px 30px -5px rgba(0,0,0,.3)' : 'none';
  root.style.setProperty('--theme-shadow', shadow);
  root.dataset.headerStyle = brand.headerStyle;
  root.dataset.buttonStyle = components.buttonStyle;
  root.dataset.cardStyle = components.cardStyle;
  root.dataset.underlineLinks = accessibility.underlineLinks ? 'true' : 'false';
  root.dataset.strongFocus = accessibility.strongFocus ? 'true' : 'false';
}

function getLuminance(hex: string): number {
  const clean = hex.replace('#', ''); if (clean.length !== 6) return 0.5;
  const rgb = [0, 2, 4].map(i => parseInt(clean.substring(i, i + 2), 16) / 255).map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
}
export function calculateContrastRatio(color1: string, color2: string): number { const a = getLuminance(color1), b = getLuminance(color2); return (Math.max(a,b)+.05)/(Math.min(a,b)+.05); }
export function getWCAGStatus(ratio: number) { return { passAA: ratio >= 4.5, passAAA: ratio >= 7, label: ratio >= 7 ? 'Excelente (WCAG AAA)' : ratio >= 4.5 ? 'Adequado (WCAG AA)' : 'Inadequado (WCAG Falha)' }; }
