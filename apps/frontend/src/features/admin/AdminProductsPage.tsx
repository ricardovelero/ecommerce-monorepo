import { useEffect, useState } from "react";

import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { AdminNav } from "@/features/admin/AdminNav";
import type { AdminCategory, AdminProduct, AdminProductInput } from "@/features/admin/types";
import { useHttpClient } from "@/features/shared/api/useHttpClient";

const EMPTY_FORM: AdminProductInput = {
  name: "",
  description: "",
  priceCents: 0,
  currency: "EUR",
  imageUrl: "",
  categoryId: "",
};

export function AdminProductsPage() {
  const http = useHttpClient();
  const { notify } = useToast();

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AdminProductInput>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const [productsResponse, categoriesResponse] = await Promise.all([
      http.get<AdminProduct[]>("/api/admin/products"),
      http.get<AdminCategory[]>("/api/admin/categories"),
    ]);

    setProducts(productsResponse);
    setCategories(categoriesResponse);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  function openCreateDialog() {
    setEditingId(null);
    setError(null);
    setForm({
      ...EMPTY_FORM,
      categoryId: categories[0]?.id ?? "",
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

  async function submitForm() {
    if (!form.name.trim() || !form.description.trim() || !form.categoryId.trim() || form.priceCents < 1) {
      setError("Please complete all required fields");
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
      await http.put(`/api/admin/products/${editingId}`, payload);
      notify("Product updated");
    } else {
      await http.post("/api/admin/products", payload);
      notify("Product created");
    }

    setDialogOpen(false);
    await load();
  }

  async function deleteProduct() {
    if (!deleteId) {
      return;
    }

    await http.delete(`/api/admin/products/${deleteId}`);
    notify("Product deleted");
    setDeleteId(null);
    await load();
  }

  return (
    <section className="space-y-4">
      <AdminNav />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin Products</h1>
        <Button onClick={openCreateDialog}>New product</Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading products...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setDeleteId(product.id)}>
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
            <DialogTitle>{editingId ? "Edit product" : "Create product"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              placeholder="Name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
            <Textarea
              placeholder="Description"
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            />
            <Input
              type="number"
              min={1}
              placeholder="Price (cents)"
              value={String(form.priceCents)}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  priceCents: Number(event.target.value),
                }))
              }
            />
            <Input
              placeholder="Currency (EUR)"
              value={form.currency}
              onChange={(event) => setForm((prev) => ({ ...prev, currency: event.target.value }))}
            />
            <Input
              placeholder="Image URL (optional)"
              value={form.imageUrl ?? ""}
              onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
            />

            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.categoryId}
              onChange={(event) => setForm((prev) => ({ ...prev, categoryId: event.target.value }))}
            >
              <option value="" disabled>
                Select category
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

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
            <AlertDialogTitle>Delete product</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button onClick={() => void deleteProduct()}>Delete</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
