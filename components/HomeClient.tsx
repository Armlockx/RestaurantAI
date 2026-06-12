"use client";

import { CartProvider } from "@/components/CartProvider";
import { MenuGrid } from "@/components/MenuGrid";
import { CartPanel } from "@/components/CartPanel";
import { ChatPanel } from "@/components/ChatPanel";
import { CheckoutForm } from "@/components/CheckoutForm";
import { ToastContainer } from "@/components/ToastContainer";
import type { MenuItem } from "@/lib/types";

export function HomeClient({ menuItems }: { menuItems: MenuItem[] }) {
  return (
    <CartProvider menuItems={menuItems}>
      <h1>Cardápio — Restaurante</h1>
      <p className="hint">
        Cardápio com assistente IA, carrinho e checkout integrados.
      </p>
      <MenuGrid items={menuItems} />
      <p className="cardapio-caption">
        Valores, ingredientes e porções são fictícios para demonstração.
      </p>
      <CartPanel />
      <ChatPanel />
      <CheckoutForm />
      <ToastContainer />
    </CartProvider>
  );
}
