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
  return `order-status order-status--${status}`;
}
