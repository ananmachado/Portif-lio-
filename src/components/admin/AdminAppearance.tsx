import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { PRESET_THEMES, calculateContrastRatio, getWCAGStatus } from '../../lib/theme';
import { ThemeConfig } from '../../types';
import { Palette, Sparkles, Check, AlertTriangle, Save, RefreshCw } from 'lucide-react';

export const AdminAppearance: React.FC = () => {
  const { settings, updateSettings, addToast } = usePortfolio();

  const [themeForm, setThemeForm] = useState<ThemeConfig>({
    ...settings.theme_config,
  });

  const handleApplyPreset = (presetConfig: ThemeConfig) => {
    setThemeForm({ ...presetConfig });
    addToast('info', 'Preset de tema selecionado. Clique em "Salvar Tokens" para confirmar.');
  };

  const handleSaveTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      theme_config: themeForm,
    });
  };

  // Contrast Audit
  const textBgRatio = calculateContrastRatio(themeForm.colors.textPrimary, themeForm.colors.bg);
  const textBgStatus = getWCAGStatus(textBgRatio);

  const textSurfaceRatio = calculateContrastRatio(themeForm.colors.textPrimary, themeForm.colors.surface);
  const textSurfaceStatus = getWCAGStatus(textSurfaceRatio);

  return (
    <form onSubmit={handleSaveTheme} className="space-y-8 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Palette className="w-5 h-5 text-[var(--theme-primary)]" />
            <span>Design Tokens & Sistema de Aparência</span>
          </h2>
          <p className="text-xs text-[var(--theme-text-secondary)] mt-1">
            Personalize as cores, tipografia, bordas, sombras e tom de voz da interface autoral.
          </p>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl font-bold text-sm text-white flex items-center gap-2 shadow-sm transition-transform hover:scale-105"
          style={{ backgroundColor: 'var(--theme-primary)' }}
        >
          <Save className="w-4 h-4" />
          <span>Salvar Tokens de Design</span>
        </button>
      </div>

      {/* WCAG Contrast Auditor Panel */}
      <div className="p-6 rounded-2xl border space-y-3" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
        <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Auditor de Contraste e Acessibilidade (WCAG 2.2 AA)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl border flex items-center justify-between" style={{ backgroundColor: themeForm.colors.bg, borderColor: 'var(--theme-border)' }}>
            <div>
              <span className="block text-xs font-bold" style={{ color: themeForm.colors.textPrimary }}>
                Texto Principal sobre Fundo
              </span>
              <span className="text-xs opacity-75" style={{ color: themeForm.colors.textSecondary }}>
                Razão de Contraste: {textBgRatio.toFixed(2)}:1
              </span>
            </div>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${textBgStatus.passAA ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
              {textBgStatus.label}
            </span>
          </div>

          <div className="p-4 rounded-xl border flex items-center justify-between" style={{ backgroundColor: themeForm.colors.surface, borderColor: 'var(--theme-border)' }}>
            <div>
              <span className="block text-xs font-bold" style={{ color: themeForm.colors.textPrimary }}>
                Texto sobre Superfície
              </span>
              <span className="text-xs opacity-75" style={{ color: themeForm.colors.textSecondary }}>
                Razão de Contraste: {textSurfaceRatio.toFixed(2)}:1
              </span>
            </div>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${textSurfaceStatus.passAA ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
              {textSurfaceStatus.label}
            </span>
          </div>
        </div>

        {(!textBgStatus.passAA || !textSurfaceStatus.passAA) && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Aviso: Alguma das combinações de cores escolhidas não atinge o contraste mínimo de 4.5:1 exigido pela WCAG AA.</span>
          </div>
        )}
      </div>

      {/* Presets Quick Selector */}
      <div className="p-6 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
        <h3 className="text-sm font-bold uppercase tracking-wider">Presets de Temas Visuais</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {PRESET_THEMES.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleApplyPreset(preset.config)}
              className="p-4 rounded-xl border text-left space-y-2 transition-all hover:scale-[1.02] focus:outline-none"
              style={{
                backgroundColor: preset.config.colors.surface,
                borderColor: 'var(--theme-border)',
              }}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.config.colors.primary }} />
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.config.colors.bg }} />
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.config.colors.textPrimary }} />
              </div>
              <div>
                <span className="font-bold text-xs block" style={{ color: preset.config.colors.textPrimary }}>
                  {preset.name}
                </span>
                <p className="text-[10px] line-clamp-2" style={{ color: preset.config.colors.textSecondary }}>
                  {preset.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Colors Section */}
      <div className="p-6 rounded-2xl border space-y-6" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
        <h3 className="text-sm font-bold uppercase tracking-wider">Tokens de Cor</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold">Fundo (Background)</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={themeForm.colors.bg}
                onChange={(e) => setThemeForm({ ...themeForm, colors: { ...themeForm.colors, bg: e.target.value } })}
                className="w-10 h-10 rounded-lg cursor-pointer border"
              />
              <input
                type="text"
                value={themeForm.colors.bg}
                onChange={(e) => setThemeForm({ ...themeForm, colors: { ...themeForm.colors, bg: e.target.value } })}
                className="w-full p-2 border rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold">Superfície (Surface)</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={themeForm.colors.surface}
                onChange={(e) => setThemeForm({ ...themeForm, colors: { ...themeForm.colors, surface: e.target.value } })}
                className="w-10 h-10 rounded-lg cursor-pointer border"
              />
              <input
                type="text"
                value={themeForm.colors.surface}
                onChange={(e) => setThemeForm({ ...themeForm, colors: { ...themeForm.colors, surface: e.target.value } })}
                className="w-full p-2 border rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold">Texto Principal</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={themeForm.colors.textPrimary}
                onChange={(e) => setThemeForm({ ...themeForm, colors: { ...themeForm.colors, textPrimary: e.target.value } })}
                className="w-10 h-10 rounded-lg cursor-pointer border"
              />
              <input
                type="text"
                value={themeForm.colors.textPrimary}
                onChange={(e) => setThemeForm({ ...themeForm, colors: { ...themeForm.colors, textPrimary: e.target.value } })}
                className="w-full p-2 border rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold">Cor Primária (Destaque)</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={themeForm.colors.primary}
                onChange={(e) => setThemeForm({ ...themeForm, colors: { ...themeForm.colors, primary: e.target.value } })}
                className="w-10 h-10 rounded-lg cursor-pointer border"
              />
              <input
                type="text"
                value={themeForm.colors.primary}
                onChange={(e) => setThemeForm({ ...themeForm, colors: { ...themeForm.colors, primary: e.target.value } })}
                className="w-full p-2 border rounded-lg text-xs font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tipografia e Formas */}
      <div className="p-6 rounded-2xl border space-y-6" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
        <h3 className="text-sm font-bold uppercase tracking-wider">Forma & Grid</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold">Arredondamento das Bordas (Border Radius)</label>
            <select
              value={themeForm.shape.borderRadius}
              onChange={(e) => setThemeForm({ ...themeForm, shape: { ...themeForm.shape, borderRadius: e.target.value } })}
              className="w-full p-3 rounded-xl border text-xs"
            >
              <option value="0px">Reto (0px - Brutalista)</option>
              <option value="4px">Suave (4px)</option>
              <option value="12px">Padrão (12px)</option>
              <option value="20px">Muito Arredondado (20px)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold">Estilo de Sombra</label>
            <select
              value={themeForm.shape.shadowStyle}
              onChange={(e) => setThemeForm({ ...themeForm, shape: { ...themeForm.shape, shadowStyle: e.target.value as any } })}
              className="w-full p-3 rounded-xl border text-xs"
            >
              <option value="none">Sem sombra (Flat)</option>
              <option value="soft">Sombra Suave (Moderna)</option>
              <option value="sharp">Sombra Marcada (Brutalista)</option>
              <option value="deep">Sombra Profunda (Noturna)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold">Colunas de Cards em Telas Grandes</label>
            <select
              value={themeForm.layout.cardColumns}
              onChange={(e) => setThemeForm({ ...themeForm, layout: { ...themeForm.layout, cardColumns: e.target.value as any } })}
              className="w-full p-3 rounded-xl border text-xs"
            >
              <option value="1">1 Coluna (Editorial amplo)</option>
              <option value="2">2 Colunas (Equilibrado)</option>
              <option value="3">3 Colunas (Grade padrão)</option>
            </select>
          </div>
        </div>
      </div>

      {/* UX Writing & Rótulo dos CTAs */}
      <div className="p-6 rounded-2xl border space-y-6" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
        <h3 className="text-sm font-bold uppercase tracking-wider">UX Writing & Tom de Voz Autoral</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold">Rótulo Principal dos Botões (CTA de Abrir Projeto)</label>
            <select
              value={themeForm.uxVoice.ctaProject}
              onChange={(e) => setThemeForm({ ...themeForm, uxVoice: { ...themeForm.uxVoice, ctaProject: e.target.value } })}
              className="w-full p-3 rounded-xl border text-xs font-semibold"
            >
              <option value="Ver projeto">Ver projeto</option>
              <option value="Explorar">Explorar</option>
              <option value="Conhecer">Conhecer</option>
              <option value="Abrir projeto">Abrir projeto</option>
              <option value="Entrar">Entrar</option>
              <option value="Descobrir">Descobrir</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold">Tom de Voz Cadastrado</label>
            <select
              value={themeForm.uxVoice.tone}
              onChange={(e) => setThemeForm({ ...themeForm, uxVoice: { ...themeForm.uxVoice, tone: e.target.value as any } })}
              className="w-full p-3 rounded-xl border text-xs"
            >
              <option value="direto">Direto & Claro</option>
              <option value="informal">Informal & Próximo</option>
              <option value="poetico">Poético & Sensível</option>
              <option value="academico">Acadêmico & Crítico</option>
              <option value="experimental">Experimental & Provocativo</option>
              <option value="profissional">Profissional & Corporativo</option>
            </select>
          </div>
        </div>
      </div>
    </form>
  );
};
