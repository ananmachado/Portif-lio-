import React, { useState } from "react";
import AdminLayout from "./AdminLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Loader2, Pencil, Trash2, ChevronUp, ChevronDown, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminCategories() {
  const utils = trpc.useUtils();
  const { data: categories, isLoading } = trpc.categories.list.useQuery();
  const { data: projects } = trpc.projects.list.useQuery();
  const createMutation = trpc.categories.create.useMutation({ onSuccess: () => { toast.success("Categoria criada!"); utils.categories.list.invalidate(); setCreateOpen(false); setNewName(""); }, onError: (e) => toast.error(e.message) });
  const updateMutation = trpc.categories.update.useMutation({ onSuccess: () => { toast.success("Categoria atualizada!"); utils.categories.list.invalidate(); setEditOpen(false); }, onError: (e) => toast.error(e.message) });
  const deleteMutation = trpc.categories.delete.useMutation({ onSuccess: () => { toast.success("Categoria removida!"); utils.categories.list.invalidate(); utils.projects.list.invalidate(); setDeleteTarget(null); }, onError: (e) => toast.error(e.message) });
  const reorderMutation = trpc.categories.reorder.useMutation({ onSuccess: () => utils.categories.list.invalidate() });

  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<{ id: number; name: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [deleteStrategy, setDeleteStrategy] = useState<"unlink" | "move">("unlink");
  const [moveToCategoryId, setMoveToCategoryId] = useState<string>("");

  function moveUp(idx: number) {
    if (!categories || idx === 0) return;
    const ids = categories.map((c) => c.id);
    [ids[idx - 1], ids[idx]] = [ids[idx]!, ids[idx - 1]!];
    reorderMutation.mutate({ orderedIds: ids });
  }
  function moveDown(idx: number) {
    if (!categories || idx === categories.length - 1) return;
    const ids = categories.map((c) => c.id);
    [ids[idx], ids[idx + 1]] = [ids[idx + 1]!, ids[idx]!];
    reorderMutation.mutate({ orderedIds: ids });
  }

  const projectsInCategory = deleteTarget ? (projects ?? []).filter((p) => p.categoryId === deleteTarget.id) : [];
  const otherCategories = categories?.filter((c) => c.id !== deleteTarget?.id) ?? [];

  return (
    <AdminLayout title="Categorias">
      <div className="max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <p style={{ color: "var(--color-text-secondary)" }}>{categories?.length ?? 0} categoria(s)</p>
          <Button onClick={() => setCreateOpen(true)} style={{ background: "var(--color-primary)", color: "oklch(0.98 0 0)" }}>
            <Plus size={16} className="mr-2" aria-hidden="true" /> Nova categoria
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2"><Loader2 className="animate-spin" size={20} /><span>Carregando...</span></div>
        ) : categories?.length === 0 ? (
          <div className="py-12 text-center rounded border" style={{ borderColor: "var(--color-border)", borderRadius: "var(--radius-lg)" }}>
            <p className="mb-4" style={{ color: "var(--color-text-secondary)" }}>Você ainda não criou nenhuma categoria.</p>
            <Button onClick={() => setCreateOpen(true)} style={{ background: "var(--color-primary)", color: "oklch(0.98 0 0)" }}>Criar primeira categoria</Button>
          </div>
        ) : (
          <ul className="space-y-2 list-none p-0 m-0" aria-label="Lista de categorias">
            {categories?.map((cat, idx) => (
              <li key={cat.id} className="flex items-center gap-3 p-4 rounded border" style={{ borderColor: "var(--color-border)", borderRadius: "var(--radius-md)", background: "var(--color-surface)" }}>
                <div className="flex flex-col gap-1">
                  <button onClick={() => moveUp(idx)} disabled={idx === 0} aria-label={`Mover ${cat.name} para cima`} className="p-1 rounded hover:opacity-70 disabled:opacity-30"><ChevronUp size={14} aria-hidden="true" /></button>
                  <button onClick={() => moveDown(idx)} disabled={idx === (categories?.length ?? 0) - 1} aria-label={`Mover ${cat.name} para baixo`} className="p-1 rounded hover:opacity-70 disabled:opacity-30"><ChevronDown size={14} aria-hidden="true" /></button>
                </div>
                <span className="flex-1 font-medium" style={{ color: "var(--color-text-primary)" }}>{cat.name}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setEditTarget({ id: cat.id, name: cat.name }); setEditOpen(true); }} aria-label={`Editar categoria ${cat.name}`}><Pencil size={14} aria-hidden="true" /></Button>
                  <Button variant="outline" size="sm" onClick={() => setDeleteTarget({ id: cat.id, name: cat.name })} aria-label={`Excluir categoria ${cat.name}`} style={{ color: "var(--color-error)", borderColor: "var(--color-error)" }}><Trash2 size={14} aria-hidden="true" /></Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent aria-labelledby="create-cat-title">
          <DialogHeader><DialogTitle id="create-cat-title">Nova categoria</DialogTitle></DialogHeader>
          <div>
            <Label htmlFor="new-cat-name">Nome</Label>
            <Input id="new-cat-name" value={newName} onChange={(e) => setNewName(e.target.value)} className="mt-1" onKeyDown={(e) => e.key === "Enter" && newName.trim() && createMutation.mutate({ name: newName.trim() })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button onClick={() => newName.trim() && createMutation.mutate({ name: newName.trim() })} disabled={createMutation.isPending || !newName.trim()} style={{ background: "var(--color-primary)", color: "oklch(0.98 0 0)" }}>
              {createMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent aria-labelledby="edit-cat-title">
          <DialogHeader><DialogTitle id="edit-cat-title">Editar categoria</DialogTitle></DialogHeader>
          <div>
            <Label htmlFor="edit-cat-name">Nome</Label>
            <Input id="edit-cat-name" value={editTarget?.name ?? ""} onChange={(e) => setEditTarget((t) => t ? { ...t, name: e.target.value } : t)} className="mt-1" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button onClick={() => editTarget && updateMutation.mutate({ id: editTarget.id, name: editTarget.name })} disabled={updateMutation.isPending} style={{ background: "var(--color-primary)", color: "oklch(0.98 0 0)" }}>
              {updateMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent aria-labelledby="delete-cat-title">
          <AlertDialogHeader>
            <AlertDialogTitle id="delete-cat-title">Excluir "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              {projectsInCategory.length > 0
                ? `Esta categoria possui ${projectsInCategory.length} projeto(s). O que deseja fazer com eles?`
                : "Esta ação não pode ser desfeita."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {projectsInCategory.length > 0 && (
            <div className="space-y-3 py-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="delete-strategy" checked={deleteStrategy === "unlink"} onChange={() => setDeleteStrategy("unlink")} /> Remover associação (projetos ficam sem categoria)
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="delete-strategy" checked={deleteStrategy === "move"} onChange={() => setDeleteStrategy("move")} /> Mover projetos para outra categoria
              </label>
              {deleteStrategy === "move" && (
                <Select value={moveToCategoryId} onValueChange={setMoveToCategoryId}>
                  <SelectTrigger aria-label="Selecionar categoria de destino"><SelectValue placeholder="Selecionar categoria" /></SelectTrigger>
                  <SelectContent>
                    {otherCategories.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteMutation.mutate({ id: deleteTarget.id, strategy: deleteStrategy, moveToCategoryId: deleteStrategy === "move" && moveToCategoryId ? Number(moveToCategoryId) : null })}
              style={{ background: "var(--color-error)", color: "oklch(0.98 0 0)" }}
            >
              {deleteMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
