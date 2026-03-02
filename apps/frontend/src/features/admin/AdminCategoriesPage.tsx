import { useEffect, useState } from "react";

import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { AdminNav } from "@/features/admin/AdminNav";
import type { AdminCategory } from "@/features/admin/types";
import { useHttpClient } from "@/features/shared/api/useHttpClient";

export function AdminCategoriesPage() {
  const http = useHttpClient();
  const { notify } = useToast();

  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const response = await http.get<AdminCategory[]>("/api/admin/categories");
    setCategories(response);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  function openCreateDialog() {
    setEditingId(null);
    setName("");
    setError(null);
    setDialogOpen(true);
  }

  function openEditDialog(category: AdminCategory) {
    setEditingId(category.id);
    setName(category.name);
    setError(null);
    setDialogOpen(true);
  }

  async function submitForm() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Name is required");
      return;
    }

    if (editingId) {
      await http.put(`/api/admin/categories/${editingId}`, { name: trimmedName });
      notify("Category updated");
    } else {
      await http.post("/api/admin/categories", { name: trimmedName });
      notify("Category created");
    }

    setDialogOpen(false);
    await load();
  }

  async function deleteCategory() {
    if (!deleteId) {
      return;
    }

    await http.delete(`/api/admin/categories/${deleteId}`);
    notify("Category deleted");
    setDeleteId(null);
    await load();
  }

  return (
    <section className="space-y-4">
      <AdminNav />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin Categories</h1>
        <Button onClick={openCreateDialog}>New category</Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading categories...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>
                <TableCell>{new Date(category.updatedAt).toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEditDialog(category)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setDeleteId(category.id)}>
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit category" : "Create category"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <Input placeholder="Name" value={name} onChange={(event) => setName(event.target.value)} />
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void submitForm()}>{editingId ? "Save changes" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteId)} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Categories with linked products cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button onClick={() => void deleteCategory()}>Delete</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
