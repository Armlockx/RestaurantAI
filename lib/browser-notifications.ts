import { ORDER_STATUS_LABELS } from "@/lib/order-labels";
import type { OrderStatus } from "@/lib/types";

const BANNER_DISMISSED_KEY = "restaurantai-notify-banner-dismissed";
const PROMPT_AFTER_ORDER_KEY = "restaurantai-notify-prompt-order";

export function isBrowserNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getBrowserNotificationPermission(): NotificationPermission | "unsupported" {
  if (!isBrowserNotificationSupported()) return "unsupported";
  return Notification.permission;
}

export async function requestBrowserNotificationPermission(): Promise<
  NotificationPermission | "unsupported"
> {
  if (!isBrowserNotificationSupported()) return "unsupported";
  return Notification.requestPermission();
}

export function isNotifyBannerDismissed(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(BANNER_DISMISSED_KEY) === "1";
}

export function dismissNotifyBanner(): void {
  localStorage.setItem(BANNER_DISMISSED_KEY, "1");
}

export function markNotifyPromptAfterOrder(): void {
  sessionStorage.setItem(PROMPT_AFTER_ORDER_KEY, "1");
}

export function hasNotifyPromptAfterOrder(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(PROMPT_AFTER_ORDER_KEY) === "1";
}

export function clearNotifyPromptAfterOrder(): void {
  sessionStorage.removeItem(PROMPT_AFTER_ORDER_KEY);
}

/** Browser notification when the tab is in the background (permission required). */
export function showOrderStatusBrowserNotification(
  orderId: string,
  status: OrderStatus,
  message?: string
): void {
  if (!isBrowserNotificationSupported()) return;
  if (Notification.permission !== "granted") return;
  if (typeof document === "undefined" || !document.hidden) return;

  const body =
    message ?? `Pedido #${orderId.slice(0, 8)}: ${ORDER_STATUS_LABELS[status] ?? status}`;

  try {
    const notification = new Notification("RestaurantAI — Atualização do pedido", {
      body,
      icon: "/img/favicon.gif",
      tag: `order-${orderId}`,
    });
    notification.onclick = () => {
      window.focus();
      window.location.assign(`/orders/${orderId}`);
      notification.close();
    };
  } catch {
    /* unsupported icon format or quota — ignore */
  }
}
