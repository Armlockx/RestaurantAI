"use client";

import Link from "next/link";
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
  if (initialOrders.length === 0) {
    return (
      <div className="my-orders-empty">
        <p>Você ainda não fez nenhum pedido.</p>
        <Link href="/" className="my-orders-empty__link">
          Ver cardápio
        </Link>
      </div>
    );
  }

  return (
    <ul className="my-orders-list">
      {initialOrders.map((order) => (
        <li key={order.id}>
          <Link href={`/orders/${order.id}`} className="my-orders-card">
            <div className="my-orders-card__header">
              <span className={orderStatusClass(order.status)}>
                {ORDER_STATUS_LABELS[order.status]}
              </span>
              <time className="my-orders-card__date" dateTime={order.created_at}>
                {formatOrderDate(order.created_at)}
              </time>
            </div>
            <p className="my-orders-card__items">{itemSummary(order)}</p>
            <div className="my-orders-card__footer">
              <span className="my-orders-card__total">{formatPreco(order.total_centavos)}</span>
              <span className="my-orders-card__cta">Ver detalhes →</span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
