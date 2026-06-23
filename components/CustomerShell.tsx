"use client";

import type { ReactNode } from "react";
import { CartPanel } from "@/components/CartPanel";
import { CartProvider } from "@/components/CartProvider";
import { ChatEntryButton } from "@/components/chat/ChatEntryButton";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { ChatProvider } from "@/components/chat/ChatProvider";
import { CheckoutForm } from "@/components/CheckoutForm";
import { NotificationPermissionBanner } from "@/components/NotificationPermissionBanner";
import { PwaInstallCard } from "@/components/pwa/PwaInstallCard";
import { BottomNav } from "@/components/navigation/BottomNav";
import type { MenuItem } from "@/lib/types";

type CustomerShellProps = {
  menuItems: MenuItem[];
  children: ReactNode;
};

export function CustomerShell({ menuItems, children }: CustomerShellProps) {
  return (
    <CartProvider menuItems={menuItems}>
      <ChatProvider>
        <div className="pb-bottom-nav-safe md:pb-0">{children}</div>
        <CartPanel />
        <CheckoutForm />
        <ChatEntryButton />
        <ChatPanel />
        <BottomNav />
        <PwaInstallCard />
        <NotificationPermissionBanner />
      </ChatProvider>
    </CartProvider>
  );
}
