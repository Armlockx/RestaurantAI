"use client";

import { ORDER_STATUS_LABELS, orderStatusClass } from "@/lib/order-labels";
import { useOrdersLive } from "@/components/OrdersLiveProvider";
import type { OrderStatus } from "@/lib/types";

interface Props {
  orderId: string;
  initialStatus?: OrderStatus;
  onClose: () => void;
}

export function OrderStatusTracker({
  orderId,
  initialStatus = "pending",
  onClose,
}: Props) {
  const { orders } = useOrdersLive();
  const liveStatus = orders.find((o) => o.id === orderId)?.status;
  const status = liveStatus ?? initialStatus;

  return (
    <div className="order-tracker">
      <p>
        Pedido <strong>{orderId.slice(0, 8)}</strong> — Status:{" "}
        <strong className={orderStatusClass(status)}>
          {ORDER_STATUS_LABELS[status] ?? status}
        </strong>
      </p>
      <button type="button" className="order-tracker-close" onClick={onClose}>
        Fechar
      </button>
    </div>
  );
}
