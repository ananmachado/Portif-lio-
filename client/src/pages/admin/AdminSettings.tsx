import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";

export default function AdminSettings() {
  const utils = trpc.useUtils();
  const { data: settings, isLoading } = trpc.settings.get.useQuery();
  const updateMutation = trpc.settings.update.useMutation({
    onSuccess: () => { toast.success("Configurações salvas!"); utils.settings.get.invalidate(); },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });
  const { upload, uploading } = useFileUpload();
  const [form, setForm] = useState({ portfolioName: "", tagline: "", faviconUrl: "", faviconKey: "" });

  useEffect(() => {
    if (settings) setForm({ portfolioName: settings.portfolioName ?? "", tagline: settings.tagline ?? "", faviconUrl: settings.faviconUrl ?? "", faviconKey: settings.faviconKey ?? "" });
  }, [settings]);

  async function handleFaviconUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await upload(file, "favicon");
    if (result) setForm((f) => ({ ...f, faviconUrl: result.url, faviconKey: result.key }));
  }

  if (isLoading) return <AdminLayout title="Configurações"><Loader2 className="animate-spin" /></AdminLayout>;

  return (
    <AdminLayout title="Configurações">
      <div className="max-w-xl space-y-6">
        <div>
          <Label htmlFor="portfolio-name">Nome do portfólio</Label>
          <Input id="portfolio-name" value={form.portfolioName} onChange={(e) => setForm((f) => ({ ...f, portfolioName: e.target.value }))} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="tagline">Tagline</Label>
          <Input id="tagline" value={form.tagline} onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))} className="mt-1" placeholder="Uma frase que define seu trabalho" />
        </div>
        <div>
          <Label>Favicon</Label>
          <div className="mt-2 flex items-center gap-4">
            {form.faviconUrl && <img src={form.faviconUrl} alt="Favicon atual" className="w-8 h-8 object-contain" />}
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded border cursor-pointer text-sm font-medium transition-opacity hover:opacity-70" style={{ borderColor: "var(--color-border)", borderRadius: "var(--radius-md)" }}>
              {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} aria-hidden="true" />}
              {uploading ? "Enviando..." : "Escolher favicon"}
              <input type="file" accept="image/x-icon,image/png,image/svg+xml" className="sr-only" onChange={handleFaviconUpload} aria-label="Upload de favicon" />
            </label>
          </div>
        </div>
        <Button onClick={() => updateMutation.mutate(form)} disabled={updateMutation.isPending} style={{ background: "var(--color-primary)", color: "oklch(0.98 0 0)" }}>
          {updateMutation.isPending ? <><Loader2 className="animate-spin mr-2" size={16} />Salvando...</> : "Salvar"}
        </Button>
      </div>
    </AdminLayout>
  );
}
