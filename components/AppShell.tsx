"use client";

import { OrdersLiveProvider } from "@/components/OrdersLiveProvider";
import { ToastContainer } from "@/components/ToastContainer";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <OrdersLiveProvider>
      {children}
      <ToastContainer />
    </OrdersLiveProvider>
  );
}
