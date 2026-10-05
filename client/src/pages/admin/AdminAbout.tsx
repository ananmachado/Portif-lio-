import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";

export default function AdminAbout() {
  const utils = trpc.useUtils();
  const { data: settings, isLoading } = trpc.settings.get.useQuery();
  const updateMutation = trpc.settings.update.useMutation({
    onSuccess: () => { toast.success("Informações salvas!"); utils.settings.get.invalidate(); },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });
  const { upload, uploading } = useFileUpload();

  const [form, setForm] = useState({ portfolioName: "", aboutTitle: "", aboutText: "", shortBio: "", location: "", profileImageUrl: "", profileImageKey: "" });
  const [socialLinks, setSocialLinks] = useState<Array<{ label: string; url: string }>>([]);

  useEffect(() => {
    if (settings) {
      setForm({ portfolioName: settings.portfolioName ?? "", aboutTitle: settings.aboutTitle ?? "", aboutText: settings.aboutText ?? "", shortBio: settings.shortBio ?? "", location: settings.location ?? "", profileImageUrl: settings.profileImageUrl ?? "", profileImageKey: settings.profileImageKey ?? "" });
      setSocialLinks((settings.socialLinks as Array<{ label: string; url: string }>) ?? []);
    }
  }, [settings]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) { toast.error("Tipo de arquivo não permitido. Use JPEG, PNG, WebP ou GIF."); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Arquivo muito grande. Máximo 5MB."); return; }
    const result = await upload(file, "profile");
    if (result) setForm((f) => ({ ...f, profileImageUrl: result.url, profileImageKey: result.key }));
  }

  function handleSave() {
    updateMutation.mutate({ ...form, socialLinks });
  }

  if (isLoading) return <AdminLayout title="Sobre"><div className="flex items-center gap-2"><Loader2 className="animate-spin" size={20} /><span>Carregando...</span></div></AdminLayout>;

  return (
    <AdminLayout title="Sobre">
    <div className="max-w-2xl space-y-6">
        <div>
          <Label htmlFor="portfolio-name-about">Nome do portfólio</Label>
          <Input id="portfolio-name-about" value={form.portfolioName} onChange={(e) => setForm((f) => ({ ...f, portfolioName: e.target.value }))} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="about-title">Título da seção Sobre</Label>
          <Input id="about-title" value={form.aboutTitle} onChange={(e) => setForm((f) => ({ ...f, aboutTitle: e.target.value }))} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="short-bio">Apresentação curta (exibida na Home)</Label>
          <Textarea id="short-bio" value={form.shortBio} onChange={(e) => setForm((f) => ({ ...f, shortBio: e.target.value }))} rows={3} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="about-text">Texto completo da seção Sobre</Label>
          <Textarea id="about-text" value={form.aboutText} onChange={(e) => setForm((f) => ({ ...f, aboutText: e.target.value }))} rows={8} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="location">Localização</Label>
          <Input id="location" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} className="mt-1" placeholder="Ex: São Paulo, SP" />
        </div>
        <div>
          <Label>Foto de perfil</Label>
          <div className="mt-2 flex items-center gap-4">
            {form.profileImageUrl && <img src={form.profileImageUrl} alt="Foto de perfil atual" className="w-20 h-20 rounded-full object-cover" />}
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded border cursor-pointer text-sm font-medium transition-opacity hover:opacity-70" style={{ borderColor: "var(--color-border)", borderRadius: "var(--radius-md)" }}>
              {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} aria-hidden="true" />}
              {uploading ? "Enviando..." : "Escolher imagem"}
              <input type="file" accept="image/*" className="sr-only" onChange={handleImageUpload} aria-label="Upload de foto de perfil" />
            </label>
          </div>
        </div>
        <div>
          <Label>Links externos (redes sociais, portfólios, etc.)</Label>
          <div className="mt-2 space-y-2">
            {socialLinks.map((link, i) => (
              <div key={i} className="flex gap-2">
                <Input value={link.label} onChange={(e) => { const l = [...socialLinks]; l[i] = { ...l[i]!, label: e.target.value }; setSocialLinks(l); }} placeholder="Rótulo (ex: Instagram)" aria-label={`Rótulo do link ${i + 1}`} />
                <Input value={link.url} onChange={(e) => { const l = [...socialLinks]; l[i] = { ...l[i]!, url: e.target.value }; setSocialLinks(l); }} placeholder="URL" aria-label={`URL do link ${i + 1}`} />
                <Button variant="outline" onClick={() => setSocialLinks(socialLinks.filter((_, j) => j !== i))} aria-label={`Remover link ${link.label || i + 1}`}>✕</Button>
              </div>
            ))}
            <Button variant="outline" onClick={() => setSocialLinks([...socialLinks, { label: "", url: "" }])}>+ Adicionar link</Button>
          </div>
        </div>
        <Button onClick={handleSave} disabled={updateMutation.isPending} style={{ background: "var(--color-primary)", color: "oklch(0.98 0 0)" }}>
          {updateMutation.isPending ? <><Loader2 className="animate-spin mr-2" size={16} />Salvando...</> : "Salvar"}
        </Button>
      </div>
    </AdminLayout>
  );
}
