import { useState } from "react";
import { useTranslation } from "react-i18next";

import { ErrorState } from "@/components/ErrorState";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { AdminNav } from "@/features/admin/AdminNav";
import {
  useAdminCategories,
  useCreateAdminCategory,
  useDeleteAdminCategory,
  useUpdateAdminCategory,
} from "@/features/admin/hooks/useAdminCategories";

export function AdminCategoriesPage() {
  const { t } = useTranslation();
  const { notify } = useToast();

  const { data: categories = [], isLoading, isError, refetch } = useAdminCategories();
  const createCategory = useCreateAdminCategory();
  const updateCategory = useUpdateAdminCategory();
  const deleteCategoryMutation = useDeleteAdminCategory();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  function openCreateDialog() {
    setEditingId(null);
    setName("");
    setError(null);
    setDialogOpen(true);
  }

  function openEditDialog(category: { id: string; name: string }) {
    setEditingId(category.id);
    setName(category.name);
    setError(null);
    setDialogOpen(true);
  }

  function submitForm() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError(t("admin.validation.nameRequired"));
      return;
    }

    if (editingId) {
      updateCategory.mutate(
        { id: editingId, name: trimmedName },
        {
          onSuccess: () => {
            notify(t("toast.categoryUpdated"));
            setDialogOpen(false);
          },
          onError: () => setError(t("errors.generic")),
        },
      );
      return;
    }

    createCategory.mutate(trimmedName, {
      onSuccess: () => {
        notify(t("toast.categoryCreated"));
        setDialogOpen(false);
      },
      onError: () => setError(t("errors.generic")),
    });
  }

  function deleteCategory() {
    if (!deleteId) {
      return;
    }

    deleteCategoryMutation.mutate(deleteId, {
      onSuccess: () => {
        notify(t("toast.categoryDeleted"));
        setDeleteId(null);
      },
      onError: () => notify(t("errors.generic")),
    });
  }

  return (
    <section className="space-y-4">
      <AdminNav />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t("admin.categories.title")}</h1>
        <Button onClick={openCreateDialog}>{t("admin.categories.new")}</Button>
      </div>

      {isLoading ? (
        <AdminTableSkeleton />
      ) : isError ? (
        <ErrorState
          title={t("errors.adminCategoriesTitle")}
          description={t("errors.adminCategoriesDescription")}
          actionLabel={t("errors.retry")}
          onAction={() => void refetch()}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("admin.categories.columns.name")}</TableHead>
              <TableHead>{t("admin.categories.columns.updated")}</TableHead>
              <TableHead className="text-right">{t("admin.categories.columns.actions")}</TableHead>
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
                      {t("common.edit")}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setDeleteId(category.id)}>
                      {t("common.delete")}
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
            <DialogTitle>{editingId ? t("admin.categories.edit") : t("admin.categories.create")}</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <label htmlFor="category-name" className="text-sm font-medium">
              {t("admin.categories.form.name")}
            </label>
            <Input id="category-name" value={name} onChange={(event) => setName(event.target.value)} />
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={submitForm} disabled={createCategory.isPending || updateCategory.isPending}>
              {editingId ? t("common.save") : t("common.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteId)} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.categories.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("admin.categories.deleteDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={deleteCategory} disabled={deleteCategoryMutation.isPending}>
              {t("common.delete")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

function AdminTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  );
}
