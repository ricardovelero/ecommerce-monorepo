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

export type ProductSort = "newest" | "price_asc" | "price_desc" | "name_asc";

export interface ProductListQueryDTO {
  search?: string;
  categoryId?: string;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
}

export interface ProductListResponseDTO {
  items: ProductDTO[];
  categories: CategoryDTO[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface CheckoutSessionRequestDTO {
  lang?: LanguageCode;
  customerName: string;
  phone?: string | null;
  shippingAddressLine1: string;
  shippingAddressLine2?: string | null;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  shippingNotes?: string | null;
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

export type FulfillmentStatus = "UNFULFILLED" | "PROCESSING" | "SHIPPED" | "DELIVERED";

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
  fulfillmentStatus: FulfillmentStatus;
  currency: string;
  subtotalCents: number;
  totalCents: number;
  customerName?: string | null;
  phone?: string | null;
  shippingAddressLine1?: string | null;
  shippingAddressLine2?: string | null;
  shippingCity?: string | null;
  shippingPostalCode?: string | null;
  shippingCountry?: string | null;
  shippingNotes?: string | null;
  trackingNumber?: string | null;
  fulfilledAt?: string | null;
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
