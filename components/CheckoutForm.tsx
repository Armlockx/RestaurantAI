"use client";

import { FormEvent, useState } from "react";
import { useOrdersLive } from "@/components/OrdersLiveProvider";
import { formatPreco } from "@/lib/menu-data";
import { useCart } from "./CartProvider";
import { showToast } from "./ToastContainer";
import { OrderStatusTracker } from "./OrderStatusTracker";

export function CheckoutForm() {
  const {
    items,
    checkoutOpen,
    setCheckoutOpen,
    clear,
    totalCentavos,
    setCartOpen,
  } = useCart();
  const { refreshOrders } = useOrdersLive();
  const [submitting, setSubmitting] = useState(false);
  const [trackOrderId, setTrackOrderId] = useState<string | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [entrega, setEntrega] = useState("retirada");

  const close = () => setCheckoutOpen(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting || items.length === 0) return;

    const fd = new FormData(e.currentTarget);
    setSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteNome: fd.get("nome"),
          clienteTelefone: fd.get("telefone"),
          entregaTipo: fd.get("entrega"),
          endereco: fd.get("endereco") || null,
          pagamento: fd.get("pagamento"),
          observacoes: fd.get("observacoes") || null,
          items: items.map((i) => ({
            menuItemId: i.menu_item_id,
            quantidade: i.quantidade,
          })),
        }),
      });

      const data = (await res.json()) as {
        order?: { id: string; cliente_nome: string; total_centavos: number };
        error?: string;
      };

      if (!res.ok) throw new Error(data.error ?? "Erro ao confirmar pedido");

      const orderId = data.order!.id;
      setTrackOrderId(orderId);
      setBannerDismissed(false);
      clear();
      close();
      setCartOpen(false);
      await refreshOrders();
      showToast(
        `Pedido confirmado! Total: ${formatPreco(data.order!.total_centavos)}`
      );
      (e.target as HTMLFormElement).reset();
      setEntrega("retirada");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Erro ao confirmar pedido"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div
        className={`checkout-overlay${checkoutOpen ? " is-open" : ""}`}
        aria-hidden={!checkoutOpen}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <div
          className="checkout-modal"
          role="dialog"
          aria-labelledby="checkout-title"
          aria-modal="true"
        >
          <header className="checkout-header">
            <h2 id="checkout-title">Checkout</h2>
            <button
              type="button"
              className="checkout-close"
              onClick={close}
              aria-label="Fechar checkout"
            >
              ×
            </button>
          </header>
          <div className="checkout-summary">
            {items.map((i) => (
              <div key={i.id} className="checkout-line">
                <span>
                  {i.nome} × {i.quantidade}
                </span>
                <span>{formatPreco(i.preco_centavos * i.quantidade)}</span>
              </div>
            ))}
            <div className="checkout-line checkout-line-total">
              <span>Total</span>
              <strong>{formatPreco(totalCentavos)}</strong>
            </div>
          </div>
          <form className="checkout-form" onSubmit={submit}>
            <label>
              Nome
              <input type="text" name="nome" required autoComplete="name" />
            </label>
            <label>
              Telefone / WhatsApp
              <input type="tel" name="telefone" required autoComplete="tel" />
            </label>
            <label>
              Tipo de entrega
              <select
                name="entrega"
                required
                value={entrega}
                onChange={(e) => setEntrega(e.target.value)}
              >
                <option value="retirada">Retirada no balcão</option>
                <option value="mesa">Entrega na mesa</option>
                <option value="delivery">Delivery</option>
              </select>
            </label>
            {entrega === "delivery" && (
              <label>
                Endereço
                <input
                  type="text"
                  name="endereco"
                  required
                  autoComplete="street-address"
                />
              </label>
            )}
            <label>
              Observações
              <textarea
                name="observacoes"
                rows={2}
                placeholder="Sem cebola, ponto da carne, etc."
              />
            </label>
            <label>
              Forma de pagamento
              <select name="pagamento" required>
                <option value="pix">PIX</option>
                <option value="credito">Cartão de crédito</option>
                <option value="debito">Cartão de débito</option>
                <option value="dinheiro">Dinheiro</option>
              </select>
            </label>
            <button type="submit" className="checkout-submit" disabled={submitting}>
              {submitting ? "Confirmando..." : "Confirmar pedido"}
            </button>
          </form>
        </div>
      </div>

      {trackOrderId && !bannerDismissed && (
        <OrderStatusTracker
          orderId={trackOrderId}
          onClose={() => setBannerDismissed(true)}
        />
      )}
    </>
  );
}
