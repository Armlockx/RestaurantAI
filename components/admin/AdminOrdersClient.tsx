"use client";

import { useEffect, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { formatPreco } from "@/lib/menu-data";
import type { Order, OrderStatus } from "@/lib/types";

const STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "delivered",
  "cancelled",
];

export function AdminOrdersClient({
  initialOrders,
}: {
  initialOrders: Order[];
}) {
  const [orders, setOrders] = useState(initialOrders);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    const channel = supabase
      .channel("admin-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          fetch("/api/orders?all=1")
            .then((r) => r.json())
            .then((d: { orders?: Order[] }) => {
              if (d.orders) setOrders(d.orders);
            })
            .catch(() => {});
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateStatus = async (id: string, status: OrderStatus) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const data = (await res.json()) as { order: Order };
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? data.order : o))
      );
    }
  };

  if (!orders.length) {
    return <p className="text-sm text-text-muted">Nenhum pedido ainda.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-muted">
            <th className="px-3 py-2 text-left font-semibold text-text">ID</th>
            <th className="px-3 py-2 text-left font-semibold text-text">Cliente</th>
            <th className="px-3 py-2 text-left font-semibold text-text">Total</th>
            <th className="px-3 py-2 text-left font-semibold text-text">Status</th>
            <th className="px-3 py-2 text-left font-semibold text-text">Data</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b border-border">
              <td className="px-3 py-2 font-mono text-xs">{o.id.slice(0, 8)}</td>
              <td className="px-3 py-2">
                {o.cliente_nome}
                <br />
                <small className="text-text-muted">{o.cliente_telefone}</small>
              </td>
              <td className="px-3 py-2">{formatPreco(o.total_centavos)}</td>
              <td className="px-3 py-2">
                <select
                  value={o.status}
                  onChange={(e) =>
                    updateStatus(o.id, e.target.value as OrderStatus)
                  }
                  className="rounded-button border border-border px-2 py-1 text-sm outline-none focus:border-brand"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-text-muted">
                {new Date(o.created_at).toLocaleString("pt-BR")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
