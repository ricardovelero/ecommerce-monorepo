export type OrderStatus =
  | "PENDING"
  | "PAYMENT_PROCESSING"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export interface OrderItem {
  id: string;
  productId: string;
  nameSnapshot: string;
  priceCentsSnapshot: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  currency: string;
  subtotalCents: number;
  totalCents: number;
  stripeCheckoutSessionId: string | null;
  stripePaymentIntentId: string | null;
  stripeCustomerId: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}
