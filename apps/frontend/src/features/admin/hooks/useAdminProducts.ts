import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { AdminProduct, AdminProductInput } from "@/features/admin/types";
import { useHttpClient } from "@/features/shared/api/useHttpClient";

const adminProductsQueryKey = ["admin", "products"] as const;

export function useAdminProducts() {
  const http = useHttpClient();

  return useQuery({
    queryKey: adminProductsQueryKey,
    queryFn: () => http.get<AdminProduct[]>("/api/admin/products"),
  });
}

export function useCreateAdminProduct() {
  const http = useHttpClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminProductInput) => http.post<AdminProduct>("/api/admin/products", payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminProductsQueryKey }),
  });
}

export function useUpdateAdminProduct() {
  const http = useHttpClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminProductInput }) =>
      http.put<AdminProduct>(`/api/admin/products/${id}`, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminProductsQueryKey }),
  });
}

export function useDeleteAdminProduct() {
  const http = useHttpClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => http.delete<void>(`/api/admin/products/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminProductsQueryKey }),
  });
}
