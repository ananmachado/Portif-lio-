import React, { useMemo, useState } from "react";
import AdminLayout from "./AdminLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Loader2, Pencil, Trash2, ChevronUp, ChevronDown, Plus, CornerDownRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Category } from "../../../../drizzle/schema";

type CategoryDraft = { id: number; name: string; parentCategoryId: number | null };

function buildTree(categories: Category[]) {
  const roots = categories.filter((c) => c.parentCategoryId == null);
  return roots.flatMap((root) => [
    { ...root, level: 0 },
    ...categories.filter((child) => child.parentCategoryId === root.id).sort((a, b) => a.displayOrder - b.displayOrder).map((child) => ({ ...child, level: 1 })),
  ]);
}

export default function AdminCategories() {
  const utils = trpc.useUtils();
  const { data: categories, isLoading } = trpc.categories.list.useQuery();
  const { data: projects } = trpc.projects.list.useQuery();

  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newParentId, setNewParentId] = useState<string>("none");
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CategoryDraft | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryDraft | null>(null);
  const [deleteStrategy, setDeleteStrategy] = useState<"unlink" | "move">("unlink");
  const [moveToCategoryId, setMoveToCategoryId] = useState("");

  const createMutation = trpc.categories.create.useMutation({
    onSuccess: () => {
      toast.success(newParentId === "none" ? "Categoria criada!" : "Subcategoria criada!");
      utils.categories.list.invalidate();
      setCreateOpen(false);
      setNewName("");
      setNewParentId("none");
    },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.categories.update.useMutation({
    onSuccess: () => {
      toast.success("Categoria atualizada!");
      utils.categories.list.invalidate();
      setEditOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.categories.delete.useMutation({
    onSuccess: () => {
      toast.success("Categoria removida!");
      utils.categories.list.invalidate();
      utils.projects.list.invalidate();
      setDeleteTarget(null);
    },
    onError: (e) => toast.error(e.message),
  });
  const reorderMutation = trpc.categories.reorder.useMutation({ onSuccess: () => utils.categories.list.invalidate() });

  const flatTree = useMemo(() => buildTree(categories ?? []), [categories]);
  const rootCategories = useMemo(() => (categories ?? []).filter((c) => c.parentCategoryId == null), [categories]);
  const projectsInCategory = deleteTarget ? (projects ?? []).filter((p) => p.categoryId === deleteTarget.id) : [];
  const childrenOfDeleteTarget = deleteTarget ? (categories ?? []).filter((c) => c.parentCategoryId === deleteTarget.id) : [];
  const otherCategories = categories?.filter((c) => c.id !== deleteTarget?.id && c.parentCategoryId == null) ?? [];

  function moveSibling(id: number, direction: -1 | 1) {
    if (!categories) return;
    const item = categories.find((c) => c.id === id);
    if (!item) return;
    const siblings = categories.filter((c) => c.parentCategoryId === item.parentCategoryId).sort((a, b) => a.displayOrder - b.displayOrder);
    const idx = siblings.findIndex((c) => c.id === id);
    const targetIdx = idx + direction;
    if (idx < 0 || targetIdx < 0 || targetIdx >= siblings.length) return;
    const orderedIds = siblings.map((c) => c.id);
    [orderedIds[idx], orderedIds[targetIdx]] = [orderedIds[targetIdx]!, orderedIds[idx]!];
    reorderMutation.mutate({ orderedIds });
  }

  const selectableParents = rootCategories.filter((c) => c.id !== editTarget?.id && c.id !== deleteTarget?.id);

  return (
    <AdminLayout title="Categorias">
      <div className="max-w-3xl">
        <div className="flex items-center justify-between mb-6 gap-4">
          <div>
            <p style={{ color: "var(--color-text-secondary)" }}>{categories?.length ?? 0} categoria(s) incluindo subcategorias</p>
            <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>Use subcategorias para organizar um grande tema, como Audiovisual → Animações, Curtametragens e Cenários.</p>
          </div>
          <Button onClick={() => setCreateOpen(true)} style={{ background: "var(--color-primary)", color: "#fff" }}>
            <Plus size={16} className="mr-2" aria-hidden="true" /> Nova categoria
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2"><Loader2 className="animate-spin" size={20} /><span>Carregando...</span></div>
        ) : flatTree.length === 0 ? (
          <div className="py-12 text-center rounded border" style={{ borderColor: "var(--color-border)", borderRadius: "var(--radius-lg)" }}>
            <p className="mb-4" style={{ color: "var(--color-text-secondary)" }}>Você ainda não criou nenhuma categoria.</p>
            <Button onClick={() => setCreateOpen(true)} style={{ background: "var(--color-primary)", color: "#fff" }}>Criar primeira categoria</Button>
          </div>
        ) : (
          <ul className="space-y-2 list-none p-0 m-0" aria-label="Lista de categorias e subcategorias">
            {flatTree.map((cat) => {
              const isSub = cat.level === 1;
              const siblings = (categories ?? []).filter((c) => c.parentCategoryId === cat.parentCategoryId).sort((a, b) => a.displayOrder - b.displayOrder);
              const idx = siblings.findIndex((c) => c.id === cat.id);
              return (
                <li key={cat.id} className="flex items-center gap-3 p-4 rounded border" style={{ borderColor: "var(--color-border)", borderRadius: "var(--radius-md)", background: "var(--color-surface)", marginLeft: isSub ? 32 : 0 }}>
                  <div className="flex flex-col gap-1">
                    <button onClick={() => moveSibling(cat.id, -1)} disabled={idx === 0} aria-label={`Mover ${cat.name} para cima`} className="p-1 rounded hover:opacity-70 disabled:opacity-30"><ChevronUp size={14} aria-hidden="true" /></button>
                    <button onClick={() => moveSibling(cat.id, 1)} disabled={idx === siblings.length - 1} aria-label={`Mover ${cat.name} para baixo`} className="p-1 rounded hover:opacity-70 disabled:opacity-30"><ChevronDown size={14} aria-hidden="true" /></button>
                  </div>
                  {isSub ? <CornerDownRight size={16} aria-hidden="true" style={{ color: "var(--color-primary)" }} /> : <span aria-hidden="true" style={{ width: 16 }} />}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium" style={{ color: "var(--color-text-primary)" }}>{cat.name}</div>
                    {isSub && <div className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>Subcategoria</div>}
                  </div>
                  <div className="flex gap-2">
                    {!isSub && <Button variant="outline" size="sm" onClick={() => { setNewParentId(String(cat.id)); setCreateOpen(true); }} aria-label={`Adicionar subcategoria em ${cat.name}`}><Plus size={14} className="mr-1" aria-hidden="true" /> Subcategoria</Button>}
                    <Button variant="outline" size="sm" onClick={() => { setEditTarget({ id: cat.id, name: cat.name, parentCategoryId: cat.parentCategoryId }); setEditOpen(true); }} aria-label={`Editar ${cat.name}`}><Pencil size={14} aria-hidden="true" /></Button>
                    <Button variant="outline" size="sm" onClick={() => setDeleteTarget({ id: cat.id, name: cat.name, parentCategoryId: cat.parentCategoryId })} aria-label={`Excluir ${cat.name}`} style={{ color: "var(--color-error)", borderColor: "var(--color-error)" }}><Trash2 size={14} aria-hidden="true" /></Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent aria-labelledby="create-cat-title">
          <DialogHeader><DialogTitle id="create-cat-title">Nova categoria ou subcategoria</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-cat-name">Nome</Label>
              <Input id="new-cat-name" value={newName} onChange={(e) => setNewName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="new-cat-parent">Categoria-pai</Label>
              <Select value={newParentId} onValueChange={setNewParentId}>
                <SelectTrigger id="new-cat-parent" className="mt-1"><SelectValue placeholder="Categoria principal" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Categoria principal (sem pai)</SelectItem>
                  {rootCategories.map((c) => <SelectItem key={c.id} value={String(c.id)}>↳ {c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <p className="text-xs mt-2" style={{ color: "var(--color-text-secondary)" }}>Exemplo: Categoria-pai “Audiovisual” → subcategoria “Animações”.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button onClick={() => newName.trim() && createMutation.mutate({ name: newName.trim(), parentCategoryId: newParentId === "none" ? null : Number(newParentId) })} disabled={createMutation.isPending || !newName.trim()} style={{ background: "var(--color-primary)", color: "#fff" }}>
              {createMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : newParentId === "none" ? "Criar categoria" : "Criar subcategoria"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent aria-labelledby="edit-cat-title">
          <DialogHeader><DialogTitle id="edit-cat-title">Editar categoria</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-cat-name">Nome</Label>
              <Input id="edit-cat-name" value={editTarget?.name ?? ""} onChange={(e) => setEditTarget((t) => t ? { ...t, name: e.target.value } : t)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="edit-cat-parent">Categoria-pai</Label>
              <Select value={editTarget?.parentCategoryId == null ? "none" : String(editTarget.parentCategoryId)} onValueChange={(v) => setEditTarget((t) => t ? { ...t, parentCategoryId: v === "none" ? null : Number(v) } : t)}>
                <SelectTrigger id="edit-cat-parent" className="mt-1"><SelectValue placeholder="Categoria principal" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Categoria principal (sem pai)</SelectItem>
                  {selectableParents.map((c) => <SelectItem key={c.id} value={String(c.id)}>↳ {c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button onClick={() => editTarget && updateMutation.mutate({ id: editTarget.id, name: editTarget.name, parentCategoryId: editTarget.parentCategoryId })} disabled={updateMutation.isPending} style={{ background: "var(--color-primary)", color: "#fff" }}>
              {updateMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent aria-labelledby="delete-cat-title">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              {projectsInCategory.length > 0
                ? `Esta categoria possui ${projectsInCategory.length} projeto(s). O que deseja fazer com eles?`
                : "Esta ação não pode ser desfeita."}
              {childrenOfDeleteTarget.length > 0 && ` Ela também possui ${childrenOfDeleteTarget.length} subcategoria(s), que serão mantidas como categorias principais.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {projectsInCategory.length > 0 && (
            <div className="space-y-3 py-2">
              <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="delete-strategy" checked={deleteStrategy === "unlink"} onChange={() => setDeleteStrategy("unlink")} /> Remover associação</label>
              <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="delete-strategy" checked={deleteStrategy === "move"} onChange={() => setDeleteStrategy("move")} /> Mover projetos para outra categoria</label>
              {deleteStrategy === "move" && (
                <Select value={moveToCategoryId} onValueChange={setMoveToCategoryId}>
                  <SelectTrigger aria-label="Selecionar categoria de destino"><SelectValue placeholder="Selecionar categoria" /></SelectTrigger>
                  <SelectContent>{otherCategories.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              )}
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteMutation.mutate({
                id: deleteTarget.id,
                strategy: projectsInCategory.length === 0 ? "unlink" : deleteStrategy,
                moveToCategoryId: deleteStrategy === "move" && moveToCategoryId ? Number(moveToCategoryId) : null,
              })}
            >Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
