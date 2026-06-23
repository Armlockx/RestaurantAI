"use client";

import Link from "next/link";
import { useOrdersLive } from "@/components/OrdersLiveProvider";
import { formatPreco } from "@/lib/menu-data";
import { ORDER_STATUS_LABELS, orderStatusClass } from "@/lib/order-labels";
import type { Order } from "@/lib/types";

function formatOrderDate(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function itemSummary(order: Order): string {
  const items = order.order_items ?? [];
  if (items.length === 0) return "Sem itens";
  const totalQty = items.reduce((acc, i) => acc + i.quantidade, 0);
  const first = items[0].nome_snapshot;
  if (items.length === 1) return `${totalQty}× ${first}`;
  return `${totalQty} itens — ${first} e mais ${items.length - 1}`;
}

export function MyOrdersClient({ initialOrders }: { initialOrders: Order[] }) {
  const { orders: liveOrders, isReady } = useOrdersLive();
  const orders = isReady ? liveOrders : initialOrders;

  if (orders.length === 0) {
    return (
      <div className="py-8 text-center text-text-muted">
        <p className="m-0">Você ainda não fez nenhum pedido.</p>
        <Link
          href="/"
          className="mt-3 inline-block font-semibold text-text hover:underline"
        >
          Ver cardápio
        </Link>
      </div>
    );
  }

  return (
    <ul className="m-0 flex list-none flex-col gap-3 p-0">
      {orders.map((order) => (
        <li key={order.id}>
          <Link
            href={`/orders/${order.id}`}
            className="block rounded-card border border-border bg-surface p-4 text-inherit no-underline shadow-sm transition-all hover:border-neutral-300 hover:shadow-md"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className={orderStatusClass(order.status)}>
                {ORDER_STATUS_LABELS[order.status]}
              </span>
              <time
                className="text-xs text-text-muted"
                dateTime={order.created_at}
              >
                {formatOrderDate(order.created_at)}
              </time>
            </div>
            <p className="mb-3 text-sm leading-snug text-text-muted">
              {itemSummary(order)}
            </p>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[15px] font-bold text-text">
                {formatPreco(order.total_centavos)}
              </span>
              <span className="text-xs text-text-muted">Ver detalhes →</span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
