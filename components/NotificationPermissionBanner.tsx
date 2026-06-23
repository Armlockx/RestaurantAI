"use client";

import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { useOrdersLive } from "@/components/OrdersLiveProvider";
import {
  clearNotifyPromptAfterOrder,
  dismissNotifyBanner,
  getBrowserNotificationPermission,
  hasNotifyPromptAfterOrder,
  isBrowserNotificationSupported,
  isNotifyBannerDismissed,
  requestBrowserNotificationPermission,
} from "@/lib/browser-notifications";
import { cn } from "@/lib/utils";

export function NotificationPermissionBanner() {
  const { orders, isReady } = useOrdersLive();
  const [visible, setVisible] = useState(false);
  const [entered, setEntered] = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (!isBrowserNotificationSupported()) return;
    if (getBrowserNotificationPermission() !== "default") return;
    if (isNotifyBannerDismissed()) return;
    if (!isReady) return;

    const afterOrder = hasNotifyPromptAfterOrder();
    if (afterOrder || orders.length > 0) {
      setVisible(true);
      requestAnimationFrame(() => setEntered(true));
    }
  }, [isReady, orders.length]);

  const hide = () => {
    setVisible(false);
    clearNotifyPromptAfterOrder();
  };

  const dismiss = () => {
    dismissNotifyBanner();
    hide();
  };

  const enable = async () => {
    setRequesting(true);
    try {
      const permission = await requestBrowserNotificationPermission();
      if (permission === "granted") {
        dismissNotifyBanner();
      }
      hide();
    } finally {
      setRequesting(false);
    }
  };

  if (!visible) return null;

  return (
    <aside
      role="region"
      aria-label="Ativar notificações do navegador"
      className={cn(
        "fixed inset-x-4 z-[48] max-w-sm transition-all duration-300 md:inset-x-auto md:right-6 md:left-auto",
        "bottom-[calc(var(--spacing-bottom-nav)+var(--spacing-safe-bottom)+6.5rem)] md:bottom-28",
        entered ? "translate-y-0 opacity-100 animate-chat-enter" : "translate-y-3 opacity-0"
      )}
    >
      <div className="relative rounded-card border border-border bg-surface p-4 shadow-xl">
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-muted hover:text-text"
          aria-label="Fechar aviso de notificações"
        >
          <X className="size-4" aria-hidden />
        </button>

        <div className="mb-3 flex items-start gap-3 pr-8">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand text-brand-foreground">
            <Bell className="size-5" aria-hidden />
          </div>
          <p className="text-sm leading-relaxed text-text">
            Receba alertas quando o status do pedido mudar com a aba em segundo plano.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void enable()}
            disabled={requesting}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-button bg-brand px-3 py-2 text-sm font-semibold text-brand-foreground transition-colors hover:bg-neutral-800 disabled:opacity-60"
          >
            {requesting ? "Aguardando…" : "Ativar notificações"}
          </button>
          <button
            type="button"
            onClick={dismiss}
            disabled={requesting}
            className="rounded-button border border-border bg-surface px-3 py-2 text-sm font-semibold text-text-muted transition-colors hover:bg-surface-muted disabled:opacity-60"
          >
            Agora não
          </button>
        </div>
      </div>
    </aside>
  );
}
