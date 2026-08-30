import React, { createContext, useContext, useEffect } from "react";
import { trpc } from "@/lib/trpc";
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
  const ownerId = data?.ownerId ?? 0;
  const publicSettings = data?.settings ?? null;

  useEffect(() => {
    if (!publicSettings?.themeConfig) return;
    const cfg = publicSettings.themeConfig as ThemeConfig;
    const root = document.documentElement;
    const map: Record<string, string | undefined> = {
      "--color-background": cfg.colorBackground,
      "--color-surface": cfg.colorSurface,
      "--color-text-primary": cfg.colorTextPrimary,
      "--color-text-secondary": cfg.colorTextSecondary,
      "--color-primary": cfg.colorPrimary,
      "--color-secondary": cfg.colorSecondary,
      "--color-accent": cfg.colorAccent,
      "--color-border": cfg.colorBorder,
      "--color-focus": cfg.colorFocus,
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

    if (cfg.fontBody) {
      document.body.style.fontFamily = `${cfg.fontBody}, var(--font-sans)`;
    }

    if (publicSettings.faviconUrl) {
      const link = document.getElementById("dynamic-favicon") as HTMLLinkElement | null;
      if (link) link.href = publicSettings.faviconUrl;
    }
  }, [publicSettings]);

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
