import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectFile = (relativePath: string) => readFileSync(resolve(process.cwd(), relativePath), "utf-8");

describe("acessibilidade do redesenho editorial", () => {
  it("mantém skip link, controle de menu e diálogo modal no layout público", () => {
    const layout = projectFile("client/src/components/PublicLayout.tsx");
    expect(layout).toContain('href="#main-content"');
    expect(layout).toContain('aria-expanded={menuOpen}');
    expect(layout).toContain('role="dialog"');
    expect(layout).toContain('aria-modal="true"');
    expect(layout).toContain('event.key === "Escape"');
    expect(layout).toContain('menuBtnRef.current?.focus()');
  });

  it("mantém filtro de projetos operável com estados aria-pressed", () => {
    const projects = projectFile("client/src/pages/ProjectsPage.tsx");
    expect(projects).toContain('aria-pressed={activeCategory === null}');
    expect(projects).toContain('aria-pressed={activeCategory === category.id}');
    expect(projects).toContain('aria-live="polite"');
  });

  it("mantém campos de contato rotulados, validação acessível e URL encoding do WhatsApp", () => {
    const contact = projectFile("client/src/pages/ContactPage.tsx");
    expect(contact).toContain('aria-invalid={Boolean(errors.name)}');
    expect(contact).toContain('role="alert"');
    expect(contact).toContain('encodeURIComponent(text)');
    expect(contact).toContain('aria-label="Formulário de contato"');
  });

  it("mantém foco visível e redução de movimento no CSS global", () => {
    const styles = projectFile("client/src/index.css");
    expect(styles).toContain(':focus-visible');
    expect(styles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(styles).toContain('--color-focus');
  });
});
