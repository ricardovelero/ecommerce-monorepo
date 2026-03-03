import { useCallback, useEffect, useState } from "react";

import type { Order } from "@/features/orders/types";
import { useHttpClient } from "@/features/shared/api/useHttpClient";

export function useOrders() {
  const http = useHttpClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const next = await http.get<Order[]>("/api/orders");
    setOrders(next);
  }, [http]);

  useEffect(() => {
    refresh()
      .catch(() => {
        setOrders([]);
      })
      .finally(() => setLoading(false));
  }, [refresh]);

  return {
    orders,
    loading,
    refresh,
  };
}

export function useOrder(orderId: string | undefined) {
  const http = useHttpClient();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!orderId) {
      setOrder(null);
      return;
    }

    const next = await http.get<Order>(`/api/orders/${orderId}`);
    setOrder(next);
  }, [http, orderId]);

  useEffect(() => {
    refresh()
      .catch(() => {
        setOrder(null);
      })
      .finally(() => setLoading(false));
  }, [refresh]);

  return {
    order,
    loading,
    refresh,
  };
}
