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
    <div className="fixed bottom-[calc(var(--spacing-bottom-nav)+var(--spacing-safe-bottom)+0.75rem)] left-4 z-[45] flex max-w-sm items-center gap-3 rounded-card bg-brand px-4 py-3 text-sm text-brand-foreground shadow-lg md:bottom-6">
      <p className="m-0 flex-1">
        Pedido <strong>{orderId.slice(0, 8)}</strong> —{" "}
        <strong className={orderStatusClass(status)}>
          {ORDER_STATUS_LABELS[status] ?? status}
        </strong>
      </p>
      <button
        type="button"
        onClick={onClose}
        className="shrink-0 rounded-button border border-white/30 px-2 py-1 text-xs transition-colors hover:bg-white/10"
      >
        Fechar
      </button>
    </div>
  );
}
