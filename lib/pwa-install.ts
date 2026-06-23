const INSTALL_BANNER_DISMISSED_KEY = "restaurantai-pwa-install-dismissed";

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function isPwaInstalled(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function isPwaInstallSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "serviceWorker" in navigator;
}

export function isIosSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) && !(window as Window & { MSStream?: unknown }).MSStream;
}

export function isInstallBannerDismissed(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(INSTALL_BANNER_DISMISSED_KEY) === "1";
}

export function dismissInstallBanner(): void {
  localStorage.setItem(INSTALL_BANNER_DISMISSED_KEY, "1");
}

export function shouldShowIosInstallHint(): boolean {
  return isIosSafari() && !isPwaInstalled();
}

export function shouldShowInstallPrompt(deferredPrompt: BeforeInstallPromptEvent | null): boolean {
  if (!isPwaInstallSupported() || isPwaInstalled() || isInstallBannerDismissed()) {
    return false;
  }
  if (isIosSafari()) return shouldShowIosInstallHint();
  return deferredPrompt !== null;
}
