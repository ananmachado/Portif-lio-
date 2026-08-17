import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Project, ProjectBlock, BlockType } from '../../types';
import { BlockRenderer } from '../public/BlockRenderer';
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Type,
  Image as ImageIcon,
  Video,
  Music,
  Eye,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export const AdminProjectEditor: React.FC = () => {
  const {
    editingProjectId,
    setEditingProjectId,
    projects,
    categories,
    blocks,
    addProject,
    updateProject,
    addBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks,
    setAdminSubView,
    addToast,
  } = usePortfolio();

  const existingProject = projects.find((p) => p.id === editingProjectId);

  const [projectForm, setProjectForm] = useState<Partial<Project>>({
    title: '',
    slug: '',
    short_description: '',
    category_id: categories[0]?.id || '',
    cover_image: '',
    year: new Date().getFullYear().toString(),
    status: 'rascunho',
    featured: false,
    display_order: projects.length + 1,
  });

  const [activeTab, setActiveTab] = useState<'info' | 'blocks' | 'preview'>('info');

  // Load existing project if editing
  useEffect(() => {
    if (existingProject) {
      setProjectForm({ ...existingProject });
    }
  }, [existingProject]);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (val: string) => {
    setProjectForm((prev) => ({
      ...prev,
      title: val,
      slug: existingProject ? prev.slug : generateSlug(val),
    }));
  };

  const handleSaveProjectInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title?.trim()) {
      addToast('error', 'O título do projeto é obrigatório.');
      return;
    }

    if (existingProject) {
      await updateProject(projectForm as Project);
    } else {
      const created = await addProject(projectForm as Omit<Project, 'id'>);
      setEditingProjectId(created.id);
    }
    setActiveTab('blocks');
  };

  // Block management
  const projectBlocks = editingProjectId
    ? blocks
        .filter((b) => b.project_id === editingProjectId)
        .sort((a, b) => a.display_order - b.display_order)
    : [];

  const handleAddBlock = async (type: BlockType) => {
    if (!editingProjectId) {
      addToast('warning', 'Salve as informações do projeto primeiro para adicionar blocos.');
      return;
    }

    let defaultContent = '';
    let defaultCaption = '';
    let defaultAlt = '';

    if (type === 'texto') defaultContent = 'Digite seu texto em parágrafos aqui...';
    if (type === 'imagem') {
      defaultContent = '';
      defaultAlt = 'Descrição acessível da imagem';
    }
    if (type === 'youtube') defaultCaption = 'Demonstração em vídeo';
    if (type === 'audio') defaultCaption = 'Comentário em áudio';

    await addBlock({
      project_id: editingProjectId,
      type,
      content: defaultContent,
      media_url: type === 'youtube' ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' : '',
      alt_text: defaultAlt,
      caption: defaultCaption,
      transcript: type === 'audio' ? 'Transcrição textual do áudio...' : '',
      display_order: projectBlocks.length + 1,
    });
  };

  const handleMoveBlockUp = (index: number) => {
    if (index === 0) return;
    const items = [...projectBlocks];
    const temp = items[index];
    items[index] = items[index - 1];
    items[index - 1] = temp;
    reorderBlocks(items);
  };

  const handleMoveBlockDown = (index: number) => {
    if (index === projectBlocks.length - 1) return;
    const items = [...projectBlocks];
    const temp = items[index];
    items[index] = items[index + 1];
    items[index + 1] = temp;
    reorderBlocks(items);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--theme-border)' }}>
        <button
          onClick={() => setAdminSubView('projects')}
          className="flex items-center gap-2 text-sm font-semibold hover:underline"
          style={{ color: 'var(--theme-primary)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Lista de Projetos</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--theme-text-secondary)]">
            {existingProject ? 'Editando Projeto' : 'Novo Projeto'}
          </span>
        </div>
      </div>

      {/* Mode Sub-Tabs */}
      <div className="flex items-center gap-2 border-b pb-2" style={{ borderColor: 'var(--theme-border)' }}>
        <button
          onClick={() => setActiveTab('info')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'info' ? 'bg-[var(--theme-primary)] text-white' : 'bg-[var(--theme-surface)] border'
          }`}
        >
          1. Dados Básicos do Projeto
        </button>
        <button
          onClick={() => setActiveTab('blocks')}
          disabled={!editingProjectId}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'blocks' ? 'bg-[var(--theme-primary)] text-white' : 'bg-[var(--theme-surface)] border'
          } disabled:opacity-40`}
        >
          2. Editor de Blocos ({projectBlocks.length})
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          disabled={!editingProjectId}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'preview' ? 'bg-[var(--theme-primary)] text-white' : 'bg-[var(--theme-surface)] border'
          } disabled:opacity-40`}
        >
          3. Pré-visualização do Projeto
        </button>
      </div>

      {/* TAB 1: INFO FORM */}
      {activeTab === 'info' && (
        <form onSubmit={handleSaveProjectInfo} className="p-6 rounded-2xl border space-y-6" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="project-title" className="block text-xs font-bold uppercase tracking-wider">
                Título do Projeto *
              </label>
              <input
                id="project-title"
                type="text"
                required
                value={projectForm.title || ''}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Ex: Identidade Visual & Edição Especial"
                className="w-full px-4 py-3 rounded-xl border text-sm font-bold focus:outline-none"
                style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="project-slug" className="block text-xs font-bold uppercase tracking-wider">
                URL Legível (Slug)
              </label>
              <input
                id="project-slug"
                type="text"
                required
                value={projectForm.slug || ''}
                onChange={(e) => setProjectForm({ ...projectForm, slug: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border text-xs font-mono focus:outline-none"
                style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="project-category" className="block text-xs font-bold uppercase tracking-wider">
                Categoria *
              </label>
              <select
                id="project-category"
                value={projectForm.category_id || ''}
                onChange={(e) => setProjectForm({ ...projectForm, category_id: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none"
                style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="project-cover" className="block text-xs font-bold uppercase tracking-wider">
                URL da Imagem de Capa
              </label>
              <input
                id="project-cover"
                type="url"
                value={projectForm.cover_image || ''}
                onChange={(e) => setProjectForm({ ...projectForm, cover_image: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none"
                style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="project-year" className="block text-xs font-bold uppercase tracking-wider">
                Ano de Realização
              </label>
              <input
                id="project-year"
                type="text"
                value={projectForm.year || ''}
                onChange={(e) => setProjectForm({ ...projectForm, year: e.target.value })}
                placeholder="2025"
                className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none"
                style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="project-short-desc" className="block text-xs font-bold uppercase tracking-wider">
                Descrição Curta (Exibida nos Cards)
              </label>
              <textarea
                id="project-short-desc"
                rows={3}
                value={projectForm.short_description || ''}
                onChange={(e) => setProjectForm({ ...projectForm, short_description: e.target.value })}
                placeholder="Resumo em 2 frases apresentando os pontos fortes deste trabalho..."
                className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none resize-y"
                style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="project-status" className="block text-xs font-bold uppercase tracking-wider">
                Status de Publicação
              </label>
              <select
                id="project-status"
                value={projectForm.status || 'rascunho'}
                onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value as any })}
                className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none font-semibold"
                style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}
              >
                <option value="rascunho">Rascunho (Privado na área admin)</option>
                <option value="publicado">Publicado (Visível no site público)</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-6">
              <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(projectForm.featured)}
                  onChange={(e) => setProjectForm({ ...projectForm, featured: e.target.checked })}
                  className="w-4 h-4 rounded-md"
                />
                <span>Destacar este projeto na página inicial</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t flex justify-end" style={{ borderColor: 'var(--theme-border)' }}>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl font-bold text-sm text-white flex items-center gap-2 shadow-md hover:scale-105 transition-transform"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            >
              <Save className="w-4 h-4" />
              <span>Salvar Dados do Projeto</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: BLOCKS EDITOR */}
      {activeTab === 'blocks' && (
        <div className="space-y-6">
          {/* Add Block Toolbar */}
          <div className="p-6 rounded-2xl border space-y-3" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
            <h3 className="text-sm font-bold uppercase tracking-wider">Adicionar Bloco de Conteúdo</h3>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => handleAddBlock('texto')}
                className="px-4 py-2.5 rounded-xl text-xs font-bold border flex items-center gap-2 hover:bg-black/5"
                style={{ borderColor: 'var(--theme-border)' }}
              >
                <Type className="w-4 h-4 text-blue-600" />
                <span>+ Bloco de Texto</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddBlock('imagem')}
                className="px-4 py-2.5 rounded-xl text-xs font-bold border flex items-center gap-2 hover:bg-black/5"
                style={{ borderColor: 'var(--theme-border)' }}
              >
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>+ Bloco de Imagem</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddBlock('youtube')}
                className="px-4 py-2.5 rounded-xl text-xs font-bold border flex items-center gap-2 hover:bg-black/5"
                style={{ borderColor: 'var(--theme-border)' }}
              >
                <Video className="w-4 h-4 text-red-600" />
                <span>+ Vídeo do YouTube</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddBlock('audio')}
                className="px-4 py-2.5 rounded-xl text-xs font-bold border flex items-center gap-2 hover:bg-black/5"
                style={{ borderColor: 'var(--theme-border)' }}
              >
                <Music className="w-4 h-4 text-purple-600" />
                <span>+ Áudio & Transcrição</span>
              </button>
            </div>
          </div>

          {/* Blocks Sequence */}
          <div className="space-y-4">
            {projectBlocks.map((block, index) => (
              <div
                key={block.id}
                className="p-6 rounded-2xl border space-y-4 shadow-xs"
                style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}
              >
                <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--theme-border)' }}>
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                    <span className="w-6 h-6 rounded-lg bg-black/10 flex items-center justify-center font-mono">
                      {index + 1}
                    </span>
                    <span>Tipo: {block.type}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleMoveBlockUp(index)}
                      disabled={index === 0}
                      aria-label="Mover bloco para cima"
                      className="p-1.5 rounded-lg border disabled:opacity-30 hover:bg-black/5"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveBlockDown(index)}
                      disabled={index === projectBlocks.length - 1}
                      aria-label="Mover bloco para baixo"
                      className="p-1.5 rounded-lg border disabled:opacity-30 hover:bg-black/5"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteBlock(block.id)}
                      aria-label="Excluir bloco"
                      className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Edit fields depending on type */}
                {block.type === 'texto' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase">Conteúdo do Texto</label>
                    <textarea
                      rows={4}
                      value={block.content || ''}
                      onChange={(e) => updateBlock({ ...block, content: e.target.value })}
                      className="w-full p-3 rounded-xl border text-sm font-normal focus:outline-none resize-y"
                      style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}
                    />
                  </div>
                )}

                {block.type === 'imagem' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <label className="block text-xs font-bold uppercase">URL da Imagem</label>
                      <input
                        type="url"
                        value={block.media_url || ''}
                        onChange={(e) => updateBlock({ ...block, media_url: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full p-3 rounded-xl border text-xs focus:outline-none"
                        style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase">Texto Alternativo (Alt - Obrigatório Acessibilidade)</label>
                      <input
                        type="text"
                        value={block.alt_text || ''}
                        onChange={(e) => updateBlock({ ...block, alt_text: e.target.value })}
                        placeholder="Descrição textual da imagem..."
                        className="w-full p-3 rounded-xl border text-xs focus:outline-none"
                        style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase">Legenda Visual Opcional</label>
                      <input
                        type="text"
                        value={block.caption || ''}
                        onChange={(e) => updateBlock({ ...block, caption: e.target.value })}
                        placeholder="Legenda..."
                        className="w-full p-3 rounded-xl border text-xs focus:outline-none"
                        style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}
                      />
                    </div>
                  </div>
                )}

                {block.type === 'youtube' && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase">URL do Vídeo no YouTube</label>
                      <input
                        type="url"
                        value={block.media_url || ''}
                        onChange={(e) => updateBlock({ ...block, media_url: e.target.value })}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full p-3 rounded-xl border text-xs focus:outline-none"
                        style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase">Título Acessível do Vídeo</label>
                      <input
                        type="text"
                        value={block.alt_text || ''}
                        onChange={(e) => updateBlock({ ...block, alt_text: e.target.value })}
                        placeholder="Ex: Demonstração da interface em execução"
                        className="w-full p-3 rounded-xl border text-xs focus:outline-none"
                        style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}
                      />
                    </div>
                  </div>
                )}

                {block.type === 'audio' && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase">URL do Arquivo de Áudio (.mp3, .ogg)</label>
                      <input
                        type="url"
                        value={block.media_url || ''}
                        onChange={(e) => updateBlock({ ...block, media_url: e.target.value })}
                        placeholder="https://.../audio.ogg"
                        className="w-full p-3 rounded-xl border text-xs focus:outline-none"
                        style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase">Transcrição Textual Completa (WCAG AA)</label>
                      <textarea
                        rows={3}
                        value={block.transcript || ''}
                        onChange={(e) => updateBlock({ ...block, transcript: e.target.value })}
                        placeholder="Texto completo correspondente à narração do áudio..."
                        className="w-full p-3 rounded-xl border text-xs focus:outline-none resize-y font-mono"
                        style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PREVIEW */}
      {activeTab === 'preview' && (
        <div className="p-8 rounded-2xl border space-y-6" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
          <div className="border-b pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Pré-visualização do Projeto</span>
            <h2 className="text-3xl font-bold mt-1">{projectForm.title}</h2>
          </div>

          {projectForm.cover_image && (
            <img src={projectForm.cover_image} alt="" className="w-full h-80 object-cover rounded-2xl border" />
          )}

          <div className="space-y-6 pt-4">
            {projectBlocks.map((b) => (
              <BlockRenderer key={b.id} block={b} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
