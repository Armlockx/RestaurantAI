"use client";

import { FormEvent, useState } from "react";
import { X } from "lucide-react";
import { useOrdersLive } from "@/components/OrdersLiveProvider";
import { formatPreco } from "@/lib/menu-data";
import { markNotifyPromptAfterOrder } from "@/lib/browser-notifications";
import { cn } from "@/lib/utils";
import { useCart } from "./CartProvider";
import { showToast } from "./ToastContainer";
import { OrderStatusTracker } from "./OrderStatusTracker";

const fieldClass =
  "rounded-button border border-border px-3 py-2.5 text-sm outline-none focus:border-brand";
const labelClass = "flex flex-col gap-1.5 text-sm font-semibold text-text";

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
      markNotifyPromptAfterOrder();
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
        className={cn(
          "fixed inset-0 z-[10000] flex items-center justify-center bg-black/45 p-4 transition-all",
          checkoutOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        )}
        aria-hidden={!checkoutOpen}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <div
          className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-card bg-surface shadow-xl"
          role="dialog"
          aria-labelledby="checkout-title"
          aria-modal="true"
        >
          <header className="flex items-center justify-between rounded-t-card bg-brand px-4 py-3.5 text-brand-foreground">
            <h2 id="checkout-title" className="m-0 text-lg font-semibold">
              Checkout
            </h2>
            <button
              type="button"
              onClick={close}
              className="flex size-8 items-center justify-center rounded-full transition-colors hover:bg-white/15"
              aria-label="Fechar checkout"
            >
              <X className="size-5" aria-hidden />
            </button>
          </header>

          <div className="border-b border-border bg-surface-muted px-4 py-3">
            {items.map((i) => (
              <div
                key={i.id}
                className="flex justify-between gap-3 py-1 text-sm text-text"
              >
                <span>
                  {i.nome} × {i.quantidade}
                </span>
                <span>{formatPreco(i.preco_centavos * i.quantidade)}</span>
              </div>
            ))}
            <div className="mt-2 flex justify-between gap-3 border-t border-border pt-2 text-[15px] font-semibold text-text">
              <span>Total</span>
              <strong>{formatPreco(totalCentavos)}</strong>
            </div>
          </div>

          <form className="flex flex-col gap-3 p-4" onSubmit={submit}>
            <label className={labelClass}>
              Nome
              <input
                type="text"
                name="nome"
                required
                autoComplete="name"
                className={fieldClass}
              />
            </label>
            <label className={labelClass}>
              Telefone / WhatsApp
              <input
                type="tel"
                name="telefone"
                required
                autoComplete="tel"
                className={fieldClass}
              />
            </label>
            <label className={labelClass}>
              Tipo de entrega
              <select
                name="entrega"
                required
                value={entrega}
                onChange={(e) => setEntrega(e.target.value)}
                className={fieldClass}
              >
                <option value="retirada">Retirada no balcão</option>
                <option value="mesa">Entrega na mesa</option>
                <option value="delivery">Delivery</option>
              </select>
            </label>
            {entrega === "delivery" && (
              <label className={labelClass}>
                Endereço
                <input
                  type="text"
                  name="endereco"
                  required
                  autoComplete="street-address"
                  className={fieldClass}
                />
              </label>
            )}
            <label className={labelClass}>
              Observações
              <textarea
                name="observacoes"
                rows={2}
                placeholder="Sem cebola, ponto da carne, etc."
                className={fieldClass}
              />
            </label>
            <label className={labelClass}>
              Forma de pagamento
              <select name="pagamento" required className={fieldClass}>
                <option value="pix">PIX</option>
                <option value="credito">Cartão de crédito</option>
                <option value="debito">Cartão de débito</option>
                <option value="dinheiro">Dinheiro</option>
              </select>
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-button bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-neutral-800 disabled:opacity-60"
            >
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
