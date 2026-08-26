import React, { useState } from 'react';
import { isSupabaseConfigured, SUPABASE_SQL_SCHEMA } from '../../lib/supabase';
import { Database, CheckCircle2, AlertTriangle, Copy, Check, ShieldCheck, UserPlus, KeyRound } from 'lucide-react';

export const AdminDatabaseSetup: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopySql = async () => {
    await navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div
        className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isSupabaseConfigured
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              isSupabaseConfigured ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'
            }`}
          >
            {isSupabaseConfigured ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div>
            <h2 className="text-lg font-bold">
              {isSupabaseConfigured ? 'Variáveis do Supabase detectadas' : 'Supabase ainda não configurado'}
            </h2>
            <p className="text-xs opacity-90 mt-0.5">
              {isSupabaseConfigured
                ? 'O cliente foi criado com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY. As gravações exigem login real no Supabase Auth.'
                : 'Sem as duas variáveis VITE_ no build, a aplicação usa somente o modo local de demonstração.'}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl border space-y-6" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Database className="w-5 h-5 text-[var(--theme-primary)]" />
          <span>Configuração correta: Supabase + Vercel</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="p-4 rounded-xl border space-y-2" style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}>
            <span className="font-bold text-xs uppercase text-[var(--theme-primary)]">1. Criar o projeto Supabase</span>
            <p className="text-xs text-[var(--theme-text-secondary)]">
              Crie o projeto em <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline font-bold">supabase.com</a>.
            </p>
          </div>

          <div className="p-4 rounded-xl border space-y-2" style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}>
            <span className="font-bold text-xs uppercase text-[var(--theme-primary)]">2. Executar o SQL</span>
            <p className="text-xs text-[var(--theme-text-secondary)]">
              No <strong>SQL Editor</strong>, execute o script abaixo. Ele cria tabelas UUID, RLS e o bucket <strong>portfolio-media</strong>.
            </p>
          </div>

          <div className="p-4 rounded-xl border space-y-2" style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}>
            <span className="font-bold text-xs uppercase text-[var(--theme-primary)] flex items-center gap-1"><UserPlus className="w-3.5 h-3.5" />3. Criar o usuário do Admin</span>
            <p className="text-xs text-[var(--theme-text-secondary)]">
              Em <strong>Authentication → Users</strong>, crie o usuário com e-mail e senha. O Admin do site usa exatamente essas credenciais.
            </p>
          </div>

          <div className="p-4 rounded-xl border space-y-2" style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}>
            <span className="font-bold text-xs uppercase text-[var(--theme-primary)] flex items-center gap-1"><KeyRound className="w-3.5 h-3.5" />4. Variáveis no Vercel</span>
            <p className="text-xs text-[var(--theme-text-secondary)]">
              Em <strong>Vercel → Settings → Environment Variables</strong>, use exatamente:
            </p>
            <code className="block p-2 rounded bg-black/5 text-[11px] font-mono break-all">
              VITE_SUPABASE_URL=https://...supabase.co<br />
              VITE_SUPABASE_ANON_KEY=...<br />
              VITE_SUPABASE_ADMIN_EMAIL=usuario@exemplo.com <em>(opcional)</em>
            </code>
          </div>

          <div className="p-4 rounded-xl border space-y-2 md:col-span-2" style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}>
            <span className="font-bold text-xs uppercase text-[var(--theme-primary)]">5. Redeploy no Vercel</span>
            <p className="text-xs text-[var(--theme-text-secondary)]">
              Depois de criar ou alterar variáveis, faça um novo deploy. Para este ZIP, deixe o <strong>Root Directory na raiz do repositório</strong>, onde estão <code>package.json</code> e <code>vite.config.ts</code>.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3" style={{ borderColor: 'var(--theme-border)' }}>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[var(--theme-primary)]" />
            <span className="font-bold text-sm">Script SQL de tabelas, RLS e Storage</span>
          </div>

          <button
            type="button"
            onClick={handleCopySql}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 shadow-sm"
            style={{ backgroundColor: 'var(--theme-primary)' }}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copiado!' : 'Copiar Script SQL'}</span>
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto max-h-96 leading-relaxed">
          {SUPABASE_SQL_SCHEMA}
        </pre>
      </div>
    </div>
  );
};
