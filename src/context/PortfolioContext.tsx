import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  PortfolioSettings,
  Category,
  Project,
  ProjectBlock,
  ToastMessage,
} from '../types';
import {
  supabase,
  isSupabaseConfigured,
  INITIAL_SETTINGS,
  INITIAL_CATEGORIES,
  INITIAL_PROJECTS,
  INITIAL_BLOCKS,
} from '../lib/supabase';
import { applyThemeToCSS } from '../lib/theme';

interface PortfolioContextType {
  settings: PortfolioSettings;
  categories: Category[];
  projects: Project[];
  blocks: ProjectBlock[];
  isLoading: boolean;
  isAuthenticated: boolean;
  activeCategoryFilter: string;
  setActiveCategoryFilter: (catId: string) => void;
  currentRoute: { page: 'about' | 'projects' | 'project-detail' | 'contact' | 'admin'; projectSlug?: string };
  setCurrentRoute: (route: { page: 'about' | 'projects' | 'project-detail' | 'contact' | 'admin'; projectSlug?: string }) => void;
  adminSubView: 'overview' | 'settings' | 'categories' | 'projects' | 'project-edit' | 'appearance' | 'database-setup';
  setAdminSubView: (view: 'overview' | 'settings' | 'categories' | 'projects' | 'project-edit' | 'appearance' | 'database-setup') => void;
  editingProjectId: string | null;
  setEditingProjectId: (id: string | null) => void;
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], message: string) => void;
  removeToast: (id: string) => void;

  updateSettings: (newSettings: Partial<PortfolioSettings>) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<Category>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  reorderCategories: (categories: Category[]) => Promise<void>;

  addProject: (project: Omit<Project, 'id'>) => Promise<Project>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  reorderProjects: (projects: Project[]) => Promise<void>;

  addBlock: (block: Omit<ProjectBlock, 'id'>) => Promise<ProjectBlock>;
  updateBlock: (block: ProjectBlock) => Promise<void>;
  deleteBlock: (id: string) => Promise<void>;
  reorderBlocks: (blocks: ProjectBlock[]) => Promise<void>;

  loginAdmin: (email: string, password: string) => Promise<boolean>;
  logoutAdmin: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  SETTINGS: 'portfolio_autoral_settings',
  CATEGORIES: 'portfolio_autoral_categories',
  PROJECTS: 'portfolio_autoral_projects',
  BLOCKS: 'portfolio_autoral_blocks',
  AUTH: 'portfolio_autoral_auth',
};

function readLocal<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}

function localId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'object' && error && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message) return message;
  }
  return fallback;
}

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<PortfolioSettings>(() =>
    isSupabaseConfigured ? INITIAL_SETTINGS : readLocal(LOCAL_STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS),
  );
  const [categories, setCategories] = useState<Category[]>(() =>
    isSupabaseConfigured ? [] : readLocal(LOCAL_STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES),
  );
  const [projects, setProjects] = useState<Project[]>(() =>
    isSupabaseConfigured ? [] : readLocal(LOCAL_STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS),
  );
  const [blocks, setBlocks] = useState<ProjectBlock[]>(() =>
    isSupabaseConfigured ? [] : readLocal(LOCAL_STORAGE_KEYS.BLOCKS, INITIAL_BLOCKS),
  );
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    isSupabaseConfigured ? false : localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH) === 'true',
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [currentRoute, setCurrentRoute] = useState<{ page: 'about' | 'projects' | 'project-detail' | 'contact' | 'admin'; projectSlug?: string }>({
    page: 'projects',
  });
  const [adminSubView, setAdminSubView] = useState<'overview' | 'settings' | 'categories' | 'projects' | 'project-edit' | 'appearance' | 'database-setup'>('overview');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastMessage['type'], message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    applyThemeToCSS(settings.theme_config);
    if (!isSupabaseConfigured) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    }
  }, [settings]);

  useEffect(() => {
    if (!isSupabaseConfigured) localStorage.setItem(LOCAL_STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    if (!isSupabaseConfigured) localStorage.setItem(LOCAL_STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    if (!isSupabaseConfigured) localStorage.setItem(LOCAL_STORAGE_KEYS.BLOCKS, JSON.stringify(blocks));
  }, [blocks]);

  const loadFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) return;

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;

    let settingsQuery = supabase
      .from('portfolio_settings')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(1);
    let categoriesQuery = supabase.from('categories').select('*').order('display_order', { ascending: true });
    let projectsQuery = supabase.from('projects').select('*').order('display_order', { ascending: true });

    if (userId) {
      settingsQuery = settingsQuery.eq('owner_id', userId);
      categoriesQuery = categoriesQuery.eq('owner_id', userId);
      projectsQuery = projectsQuery.eq('owner_id', userId);
    }

    const [settingsResult, categoriesResult, projectsResult] = await Promise.all([
      settingsQuery.maybeSingle(),
      categoriesQuery,
      projectsQuery,
    ]);

    let blocksResult: { data: unknown[] | null; error: { message: string } | null };
    const visibleProjects = (projectsResult.data ?? []) as Project[];

    if (userId) {
      const projectIds = visibleProjects.map((project) => project.id);
      if (projectIds.length === 0) {
        blocksResult = { data: [], error: null };
      } else {
        const result = await supabase
          .from('project_blocks')
          .select('*')
          .in('project_id', projectIds)
          .order('display_order', { ascending: true });
        blocksResult = { data: result.data, error: result.error };
      }
    } else {
      const result = await supabase.from('project_blocks').select('*').order('display_order', { ascending: true });
      blocksResult = { data: result.data, error: result.error };
    }

    if (settingsResult.error) console.warn('Supabase portfolio_settings:', settingsResult.error.message);
    if (categoriesResult.error) console.warn('Supabase categories:', categoriesResult.error.message);
    if (projectsResult.error) console.warn('Supabase projects:', projectsResult.error.message);
    if (blocksResult.error) console.warn('Supabase project_blocks:', blocksResult.error.message);

    if (settingsResult.data) setSettings(settingsResult.data as PortfolioSettings);
    else if (!settingsResult.error) setSettings(INITIAL_SETTINGS);

    if (!categoriesResult.error) setCategories((categoriesResult.data ?? []) as Category[]);
    if (!projectsResult.error) setProjects(visibleProjects);
    if (!blocksResult.error) setBlocks((blocksResult.data ?? []) as ProjectBlock[]);
  }, []);

  const requireUserId = useCallback(async (): Promise<string> => {
    if (!supabase || !isSupabaseConfigured) {
      throw new Error('Supabase não está configurado.');
    }

    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      setIsAuthenticated(false);
      throw new Error('Sua sessão do Supabase expirou. Entre novamente no Admin.');
    }
    return data.user.id;
  }, []);

  const ensureSettingsRow = useCallback(async (userId: string) => {
    if (!supabase) return;

    const { data: existing, error: selectError } = await supabase
      .from('portfolio_settings')
      .select('*')
      .eq('owner_id', userId)
      .maybeSingle();

    if (selectError) throw new Error(selectError.message);
    if (existing) {
      setSettings(existing as PortfolioSettings);
      return;
    }

    const { id: _id, owner_id: _owner, created_at: _created, updated_at: _updated, ...defaults } = INITIAL_SETTINGS;
    const { data: created, error: insertError } = await supabase
      .from('portfolio_settings')
      .insert({ ...defaults, owner_id: userId })
      .select('*')
      .single();

    if (insertError) throw new Error(insertError.message);
    if (created) setSettings(created as PortfolioSettings);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function boot() {
      if (!isSupabaseConfigured || !supabase) {
        if (mounted) setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) console.warn('Supabase session:', error.message);
        if (mounted) setIsAuthenticated(Boolean(data.session));
        await loadFromSupabase();
      } catch (error) {
        console.warn('Não foi possível sincronizar com o Supabase:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    void boot();

    if (!isSupabaseConfigured || !supabase) {
      return () => {
        mounted = false;
      };
    }

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setIsAuthenticated(Boolean(session));
      void loadFromSupabase();
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [loadFromSupabase]);

  const updateSettings = async (newSettingsPartial: Partial<PortfolioSettings>) => {
    const updated: PortfolioSettings = { ...settings, ...newSettingsPartial, updated_at: new Date().toISOString() };

    if (!isSupabaseConfigured || !supabase) {
      setSettings(updated);
      addToast('success', 'Configurações salvas com sucesso.');
      return;
    }

    try {
      const userId = await requireUserId();
      const { id: _id, owner_id: _owner, created_at: _created, ...editable } = updated;
      const { data, error } = await supabase
        .from('portfolio_settings')
        .upsert({ ...editable, owner_id: userId }, { onConflict: 'owner_id' })
        .select('*')
        .single();

      if (error) throw new Error(error.message);
      if (data) setSettings(data as PortfolioSettings);
      addToast('success', 'Configurações salvas no Supabase.');
    } catch (error) {
      console.error('Supabase update settings error:', error);
      addToast('error', `Não foi possível salvar: ${errorMessage(error, 'erro no Supabase')}`);
      throw error;
    }
  };

  const addCategory = async (categoryData: Omit<Category, 'id'>): Promise<Category> => {
    if (!isSupabaseConfigured || !supabase) {
      const newCat: Category = {
        ...categoryData,
        id: localId('cat'),
        created_at: new Date().toISOString(),
      };
      setCategories((prev) => [...prev, newCat]);
      addToast('success', `Categoria "${newCat.name}" criada.`);
      return newCat;
    }

    try {
      const userId = await requireUserId();
      const { owner_id: _owner, created_at: _created, ...editable } = categoryData;
      const { data, error } = await supabase
        .from('categories')
        .insert({ ...editable, owner_id: userId })
        .select('*')
        .single();
      if (error) throw new Error(error.message);
      const created = data as Category;
      setCategories((prev) => [...prev, created].sort((a, b) => a.display_order - b.display_order));
      addToast('success', `Categoria "${created.name}" criada no Supabase.`);
      return created;
    } catch (error) {
      console.error('Supabase category insert error:', error);
      addToast('error', `Não foi possível criar a categoria: ${errorMessage(error, 'erro no Supabase')}`);
      throw error;
    }
  };

  const updateCategory = async (cat: Category) => {
    if (!isSupabaseConfigured || !supabase) {
      setCategories((prev) => prev.map((c) => (c.id === cat.id ? cat : c)));
      addToast('success', 'Categoria atualizada.');
      return;
    }

    try {
      const userId = await requireUserId();
      const { id, owner_id: _owner, created_at: _created, ...editable } = cat;
      const { data, error } = await supabase
        .from('categories')
        .update({ ...editable, owner_id: userId })
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw new Error(error.message);
      setCategories((prev) => prev.map((c) => (c.id === id ? (data as Category) : c)));
      addToast('success', 'Categoria atualizada no Supabase.');
    } catch (error) {
      console.error('Supabase category update error:', error);
      addToast('error', `Não foi possível atualizar a categoria: ${errorMessage(error, 'erro no Supabase')}`);
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    if (projects.some((p) => p.category_id === id)) {
      addToast('error', 'Não é possível excluir uma categoria que possui projetos associados. Reatribua os projetos primeiro.');
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      addToast('info', 'Categoria removida.');
      return;
    }

    try {
      await requireUserId();
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw new Error(error.message);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      addToast('info', 'Categoria removida do Supabase.');
    } catch (error) {
      addToast('error', `Não foi possível excluir a categoria: ${errorMessage(error, 'erro no Supabase')}`);
      throw error;
    }
  };

  const reorderCategories = async (newCats: Category[]) => {
    const reordered = newCats.map((c, index) => ({ ...c, display_order: index + 1 }));

    if (!isSupabaseConfigured || !supabase) {
      setCategories(reordered);
      return;
    }

    try {
      await requireUserId();
      for (const cat of reordered) {
        const { error } = await supabase.from('categories').update({ display_order: cat.display_order }).eq('id', cat.id);
        if (error) throw new Error(error.message);
      }
      setCategories(reordered);
    } catch (error) {
      addToast('error', `Não foi possível reordenar as categorias: ${errorMessage(error, 'erro no Supabase')}`);
      throw error;
    }
  };

  const addProject = async (projectData: Omit<Project, 'id'>): Promise<Project> => {
    if (!isSupabaseConfigured || !supabase) {
      const newProj: Project = {
        ...projectData,
        id: localId('proj'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setProjects((prev) => [newProj, ...prev]);
      addToast('success', `Projeto "${newProj.title}" criado.`);
      return newProj;
    }

    try {
      const userId = await requireUserId();
      const { owner_id: _owner, created_at: _created, updated_at: _updated, ...editable } = projectData;
      const { data, error } = await supabase
        .from('projects')
        .insert({ ...editable, owner_id: userId })
        .select('*')
        .single();
      if (error) throw new Error(error.message);
      const created = data as Project;
      setProjects((prev) => [created, ...prev]);
      addToast('success', `Projeto "${created.title}" criado no Supabase.`);
      return created;
    } catch (error) {
      console.error('Supabase project insert error:', error);
      addToast('error', `Não foi possível criar o projeto: ${errorMessage(error, 'erro no Supabase')}`);
      throw error;
    }
  };

  const updateProject = async (proj: Project) => {
    const updated = { ...proj, updated_at: new Date().toISOString() };

    if (!isSupabaseConfigured || !supabase) {
      setProjects((prev) => prev.map((p) => (p.id === proj.id ? updated : p)));
      addToast('success', 'Projeto atualizado com sucesso.');
      return;
    }

    try {
      const userId = await requireUserId();
      const { id, owner_id: _owner, created_at: _created, ...editable } = updated;
      const { data, error } = await supabase
        .from('projects')
        .update({ ...editable, owner_id: userId })
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw new Error(error.message);
      setProjects((prev) => prev.map((p) => (p.id === id ? (data as Project) : p)));
      addToast('success', 'Projeto atualizado no Supabase.');
    } catch (error) {
      console.error('Supabase project update error:', error);
      addToast('error', `Não foi possível atualizar o projeto: ${errorMessage(error, 'erro no Supabase')}`);
      throw error;
    }
  };

  const deleteProject = async (id: string) => {
    if (!isSupabaseConfigured || !supabase) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setBlocks((prev) => prev.filter((b) => b.project_id !== id));
      addToast('info', 'Projeto excluído.');
      return;
    }

    try {
      await requireUserId();
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw new Error(error.message);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setBlocks((prev) => prev.filter((b) => b.project_id !== id));
      addToast('info', 'Projeto excluído do Supabase.');
    } catch (error) {
      addToast('error', `Não foi possível excluir o projeto: ${errorMessage(error, 'erro no Supabase')}`);
      throw error;
    }
  };

  const reorderProjects = async (newProjs: Project[]) => {
    const reordered = newProjs.map((p, index) => ({ ...p, display_order: index + 1 }));

    if (!isSupabaseConfigured || !supabase) {
      setProjects(reordered);
      return;
    }

    try {
      await requireUserId();
      for (const proj of reordered) {
        const { error } = await supabase.from('projects').update({ display_order: proj.display_order }).eq('id', proj.id);
        if (error) throw new Error(error.message);
      }
      setProjects(reordered);
    } catch (error) {
      addToast('error', `Não foi possível reordenar os projetos: ${errorMessage(error, 'erro no Supabase')}`);
      throw error;
    }
  };

  const addBlock = async (blockData: Omit<ProjectBlock, 'id'>): Promise<ProjectBlock> => {
    if (!isSupabaseConfigured || !supabase) {
      const newBlock: ProjectBlock = {
        ...blockData,
        id: localId('blk'),
        created_at: new Date().toISOString(),
      };
      setBlocks((prev) => [...prev, newBlock]);
      addToast('success', 'Bloco de conteúdo adicionado.');
      return newBlock;
    }

    try {
      await requireUserId();
      const { created_at: _created, ...editable } = blockData;
      const { data, error } = await supabase
        .from('project_blocks')
        .insert(editable)
        .select('*')
        .single();
      if (error) throw new Error(error.message);
      const created = data as ProjectBlock;
      setBlocks((prev) => [...prev, created]);
      addToast('success', 'Bloco de conteúdo adicionado ao Supabase.');
      return created;
    } catch (error) {
      console.error('Supabase block insert error:', error);
      addToast('error', `Não foi possível criar o bloco: ${errorMessage(error, 'erro no Supabase')}`);
      throw error;
    }
  };

  const updateBlock = async (block: ProjectBlock) => {
    if (!isSupabaseConfigured || !supabase) {
      setBlocks((prev) => prev.map((b) => (b.id === block.id ? block : b)));
      addToast('success', 'Bloco atualizado.');
      return;
    }

    try {
      await requireUserId();
      const { id, created_at: _created, ...editable } = block;
      const { data, error } = await supabase
        .from('project_blocks')
        .update(editable)
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw new Error(error.message);
      setBlocks((prev) => prev.map((b) => (b.id === id ? (data as ProjectBlock) : b)));
      addToast('success', 'Bloco atualizado no Supabase.');
    } catch (error) {
      addToast('error', `Não foi possível atualizar o bloco: ${errorMessage(error, 'erro no Supabase')}`);
      throw error;
    }
  };

  const deleteBlock = async (id: string) => {
    if (!isSupabaseConfigured || !supabase) {
      setBlocks((prev) => prev.filter((b) => b.id !== id));
      addToast('info', 'Bloco removido.');
      return;
    }

    try {
      await requireUserId();
      const { error } = await supabase.from('project_blocks').delete().eq('id', id);
      if (error) throw new Error(error.message);
      setBlocks((prev) => prev.filter((b) => b.id !== id));
      addToast('info', 'Bloco removido do Supabase.');
    } catch (error) {
      addToast('error', `Não foi possível excluir o bloco: ${errorMessage(error, 'erro no Supabase')}`);
      throw error;
    }
  };

  const reorderBlocks = async (newBlocks: ProjectBlock[]) => {
    const reordered = newBlocks.map((b, index) => ({ ...b, display_order: index + 1 }));

    if (!isSupabaseConfigured || !supabase) {
      setBlocks((prev) => {
        const reorderedIds = new Set(reordered.map((b) => b.id));
        return [...prev.filter((b) => !reorderedIds.has(b.id)), ...reordered];
      });
      return;
    }

    try {
      await requireUserId();
      for (const block of reordered) {
        const { error } = await supabase.from('project_blocks').update({ display_order: block.display_order }).eq('id', block.id);
        if (error) throw new Error(error.message);
      }
      setBlocks((prev) => {
        const reorderedIds = new Set(reordered.map((b) => b.id));
        return [...prev.filter((b) => !reorderedIds.has(b.id)), ...reordered];
      });
    } catch (error) {
      addToast('error', `Não foi possível reordenar os blocos: ${errorMessage(error, 'erro no Supabase')}`);
      throw error;
    }
  };

  const loginAdmin = async (email: string, password: string): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase) {
      if (password === 'admin' || password === 'admin123') {
        setIsAuthenticated(true);
        localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH, 'true');
        addToast('success', 'Modo local de demonstração ativado.');
        return true;
      }
      addToast('error', 'Supabase não configurado. No modo local, use a senha "admin".');
      return false;
    }

    if (!email.trim()) {
      addToast('error', 'Informe o e-mail cadastrado em Supabase → Authentication → Users.');
      return false;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error || !data.user) {
        addToast('error', error?.message || 'E-mail ou senha inválidos.');
        return false;
      }

      setIsAuthenticated(true);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH);
      await ensureSettingsRow(data.user.id);
      await loadFromSupabase();
      addToast('success', 'Autenticado no Supabase com sucesso.');
      return true;
    } catch (error) {
      console.error('Supabase auth error:', error);
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      addToast('error', `Não foi possível entrar: ${errorMessage(error, 'erro de autenticação')}`);
      return false;
    }
  };

  const logoutAdmin = async () => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) console.warn('Supabase signOut:', error.message);
      setIsAuthenticated(false);
      await loadFromSupabase();
    } else {
      setIsAuthenticated(false);
      localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH, 'false');
    }
    setCurrentRoute({ page: 'projects' });
    addToast('info', 'Sessão encerrada.');
  };

  return (
    <PortfolioContext.Provider
      value={{
        settings,
        categories,
        projects,
        blocks,
        isLoading,
        isAuthenticated,
        activeCategoryFilter,
        setActiveCategoryFilter,
        currentRoute,
        setCurrentRoute,
        adminSubView,
        setAdminSubView,
        editingProjectId,
        setEditingProjectId,
        toasts,
        addToast,
        removeToast,
        updateSettings,
        addCategory,
        updateCategory,
        deleteCategory,
        reorderCategories,
        addProject,
        updateProject,
        deleteProject,
        reorderProjects,
        addBlock,
        updateBlock,
        deleteBlock,
        reorderBlocks,
        loginAdmin,
        logoutAdmin,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) throw new Error('usePortfolio must be used within a PortfolioProvider');
  return context;
};
