"use client";

import { FormEvent } from "react";
import { Send, Sparkles, X } from "lucide-react";
import { useChat } from "@/components/chat/ChatProvider";
import { cn } from "@/lib/utils";

function formatMessage(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

export function ChatPanel() {
  const {
    open,
    setOpen,
    input,
    setInput,
    loading,
    messages,
    submit,
    messagesRef,
  } = useChat();

  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-[60] bg-black/20 md:bg-transparent md:pointer-events-none"
          onClick={() => setOpen(false)}
          aria-label="Fechar assistente"
        />
      )}

      <aside
        className={cn(
          "fixed z-[60] flex max-h-[min(70vh,calc(100dvh-8rem))] flex-col overflow-hidden rounded-card border border-border bg-surface shadow-xl transition-all duration-200",
          "inset-x-4 bottom-20 md:inset-x-auto md:bottom-24 md:right-6 md:left-auto md:w-[380px] md:max-h-[70vh]",
          open
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-2 scale-[0.96] opacity-0"
        )}
        aria-hidden={!open}
        aria-label="Assistente do cardápio"
      >
        <header className="flex items-center justify-between bg-brand/90 px-4 py-3.5 text-brand-foreground">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4" aria-hidden />
            <h2 className="m-0 text-base font-semibold">Assistente do cardápio</h2>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex size-8 items-center justify-center rounded-full transition-colors hover:bg-white/15"
            aria-label="Fechar assistente"
          >
            <X className="size-5" aria-hidden />
          </button>
        </header>

        <div
          ref={messagesRef}
          className="min-h-[200px] max-h-[400px] flex-1 overflow-y-auto bg-surface-muted p-3"
        >
          {messages.length === 0 ? (
            <p className="m-0 px-2 py-8 text-center text-sm text-text-muted">
              Pergunte sobre o cardápio ou peça para montar seu pedido.
            </p>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "mb-2.5 max-w-[90%]",
                  message.role === "user" ? "ml-auto" : "mr-auto"
                )}
              >
                <div
                  className={cn(
                    "rounded-xl px-3.5 py-2.5 text-sm leading-relaxed",
                    message.role === "user"
                      ? "rounded-br-sm bg-brand/90 text-brand-foreground"
                      : "rounded-bl-sm border border-border bg-surface text-text",
                    message.loading && "italic text-text-muted"
                  )}
                  dangerouslySetInnerHTML={{
                    __html: message.loading
                      ? "Pensando..."
                      : formatMessage(message.text),
                  }}
                />
              </div>
            ))
          )}
        </div>

        <form
          className="flex gap-2 border-t border-border bg-surface p-3"
          onSubmit={(event: FormEvent) => void submit(event)}
        >
          <input
            type="text"
            className="flex-1 rounded-button border border-border px-3 py-2.5 text-sm outline-none focus:border-brand"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Pergunte ou peça: ex. quero 2 bruschettas..."
            autoComplete="off"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1 rounded-button bg-brand px-3.5 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
            aria-label="Enviar mensagem"
          >
            <Send className="size-4" aria-hidden />
            <span className="hidden sm:inline">Enviar</span>
          </button>
        </form>
      </aside>
    </>
  );
}
