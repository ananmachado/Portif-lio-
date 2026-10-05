import React, {
  useEffect,
  useState,
} from "react";

import AdminLayout from "./AdminLayout";

import { trpc } from "@/lib/trpc";

import { toast } from "sonner";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import {
  Loader2,
  Upload,
} from "lucide-react";

import { useFileUpload } from "@/hooks/useFileUpload";

import type {
  HomeGridConfig,
  HomeLayoutConfig,
  HomeLayoutGap,
  HomeLayoutMode,
} from "@/contexts/PortfolioContext";

import type { ThemeConfig } from "../../../../drizzle/schema";

type HomeTextForm = {
  portfolioName: string;
  tagline: string;
  faviconUrl: string;
  faviconKey: string;

  ribbonText: string;

  homeHeroEyebrow: string;
  homeHeroTitle: string;
  homeHeroLead: string;
  homeHeroPrimaryCta: string;
  homeHeroSecondaryCta: string;

  homeFeaturedEyebrow: string;
  homeFeaturedTitle: string;
  homeFeaturedDescription: string;

  homeManifestoTileText: string;
  homeManifestoEyebrow: string;
  homeManifestoTitle: string;
  homeManifestoText: string;
  homeManifestoCta: string;

  homeLayoutConfig: HomeLayoutConfig;
};

const DEFAULT_LAYOUT: HomeLayoutConfig = {
  hero: {
    desktopColumns: 2,
    mobileColumns: 1,
    mode: "split",
    gap: "large",
  },

  featured: {
    desktopColumns: 3,
    mobileColumns: 2,
    mode: "grid",
    gap: "medium",
  },

  manifesto: {
    desktopColumns: 2,
    mobileColumns: 1,
    mode: "split",
    gap: "large",
  },
};

const DEFAULTS: HomeTextForm = {
  portfolioName: "",
  tagline: "",
  faviconUrl: "",
  faviconKey: "",

  ribbonText:
    "Portfólio autoral · ideias, imagens e histórias",

  homeHeroEyebrow:
    "Portfólio criativo",

  homeHeroTitle:
    "Ideias para ver, sentir e guardar.",

  homeHeroLead:
    "Um espaço autoral para reunir projetos, processos e histórias em movimento.",

  homeHeroPrimaryCta:
    "Conheça os projetos",

  homeHeroSecondaryCta:
    "Vamos conversar",

  homeFeaturedEyebrow:
    "Seleção autoral",

  homeFeaturedTitle:
    "Projetos em destaque",

  homeFeaturedDescription:
    "Uma vitrine de processos, imagens e narrativas criadas com intenção.",

  homeManifestoTileText:
    "criar\né cultivar",

  homeManifestoEyebrow:
    "Sobre o processo",

  homeManifestoTitle:
    "Toda boa ideia merece ganhar forma.",

  homeManifestoText:
    "Este portfólio reúne trabalhos e pequenos rastros do que acontece antes, durante e depois de uma ideia ganhar o mundo.",

  homeManifestoCta:
    "Conheça a história",

  homeLayoutConfig:
    DEFAULT_LAYOUT,
};

const MODE_OPTIONS: Array<{
  value: HomeLayoutMode;
  label: string;
  description: string;
}> = [
  {
    value: "grid",
    label: "Grade regular",
    description:
      "Distribui os elementos igualmente pelas colunas.",
  },
  {
    value: "split",
    label: "Divisão equilibrada",
    description:
      "Cria uma composição dividida em áreas principais.",
  },
  {
    value: "asymmetric",
    label: "Assimétrico",
    description:
      "Dá mais espaço visual para a primeira área.",
  },
  {
    value: "stack",
    label: "Empilhado",
    description:
      "Coloca os elementos em uma única coluna.",
  },
  {
    value: "reverse",
    label: "Invertido",
    description:
      "Troca a ordem visual dos blocos.",
  },
  {
    value: "featured-first",
    label: "Primeiro destaque",
    description:
      "Faz o primeiro item ocupar mais espaço na grade.",
  },
  {
    value: "masonry",
    label: "Mosaico",
    description:
      "Usa uma composição mais solta e densa.",
  },
];

const GAP_OPTIONS: Array<{
  value: HomeLayoutGap;
  label: string;
}> = [
  {
    value: "small",
    label: "Pequeno",
  },
  {
    value: "medium",
    label: "Médio",
  },
  {
    value: "large",
    label: "Grande",
  },
];

function parseLayout(
  value: unknown,
): HomeLayoutConfig {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return DEFAULT_LAYOUT;
  }

  try {
    const parsed =
      JSON.parse(value) as Partial<HomeLayoutConfig>;

    return {
      hero: {
        ...DEFAULT_LAYOUT.hero,
        ...(parsed.hero ?? {}),
      },

      featured: {
        ...DEFAULT_LAYOUT.featured,
        ...(parsed.featured ?? {}),
      },

      manifesto: {
        ...DEFAULT_LAYOUT.manifesto,
        ...(parsed.manifesto ?? {}),
      },
    };
  } catch {
    return DEFAULT_LAYOUT;
  }
}

function clampColumns(
  value: number,
  min: number,
  max: number,
) {
  return Math.max(
    min,
    Math.min(max, Number(value) || min),
  );
}

function LayoutSelect({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{
    value: string;
    label: string;
  }>;
}) {
  return (
    <div>
      <Label htmlFor={id}>
        {label}
      </Label>

      <select
        id={id}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="mt-1 flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none"
        style={{
          borderColor:
            "var(--color-border)",
          color:
            "var(--color-text-primary)",
        }}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function LayoutEditor({
  title,
  description,
  config,
  onChange,
  desktopMax,
  idPrefix,
}: {
  title: string;
  description: string;
  config: HomeGridConfig;
  onChange: (
    config: HomeGridConfig,
  ) => void;
  desktopMax: number;
  idPrefix: string;
}) {
  const selectedMode =
    MODE_OPTIONS.find(
      (option) =>
        option.value === config.mode,
    );

  return (
    <div
      className="rounded-lg border p-5 space-y-5"
      style={{
        borderColor:
          "var(--color-border)",
        background:
          "var(--color-background)",
      }}
    >
      <div>
        <h4 className="font-semibold">
          {title}
        </h4>

        <p
          className="text-sm mt-1"
          style={{
            color:
              "var(--color-text-secondary)",
          }}
        >
          {description}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label
            htmlFor={`${idPrefix}-desktop`}
          >
            Colunas no desktop
          </Label>

          <select
            id={`${idPrefix}-desktop`}
            value={config.desktopColumns}
            onChange={(event) =>
              onChange({
                ...config,
                desktopColumns:
                  clampColumns(
                    Number(
                      event.target.value,
                    ),
                    1,
                    desktopMax,
                  ),
              })
            }
            className="mt-1 flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none"
            style={{
              borderColor:
                "var(--color-border)",
              color:
                "var(--color-text-primary)",
            }}
          >
            {Array.from(
              {
                length: desktopMax,
              },
              (_, index) => index + 1,
            ).map((value) => (
              <option
                key={value}
                value={value}
              >
                {value}{" "}
                {value === 1
                  ? "coluna"
                  : "colunas"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label
            htmlFor={`${idPrefix}-mobile`}
          >
            Colunas no mobile
          </Label>

          <select
            id={`${idPrefix}-mobile`}
            value={config.mobileColumns}
            onChange={(event) =>
              onChange({
                ...config,
                mobileColumns:
                  clampColumns(
                    Number(
                      event.target.value,
                    ),
                    1,
                    2,
                  ),
              })
            }
            className="mt-1 flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none"
            style={{
              borderColor:
                "var(--color-border)",
              color:
                "var(--color-text-primary)",
            }}
          >
            <option value="1">
              1 coluna
            </option>

            <option value="2">
              2 colunas
            </option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <LayoutSelect
          id={`${idPrefix}-mode`}
          label="Tipo de construção"
          value={config.mode}
          onChange={(value) =>
            onChange({
              ...config,
              mode:
                value as HomeLayoutMode,
            })
          }
          options={MODE_OPTIONS.map(
            ({ value, label }) => ({
              value,
              label,
            }),
          )}
        />

        <LayoutSelect
          id={`${idPrefix}-gap`}
          label="Espaçamento entre áreas"
          value={config.gap}
          onChange={(value) =>
            onChange({
              ...config,
              gap:
                value as HomeLayoutGap,
            })
          }
          options={GAP_OPTIONS}
        />
      </div>

      <div
        className="flex items-start gap-3 rounded-md border p-3 text-sm"
        style={{
          borderColor:
            "var(--color-border)",
          color:
            "var(--color-text-secondary)",
        }}
      >
        <div
          aria-hidden="true"
          className="grid min-w-24 w-24 h-14 gap-1"
          style={{
            gridTemplateColumns: `repeat(${config.desktopColumns}, minmax(0, 1fr))`,
          }}
        >
          {Array.from(
            {
              length: Math.min(
                config.desktopColumns * 2,
                8,
              ),
            },
            (_, index) => (
              <span
                key={index}
                className="rounded-sm"
                style={{
                  background:
                    index === 0
                      ? "var(--color-primary)"
                      : "var(--color-border)",
                }}
              />
            ),
          )}
        </div>

        <div>
          <strong
            style={{
              color:
                "var(--color-text-primary)",
            }}
          >
            Pré-visualização
          </strong>

          <p className="mt-0.5">
            Desktop:{" "}
            {config.desktopColumns} ·
            Mobile:{" "}
            {config.mobileColumns} ·{" "}
            {selectedMode?.label ??
              "Grade regular"}{" "}
            · Espaçamento{" "}
            {GAP_OPTIONS.find(
              (item) =>
                item.value === config.gap,
            )
              ?.label.toLowerCase()}
            .
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminSettings() {
  const utils = trpc.useUtils();

  const {
    data: settings,
    isLoading,
  } =
    trpc.settings.get.useQuery();

  const updateMutation =
    trpc.settings.update.useMutation({
      onSuccess: () => {
        toast.success(
          "Configurações salvas!",
        );

        utils.settings.get.invalidate();
        utils.settings.getPublicPortfolio.invalidate();
      },

      onError: (e) =>
        toast.error(
          `Erro: ${e.message}`,
        ),
    });

  const {
    upload,
    uploading,
  } = useFileUpload();

  const [form, setForm] =
    useState<HomeTextForm>(
      DEFAULTS,
    );

  useEffect(() => {
    if (!settings) return;

    const cfg =
      (settings.themeConfig as
        | ThemeConfig
        | undefined) ?? {};

    setForm({
      portfolioName:
        settings.portfolioName ?? "",

      tagline:
        settings.tagline ?? "",

      faviconUrl:
        settings.faviconUrl ?? "",

      faviconKey:
        settings.faviconKey ?? "",

      ribbonText:
        cfg.ribbonText ??
        DEFAULTS.ribbonText,

      homeHeroEyebrow:
        cfg.homeHeroEyebrow ??
        DEFAULTS.homeHeroEyebrow,

      homeHeroTitle:
        cfg.homeHeroTitle ??
        DEFAULTS.homeHeroTitle,

      homeHeroLead:
        cfg.homeHeroLead ??
        DEFAULTS.homeHeroLead,

      homeHeroPrimaryCta:
        cfg.homeHeroPrimaryCta ??
        DEFAULTS.homeHeroPrimaryCta,

      homeHeroSecondaryCta:
        cfg.homeHeroSecondaryCta ??
        DEFAULTS.homeHeroSecondaryCta,

      homeFeaturedEyebrow:
        cfg.homeFeaturedEyebrow ??
        DEFAULTS.homeFeaturedEyebrow,

      homeFeaturedTitle:
        cfg.homeFeaturedTitle ??
        DEFAULTS.homeFeaturedTitle,

      homeFeaturedDescription:
        cfg.homeFeaturedDescription ??
        DEFAULTS.homeFeaturedDescription,

      homeManifestoTileText:
        cfg.homeManifestoTileText ??
        DEFAULTS.homeManifestoTileText,

      homeManifestoEyebrow:
        cfg.homeManifestoEyebrow ??
        DEFAULTS.homeManifestoEyebrow,

      homeManifestoTitle:
        cfg.homeManifestoTitle ??
        DEFAULTS.homeManifestoTitle,

      homeManifestoText:
        cfg.homeManifestoText ??
        DEFAULTS.homeManifestoText,

      homeManifestoCta:
        cfg.homeManifestoCta ??
        DEFAULTS.homeManifestoCta,

      homeLayoutConfig:
        parseLayout(
          (
            cfg as ThemeConfig & {
              homeLayoutConfig?: string;
            }
          ).homeLayoutConfig,
        ),
    });
  }, [settings]);

  async function handleFaviconUpload(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      e.target.files?.[0];

    if (!file) return;

    const result =
      await upload(
        file,
        "favicon",
      );

    if (result) {
      setForm((f) => ({
        ...f,
        faviconUrl: result.url,
        faviconKey: result.key,
      }));
    }
  }

  function updateField<
    K extends keyof HomeTextForm,
  >(
    key: K,
    value: HomeTextForm[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updateLayout(
    section: keyof HomeLayoutConfig,
    config: HomeGridConfig,
  ) {
    setForm((current) => ({
      ...current,

      homeLayoutConfig: {
        ...current.homeLayoutConfig,
        [section]: config,
      },
    }));
  }

  function handleSave() {
    const {
      portfolioName,
      tagline,
      faviconUrl,
      faviconKey,
      homeLayoutConfig,
      ...homeTexts
    } = form;

    const existingTheme =
      (settings?.themeConfig as
        | ThemeConfig
        | undefined) ?? {};

    updateMutation.mutate({
      portfolioName,
      tagline,
      faviconUrl,
      faviconKey,

      themeConfig: {
        ...existingTheme,
        ...homeTexts,

        homeLayoutConfig:
          JSON.stringify(
            homeLayoutConfig,
          ),
      },
    });
  }

  if (isLoading) {
    return (
      <AdminLayout title="Configurações">
        <Loader2 className="animate-spin" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Configurações">
      <div className="max-w-3xl space-y-8">

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">
              Identidade do portfólio
            </h2>

            <p
              className="text-sm mt-1"
              style={{
                color:
                  "var(--color-text-secondary)",
              }}
            >
              Informações gerais usadas no
              cabeçalho e nas configurações do
              site.
            </p>
          </div>

          <div>
            <Label htmlFor="portfolio-name">
              Nome do portfólio
            </Label>

            <Input
              id="portfolio-name"
              value={form.portfolioName}
              onChange={(e) =>
                updateField(
                  "portfolioName",
                  e.target.value,
                )
              }
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="tagline">
              Tagline
            </Label>

            <Input
              id="tagline"
              value={form.tagline}
              onChange={(e) =>
                updateField(
                  "tagline",
                  e.target.value,
                )
              }
              className="mt-1"
              placeholder="Uma frase que define seu trabalho"
            />
          </div>

          <div>
            <Label>
              Favicon
            </Label>

            <div className="mt-2 flex items-center gap-4">
              {form.faviconUrl && (
                <img
                  src={form.faviconUrl}
                  alt="Favicon atual"
                  className="w-8 h-8 object-contain"
                />
              )}

              <label
                className="inline-flex items-center gap-2 px-4 py-2 rounded border cursor-pointer text-sm font-medium transition-opacity hover:opacity-70"
                style={{
                  borderColor:
                    "var(--color-border)",
                  borderRadius:
                    "var(--radius-md)",
                }}
              >
                {uploading ? (
                  <Loader2
                    className="animate-spin"
                    size={16}
                  />
                ) : (
                  <Upload
                    size={16}
                    aria-hidden="true"
                  />
                )}

                {uploading
                  ? "Enviando..."
                  : "Escolher favicon"}

                <input
                  type="file"
                  accept="image/x-icon,image/png,image/svg+xml"
                  className="sr-only"
                  onChange={
                    handleFaviconUpload
                  }
                  aria-label="Upload de favicon"
                />
              </label>
            </div>
          </div>
        </section>

        <section
          className="space-y-5 border-t pt-8"
          style={{
            borderColor:
              "var(--color-border)",
          }}
        >
          <div>
            <h2 className="text-lg font-semibold">
              Textos da página inicial
            </h2>

            <p
              className="text-sm mt-1"
              style={{
                color:
                  "var(--color-text-secondary)",
              }}
            >
              Altere os textos exibidos na Home
              sem precisar mexer no código.
            </p>
          </div>

          <div>
            <Label htmlFor="ribbon-text">
              Texto da faixa superior
            </Label>

            <Input
              id="ribbon-text"
              value={form.ribbonText}
              onChange={(e) =>
                updateField(
                  "ribbonText",
                  e.target.value,
                )
              }
              className="mt-1"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <Label htmlFor="hero-eyebrow">
                Texto pequeno do destaque inicial
              </Label>

              <Input
                id="hero-eyebrow"
                value={
                  form.homeHeroEyebrow
                }
                onChange={(e) =>
                  updateField(
                    "homeHeroEyebrow",
                    e.target.value,
                  )
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="hero-title">
                Título principal da Home
              </Label>

              <Input
                id="hero-title"
                value={
                  form.homeHeroTitle
                }
                onChange={(e) =>
                  updateField(
                    "homeHeroTitle",
                    e.target.value,
                  )
                }
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="hero-lead">
              Texto abaixo do título principal
            </Label>

            <Textarea
              id="hero-lead"
              value={
                form.homeHeroLead
              }
              onChange={(e) =>
                updateField(
                  "homeHeroLead",
                  e.target.value,
                )
              }
              rows={3}
              className="mt-1"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <Label htmlFor="hero-primary-cta">
                Botão principal
              </Label>

              <Input
                id="hero-primary-cta"
                value={
                  form.homeHeroPrimaryCta
                }
                onChange={(e) =>
                  updateField(
                    "homeHeroPrimaryCta",
                    e.target.value,
                  )
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="hero-secondary-cta">
                Botão secundário
              </Label>

              <Input
                id="hero-secondary-cta"
                value={
                  form.homeHeroSecondaryCta
                }
                onChange={(e) =>
                  updateField(
                    "homeHeroSecondaryCta",
                    e.target.value,
                  )
                }
                className="mt-1"
              />
            </div>
          </div>

          <div className="pt-3">
            <h3 className="font-medium">
              Seção “Projetos em destaque”
            </h3>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <Label htmlFor="featured-eyebrow">
                Texto pequeno da seção
              </Label>

              <Input
                id="featured-eyebrow"
                value={
                  form.homeFeaturedEyebrow
                }
                onChange={(e) =>
                  updateField(
                    "homeFeaturedEyebrow",
                    e.target.value,
                  )
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="featured-title">
                Título da seção
              </Label>

              <Input
                id="featured-title"
                value={
                  form.homeFeaturedTitle
                }
                onChange={(e) =>
                  updateField(
                    "homeFeaturedTitle",
                    e.target.value,
                  )
                }
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="featured-description">
              Descrição da seção
            </Label>

            <Textarea
              id="featured-description"
              value={
                form.homeFeaturedDescription
              }
              onChange={(e) =>
                updateField(
                  "homeFeaturedDescription",
                  e.target.value,
                )
              }
              rows={3}
              className="mt-1"
            />
          </div>

          <div className="pt-3">
            <h3 className="font-medium">
              Seção “Sobre o processo”
            </h3>
          </div>

          <div>
            <Label htmlFor="manifesto-tile">
              Texto do bloco roxo
            </Label>

            <Textarea
              id="manifesto-tile"
              value={
                form.homeManifestoTileText
              }
              onChange={(e) =>
                updateField(
                  "homeManifestoTileText",
                  e.target.value,
                )
              }
              rows={3}
              className="mt-1"
              placeholder={
                "Ex.: criar\né cultivar"
              }
            />

            <p
              className="text-xs mt-1"
              style={{
                color:
                  "var(--color-text-secondary)",
              }}
            >
              Use uma quebra de linha para
              separar as frases no bloco.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <Label htmlFor="manifesto-eyebrow">
                Texto pequeno da seção
              </Label>

              <Input
                id="manifesto-eyebrow"
                value={
                  form.homeManifestoEyebrow
                }
                onChange={(e) =>
                  updateField(
                    "homeManifestoEyebrow",
                    e.target.value,
                  )
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="manifesto-title">
                Título da seção
              </Label>

              <Input
                id="manifesto-title"
                value={
                  form.homeManifestoTitle
                }
                onChange={(e) =>
                  updateField(
                    "homeManifestoTitle",
                    e.target.value,
                  )
                }
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="manifesto-text">
              Texto da seção
            </Label>

            <Textarea
              id="manifesto-text"
              value={
                form.homeManifestoText
              }
              onChange={(e) =>
                updateField(
                  "homeManifestoText",
                  e.target.value,
                )
              }
              rows={5}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="manifesto-cta">
              Botão da seção
            </Label>

            <Input
              id="manifesto-cta"
              value={
                form.homeManifestoCta
              }
              onChange={(e) =>
                updateField(
                  "homeManifestoCta",
                  e.target.value,
                )
              }
              className="mt-1"
            />
          </div>
        </section>

        <section
          className="space-y-5 border-t pt-8"
          style={{
            borderColor:
              "var(--color-border)",
          }}
        >
          <div>
            <h2 className="text-lg font-semibold">
              Construtor de grids e layouts da
              Home
            </h2>

            <p
              className="text-sm mt-1"
              style={{
                color:
                  "var(--color-text-secondary)",
              }}
            >
              Controle separadamente a
              quantidade de colunas no desktop e
              no mobile, o tipo de composição e o
              espaçamento. Essas escolhas são
              salvas junto às configurações do
              portfólio e aplicadas no front-end.
            </p>
          </div>

          <LayoutEditor
            title="Destaque inicial"
            description="Controla a relação entre o texto principal e a imagem/monograma da primeira seção."
            config={
              form.homeLayoutConfig.hero
            }
            onChange={(config) =>
              updateLayout(
                "hero",
                config,
              )
            }
            desktopMax={2}
            idPrefix="home-hero-layout"
          />

          <LayoutEditor
            title="Projetos em destaque"
            description="Controla quantos projetos aparecem lado a lado e como a vitrine é construída."
            config={
              form.homeLayoutConfig.featured
            }
            onChange={(config) =>
              updateLayout(
                "featured",
                config,
              )
            }
            desktopMax={4}
            idPrefix="home-featured-layout"
          />

          <LayoutEditor
            title="Sobre o processo"
            description="Controla a relação entre o bloco visual e o texto da seção final da Home."
            config={
              form.homeLayoutConfig.manifesto
            }
            onChange={(config) =>
              updateLayout(
                "manifesto",
                config,
              )
            }
            desktopMax={2}
            idPrefix="home-manifesto-layout"
          />
        </section>

        <Button
          onClick={handleSave}
          disabled={
            updateMutation.isPending
          }
          style={{
            background:
              "var(--color-primary)",
            color: "oklch(0.98 0 0)",
          }}
        >
          {updateMutation.isPending ? (
            <>
              <Loader2
                className="animate-spin mr-2"
                size={16}
              />
              Salvando...
            </>
          ) : (
            "Salvar"
          )}
        </Button>
      </div>
    </AdminLayout>
  );
}
