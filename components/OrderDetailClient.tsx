"use client";

import Link from "next/link";
import { useOrdersLive } from "@/components/OrdersLiveProvider";
import { formatPreco } from "@/lib/menu-data";
import {
  ENTREGA_LABELS,
  ORDER_STATUS_LABELS,
  PAGAMENTO_LABELS,
  orderStatusClass,
} from "@/lib/order-labels";
import type { Order } from "@/lib/types";

export function OrderDetailClient({ order }: { order: Order }) {
  const { orders } = useOrdersLive();
  const liveStatus = orders.find((o) => o.id === order.id)?.status;
  const status = liveStatus ?? order.status;
  const items = order.order_items ?? [];

  return (
    <div className="mx-auto max-w-2xl">
      <p className="mb-4 text-sm">
        <Link
          href="/orders"
          className="text-text-muted no-underline transition-colors hover:text-text hover:underline"
        >
          ← Voltar aos pedidos
        </Link>
      </p>

      <div className="rounded-card border border-border bg-surface-muted p-5">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="m-0 text-[22px] font-bold text-text">
            Pedido #{order.id.slice(0, 8)}
          </h1>
          <span className={orderStatusClass(status)}>
            {ORDER_STATUS_LABELS[status]}
          </span>
        </div>

        <p className="mb-2 text-sm text-text-muted">
          Realizado em{" "}
          {new Date(order.created_at).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>

        <p className="mb-5 text-xs text-text-muted">
          O status atualiza automaticamente quando o restaurante alterar seu pedido.
        </p>

        <section className="border-t border-border pt-4">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-text-muted">
            Itens
          </h2>
          <ul className="m-0 mb-3 list-none p-0">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex justify-between gap-3 border-b border-border py-2 text-sm last:border-b-0"
              >
                <span>
                  {item.quantidade}× {item.nome_snapshot}
                </span>
                <span>{formatPreco(item.preco_snapshot_centavos * item.quantidade)}</span>
              </li>
            ))}
          </ul>
          <p className="m-0 text-right text-[15px] text-text">
            Total: <strong>{formatPreco(order.total_centavos)}</strong>
          </p>
        </section>

        <section className="mt-5 border-t border-border pt-4">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-text-muted">
            Entrega e pagamento
          </h2>
          <dl className="m-0 grid gap-3">
            {[
              ["Cliente", order.cliente_nome],
              ["Telefone", order.cliente_telefone],
              ["Entrega", ENTREGA_LABELS[order.entrega_tipo] ?? order.entrega_tipo],
              order.endereco ? ["Endereço", order.endereco] : null,
              ["Pagamento", PAGAMENTO_LABELS[order.pagamento] ?? order.pagamento],
              order.observacoes ? ["Observações", order.observacoes] : null,
            ]
              .filter(Boolean)
              .map((row) => (
                <div
                  key={row![0]}
                  className="grid gap-0.5 text-sm sm:grid-cols-[120px_1fr] sm:gap-2"
                >
                  <dt className="font-semibold text-text-muted">{row![0]}</dt>
                  <dd className="m-0 text-text">{row![1]}</dd>
                </div>
              ))}
          </dl>
        </section>
      </div>
    </div>
  );
}
