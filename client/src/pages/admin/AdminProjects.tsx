import React, { useState } from "react";
import { Link } from "wouter";
import AdminLayout from "./AdminLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Pencil, Trash2, Eye, EyeOff, ChevronUp, ChevronDown } from "lucide-react";

export default function AdminProjects() {
  const utils = trpc.useUtils();
  const { data: projects, isLoading } = trpc.projects.list.useQuery();
  const { data: categories } = trpc.categories.list.useQuery();
  const createMutation = trpc.projects.create.useMutation({ onSuccess: (p) => { toast.success("Projeto criado!"); utils.projects.list.invalidate(); setCreateOpen(false); window.location.href = `/admin/projetos/${p.id}`; }, onError: (e) => toast.error(e.message) });
  const updateMutation = trpc.projects.update.useMutation({ onSuccess: () => { utils.projects.list.invalidate(); }, onError: (e) => toast.error(e.message) });
  const deleteMutation = trpc.projects.delete.useMutation({ onSuccess: () => { toast.success("Projeto excluído!"); utils.projects.list.invalidate(); setDeleteTarget(null); }, onError: (e) => toast.error(e.message) });
  const reorderMutation = trpc.projects.reorder.useMutation({ onSuccess: () => utils.projects.list.invalidate() });

  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategoryId, setNewCategoryId] = useState<string>("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);

  function moveUp(idx: number) {
    if (!projects || idx === 0) return;
    const ids = projects.map((p) => p.id);
    [ids[idx - 1], ids[idx]] = [ids[idx]!, ids[idx - 1]!];
    reorderMutation.mutate({ orderedIds: ids });
  }
  function moveDown(idx: number) {
    if (!projects || idx === projects.length - 1) return;
    const ids = projects.map((p) => p.id);
    [ids[idx], ids[idx + 1]] = [ids[idx + 1]!, ids[idx]!];
    reorderMutation.mutate({ orderedIds: ids });
  }

  return (
    <AdminLayout title="Projetos">
      <div className="max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <p style={{ color: "var(--color-text-secondary)" }}>{projects?.length ?? 0} projeto(s)</p>
          <Button onClick={() => setCreateOpen(true)} style={{ background: "var(--color-primary)", color: "oklch(0.98 0 0)" }}>
            <Plus size={16} className="mr-2" aria-hidden="true" /> Novo projeto
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2"><Loader2 className="animate-spin" size={20} /><span>Carregando...</span></div>
        ) : projects?.length === 0 ? (
          <div className="py-12 text-center rounded border" style={{ borderColor: "var(--color-border)", borderRadius: "var(--radius-lg)" }}>
            <p className="mb-4" style={{ color: "var(--color-text-secondary)" }}>Você ainda não criou nenhum projeto.</p>
            <Button onClick={() => setCreateOpen(true)} style={{ background: "var(--color-primary)", color: "oklch(0.98 0 0)" }}>Criar primeiro projeto</Button>
          </div>
        ) : (
          <ul className="space-y-2 list-none p-0 m-0" aria-label="Lista de projetos">
            {projects?.map((project, idx) => {
              const cat = categories?.find((c) => c.id === project.categoryId);
              return (
                <li key={project.id} className="flex items-center gap-3 p-4 rounded border" style={{ borderColor: "var(--color-border)", borderRadius: "var(--radius-md)", background: "var(--color-surface)" }}>
                  <div className="flex flex-col gap-1">
                    <button onClick={() => moveUp(idx)} disabled={idx === 0} aria-label={`Mover "${project.title}" para cima`} className="p-1 rounded hover:opacity-70 disabled:opacity-30"><ChevronUp size={14} aria-hidden="true" /></button>
                    <button onClick={() => moveDown(idx)} disabled={idx === (projects?.length ?? 0) - 1} aria-label={`Mover "${project.title}" para baixo`} className="p-1 rounded hover:opacity-70 disabled:opacity-30"><ChevronDown size={14} aria-hidden="true" /></button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate" style={{ color: "var(--color-text-primary)" }}>{project.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={project.status === "published" ? "default" : "secondary"} className="text-xs">
                        {project.status === "published" ? "Publicado" : "Rascunho"}
                      </Badge>
                      {cat && <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{cat.name}</span>}
                      {project.year && <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{project.year}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button variant="outline" size="sm" onClick={() => updateMutation.mutate({ id: project.id, status: project.status === "published" ? "draft" : "published" })} aria-label={project.status === "published" ? `Despublicar "${project.title}"` : `Publicar "${project.title}"`}>
                      {project.status === "published" ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
                    </Button>
                    <Link href={`/admin/projetos/${project.id}`}>
                      <Button variant="outline" size="sm" aria-label={`Editar "${project.title}"`}><Pencil size={14} aria-hidden="true" /></Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => setDeleteTarget({ id: project.id, title: project.title })} aria-label={`Excluir "${project.title}"`} style={{ color: "var(--color-error)", borderColor: "var(--color-error)" }}><Trash2 size={14} aria-hidden="true" /></Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent aria-labelledby="create-proj-title">
          <DialogHeader><DialogTitle id="create-proj-title">Novo projeto</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-proj-title">Título</Label>
              <Input id="new-proj-title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="new-proj-cat">Categoria (opcional)</Label>
              <Select value={newCategoryId} onValueChange={setNewCategoryId}>
                <SelectTrigger id="new-proj-cat" className="mt-1"><SelectValue placeholder="Sem categoria" /></SelectTrigger>
                <SelectContent>
                  {categories?.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button onClick={() => newTitle.trim() && createMutation.mutate({ title: newTitle.trim(), categoryId: newCategoryId ? Number(newCategoryId) : null })} disabled={createMutation.isPending || !newTitle.trim()} style={{ background: "var(--color-primary)", color: "oklch(0.98 0 0)" }}>
              {createMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : "Criar e editar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir "{deleteTarget?.title}"?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação removerá o projeto e todos os seus blocos de conteúdo. Não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTarget && deleteMutation.mutate({ id: deleteTarget.id })} style={{ background: "var(--color-error)", color: "oklch(0.98 0 0)" }}>
              {deleteMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : "Excluir definitivamente"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}

