"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone, X } from "lucide-react";
import {
  dismissInstallBanner,
  isInstallBannerDismissed,
  isIosSafari,
  isPwaInstalled,
  isPwaInstallSupported,
  shouldShowIosInstallHint,
  type BeforeInstallPromptEvent,
} from "@/lib/pwa-install";
import { cn } from "@/lib/utils";

export function PwaInstallCard() {
  const [visible, setVisible] = useState(false);
  const [entered, setEntered] = useState(false);
  const [iosHint, setIosHint] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (!isPwaInstallSupported() || isPwaInstalled() || isInstallBannerDismissed()) {
      return;
    }

    if (shouldShowIosInstallHint()) {
      setIosHint(true);
      setVisible(true);
      requestAnimationFrame(() => setEntered(true));
      return;
    }

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
      requestAnimationFrame(() => setEntered(true));
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  const dismiss = () => {
    dismissInstallBanner();
    setVisible(false);
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
      setVisible(false);
    } finally {
      setInstalling(false);
      setDeferredPrompt(null);
    }
  };

  if (!visible) return null;

  return (
    <aside
      role="region"
      aria-label="Instalar aplicativo"
      className={cn(
        "fixed inset-x-4 z-50 max-w-sm transition-all duration-300 md:inset-x-auto md:right-6 md:left-auto",
        "bottom-[calc(var(--spacing-bottom-nav)+var(--spacing-safe-bottom)+0.75rem)] md:bottom-6",
        entered ? "translate-y-0 opacity-100 animate-chat-enter" : "translate-y-3 opacity-0"
      )}
    >
      <div className="relative overflow-hidden rounded-card border border-brand/20 bg-gradient-to-br from-surface to-surface-muted p-4 shadow-xl">
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface hover:text-text"
          aria-label="Fechar aviso de instalação"
        >
          <X className="size-4" aria-hidden />
        </button>

        <div className="mb-3 flex items-start gap-3 pr-8">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand text-brand-foreground">
            <Smartphone className="size-5" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-bold text-text">Instale o RestaurantAI</p>
            <p className="mt-0.5 text-xs leading-relaxed text-text-muted">
              {iosHint || isIosSafari()
                ? "Adicione à Tela de Início para uma experiência de app."
                : "Acesso rápido ao cardápio direto da tela inicial."}
            </p>
          </div>
        </div>

        {iosHint || isIosSafari() ? (
          <p className="text-xs leading-relaxed text-text-muted">
            Toque em <strong className="text-text">Compartilhar</strong> e depois em{" "}
            <strong className="text-text">Adicionar à Tela de Início</strong>.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {deferredPrompt ? (
              <button
                type="button"
                onClick={() => void install()}
                disabled={installing}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-button bg-brand px-3 py-2 text-sm font-semibold text-brand-foreground transition-colors hover:bg-neutral-800 disabled:opacity-60"
              >
                <Download className="size-4" aria-hidden />
                {installing ? "Aguardando…" : "Instalar app"}
              </button>
            ) : null}
            <button
              type="button"
              onClick={dismiss}
              disabled={installing}
              className="rounded-button border border-border bg-surface px-3 py-2 text-sm font-semibold text-text-muted transition-colors hover:bg-surface-muted disabled:opacity-60"
            >
              Agora não
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
