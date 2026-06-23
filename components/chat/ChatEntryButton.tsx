"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { useChat } from "@/components/chat/ChatProvider";
import { cn } from "@/lib/utils";

const REVEAL_DELAY_MS = 3000;
const NEW_LABEL_DURATION_MS = 2000;

export function ChatEntryButton() {
  const pathname = usePathname();
  const { open, toggleOpen } = useChat();
  const [visible, setVisible] = useState(false);
  const [showNewLabel, setShowNewLabel] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    setVisible(false);
    setEntered(false);
    setShowNewLabel(false);

    let labelTimer: number | undefined;

    const revealTimer = window.setTimeout(() => {
      setVisible(true);
      setEntered(true);
      setShowNewLabel(true);

      labelTimer = window.setTimeout(() => {
        setShowNewLabel(false);
      }, NEW_LABEL_DURATION_MS);
    }, REVEAL_DELAY_MS);

    return () => {
      window.clearTimeout(revealTimer);
      if (labelTimer) window.clearTimeout(labelTimer);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed right-4 z-[55] bottom-[calc(var(--spacing-bottom-nav)+var(--spacing-safe-bottom)+0.5rem)] md:bottom-6",
        entered && "animate-chat-enter"
      )}
    >
      {showNewLabel && (
        <span className="absolute -top-7 right-0 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm animate-chat-badge">
          Novo
        </span>
      )}

      <button
        type="button"
        onClick={toggleOpen}
        className={cn(
          "relative flex size-14 items-center justify-center rounded-full bg-brand/90 text-brand-foreground shadow-lg transition-transform active:scale-95",
          !open && "animate-chat-pulse",
          open && "ring-2 ring-brand/30 ring-offset-2"
        )}
        aria-label={open ? "Fechar assistente do cardápio" : "Abrir assistente do cardápio"}
        aria-pressed={open}
      >
        <Sparkles className="size-6" aria-hidden />
      </button>
    </div>
  );
}
