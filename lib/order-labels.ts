import type { OrderStatus } from "./types";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  preparing: "Em preparo",
  ready: "Pronto",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

export const ENTREGA_LABELS: Record<string, string> = {
  retirada: "Retirada no balcão",
  mesa: "Consumo na mesa",
  delivery: "Delivery",
};

export const PAGAMENTO_LABELS: Record<string, string> = {
  pix: "PIX",
  credito: "Cartão de crédito",
  debito: "Cartão de débito",
  dinheiro: "Dinheiro",
};

export function orderStatusClass(status: OrderStatus): string {
  const base =
    "inline-block rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide";

  switch (status) {
    case "pending":
      return `${base} bg-amber-100 text-amber-900`;
    case "confirmed":
      return `${base} bg-blue-100 text-blue-800`;
    case "preparing":
      return `${base} bg-violet-100 text-violet-800`;
    case "ready":
      return `${base} bg-emerald-100 text-emerald-800`;
    case "delivered":
      return `${base} bg-neutral-200 text-neutral-700`;
    case "cancelled":
      return `${base} bg-red-100 text-red-800`;
    default:
      return `${base} bg-neutral-100 text-neutral-700`;
  }
}
