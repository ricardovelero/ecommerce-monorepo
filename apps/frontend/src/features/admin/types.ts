export interface AdminCategory {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  createdById: string | null;
  updatedById: string | null;
}

export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  stock: number;
  currency: string;
  imageUrl: string | null;
  categoryId: string;
  categoryName: string;
  createdAt: string;
  updatedAt: string;
  createdById: string | null;
  updatedById: string | null;
}

export interface AdminProductInput {
  name: string;
  description: string;
  priceCents: number;
  stock?: number;
  currency: string;
  imageUrl?: string | null;
  categoryId: string;
}
