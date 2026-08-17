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
  SUPABASE_SQL_SCHEMA,
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

  // Actions
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

  loginAdmin: (password: string) => Promise<boolean>;
  logoutAdmin: () => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  SETTINGS: 'portfolio_autoral_settings',
  CATEGORIES: 'portfolio_autoral_categories',
  PROJECTS: 'portfolio_autoral_projects',
  BLOCKS: 'portfolio_autoral_blocks',
  AUTH: 'portfolio_autoral_auth',
};

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<PortfolioSettings>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CATEGORIES);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.PROJECTS);
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [blocks, setBlocks] = useState<ProjectBlock[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.BLOCKS);
    return saved ? JSON.parse(saved) : INITIAL_BLOCKS;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH) === 'true';
  });

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
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Save state to LocalStorage for fallback persistence
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    applyThemeToCSS(settings.theme_config);
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.BLOCKS, JSON.stringify(blocks));
  }, [blocks]);

  // Load from Supabase if configured
  useEffect(() => {
    async function loadFromSupabase() {
      if (!isSupabaseConfigured || !supabase) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Fetch settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('portfolio_settings')
          .select('*')
          .maybeSingle();

        if (settingsData && !settingsError) {
          setSettings(settingsData as PortfolioSettings);
        }

        // Fetch categories
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select('*')
          .order('display_order', { ascending: true });

        if (catData && !catError && catData.length > 0) {
          setCategories(catData as Category[]);
        }

        // Fetch projects
        const { data: projData, error: projError } = await supabase
          .from('projects')
          .select('*')
          .order('display_order', { ascending: true });

        if (projData && !projError && projData.length > 0) {
          setProjects(projData as Project[]);
        }

        // Fetch blocks
        const { data: blockData, error: blockError } = await supabase
          .from('project_blocks')
          .select('*')
          .order('display_order', { ascending: true });

        if (blockData && !blockError && blockData.length > 0) {
          setBlocks(blockData as ProjectBlock[]);
        }

        // Check active Supabase auth session
        const { data: authData } = await supabase.auth.getSession();
        if (authData.session) {
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.warn('Could not sync with Supabase, using local store:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadFromSupabase();
  }, []);

  // Actions implementations
  const updateSettings = async (newSettingsPartial: Partial<PortfolioSettings>) => {
    const updated = { ...settings, ...newSettingsPartial, updated_at: new Date().toISOString() };
    setSettings(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('portfolio_settings').upsert(updated);
      } catch (err) {
        console.error('Supabase update settings error:', err);
      }
    }
    addToast('success', 'Configurações salvas com sucesso.');
  };

  const addCategory = async (categoryData: Omit<Category, 'id'>): Promise<Category> => {
    const newCat: Category = {
      ...categoryData,
      id: 'cat-' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
    };

    setCategories((prev) => [...prev, newCat]);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase.from('categories').insert(newCat).select().single();
        if (data) {
          setCategories((prev) => prev.map((c) => (c.id === newCat.id ? data : c)));
        }
      } catch (err) {
        console.error('Supabase error:', err);
      }
    }

    addToast('success', `Categoria "${newCat.name}" criada.`);
    return newCat;
  };

  const updateCategory = async (cat: Category) => {
    setCategories((prev) => prev.map((c) => (c.id === cat.id ? cat : c)));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('categories').update(cat).eq('id', cat.id);
      } catch (err) {
        console.error('Supabase error:', err);
      }
    }
    addToast('success', 'Categoria atualizada.');
  };

  const deleteCategory = async (id: string) => {
    // Check if category has projects
    const hasProjects = projects.some((p) => p.category_id === id);
    if (hasProjects) {
      addToast('error', 'Não é possível excluir uma categoria que possui projetos associados. Reatribua os projetos primeiro.');
      return;
    }

    setCategories((prev) => prev.filter((c) => c.id !== id));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('categories').delete().eq('id', id);
      } catch (err) {
        console.error('Supabase delete error:', err);
      }
    }
    addToast('info', 'Categoria removida.');
  };

  const reorderCategories = async (newCats: Category[]) => {
    const reordered = newCats.map((c, index) => ({ ...c, display_order: index + 1 }));
    setCategories(reordered);

    if (isSupabaseConfigured && supabase) {
      try {
        for (const cat of reordered) {
          await supabase.from('categories').update({ display_order: cat.display_order }).eq('id', cat.id);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const addProject = async (projectData: Omit<Project, 'id'>): Promise<Project> => {
    const newProj: Project = {
      ...projectData,
      id: 'proj-' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setProjects((prev) => [newProj, ...prev]);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase.from('projects').insert(newProj).select().single();
        if (data) {
          setProjects((prev) => prev.map((p) => (p.id === newProj.id ? data : p)));
        }
      } catch (err) {
        console.error('Supabase project error:', err);
      }
    }

    addToast('success', `Projeto "${newProj.title}" criado.`);
    return newProj;
  };

  const updateProject = async (proj: Project) => {
    const updated = { ...proj, updated_at: new Date().toISOString() };
    setProjects((prev) => prev.map((p) => (p.id === proj.id ? updated : p)));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('projects').update(updated).eq('id', proj.id);
      } catch (err) {
        console.error('Supabase update project error:', err);
      }
    }
    addToast('success', 'Projeto atualizado com sucesso.');
  };

  const deleteProject = async (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setBlocks((prev) => prev.filter((b) => b.project_id !== id));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('projects').delete().eq('id', id);
      } catch (err) {
        console.error('Supabase error:', err);
      }
    }
    addToast('info', 'Projeto excluído.');
  };

  const reorderProjects = async (newProjs: Project[]) => {
    const reordered = newProjs.map((p, index) => ({ ...p, display_order: index + 1 }));
    setProjects(reordered);

    if (isSupabaseConfigured && supabase) {
      try {
        for (const proj of reordered) {
          await supabase.from('projects').update({ display_order: proj.display_order }).eq('id', proj.id);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const addBlock = async (blockData: Omit<ProjectBlock, 'id'>): Promise<ProjectBlock> => {
    const newBlock: ProjectBlock = {
      ...blockData,
      id: 'blk-' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
    };

    setBlocks((prev) => [...prev, newBlock]);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase.from('project_blocks').insert(newBlock).select().single();
        if (data) {
          setBlocks((prev) => prev.map((b) => (b.id === newBlock.id ? data : b)));
        }
      } catch (err) {
        console.error('Supabase block error:', err);
      }
    }

    addToast('success', 'Bloco de conteúdo adicionado.');
    return newBlock;
  };

  const updateBlock = async (block: ProjectBlock) => {
    setBlocks((prev) => prev.map((b) => (b.id === block.id ? block : b)));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('project_blocks').update(block).eq('id', block.id);
      } catch (err) {
        console.error('Supabase block update error:', err);
      }
    }
    addToast('success', 'Bloco atualizado.');
  };

  const deleteBlock = async (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('project_blocks').delete().eq('id', id);
      } catch (err) {
        console.error('Supabase delete block error:', err);
      }
    }
    addToast('info', 'Bloco removido.');
  };

  const reorderBlocks = async (newBlocks: ProjectBlock[]) => {
    const reordered = newBlocks.map((b, index) => ({ ...b, display_order: index + 1 }));
    setBlocks(reordered);

    if (isSupabaseConfigured && supabase) {
      try {
        for (const block of reordered) {
          await supabase.from('project_blocks').update({ display_order: block.display_order }).eq('id', block.id);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const loginAdmin = async (password: string): Promise<boolean> => {
    // In demo mode or if Supabase is not configured, accept password "admin" or any valid demo credentials
    if (password === 'admin' || password === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH, 'true');
      addToast('success', 'Login de administrador realizado com sucesso.');
      return true;
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: settings.email_public || 'admin@portfolio.com',
          password,
        });

        if (!error) {
          setIsAuthenticated(true);
          localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH, 'true');
          addToast('success', 'Autenticado via Supabase.');
          return true;
        }
      } catch (err) {
        console.error('Supabase auth error:', err);
      }
    }

    addToast('error', 'Senha incorreta. Para o modo de demonstração local, use a senha "admin".');
    return false;
  };

  const logoutAdmin = () => {
    setIsAuthenticated(false);
    localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH, 'false');
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut();
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
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
