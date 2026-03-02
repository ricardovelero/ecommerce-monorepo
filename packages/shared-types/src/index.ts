export type LanguageCode = "es" | "en";

export interface ProductDTO {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  imageUrl?: string | null;
  categoryId: string;
  categoryName: string;
}

export interface CategoryDTO {
  id: string;
  name: string;
}

export interface CartItemDTO {
  id: string;
  productId: string;
  productName: string;
  priceCents: number;
  quantity: number;
}

export interface CartDTO {
  id: string;
  status: "OPEN" | "CHECKED_OUT";
  items: CartItemDTO[];
}
