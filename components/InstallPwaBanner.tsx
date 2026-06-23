"use client";

import { useEffect, useState } from "react";
import {
  dismissInstallBanner,
  isInstallBannerDismissed,
  isIosSafari,
  isPwaInstalled,
  isPwaInstallSupported,
  shouldShowIosInstallHint,
  type BeforeInstallPromptEvent,
} from "@/lib/pwa-install";

export function InstallPwaBanner() {
  const [visible, setVisible] = useState(false);
  const [iosHint, setIosHint] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (!isPwaInstallSupported() || isPwaInstalled() || isInstallBannerDismissed()) return;

    if (shouldShowIosInstallHint()) {
      setIosHint(true);
      setVisible(true);
      return;
    }

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  const hide = () => setVisible(false);

  const dismiss = () => {
    dismissInstallBanner();
    hide();
  };

  const install = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        dismissInstallBanner();
      }
      hide();
    } finally {
      setInstalling(false);
      setDeferredPrompt(null);
    }
  };

  if (!visible) return null;

  return (
    <div
      className="notify-banner install-banner"
      role="region"
      aria-label="Instalar aplicativo"
    >
      <p className="notify-banner__text">
        {iosHint || isIosSafari()
          ? "Para uma experiência de app, toque em Compartilhar e depois em Adicionar à Tela de Início."
          : "Instale o RestaurantAI no seu dispositivo para acesso rápido ao cardápio."}
      </p>
      <div className="notify-banner__actions">
        {!iosHint && deferredPrompt ? (
          <button
            type="button"
            className="notify-banner__btn notify-banner__btn--primary"
            onClick={() => void install()}
            disabled={installing}
          >
            {installing ? "Aguardando…" : "Instalar app"}
          </button>
        ) : null}
        <button
          type="button"
          className="notify-banner__btn"
          onClick={dismiss}
          disabled={installing}
        >
          Agora não
        </button>
      </div>
    </div>
  );
}
