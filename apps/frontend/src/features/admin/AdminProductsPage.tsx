import { useMemo, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { AdminNav } from "@/features/admin/AdminNav";
import { useAdminCategories } from "@/features/admin/hooks/useAdminCategories";
import {
  useCreateAdminProduct,
  useDeleteAdminProduct,
  useUpdateAdminProduct,
  useAdminProducts,
} from "@/features/admin/hooks/useAdminProducts";
import type { AdminProduct, AdminProductInput } from "@/features/admin/types";

const EMPTY_FORM: AdminProductInput = {
  name: "",
  description: "",
  priceCents: 0,
  currency: "EUR",
  imageUrl: "",
  categoryId: "",
};

export function AdminProductsPage() {
  const { t } = useTranslation();
  const { notify } = useToast();

  const { data: products = [], isLoading, isError, refetch } = useAdminProducts();
  const { data: categories = [] } = useAdminCategories();
  const createProduct = useCreateAdminProduct();
  const updateProduct = useUpdateAdminProduct();
  const deleteProductMutation = useDeleteAdminProduct();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AdminProductInput>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const isSubmitting = createProduct.isPending || updateProduct.isPending;

  const categoryOptions = useMemo(() => categories, [categories]);

  function openCreateDialog() {
    setEditingId(null);
    setError(null);
    setForm({
      ...EMPTY_FORM,
      categoryId: categoryOptions[0]?.id ?? "",
    });
    setDialogOpen(true);
  }

  function openEditDialog(product: AdminProduct) {
    setEditingId(product.id);
    setError(null);
    setForm({
      name: product.name,
      description: product.description,
      priceCents: product.priceCents,
      currency: product.currency,
      imageUrl: product.imageUrl ?? "",
      categoryId: product.categoryId,
    });
    setDialogOpen(true);
  }

  function submitForm() {
    if (!form.name.trim() || !form.description.trim() || !form.categoryId.trim() || form.priceCents < 1) {
      setError(t("admin.validation.requiredFields"));
      return;
    }

    const payload: AdminProductInput = {
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      currency: form.currency.trim().toUpperCase(),
      imageUrl: form.imageUrl?.trim() ? form.imageUrl.trim() : null,
    };

    if (editingId) {
      updateProduct.mutate(
        { id: editingId, payload },
        {
          onSuccess: () => {
            notify(t("toast.productUpdated"));
            setDialogOpen(false);
          },
          onError: () => setError(t("errors.generic")),
        },
      );
      return;
    }

    createProduct.mutate(payload, {
      onSuccess: () => {
        notify(t("toast.productCreated"));
        setDialogOpen(false);
      },
      onError: () => setError(t("errors.generic")),
    });
  }

  function deleteProduct() {
    if (!deleteId) {
      return;
    }

    deleteProductMutation.mutate(deleteId, {
      onSuccess: () => {
        notify(t("toast.productDeleted"));
        setDeleteId(null);
      },
      onError: () => notify(t("errors.generic")),
    });
  }

  return (
    <section className="space-y-4">
      <AdminNav />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t("admin.products.title")}</h1>
        <Button onClick={openCreateDialog}>{t("admin.products.new")}</Button>
      </div>

      {isLoading ? (
        <AdminTableSkeleton />
      ) : isError ? (
        <ErrorState
          title={t("errors.adminProductsTitle")}
          description={t("errors.adminProductsDescription")}
          actionLabel={t("errors.retry")}
          onAction={() => void refetch()}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("admin.products.columns.name")}</TableHead>
              <TableHead>{t("admin.products.columns.category")}</TableHead>
              <TableHead>{t("admin.products.columns.price")}</TableHead>
              <TableHead>{t("admin.products.columns.currency")}</TableHead>
              <TableHead className="text-right">{t("admin.products.columns.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.categoryName}</TableCell>
                <TableCell>{(product.priceCents / 100).toFixed(2)}</TableCell>
                <TableCell>{product.currency}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEditDialog(product)}>
                      {t("common.edit")}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setDeleteId(product.id)}>
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
            <DialogTitle>{editingId ? t("admin.products.edit") : t("admin.products.create")}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="product-name" className="text-sm font-medium">
                {t("admin.products.form.name")}
              </label>
              <Input
                id="product-name"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="product-description" className="text-sm font-medium">
                {t("admin.products.form.description")}
              </label>
              <Textarea
                id="product-description"
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="product-price" className="text-sm font-medium">
                {t("admin.products.form.priceCents")}
              </label>
              <Input
                id="product-price"
                type="number"
                min={1}
                value={String(form.priceCents)}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    priceCents: Number(event.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="product-currency" className="text-sm font-medium">
                {t("admin.products.form.currency")}
              </label>
              <Input
                id="product-currency"
                value={form.currency}
                onChange={(event) => setForm((prev) => ({ ...prev, currency: event.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="product-image" className="text-sm font-medium">
                {t("admin.products.form.imageUrl")}
              </label>
              <Input
                id="product-image"
                value={form.imageUrl ?? ""}
                onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="product-category" className="text-sm font-medium">
                {t("admin.products.form.category")}
              </label>
              <select
                id="product-category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.categoryId}
                onChange={(event) => setForm((prev) => ({ ...prev, categoryId: event.target.value }))}
              >
                <option value="" disabled>
                  {t("admin.products.form.selectCategory")}
                </option>
                {categoryOptions.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={submitForm} disabled={isSubmitting}>
              {editingId ? t("common.save") : t("common.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteId)} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.products.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("admin.products.deleteDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={deleteProduct} disabled={deleteProductMutation.isPending}>
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
