"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone } from "lucide-react";
import {
  isIosSafari,
  isPwaInstalled,
  isPwaInstallSupported,
  type BeforeInstallPromptEvent,
} from "@/lib/pwa-install";
import { cn } from "@/lib/utils";

export function ProfileInstallSection() {
  const [installed, setInstalled] = useState(false);
  const [supported, setSupported] = useState(false);
  const [iosHint, setIosHint] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    setInstalled(isPwaInstalled());
    setSupported(isPwaInstallSupported());
    setIosHint(isIosSafari() && !isPwaInstalled());

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setInstalled(true);
      }
      setDeferredPrompt(null);
    } finally {
      setInstalling(false);
    }
  };

  if (!supported) return null;

  return (
    <section className="rounded-card border border-border bg-surface p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-full bg-surface-muted text-text">
          <Smartphone className="size-4" aria-hidden />
        </div>
        <div>
          <h2 className="text-sm font-bold text-text">Instalar app</h2>
          <p className="text-xs text-text-muted">
            Acesso rápido ao cardápio na tela inicial
          </p>
        </div>
      </div>

      {installed ? (
        <p className="rounded-button bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
          RestaurantAI já está instalado neste dispositivo.
        </p>
      ) : iosHint || isIosSafari() ? (
        <p className="text-sm leading-relaxed text-text-muted">
          Toque em <strong className="text-text">Compartilhar</strong> no Safari e
          depois em <strong className="text-text">Adicionar à Tela de Início</strong>.
        </p>
      ) : (
        <>
          <p className="mb-3 text-sm leading-relaxed text-text-muted">
            Instale o RestaurantAI para abrir o cardápio como um app nativo, com
            ícone na tela inicial.
          </p>
          <button
            type="button"
            onClick={() => void install()}
            disabled={!deferredPrompt || installing}
            className={cn(
              "inline-flex w-full items-center justify-center gap-2 rounded-button px-4 py-2.5 text-sm font-semibold transition-colors",
              deferredPrompt
                ? "bg-brand text-brand-foreground hover:bg-neutral-800"
                : "cursor-not-allowed bg-surface-muted text-text-muted"
            )}
          >
            <Download className="size-4" aria-hidden />
            {installing
              ? "Aguardando confirmação…"
              : deferredPrompt
                ? "Instalar RestaurantAI"
                : "Instalação disponível em breve neste navegador"}
          </button>
        </>
      )}
    </section>
  );
}
