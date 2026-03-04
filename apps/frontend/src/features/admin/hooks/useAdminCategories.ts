import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { AdminCategory } from "@/features/admin/types";
import { useHttpClient } from "@/features/shared/api/useHttpClient";

const adminCategoriesQueryKey = ["admin", "categories"] as const;

export function useAdminCategories() {
  const http = useHttpClient();

  return useQuery({
    queryKey: adminCategoriesQueryKey,
    queryFn: () => http.get<AdminCategory[]>("/api/admin/categories"),
  });
}

export function useCreateAdminCategory() {
  const http = useHttpClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => http.post<AdminCategory>("/api/admin/categories", { name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminCategoriesQueryKey }),
  });
}

export function useUpdateAdminCategory() {
  const http = useHttpClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      http.put<AdminCategory>(`/api/admin/categories/${id}`, { name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminCategoriesQueryKey }),
  });
}

export function useDeleteAdminCategory() {
  const http = useHttpClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => http.delete<void>(`/api/admin/categories/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminCategoriesQueryKey }),
  });
}
