import { useEffect } from "react";

interface SEOOptions {
  title?: string;
  description?: string;
  ogImage?: string;
  siteName?: string;
}

export function useSEO({ title, description, ogImage, siteName }: SEOOptions) {
  useEffect(() => {
    const base = siteName ?? "Portfólio";
    const fullTitle = title ? `${title} — ${base}` : base;
    document.title = fullTitle;

    function setMeta(name: string, content: string, attr: "name" | "property" = "name") {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    }

    if (description) {
      setMeta("description", description);
      setMeta("og:description", description, "property");
    }
    if (title) setMeta("og:title", fullTitle, "property");
    if (ogImage) setMeta("og:image", ogImage, "property");
    setMeta("og:type", "website", "property");

    return () => {
      document.title = base;
    };
  }, [title, description, ogImage, siteName]);
}
