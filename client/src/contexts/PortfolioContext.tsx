import React, { createContext, useContext, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useTheme } from "@/contexts/ThemeContext";
import type { ThemeConfig } from "../../../drizzle/schema";

interface PortfolioContextValue {
  ownerId: number;
  settings: {
    portfolioName: string;
    tagline: string;
    aboutTitle: string;
    aboutText: string;
    shortBio: string;
    profileImageUrl: string;
    whatsapp: string;
    emailPublic: string;
    location: string;
    socialLinks: Array<{ label: string; url: string }>;
    contactIntro: string;
    themeConfig: ThemeConfig;
    faviconUrl: string;
    ctaViewProject: string;
    ctaSendMessage: string;
  } | null;
  isLoading: boolean;
}

const PortfolioContext = createContext<PortfolioContextValue>({
  ownerId: 0,
  settings: null,
  isLoading: true,
});

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  // The public portfolio owner is resolved on the server from OWNER_EMAIL or
  // the first admin account. No VITE_* owner variable is exposed to the client.
  const { data, isLoading } = trpc.settings.getPublicPortfolio.useQuery();
  const { theme: activeTheme } = useTheme();
  const ownerId = data?.ownerId ?? 0;
  const publicSettings = data?.settings ?? null;

  useEffect(() => {
    if (!publicSettings?.themeConfig) return;
    const cfg = publicSettings.themeConfig as ThemeConfig;
    const root = document.documentElement;

    const legacy = {
      colorBackground: cfg.colorBackground,
      colorSurface: cfg.colorSurface,
      colorTextPrimary: cfg.colorTextPrimary,
      colorTextSecondary: cfg.colorTextSecondary,
      colorPrimary: cfg.colorPrimary,
      colorSecondary: cfg.colorSecondary,
      colorAccent: cfg.colorAccent,
      colorBorder: cfg.colorBorder,
      colorFocus: cfg.colorFocus,
    };

    const lightDefaults = {
      colorBackground: "#FAF8FC",
      colorSurface: "#FFFFFF",
      colorTextPrimary: "#211A29",
      colorTextSecondary: "#5F5668",
      colorPrimary: "#6D28D9",
      colorSecondary: "#5B21B6",
      colorAccent: "#7C3AED",
      colorBorder: "#DDD5E5",
      colorFocus: "#5B21B6",
    };

    const darkDefaults = {
      colorBackground: "#0B0910",
      colorSurface: "#17131F",
      colorTextPrimary: "#F7F3FA",
      colorTextSecondary: "#C4BBCF",
      colorPrimary: "#7C3AED",
      colorSecondary: "#5B21B6",
      colorAccent: "#A855F7",
      colorBorder: "#332B3D",
      colorFocus: "#D8B4FE",
    };

    const theme = activeTheme === "dark" ? darkDefaults : lightDefaults;
    const prefix = activeTheme === "dark" ? "dark" : "light";
    const value = (key: keyof typeof theme) => {
      const modeKey = `${prefix}${key[0].toUpperCase()}${key.slice(1)}`;
      const configured = (cfg as Record<string, unknown>)[modeKey];
      if (typeof configured === "string" && configured.trim()) return configured;
      if (activeTheme === "light" && legacy[key]) return legacy[key];
      return theme[key] as string;
    };

    const map: Record<string, string | undefined> = {
      "--color-background": value("colorBackground"),
      "--color-surface": value("colorSurface"),
      "--color-text-primary": value("colorTextPrimary"),
      "--color-text-secondary": value("colorTextSecondary"),
      "--color-primary": value("colorPrimary"),
      "--color-secondary": value("colorSecondary"),
      "--color-accent": value("colorAccent"),
      "--color-border": value("colorBorder"),
      "--color-focus": value("colorFocus"),
      "--font-size-base": cfg.fontSizeBase,
      "--line-height-base": cfg.lineHeightBase,
      "--letter-spacing-heading": cfg.letterSpacingHeading,
      "--radius-none": cfg.radiusNone,
      "--radius-sm": cfg.radiusSm,
      "--radius-md": cfg.radiusMd,
      "--radius-lg": cfg.radiusLg,
      "--radius-full": cfg.radiusFull,
      "--shadow-sm": cfg.shadowSm,
      "--shadow-md": cfg.shadowMd,
      "--shadow-lg": cfg.shadowLg,
      "--max-width": cfg.maxWidth,
      "--gap-base": cfg.gapBase,
      "--motion-fast": cfg.motionFast,
      "--motion-normal": cfg.motionNormal,
      "--motion-slow": cfg.motionSlow,
      "--motion-easing": cfg.motionEasing,
    };

    for (const [prop, val] of Object.entries(map)) {
      if (val) root.style.setProperty(prop, val);
    }

    if (cfg.fontBody) document.body.style.fontFamily = `${cfg.fontBody}, var(--font-sans)`;

    if (publicSettings.faviconUrl) {
      const link = document.getElementById("dynamic-favicon") as HTMLLinkElement | null;
      if (link) link.href = publicSettings.faviconUrl;
    }
  }, [publicSettings, activeTheme]);

  const settings = publicSettings
    ? {
        portfolioName: publicSettings.portfolioName ?? "Portfólio",
        tagline: publicSettings.tagline ?? "",
        aboutTitle: publicSettings.aboutTitle ?? "Sobre",
        aboutText: publicSettings.aboutText ?? "",
        shortBio: publicSettings.shortBio ?? "",
        profileImageUrl: publicSettings.profileImageUrl ?? "",
        whatsapp: publicSettings.whatsapp ?? "",
        emailPublic: publicSettings.emailPublic ?? "",
        location: publicSettings.location ?? "",
        socialLinks:
          (publicSettings.socialLinks as Array<{ label: string; url: string }>) ?? [],
        contactIntro: publicSettings.contactIntro ?? "",
        themeConfig: (publicSettings.themeConfig as ThemeConfig) ?? {},
        faviconUrl: publicSettings.faviconUrl ?? "",
        ctaViewProject:
          (publicSettings.themeConfig as ThemeConfig)?.ctaViewProject ?? "Ver projeto",
        ctaSendMessage:
          (publicSettings.themeConfig as ThemeConfig)?.ctaSendMessage ?? "Enviar pelo WhatsApp",
      }
    : null;

  return (
    <PortfolioContext.Provider value={{ ownerId, settings, isLoading }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  return useContext(PortfolioContext);
}
