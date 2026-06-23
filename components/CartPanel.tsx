"use client";

import { ShoppingCart, X } from "lucide-react";
import { formatPreco } from "@/lib/menu-data";
import { cn } from "@/lib/utils";
import { useCart } from "./CartProvider";

export function CartPanel() {
  const {
    items,
    cartOpen,
    setCartOpen,
    changeQty,
    removeItem,
    clear,
    totalCentavos,
    totalItems,
    setCheckoutOpen,
  } = useCart();

  const toggleCart = () => setCartOpen(!cartOpen);
  const closeCart = () => setCartOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={toggleCart}
        className={cn(
          "fixed bottom-6 right-6 z-40 hidden size-14 items-center justify-center rounded-full bg-surface text-text shadow-lg transition-transform hover:scale-105 active:scale-95 md:flex",
          cartOpen && "ring-2 ring-brand/30 ring-offset-2"
        )}
        aria-label={cartOpen ? "Fechar carrinho" : "Abrir carrinho"}
        aria-pressed={cartOpen}
      >
        <ShoppingCart className="size-6" aria-hidden />
        {totalItems > 0 && (
          <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold leading-5 text-white">
            {totalItems > 99 ? "99+" : totalItems}
          </span>
        )}
      </button>

      {cartOpen && (
        <button
          type="button"
          className="fixed inset-0 z-50 bg-black/40 md:bg-black/20"
          onClick={closeCart}
          aria-label="Fechar carrinho"
        />
      )}

      <aside
        className={cn(
          "fixed z-50 flex max-h-[min(70vh,calc(100dvh-6rem))] flex-col overflow-hidden rounded-card border border-border bg-surface shadow-xl transition-all duration-200",
          "inset-x-4 bottom-20",
          "md:inset-x-auto md:bottom-4 md:right-4 md:left-auto md:w-[360px] md:max-h-[70vh]",
          cartOpen
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-2 scale-[0.96] opacity-0"
        )}
        aria-hidden={!cartOpen}
        aria-label="Seu carrinho"
      >
        <header className="flex items-center justify-between bg-brand px-4 py-3.5 text-brand-foreground">
          <h2 className="m-0 text-base font-semibold">Seu carrinho</h2>
          <button
            type="button"
            onClick={closeCart}
            className="flex size-8 items-center justify-center rounded-full transition-colors hover:bg-white/15"
            aria-label="Fechar carrinho"
          >
            <X className="size-5" aria-hidden />
          </button>
        </header>

        <div className="min-h-[120px] max-h-[340px] flex-1 overflow-y-auto bg-surface-muted p-3">
          {items.length === 0 ? (
            <p className="m-0 px-2 py-6 text-center text-sm text-text-muted">
              Seu carrinho está vazio.
            </p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="mb-2 rounded-[10px] border border-border bg-surface p-2.5 last:mb-0"
              >
                <div className="mb-2 flex justify-between gap-2">
                  <strong className="text-sm font-semibold">{item.nome}</strong>
                  <span className="shrink-0 text-xs text-text-muted">
                    {formatPreco(item.preco_centavos)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    className="flex size-7 items-center justify-center rounded-button border border-border bg-surface text-base leading-none"
                    onClick={() => changeQty(item.id, -1)}
                    aria-label="Diminuir quantidade"
                  >
                    −
                  </button>
                  <span className="min-w-5 text-center text-sm font-semibold">
                    {item.quantidade}
                  </span>
                  <button
                    type="button"
                    className="flex size-7 items-center justify-center rounded-button border border-border bg-surface text-base leading-none"
                    onClick={() => changeQty(item.id, 1)}
                    aria-label="Aumentar quantidade"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className="ml-auto text-xs text-red-700 underline"
                    onClick={() => removeItem(item.id)}
                  >
                    Remover
                  </button>
                </div>
                <div className="mt-1.5 text-right text-[13px] font-semibold">
                  {formatPreco(item.preco_centavos * item.quantidade)}
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <footer className="flex flex-col gap-2 border-t border-border bg-surface p-3">
            <div className="flex items-center justify-between text-[15px]">
              <span>Total</span>
              <strong>{formatPreco(totalCentavos)}</strong>
            </div>
            <button
              type="button"
              className="rounded-button bg-brand px-3.5 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-neutral-800"
              onClick={() => {
                closeCart();
                setCheckoutOpen(true);
              }}
            >
              Finalizar pedido
            </button>
            <button
              type="button"
              className="bg-transparent py-2 text-[13px] text-text-muted underline"
              onClick={() => {
                if (confirm("Deseja limpar o carrinho?")) clear();
              }}
            >
              Limpar carrinho
            </button>
          </footer>
        )}
      </aside>
    </>
  );
}
