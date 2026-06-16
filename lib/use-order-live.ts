import { showToast } from "@/components/ToastContainer";
import { ORDER_STATUS_LABELS } from "@/lib/order-labels";
import type { Order, OrderStatus } from "@/lib/types";

export function notifyOrderStatusChange(
  orderId: string,
  prev: OrderStatus,
  next: OrderStatus
) {
  if (prev === next) return;
  const label = ORDER_STATUS_LABELS[next] ?? next;
  showToast(`Pedido #${orderId.slice(0, 8)}: ${label}`);
}

export async function fetchOrderById(orderId: string): Promise<Order | null> {
  const res = await fetch(`/api/orders/${orderId}`);
  if (!res.ok) return null;
  const data = (await res.json()) as { order?: Order };
  return data.order ?? null;
}

export async function fetchMyOrders(): Promise<Order[]> {
  const res = await fetch("/api/orders");
  if (!res.ok) return [];
  const data = (await res.json()) as { orders?: Order[] };
  return data.orders ?? [];
}
