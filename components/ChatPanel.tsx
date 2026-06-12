"use client";

import { FormEvent, useRef, useState } from "react";
import Image from "next/image";
import type { CartAction, ChatMessage } from "@/lib/types";
import { useCart } from "./CartProvider";
import { showToast } from "./ToastContainer";

function formatMessage(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

export function ChatPanel() {
  const { applyCartActions, openCart, setCheckoutOpen } = useCart();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; text: string; loading?: boolean }[]
  >([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  const scrollDown = () => {
    requestAnimationFrame(() => {
      if (messagesRef.current) {
        messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
      }
    });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const pergunta = input.trim();
    if (!pergunta || loading) return;

    setInput("");
    setMessages((m) => [...m, { role: "user", text: pergunta }]);
    setMessages((m) => [...m, { role: "assistant", text: "", loading: true }]);
    setLoading(true);
    scrollDown();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: pergunta,
          history,
          conversationId,
        }),
      });
      const data = (await res.json()) as {
        reply?: string;
        cartActions?: CartAction[];
        conversationId?: string;
        error?: string;
      };

      if (!res.ok) throw new Error(data.error ?? "Erro na IA");

      if (data.conversationId) setConversationId(data.conversationId);

      const reply = data.reply ?? "";
      setMessages((m) => {
        const copy = [...m];
        const last = copy[copy.length - 1];
        if (last?.loading) {
          copy[copy.length - 1] = { role: "assistant", text: reply };
        }
        return copy;
      });

      setHistory((h) => [
        ...h,
        { role: "user", content: pergunta },
        { role: "assistant", content: reply },
      ]);

      if (data.cartActions?.length) {
        applyCartActions(data.cartActions);
        const hasCheckout = data.cartActions.some(
          (a) =>
            a.acao === "checkout" ||
            a.acao === "finalizar" ||
            a.acao === "abrir_carrinho"
        );
        if (data.cartActions.some((a) => a.acao === "adicionar")) {
          showToast("Itens adicionados ao carrinho");
        }
        if (hasCheckout) {
          openCart();
          if (
            data.cartActions.some(
              (a) => a.acao === "checkout" || a.acao === "finalizar"
            )
          ) {
            setCheckoutOpen(true);
          }
        }
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Erro ao consultar a IA";
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "assistant", text: msg };
        return copy;
      });
    } finally {
      setLoading(false);
      scrollDown();
    }
  };

  return (
    <>
      <button
        type="button"
        className="chat-fab"
        onClick={() => setOpen(true)}
        aria-label="Abrir assistente do cardápio"
      >
        <Image
          src="/img/ai_icon.png"
          alt="Assistente IA"
          className="chat-fab-img"
          width={32}
          height={32}
        />
      </button>

      <aside
        className={`chat-panel${open ? " is-open" : ""}`}
        aria-hidden={!open}
      >
        <header className="chat-panel-header">
          <h2 className="chat-panel-title">Assistente do cardápio</h2>
          <button
            type="button"
            className="chat-panel-close"
            onClick={() => setOpen(false)}
            aria-label="Fechar"
          >
            ×
          </button>
        </header>
        <div className="chat-messages" ref={messagesRef}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`chat-msg ${msg.role}${msg.loading ? " loading" : ""}`}
            >
              <div
                className="chat-msg-bubble"
                dangerouslySetInnerHTML={{
                  __html: msg.loading
                    ? "Pensando..."
                    : formatMessage(msg.text),
                }}
              />
            </div>
          ))}
        </div>
        <form className="chat-form" onSubmit={submit}>
          <input
            type="text"
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte ou peça: ex. quero 2 bruschettas..."
            autoComplete="off"
          />
          <button
            type="submit"
            className="chat-send"
            disabled={loading}
            aria-label="Enviar"
          >
            Enviar
          </button>
        </form>
      </aside>
    </>
  );
}
