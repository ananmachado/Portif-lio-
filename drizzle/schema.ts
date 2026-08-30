/**
 * Shared database types.
 *
 * The production database is Supabase/PostgreSQL. The application accesses it
 * through the Supabase REST API, so these types intentionally do not depend on
 * a database driver at runtime.
 */

export type AccountRole = "user" | "admin";
export type ProjectStatus = "draft" | "published";
export type ProjectBlockType = "text" | "image" | "youtube" | "audio";

export interface ThemeConfig {
  colorBackground?: string;
  colorSurface?: string;
  colorTextPrimary?: string;
  colorTextSecondary?: string;
  colorPrimary?: string;
  colorSecondary?: string;
  colorAccent?: string;
  colorBorder?: string;
  colorFocus?: string;
  fontHeading?: string;
  fontBody?: string;
  fontSizeBase?: string;
  lineHeightBase?: string;
  letterSpacingHeading?: string;
  radiusNone?: string;
  radiusSm?: string;
  radiusMd?: string;
  radiusLg?: string;
  radiusFull?: string;
  borderWidth?: string;
  shadowSm?: string;
  shadowMd?: string;
  shadowLg?: string;
  maxWidth?: string;
  gridColumns?: string;
  gapBase?: string;
  motionFast?: string;
  motionNormal?: string;
  motionSlow?: string;
  motionEasing?: string;
  ctaViewProject?: string;
  ctaSendMessage?: string;
}

export interface User {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  role: AccountRole;
  createdAt: Date | string;
  updatedAt: Date | string;
  lastSignedIn: Date | string;
}

export type InsertUser = Partial<Omit<User, "id" | "createdAt" | "updatedAt">> & {
  openId: string;
};

export interface PortfolioSettings {
  id: number;
  userId: number;
  portfolioName: string;
  tagline: string | null;
  aboutTitle: string | null;
  aboutText: string | null;
  shortBio: string | null;
  profileImageUrl: string | null;
  profileImageKey: string | null;
  whatsapp: string | null;
  emailPublic: string | null;
  location: string | null;
  socialLinks: Array<{ label: string; url: string }>;
  contactIntro: string | null;
  uxVoice: string | null;
  themeConfig: ThemeConfig;
  faviconUrl: string | null;
  faviconKey: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export type InsertPortfolioSettings = Partial<Omit<PortfolioSettings, "id" | "createdAt" | "updatedAt">> & {
  userId: number;
};

export interface Category {
  id: number;
  userId: number;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  createdAt: Date | string;
}

export type InsertCategory = Partial<Omit<Category, "id" | "createdAt">> & {
  userId: number;
  name: string;
  slug: string;
};

export interface Project {
  id: number;
  userId: number;
  categoryId: number | null;
  title: string;
  slug: string;
  shortDescription: string | null;
  coverImageUrl: string | null;
  coverImageKey: string | null;
  coverImageAlt: string | null;
  year: string | null;
  status: ProjectStatus;
  featured: boolean;
  displayOrder: number;
  metaDescription: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export type InsertProject = Partial<Omit<Project, "id" | "createdAt" | "updatedAt">> & {
  userId: number;
  title: string;
  slug: string;
};

export interface ProjectBlock {
  id: number;
  projectId: number;
  userId: number;
  type: ProjectBlockType;
  content: string | null;
  mediaUrl: string | null;
  mediaKey: string | null;
  altText: string | null;
  caption: string | null;
  transcript: string | null;
  displayOrder: number;
  createdAt: Date | string;
}

export type InsertProjectBlock = Partial<Omit<ProjectBlock, "id" | "createdAt">> & {
  projectId: number;
  userId: number;
  type: ProjectBlockType;
};
