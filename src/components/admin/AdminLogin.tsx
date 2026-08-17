import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Shield, KeyRound, Sparkles, ArrowRight } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { loginAdmin } = usePortfolio();
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await loginAdmin(password);
    setIsLoading(false);
  };

  const handleDemoAccess = async () => {
    setPassword('admin');
    setIsLoading(true);
    await loginAdmin('admin');
    setIsLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div
        className="w-full max-w-md p-8 rounded-2xl border space-y-6 shadow-xl"
        style={{
          backgroundColor: 'var(--theme-surface)',
          borderColor: 'var(--theme-border)',
        }}
      >
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[var(--theme-primary)] text-white mx-auto flex items-center justify-center shadow-md">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Acesso Administrativo</h1>
          <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
            Entre para gerenciar seus projetos, categorias, blocos e design tokens.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="admin-password-input" className="block text-xs font-bold uppercase tracking-wider">
              Senha de Acesso
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-3.5 opacity-50" />
              <input
                id="admin-password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:outline-none"
                style={{
                  backgroundColor: 'var(--theme-bg)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text-primary)',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] focus:outline-none shadow-md"
            style={{ backgroundColor: 'var(--theme-primary)' }}
          >
            <span>{isLoading ? 'Entrando...' : 'Entrar na Administração'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t text-center space-y-3" style={{ borderColor: 'var(--theme-border)' }}>
          <p className="text-xs font-medium" style={{ color: 'var(--theme-text-secondary)' }}>
            Modo de Demonstração / Teste Rápido?
          </p>
          <button
            onClick={handleDemoAccess}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-colors hover:opacity-80"
            style={{
              backgroundColor: 'var(--theme-bg)',
              borderColor: 'var(--theme-border)',
              color: 'var(--theme-text-primary)',
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Entrar no Modo Demo (Senha: "admin")</span>
          </button>
        </div>
      </div>
    </div>
  );
};
