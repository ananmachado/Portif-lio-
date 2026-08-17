import React, { useState } from 'react';
import { isSupabaseConfigured, SUPABASE_SQL_SCHEMA } from '../../lib/supabase';
import { Database, CheckCircle2, AlertTriangle, Copy, Check, ShieldCheck, Key } from 'lucide-react';

export const AdminDatabaseSetup: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Connection Status Banner */}
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
              {isSupabaseConfigured
                ? 'Conectado ao Supabase Backend'
                : 'Modo de Armazenamento Local Ativo (Supabase em Aguardo)'}
            </h2>
            <p className="text-xs opacity-90 mt-0.5">
              {isSupabaseConfigured
                ? 'Os dados estão sincronizando com as tabelas do seu banco de dados remoto em nuvem.'
                : 'A aplicação está funcionando 100% com persistência no LocalStorage. Siga o guia abaixo para conectar ao Supabase em 2 minutos.'}
            </p>
          </div>
        </div>
      </div>

      {/* Guia de Configuração em 4 Passos */}
      <div className="p-6 rounded-2xl border space-y-6" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Database className="w-5 h-5 text-[var(--theme-primary)]" />
          <span>Passo a Passo de Integração com o Supabase</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="p-4 rounded-xl border space-y-2" style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}>
            <span className="font-bold text-xs uppercase text-[var(--theme-primary)]">Passo 1: Criar Projeto no Supabase</span>
            <p className="text-xs text-[var(--theme-text-secondary)]">
              Acesse <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline font-bold">supabase.com</a> e crie um novo projeto gratuito.
            </p>
          </div>

          <div className="p-4 rounded-xl border space-y-2" style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}>
            <span className="font-bold text-xs uppercase text-[var(--theme-primary)]">Passo 2: Configurar Variáveis no `.env`</span>
            <p className="text-xs text-[var(--theme-text-secondary)]">
              Copie o `Project URL` e a `anon public key` nas Configurações do Projeto e cole no `.env`:
            </p>
            <code className="block p-2 rounded bg-black/5 text-[11px] font-mono">
              VITE_SUPABASE_URL=https://...supabase.co<br />
              VITE_SUPABASE_ANON_KEY=eyJhbGci...
            </code>
          </div>

          <div className="p-4 rounded-xl border space-y-2" style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}>
            <span className="font-bold text-xs uppercase text-[var(--theme-primary)]">Passo 3: Executar Script SQL no Supabase</span>
            <p className="text-xs text-[var(--theme-text-secondary)]">
              No painel do Supabase, acesse a aba <strong>SQL Editor</strong>, cole o código do bloco abaixo e clique em <strong>Run</strong>.
            </p>
          </div>

          <div className="p-4 rounded-xl border space-y-2" style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}>
            <span className="font-bold text-xs uppercase text-[var(--theme-primary)]">Passo 4: Criar Bucket de Storage</span>
            <p className="text-xs text-[var(--theme-text-secondary)]">
              Na aba <strong>Storage</strong>, crie um bucket público com o nome <strong>`portfolio-media`</strong> para armazenar imagens e áudios.
            </p>
          </div>
        </div>
      </div>

      {/* SQL Script Viewer */}
      <div className="p-6 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--theme-border)' }}>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[var(--theme-primary)]" />
            <span className="font-bold text-sm">Script SQL de Tabelas e Políticas RLS</span>
          </div>

          <button
            onClick={handleCopySql}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-sm"
            style={{ backgroundColor: 'var(--theme-primary)' }}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copiado para a área de transferência!' : 'Copiar Script SQL'}</span>
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto max-h-96 leading-relaxed">
          {SUPABASE_SQL_SCHEMA}
        </pre>
      </div>
    </div>
  );
};
