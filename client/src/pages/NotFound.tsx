import { Link } from "wouter";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ background: "var(--color-background)" }}
    >
      <h1
        className="text-6xl font-bold mb-4"
        style={{ fontFamily: "var(--font-heading)", color: "var(--color-text-primary)" }}
      >
        404
      </h1>
      <p className="text-xl mb-2" style={{ color: "var(--color-text-primary)" }}>
        Página não encontrada
      </p>
      <p className="mb-8" style={{ color: "var(--color-text-secondary)" }}>
        O conteúdo que você procura não existe ou foi movido.
      </p>
      <Link
        href="/"
        className="inline-flex items-center px-5 py-2.5 rounded font-medium text-sm transition-opacity hover:opacity-80"
        style={{
          background: "var(--color-primary)",
          color: "oklch(0.98 0 0)",
          borderRadius: "var(--radius-md)",
        }}
      >
        Voltar ao início
      </Link>
    </div>
  );
}
