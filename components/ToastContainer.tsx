"use client";

import { useEffect, useState } from "react";

export function ToastContainer() {
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      const id = Date.now();
      setToasts((t) => [...t, { id, msg: detail }]);
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, 2800);
    };
    window.addEventListener("groqtest:toast", handler);
    return () => window.removeEventListener("groqtest:toast", handler);
  }, []);

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="toast is-visible">
          {t.msg}
        </div>
      ))}
    </div>
  );
}

export function showToast(msg: string) {
  window.dispatchEvent(new CustomEvent("groqtest:toast", { detail: msg }));
}
