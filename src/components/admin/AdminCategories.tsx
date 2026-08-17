import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Category } from '../../types';
import { Plus, Trash2, Edit2, ArrowUp, ArrowDown, FolderTree, AlertTriangle } from 'lucide-react';

export const AdminCategories: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory, reorderCategories, projects, addToast } = usePortfolio();

  const [isCreating, setIsCreating] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSlug = (val: string) => {
    return val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await addCategory({
      name: name.trim(),
      slug: handleSlug(name),
      description: description.trim(),
      display_order: categories.length + 1,
    });

    setName('');
    setDescription('');
    setIsCreating(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.name.trim()) return;

    await updateCategory({
      ...editingCategory,
      slug: handleSlug(editingCategory.name),
    });

    setEditingCategory(null);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const items = [...categories];
    const temp = items[index];
    items[index] = items[index - 1];
    items[index - 1] = temp;
    reorderCategories(items);
  };

  const handleMoveDown = (index: number) => {
    if (index === categories.length - 1) return;
    const items = [...categories];
    const temp = items[index];
    items[index] = items[index + 1];
    items[index + 1] = temp;
    reorderCategories(items);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="p-6 rounded-2xl border space-y-6" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--theme-border)' }}>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-[var(--theme-primary)]" />
              <span>Categorias de Projetos</span>
            </h2>
            <p className="text-xs text-[var(--theme-text-secondary)] mt-1">
              Organize seus trabalhos por disciplinas (ex: Interfaces, Editorial, Fotografia).
            </p>
          </div>

          <button
            onClick={() => {
              setIsCreating(true);
              setEditingCategory(null);
            }}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white flex items-center gap-1.5 shadow-sm hover:opacity-90"
            style={{ backgroundColor: 'var(--theme-primary)' }}
          >
            <Plus className="w-4 h-4" />
            <span>Nova Categoria</span>
          </button>
        </div>

        {/* Create Form */}
        {isCreating && (
          <form onSubmit={handleCreate} className="p-4 rounded-xl border space-y-4" style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}>
            <h3 className="font-bold text-sm">Criar Categoria</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                required
                placeholder="Nome da categoria (ex: Audiovisual)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-3 py-2 rounded-lg border text-sm focus:outline-none"
                style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}
              />
              <input
                type="text"
                placeholder="Descrição opcional"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="px-3 py-2 rounded-lg border text-sm focus:outline-none"
                style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg font-bold text-xs text-white"
                style={{ backgroundColor: 'var(--theme-primary)' }}
              >
                Salvar Categoria
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold border"
                style={{ borderColor: 'var(--theme-border)' }}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Categories List */}
        <div className="space-y-3">
          {categories.map((cat, index) => {
            const projectCount = projects.filter((p) => p.category_id === cat.id).length;
            const isEditing = editingCategory?.id === cat.id;

            return (
              <div
                key={cat.id}
                className="p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}
              >
                {isEditing ? (
                  <form onSubmit={handleUpdate} className="w-full space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        value={editingCategory.name}
                        onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                        className="px-3 py-1.5 rounded-lg border text-sm"
                      />
                      <input
                        type="text"
                        value={editingCategory.description || ''}
                        onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                        className="px-3 py-1.5 rounded-lg border text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="px-3 py-1 rounded-md text-xs font-bold text-white bg-blue-600">
                        Atualizar
                      </button>
                      <button type="button" onClick={() => setEditingCategory(null)} className="px-3 py-1 rounded-md text-xs border">
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base">{cat.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs border font-medium opacity-75">
                          {projectCount} {projectCount === 1 ? 'projeto' : 'projetos'}
                        </span>
                      </div>
                      {cat.description && (
                        <p className="text-xs text-[var(--theme-text-secondary)] mt-0.5">{cat.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        aria-label="Mover categoria para cima"
                        className="p-1.5 rounded-lg border disabled:opacity-30 hover:bg-black/5"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === categories.length - 1}
                        aria-label="Mover categoria para baixo"
                        className="p-1.5 rounded-lg border disabled:opacity-30 hover:bg-black/5"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingCategory(cat)}
                        aria-label="Editar categoria"
                        className="p-1.5 rounded-lg border hover:bg-black/5"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteCategory(cat.id)}
                        aria-label="Excluir categoria"
                        className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
