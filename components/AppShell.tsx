"use client";

import { OrdersLiveProvider } from "@/components/OrdersLiveProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ToastContainer } from "@/components/ToastContainer";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <OrdersLiveProvider>
        {children}
        <ToastContainer />
      </OrdersLiveProvider>
    </ThemeProvider>
  );
}
