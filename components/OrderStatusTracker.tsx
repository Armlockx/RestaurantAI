"use client";

import { ORDER_STATUS_LABELS, orderStatusClass } from "@/lib/order-labels";
import { useOrderStatusLive } from "@/lib/use-order-live";
import type { OrderStatus } from "@/lib/types";

interface Props {
  orderId: string;
  initialStatus?: OrderStatus;
  isLoggedIn: boolean;
  onClose: () => void;
}

export function OrderStatusTracker({
  orderId,
  initialStatus = "pending",
  isLoggedIn,
  onClose,
}: Props) {
  const status = useOrderStatusLive(orderId, initialStatus, isLoggedIn);

  return (
    <div className="order-tracker">
      <p>
        Pedido <strong>{orderId.slice(0, 8)}</strong> — Status:{" "}
        <strong>{ORDER_STATUS_LABELS[status] ?? status}</strong>
      </p>
      <button type="button" className="order-tracker-close" onClick={onClose}>
        Fechar
      </button>
    </div>
  );
}
