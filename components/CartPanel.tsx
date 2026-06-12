"use client";

import { formatPreco } from "@/lib/menu-data";
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

  return (
    <>
      <button
        type="button"
        className="cart-fab"
        onClick={() => setCartOpen(true)}
        aria-label="Abrir carrinho"
      >
        <span className="cart-fab-icon" aria-hidden="true">
          🛒
        </span>
        {totalItems > 0 && (
          <span className="cart-fab-badge">{totalItems}</span>
        )}
      </button>

      <aside
        className={`cart-panel${cartOpen ? " is-open" : ""}`}
        aria-hidden={!cartOpen}
      >
        <header className="cart-panel-header">
          <h2 className="cart-panel-title">Seu carrinho</h2>
          <button
            type="button"
            className="cart-panel-close"
            onClick={() => setCartOpen(false)}
            aria-label="Fechar carrinho"
          >
            ×
          </button>
        </header>
        <div className="cart-items">
          {items.length === 0 ? (
            <p className="cart-empty">Seu carrinho está vazio.</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="cart-line">
                <div className="cart-line-info">
                  <strong className="cart-line-name">{item.nome}</strong>
                  <span className="cart-line-price">
                    {formatPreco(item.preco_centavos)}
                  </span>
                </div>
                <div className="cart-line-actions">
                  <button
                    type="button"
                    className="cart-qty-btn"
                    onClick={() => changeQty(item.id, -1)}
                    aria-label="Diminuir quantidade"
                  >
                    −
                  </button>
                  <span className="cart-qty">{item.quantidade}</span>
                  <button
                    type="button"
                    className="cart-qty-btn"
                    onClick={() => changeQty(item.id, 1)}
                    aria-label="Aumentar quantidade"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className="cart-remove-btn"
                    onClick={() => removeItem(item.id)}
                  >
                    Remover
                  </button>
                </div>
                <div className="cart-line-subtotal">
                  {formatPreco(item.preco_centavos * item.quantidade)}
                </div>
              </div>
            ))
          )}
        </div>
        {items.length > 0 && (
          <footer className="cart-footer">
            <div className="cart-total-row">
              <span>Total</span>
              <strong>{formatPreco(totalCentavos)}</strong>
            </div>
            <button
              type="button"
              className="cart-checkout-btn"
              onClick={() => {
                setCartOpen(false);
                setCheckoutOpen(true);
              }}
            >
              Finalizar pedido
            </button>
            <button
              type="button"
              className="cart-clear-btn"
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
