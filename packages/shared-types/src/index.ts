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

export interface HomeMerchandisingResponseDTO {
  featuredProducts: ProductDTO[];
  bestSellers: ProductDTO[];
  newArrivals: ProductDTO[];
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
  shippingCarrier?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
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

export interface CheckoutReconcileResponseDTO {
  status: "queued" | "existing" | "pending_payment";
}

export interface CheckoutSessionStatusResponseDTO {
  status: "existing" | "processing" | "pending_payment";
}

export interface AdminOrderFulfillmentUpdateDTO {
  fulfillmentStatus: FulfillmentStatus;
  shippingCarrier?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  fulfilledAt?: string | null;
}

export interface AnalyticsMetricDTO {
  label: string;
  value: number;
}

export interface RevenueTrendPointDTO {
  date: string;
  revenueCents: number;
  orders: number;
}

export interface TopProductAnalyticsDTO {
  productId: string;
  name: string;
  unitsSold: number;
  revenueCents: number;
}

export interface InventoryRiskDTO {
  lowStockCount: number;
  outOfStockCount: number;
  lowStockProducts: Array<{
    id: string;
    name: string;
    stock: number;
  }>;
}

export interface CustomerAnalyticsDTO {
  totalCustomers: number;
  repeatCustomers: number;
  firstTimeCustomers: number;
}

export interface AdminAnalyticsDTO {
  revenue: {
    totalRevenueCents: number;
    paidOrders: number;
    averageOrderValueCents: number;
  };
  orderStatusBreakdown: AnalyticsMetricDTO[];
  fulfillmentBreakdown: AnalyticsMetricDTO[];
  revenueTrend: RevenueTrendPointDTO[];
  topProducts: TopProductAnalyticsDTO[];
  inventoryRisk: InventoryRiskDTO;
  customers: CustomerAnalyticsDTO;
}
