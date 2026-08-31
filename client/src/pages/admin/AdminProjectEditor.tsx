import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import AdminLayout from "./AdminLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Loader2, Upload, ChevronUp, ChevronDown, Trash2, Plus, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";
import type { ProjectBlock } from "../../../../drizzle/schema";

type BlockType = "text" | "image" | "youtube" | "audio";

export default function AdminProjectEditor() {
  const params = useParams<{ id: string }>();
  const projectId = Number(params.id);
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const { upload, uploading } = useFileUpload();

  const { data: project, isLoading: projLoading } = trpc.projects.getById.useQuery({ id: projectId }, { enabled: !!projectId });
  const { data: categories } = trpc.categories.list.useQuery();
  const { data: blocks, isLoading: blocksLoading } = trpc.blocks.list.useQuery({ projectId }, { enabled: !!projectId });

  const updateProjectMutation = trpc.projects.update.useMutation({ onSuccess: () => { toast.success("Projeto salvo!"); utils.projects.getById.invalidate({ id: projectId }); }, onError: (e) => toast.error(e.message) });
  const createBlockMutation = trpc.blocks.create.useMutation({ onSuccess: () => { toast.success("Bloco adicionado!"); utils.blocks.list.invalidate({ projectId }); }, onError: (e) => toast.error(e.message) });
  const updateBlockMutation = trpc.blocks.update.useMutation({ onSuccess: () => { utils.blocks.list.invalidate({ projectId }); }, onError: (e) => toast.error(e.message) });
  const deleteBlockMutation = trpc.blocks.delete.useMutation({ onSuccess: () => { toast.success("Bloco removido!"); utils.blocks.list.invalidate({ projectId }); setDeleteBlockId(null); }, onError: (e) => toast.error(e.message) });
  const reorderMutation = trpc.blocks.reorder.useMutation({ onSuccess: () => utils.blocks.list.invalidate({ projectId }) });

  const [form, setForm] = useState({ title: "", shortDescription: "", year: "", categoryId: "", status: "draft" as "draft" | "published", coverImageUrl: "", coverImageKey: "", coverImageAlt: "", metaDescription: "" });
  const [deleteBlockId, setDeleteBlockId] = useState<number | null>(null);
  const [editingBlock, setEditingBlock] = useState<Record<number, Partial<ProjectBlock>>>({});

  useEffect(() => {
    if (project) {
      setForm({ title: project.title, shortDescription: project.shortDescription ?? "", year: project.year ?? "", categoryId: project.categoryId ? String(project.categoryId) : "", status: project.status, coverImageUrl: project.coverImageUrl ?? "", coverImageKey: project.coverImageKey ?? "", coverImageAlt: project.coverImageAlt ?? "", metaDescription: project.metaDescription ?? "" });
    }
  }, [project]);

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) { toast.error("Tipo não permitido."); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("Máximo 10MB."); return; }
    const result = await upload(file, "covers");
    if (result) setForm((f) => ({ ...f, coverImageUrl: result.url, coverImageKey: result.key }));
  }

  async function handleBlockMediaUpload(blockId: number, file: File, type: "image" | "audio") {
    const allowed = type === "image" ? ["image/jpeg", "image/png", "image/webp", "image/gif"] : ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/m4a", "audio/aac"];
    if (!allowed.includes(file.type)) { toast.error("Tipo de arquivo não permitido."); return; }
    if (file.size > 20 * 1024 * 1024) { toast.error("Máximo 20MB."); return; }
    const result = await upload(file, type === "image" ? "images" : "audio");
    if (result) {
      await updateBlockMutation.mutateAsync({ id: blockId, mediaUrl: result.url, mediaKey: result.key });
    }
  }

  function saveProject() {
    updateProjectMutation.mutate({ id: projectId, title: form.title, shortDescription: form.shortDescription, year: form.year, categoryId: form.categoryId ? Number(form.categoryId) : null, status: form.status, coverImageUrl: form.coverImageUrl, coverImageKey: form.coverImageKey, coverImageAlt: form.coverImageAlt, metaDescription: form.metaDescription });
  }

  function addBlock(type: BlockType) {
    createBlockMutation.mutate({ projectId, type, displayOrder: blocks?.length ?? 0 });
  }

  function moveBlockUp(idx: number) {
    if (!blocks || idx === 0) return;
    const ids = blocks.map((b) => b.id);
    [ids[idx - 1], ids[idx]] = [ids[idx]!, ids[idx - 1]!];
    reorderMutation.mutate({ projectId, orderedIds: ids });
  }
  function moveBlockDown(idx: number) {
    if (!blocks || idx === blocks.length - 1) return;
    const ids = blocks.map((b) => b.id);
    [ids[idx], ids[idx + 1]] = [ids[idx + 1]!, ids[idx]!];
    reorderMutation.mutate({ projectId, orderedIds: ids });
  }

  function getBlockEdit(id: number) { return editingBlock[id] ?? {}; }
  function setBlockEdit(id: number, data: Partial<ProjectBlock>) { setEditingBlock((prev) => ({ ...prev, [id]: { ...prev[id], ...data } })); }
  function saveBlock(block: ProjectBlock) {
    const edits = getBlockEdit(block.id);
    updateBlockMutation.mutate({
      id: block.id,
      content: edits.content ?? undefined,
      mediaUrl: edits.mediaUrl ?? undefined,
      mediaKey: edits.mediaKey ?? undefined,
      altText: edits.altText ?? undefined,
      caption: edits.caption ?? undefined,
      transcript: edits.transcript ?? undefined,
    });
  }

  if (projLoading) return <AdminLayout title="Carregando..."><Loader2 className="animate-spin" /></AdminLayout>;
  if (!project) return <AdminLayout title="Projeto não encontrado"><p>Projeto não encontrado.</p></AdminLayout>;

  return (
    <AdminLayout title={`Editar: ${project.title}`}>
      <div className="max-w-3xl space-y-8">
        {/* Back */}
        <button onClick={() => navigate("/admin/projetos")} className="flex items-center gap-2 text-sm hover:opacity-70 transition-opacity" style={{ color: "var(--color-text-secondary)" }}>
          <ArrowLeft size={16} aria-hidden="true" /> Voltar para projetos
        </button>

        {/* Project metadata */}
        <section aria-labelledby="proj-meta-heading" className="p-6 rounded border space-y-4" style={{ borderColor: "var(--color-border)", borderRadius: "var(--radius-lg)", background: "var(--color-surface)" }}>
          <h2 id="proj-meta-heading" className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>Informações do projeto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="proj-title">Título</Label>
              <Input id="proj-title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="proj-category">Categoria</Label>
              <Select value={form.categoryId} onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}>
                <SelectTrigger id="proj-category" className="mt-1"><SelectValue placeholder="Sem categoria" /></SelectTrigger>
                <SelectContent>
                  {categories?.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="proj-year">Ano</Label>
              <Input id="proj-year" value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))} className="mt-1" placeholder="2024" />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="proj-desc">Descrição curta</Label>
              <Textarea id="proj-desc" value={form.shortDescription} onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))} rows={3} className="mt-1" />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="proj-meta">Meta description (SEO)</Label>
              <Input id="proj-meta" value={form.metaDescription} onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))} className="mt-1" />
            </div>
          </div>
          {/* Cover image */}
          <div>
            <Label>Imagem de capa</Label>
            <div className="mt-2 flex flex-col gap-3">
              {form.coverImageUrl && <img src={form.coverImageUrl} alt={form.coverImageAlt || "Capa do projeto"} className="w-full max-h-48 object-cover rounded" style={{ borderRadius: "var(--radius-md)" }} />}
              <div className="flex flex-col gap-2">
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded border cursor-pointer text-sm font-medium w-fit transition-opacity hover:opacity-70" style={{ borderColor: "var(--color-border)", borderRadius: "var(--radius-md)" }}>
                  {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} aria-hidden="true" />}
                  {uploading ? "Enviando..." : "Escolher capa"}
                  <input type="file" accept="image/*" className="sr-only" onChange={handleCoverUpload} aria-label="Upload de imagem de capa" />
                </label>
                {form.coverImageUrl && (
                  <div>
                    <Label htmlFor="cover-alt">Texto alternativo da capa (acessibilidade)</Label>
                    <Input id="cover-alt" value={form.coverImageAlt} onChange={(e) => setForm((f) => ({ ...f, coverImageAlt: e.target.value }))} className="mt-1" placeholder="Descreva a imagem para leitores de tela" />
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Status */}
          <div className="flex items-center gap-4">
            <Button onClick={() => { setForm((f) => ({ ...f, status: f.status === "published" ? "draft" : "published" })); }} variant="outline" className="flex items-center gap-2">
              {form.status === "published" ? <><EyeOff size={16} aria-hidden="true" /> Despublicar</> : <><Eye size={16} aria-hidden="true" /> Publicar</>}
            </Button>
            <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Status atual: <strong>{form.status === "published" ? "Publicado" : "Rascunho"}</strong>
            </span>
          </div>
          <Button onClick={saveProject} disabled={updateProjectMutation.isPending} style={{ background: "var(--color-primary)", color: "oklch(0.98 0 0)" }}>
            {updateProjectMutation.isPending ? <><Loader2 className="animate-spin mr-2" size={16} />Salvando...</> : "Salvar projeto"}
          </Button>
        </section>

        {/* Blocks editor */}
        <section aria-labelledby="blocks-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="blocks-heading" className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>Conteúdo do projeto</h2>
          </div>
          {blocksLoading ? (
            <div className="flex items-center gap-2"><Loader2 className="animate-spin" size={20} /><span>Carregando blocos...</span></div>
          ) : (
            <div className="space-y-4">
              {blocks?.length === 0 && (
                <p className="text-sm py-4" style={{ color: "var(--color-text-secondary)" }}>Nenhum bloco ainda. Adicione conteúdo abaixo.</p>
              )}
              {blocks?.map((block, idx) => (
                <div key={block.id} className="p-4 rounded border" style={{ borderColor: "var(--color-border)", borderRadius: "var(--radius-md)", background: "var(--color-surface)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wide px-2 py-1 rounded" style={{ background: "var(--color-background)", color: "var(--color-text-secondary)", borderRadius: "var(--radius-sm)" }}>
                      {block.type === "text" ? "Texto" : block.type === "image" ? "Imagem" : block.type === "youtube" ? "YouTube" : "Áudio"}
                    </span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => moveBlockUp(idx)} disabled={idx === 0} aria-label="Mover bloco para cima" className="p-1.5 rounded hover:opacity-70 disabled:opacity-30"><ChevronUp size={14} aria-hidden="true" /></button>
                      <button onClick={() => moveBlockDown(idx)} disabled={idx === (blocks?.length ?? 0) - 1} aria-label="Mover bloco para baixo" className="p-1.5 rounded hover:opacity-70 disabled:opacity-30"><ChevronDown size={14} aria-hidden="true" /></button>
                      <button onClick={() => setDeleteBlockId(block.id)} aria-label="Remover bloco" className="p-1.5 rounded hover:opacity-70" style={{ color: "var(--color-error)" }}><Trash2 size={14} aria-hidden="true" /></button>
                    </div>
                  </div>

                  {/* Text block */}
                  {block.type === "text" && (
                    <div className="space-y-2">
                      <Label htmlFor={`block-content-${block.id}`}>Conteúdo do texto</Label>
                      <Textarea id={`block-content-${block.id}`} value={getBlockEdit(block.id).content ?? block.content ?? ""} onChange={(e) => setBlockEdit(block.id, { content: e.target.value })} rows={6} className="mt-1" />
                      <Button size="sm" onClick={() => saveBlock(block)} disabled={updateBlockMutation.isPending} style={{ background: "var(--color-primary)", color: "oklch(0.98 0 0)" }}>Salvar</Button>
                    </div>
                  )}

                  {/* Image block */}
                  {block.type === "image" && (
                    <div className="space-y-3">
                      {block.mediaUrl && <img src={block.mediaUrl} alt={block.altText ?? ""} className="w-full max-h-48 object-cover rounded" style={{ borderRadius: "var(--radius-md)" }} />}
                      <label className="inline-flex items-center gap-2 px-4 py-2 rounded border cursor-pointer text-sm font-medium w-fit transition-opacity hover:opacity-70" style={{ borderColor: "var(--color-border)", borderRadius: "var(--radius-md)" }}>
                        {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} aria-hidden="true" />}
                        {uploading ? "Enviando..." : "Escolher imagem"}
                        <input type="file" accept="image/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleBlockMediaUpload(block.id, f, "image"); }} aria-label="Upload de imagem para bloco" />
                      </label>
                      <div>
                        <Label htmlFor={`block-alt-${block.id}`}>Texto alternativo (acessibilidade)</Label>
                        <Input id={`block-alt-${block.id}`} value={getBlockEdit(block.id).altText ?? block.altText ?? ""} onChange={(e) => setBlockEdit(block.id, { altText: e.target.value })} className="mt-1" placeholder="Descreva a imagem" />
                      </div>
                      <div>
                        <Label htmlFor={`block-caption-${block.id}`}>Legenda (opcional)</Label>
                        <Input id={`block-caption-${block.id}`} value={getBlockEdit(block.id).caption ?? block.caption ?? ""} onChange={(e) => setBlockEdit(block.id, { caption: e.target.value })} className="mt-1" />
                      </div>
                      <Button size="sm" onClick={() => saveBlock(block)} disabled={updateBlockMutation.isPending} style={{ background: "var(--color-primary)", color: "oklch(0.98 0 0)" }}>Salvar</Button>
                    </div>
                  )}

                  {/* YouTube block */}
                  {block.type === "youtube" && (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor={`block-yt-${block.id}`}>URL do YouTube</Label>
                        <Input id={`block-yt-${block.id}`} value={getBlockEdit(block.id).mediaUrl ?? block.mediaUrl ?? ""} onChange={(e) => setBlockEdit(block.id, { mediaUrl: e.target.value })} className="mt-1" placeholder="https://www.youtube.com/watch?v=..." />
                      </div>
                      <div>
                        <Label htmlFor={`block-yt-caption-${block.id}`}>Título/Legenda (acessibilidade)</Label>
                        <Input id={`block-yt-caption-${block.id}`} value={getBlockEdit(block.id).caption ?? block.caption ?? ""} onChange={(e) => setBlockEdit(block.id, { caption: e.target.value })} className="mt-1" />
                      </div>
                      <Button size="sm" onClick={() => saveBlock(block)} disabled={updateBlockMutation.isPending} style={{ background: "var(--color-primary)", color: "oklch(0.98 0 0)" }}>Salvar</Button>
                    </div>
                  )}

                  {/* Audio block */}
                  {block.type === "audio" && (
                    <div className="space-y-3">
                      {block.mediaUrl && <audio controls src={block.mediaUrl} className="w-full" aria-label={block.caption ?? "Áudio"} />}
                      <label className="inline-flex items-center gap-2 px-4 py-2 rounded border cursor-pointer text-sm font-medium w-fit transition-opacity hover:opacity-70" style={{ borderColor: "var(--color-border)", borderRadius: "var(--radius-md)" }}>
                        {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} aria-hidden="true" />}
                        {uploading ? "Enviando..." : "Escolher áudio"}
                        <input type="file" accept="audio/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleBlockMediaUpload(block.id, f, "audio"); }} aria-label="Upload de áudio para bloco" />
                      </label>
                      <div>
                        <Label htmlFor={`block-audio-caption-${block.id}`}>Título do áudio</Label>
                        <Input id={`block-audio-caption-${block.id}`} value={getBlockEdit(block.id).caption ?? block.caption ?? ""} onChange={(e) => setBlockEdit(block.id, { caption: e.target.value })} className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor={`block-transcript-${block.id}`}>Transcrição (acessibilidade)</Label>
                        <Textarea id={`block-transcript-${block.id}`} value={getBlockEdit(block.id).transcript ?? block.transcript ?? ""} onChange={(e) => setBlockEdit(block.id, { transcript: e.target.value })} rows={4} className="mt-1" placeholder="Transcrição do áudio para usuários que não podem ouvir" />
                      </div>
                      <Button size="sm" onClick={() => saveBlock(block)} disabled={updateBlockMutation.isPending} style={{ background: "var(--color-primary)", color: "oklch(0.98 0 0)" }}>Salvar</Button>
                    </div>
                  )}
                </div>
              ))}

              {/* Add block buttons */}
              <div className="flex flex-wrap gap-2 pt-2" role="group" aria-label="Adicionar bloco de conteúdo">
                {(["text", "image", "youtube", "audio"] as BlockType[]).map((type) => (
                  <Button key={type} variant="outline" size="sm" onClick={() => addBlock(type)} disabled={createBlockMutation.isPending} className="flex items-center gap-1.5">
                    <Plus size={14} aria-hidden="true" />
                    {type === "text" ? "Texto" : type === "image" ? "Imagem" : type === "youtube" ? "YouTube" : "Áudio"}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Delete block confirmation */}
      <AlertDialog open={deleteBlockId !== null} onOpenChange={(open) => !open && setDeleteBlockId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover bloco?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteBlockId !== null && deleteBlockMutation.mutate({ id: deleteBlockId })} style={{ background: "var(--color-error)", color: "oklch(0.98 0 0)" }}>
              {deleteBlockMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
