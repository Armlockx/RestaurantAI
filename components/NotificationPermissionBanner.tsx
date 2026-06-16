"use client";

import { useEffect, useState } from "react";
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

export function NotificationPermissionBanner() {
  const { orders, isReady } = useOrdersLive();
  const [visible, setVisible] = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (!isBrowserNotificationSupported()) return;
    if (getBrowserNotificationPermission() !== "default") return;
    if (isNotifyBannerDismissed()) return;
    if (!isReady) return;

    const afterOrder = hasNotifyPromptAfterOrder();
    if (afterOrder || orders.length > 0) {
      setVisible(true);
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
    <div className="notify-banner" role="region" aria-label="Ativar notificações do navegador">
      <p className="notify-banner__text">
        Receba alertas quando o status do pedido mudar com a aba em segundo plano.
      </p>
      <div className="notify-banner__actions">
        <button
          type="button"
          className="notify-banner__btn notify-banner__btn--primary"
          onClick={() => void enable()}
          disabled={requesting}
        >
          {requesting ? "Aguardando…" : "Ativar notificações"}
        </button>
        <button
          type="button"
          className="notify-banner__btn"
          onClick={dismiss}
          disabled={requesting}
        >
          Agora não
        </button>
      </div>
    </div>
  );
}
