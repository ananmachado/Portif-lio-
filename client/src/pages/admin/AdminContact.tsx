import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function AdminContact() {
  const utils = trpc.useUtils();
  const { data: settings, isLoading } = trpc.settings.get.useQuery();
  const updateMutation = trpc.settings.update.useMutation({
    onSuccess: () => { toast.success("Configurações de contato salvas!"); utils.settings.get.invalidate(); },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });

  const [form, setForm] = useState({ whatsapp: "", emailPublic: "", contactIntro: "" });
  const [socialLinks, setSocialLinks] = useState<Array<{ label: string; url: string }>>([]);

  useEffect(() => {
    if (settings) {
      setForm({ whatsapp: settings.whatsapp ?? "", emailPublic: settings.emailPublic ?? "", contactIntro: settings.contactIntro ?? "" });
      setSocialLinks((settings.socialLinks as Array<{ label: string; url: string }>) ?? []);
    }
  }, [settings]);

  if (isLoading) return <AdminLayout title="Contato"><Loader2 className="animate-spin" /></AdminLayout>;

  return (
    <AdminLayout title="Contato">
      <div className="max-w-2xl space-y-6">
        <div>
          <Label htmlFor="whatsapp">Número do WhatsApp (com código do país, sem espaços)</Label>
          <Input id="whatsapp" value={form.whatsapp} onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))} placeholder="5511999999999" className="mt-1" />
          <p className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>Exemplo: 5511999999999 (55 = Brasil, 11 = DDD)</p>
        </div>
        <div>
          <Label htmlFor="email-public">E-mail público (opcional)</Label>
          <Input id="email-public" type="email" value={form.emailPublic} onChange={(e) => setForm((f) => ({ ...f, emailPublic: e.target.value }))} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="contact-intro">Texto introdutório da página de contato</Label>
          <Textarea id="contact-intro" value={form.contactIntro} onChange={(e) => setForm((f) => ({ ...f, contactIntro: e.target.value }))} rows={4} className="mt-1" />
        </div>
        <div>
          <Label>Links externos (redes sociais)</Label>
          <div className="mt-2 space-y-2">
            {socialLinks.map((link, i) => (
              <div key={i} className="flex gap-2">
                <Input value={link.label} onChange={(e) => { const l = [...socialLinks]; l[i] = { ...l[i]!, label: e.target.value }; setSocialLinks(l); }} placeholder="Rótulo" aria-label={`Rótulo do link ${i + 1}`} />
                <Input value={link.url} onChange={(e) => { const l = [...socialLinks]; l[i] = { ...l[i]!, url: e.target.value }; setSocialLinks(l); }} placeholder="URL" aria-label={`URL do link ${i + 1}`} />
                <Button variant="outline" onClick={() => setSocialLinks(socialLinks.filter((_, j) => j !== i))} aria-label={`Remover link ${link.label || i + 1}`}>✕</Button>
              </div>
            ))}
            <Button variant="outline" onClick={() => setSocialLinks([...socialLinks, { label: "", url: "" }])}>+ Adicionar link</Button>
          </div>
        </div>
        <Button onClick={() => updateMutation.mutate({ ...form, socialLinks })} disabled={updateMutation.isPending} style={{ background: "var(--color-primary)", color: "oklch(0.98 0 0)" }}>
          {updateMutation.isPending ? <><Loader2 className="animate-spin mr-2" size={16} />Salvando...</> : "Salvar"}
        </Button>
      </div>
    </AdminLayout>
  );
}
