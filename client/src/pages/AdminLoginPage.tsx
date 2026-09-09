import React, { useState } from "react";
import { useLocation } from "wouter";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import { signIn } from "@/lib/supabaseAuth";

export default function AdminLoginPage() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const session = await signIn(email.trim(), password);
      if (session.portfolioUser?.role !== "admin") {
        throw new Error("Esta conta ainda não possui permissão de administrador.");
      }
      navigate("/admin");
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PublicLayout>
      <section className="auth-page" aria-labelledby="admin-login-heading">
        <div className="container auth-page__grid">
          <div className="auth-page__intro">
            <p className="site-eyebrow">Acesso restrito</p>
            <h1 id="admin-login-heading">Painel administrativo.</h1>
            <p>Entre com o e-mail e a senha de uma conta que possua papel de administrador.</p>
            <p className="auth-page__note"><ShieldCheck size={17} aria-hidden="true" /> A conta precisa estar cadastrada no Supabase e ter role <strong>admin</strong>.</p>
          </div>
          <form className="auth-card" onSubmit={handleSubmit}>
            <LockKeyhole size={28} aria-hidden="true" className="auth-card__icon" />
            <h2>Login de administrador</h2>
            <label className="block mt-4">E-mail<input className="w-full mt-2 p-3 border rounded" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" /></label>
            <label className="block mt-4">Senha<input className="w-full mt-2 p-3 border rounded" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" /></label>
            {error && <p role="alert" className="mt-4 text-red-600">{error}</p>}
            <button className="editorial-button w-full mt-5" type="submit" disabled={loading}><LockKeyhole size={16} aria-hidden="true" /> {loading ? "Entrando..." : "Entrar no painel"}</button>
            <p className="auth-card__footer">Acesso exclusivo da administradora cadastrada no Supabase.</p>
          </form>
        </div>
      </section>
    </PublicLayout>
  );
}
