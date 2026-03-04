export type LanguageCode = "es" | "en";

export interface ProductDTO {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  stock: number;
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

export type OrderStatus =
  | "PENDING"
  | "PAYMENT_PROCESSING"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export interface OrderItemDTO {
  id: string;
  productId: string;
  nameSnapshot: string;
  priceCentsSnapshot: number;
  quantity: number;
}

export interface OrderDTO {
  id: string;
  userId: string;
  status: OrderStatus;
  currency: string;
  subtotalCents: number;
  totalCents: number;
  stripeCheckoutSessionId?: string | null;
  stripePaymentIntentId?: string | null;
  stripeCustomerId?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItemDTO[];
}

export interface CheckoutSessionResponseDTO {
  url: string;
}
