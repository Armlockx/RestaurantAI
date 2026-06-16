"use client";

import Link from "next/link";
import { formatPreco } from "@/lib/menu-data";
import {
  ENTREGA_LABELS,
  ORDER_STATUS_LABELS,
  PAGAMENTO_LABELS,
  orderStatusClass,
} from "@/lib/order-labels";
import { useOrderStatusLive } from "@/lib/use-order-live";
import type { Order } from "@/lib/types";

export function OrderDetailClient({
  order,
  isLoggedIn,
}: {
  order: Order;
  isLoggedIn: boolean;
}) {
  const status = useOrderStatusLive(order.id, order.status, isLoggedIn);
  const items = order.order_items ?? [];

  return (
    <div className="my-orders-page">
      <p className="my-orders-back">
        <Link href="/orders">← Voltar aos pedidos</Link>
      </p>

      <div className="order-detail">
        <div className="order-detail__header">
          <h1>Pedido #{order.id.slice(0, 8)}</h1>
          <span className={orderStatusClass(status)}>{ORDER_STATUS_LABELS[status]}</span>
        </div>

        <p className="order-detail__meta">
          Realizado em{" "}
          {new Date(order.created_at).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>

        <p className="order-detail__live-hint">
          O status atualiza automaticamente quando o restaurante alterar seu pedido.
        </p>

        <section className="order-detail__section">
          <h2>Itens</h2>
          <ul className="order-detail__items">
            {items.map((item) => (
              <li key={item.id} className="order-detail__item">
                <span>
                  {item.quantidade}× {item.nome_snapshot}
                </span>
                <span>{formatPreco(item.preco_snapshot_centavos * item.quantidade)}</span>
              </li>
            ))}
          </ul>
          <p className="order-detail__total">
            Total: <strong>{formatPreco(order.total_centavos)}</strong>
          </p>
        </section>

        <section className="order-detail__section">
          <h2>Entrega e pagamento</h2>
          <dl className="order-detail__dl">
            <div>
              <dt>Cliente</dt>
              <dd>{order.cliente_nome}</dd>
            </div>
            <div>
              <dt>Telefone</dt>
              <dd>{order.cliente_telefone}</dd>
            </div>
            <div>
              <dt>Entrega</dt>
              <dd>{ENTREGA_LABELS[order.entrega_tipo] ?? order.entrega_tipo}</dd>
            </div>
            {order.endereco && (
              <div>
                <dt>Endereço</dt>
                <dd>{order.endereco}</dd>
              </div>
            )}
            <div>
              <dt>Pagamento</dt>
              <dd>{PAGAMENTO_LABELS[order.pagamento] ?? order.pagamento}</dd>
            </div>
            {order.observacoes && (
              <div>
                <dt>Observações</dt>
                <dd>{order.observacoes}</dd>
              </div>
            )}
          </dl>
        </section>
      </div>
    </div>
  );
}
