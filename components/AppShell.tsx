"use client";

import { OrdersLiveProvider } from "@/components/OrdersLiveProvider";
import { NotificationPermissionBanner } from "@/components/NotificationPermissionBanner";
import { ToastContainer } from "@/components/ToastContainer";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <OrdersLiveProvider>
      {children}
      <NotificationPermissionBanner />
      <ToastContainer />
    </OrdersLiveProvider>
  );
}
