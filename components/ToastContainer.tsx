"use client";

import { useEffect, useState } from "react";

let toastSeq = 0;

export function ToastContainer() {
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      const id = ++toastSeq;
      setToasts((t) => [...t, { id, msg: detail }]);
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, 2800);
    };
    window.addEventListener("groqtest:toast", handler);
    return () => window.removeEventListener("groqtest:toast", handler);
  }, []);

  return (
    <div
      className="pointer-events-none fixed right-4 top-4 z-[10001] flex flex-col gap-2"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="rounded-button bg-brand px-3.5 py-2.5 text-sm text-brand-foreground shadow-lg animate-chat-enter"
        >
          {t.msg}
        </div>
      ))}
    </div>
  );
}

export function showToast(msg: string) {
  window.dispatchEvent(new CustomEvent("groqtest:toast", { detail: msg }));
}
