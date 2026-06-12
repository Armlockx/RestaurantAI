"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartAction, CartItem, MenuItem } from "@/lib/types";
import { findMenuItemByName } from "@/lib/cart-actions";

const STORAGE_KEY = "groqtest-carrinho-v2";

interface CartContextValue {
  items: CartItem[];
  addItem: (menuItem: MenuItem, qty?: number) => void;
  changeQty: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  totalItems: number;
  totalCentavos: number;
  applyCartActions: (actions: CartAction[]) => void;
  openCart: () => void;
  openCheckout: () => void;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  checkoutOpen: boolean;
  setCheckoutOpen: (v: boolean) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  children,
  menuItems,
}: {
  children: ReactNode;
  menuItems: MenuItem[];
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback((menuItem: MenuItem, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.menu_item_id === menuItem.id);
      if (existing) {
        return prev.map((i) =>
          i.menu_item_id === menuItem.id
            ? { ...i, quantidade: i.quantidade + qty }
            : i
        );
      }
      return [
        ...prev,
        {
          id: menuItem.id,
          menu_item_id: menuItem.id,
          nome: menuItem.nome,
          preco_centavos: menuItem.preco_centavos,
          quantidade: qty,
        },
      ];
    });
  }, []);

  const changeQty = useCallback((id: string, delta: number) => {
    setItems((prev) => {
      const next = prev
        .map((i) =>
          i.id === id ? { ...i, quantidade: i.quantidade + delta } : i
        )
        .filter((i) => i.quantidade > 0);
      return next;
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const applyCartActions = useCallback(
    (actions: CartAction[]) => {
      for (const action of actions) {
        const tipo = (action.acao || "").toLowerCase();
        if (tipo === "adicionar" && action.itens) {
          for (const entrada of action.itens) {
            const found = findMenuItemByName(menuItems, entrada.nome);
            if (found) addItem(found, entrada.quantidade ?? 1);
          }
        }
        if (tipo === "remover" && action.itens) {
          for (const entrada of action.itens) {
            const found = findMenuItemByName(menuItems, entrada.nome);
            if (found) {
              const qtd = entrada.quantidade ?? 1;
              for (let i = 0; i < qtd; i++) changeQty(found.id, -1);
            }
          }
        }
        if (tipo === "limpar") clear();
        if (tipo === "abrir_carrinho") setCartOpen(true);
        if (tipo === "checkout" || tipo === "finalizar") {
          setCartOpen(true);
          setCheckoutOpen(true);
        }
      }
    },
    [menuItems, addItem, changeQty, clear]
  );

  const totalItems = useMemo(
    () => items.reduce((a, i) => a + i.quantidade, 0),
    [items]
  );
  const totalCentavos = useMemo(
    () => items.reduce((a, i) => a + i.preco_centavos * i.quantidade, 0),
    [items]
  );

  const value: CartContextValue = {
    items,
    addItem,
    changeQty,
    removeItem,
    clear,
    totalItems,
    totalCentavos,
    applyCartActions,
    openCart: () => setCartOpen(true),
    openCheckout: () => setCheckoutOpen(true),
    cartOpen,
    setCartOpen,
    checkoutOpen,
    setCheckoutOpen,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
