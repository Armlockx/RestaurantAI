"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
  type RefObject,
} from "react";
import type { CartAction, ChatMessage } from "@/lib/types";
import { useCart } from "@/components/CartProvider";
import { showToast } from "@/components/ToastContainer";

const CHAT_STORAGE_KEY = "groqtest-chat-v1";

export type ChatDisplayMessage = {
  role: "user" | "assistant";
  text: string;
  loading?: boolean;
};

type StoredChat = {
  messages: ChatDisplayMessage[];
  history: ChatMessage[];
  conversationId: string | null;
};

type ChatContextValue = {
  open: boolean;
  setOpen: (value: boolean) => void;
  toggleOpen: () => void;
  input: string;
  setInput: (value: string) => void;
  loading: boolean;
  messages: ChatDisplayMessage[];
  submit: (event: FormEvent) => Promise<void>;
  messagesRef: RefObject<HTMLDivElement | null>;
};

const ChatContext = createContext<ChatContextValue | null>(null);

function loadStoredChat(): StoredChat | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredChat;
  } catch {
    return null;
  }
}

function persistChat(data: StoredChat) {
  try {
    sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore quota errors */
  }
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const { applyCartActions, openCart, setCheckoutOpen } = useCart();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [messages, setMessages] = useState<ChatDisplayMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = loadStoredChat();
    if (stored) {
      setMessages(stored.messages.filter((message) => !message.loading));
      setHistory(stored.history);
      setConversationId(stored.conversationId);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    persistChat({
      messages: messages.filter((message) => !message.loading),
      history,
      conversationId,
    });
  }, [messages, history, conversationId, hydrated]);

  const scrollDown = useCallback(() => {
    requestAnimationFrame(() => {
      if (messagesRef.current) {
        messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
      }
    });
  }, []);

  const toggleOpen = useCallback(() => {
    setOpen((current) => !current);
  }, []);

  const submit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      const pergunta = input.trim();
      if (!pergunta || loading) return;

      setInput("");
      setMessages((current) => [
        ...current,
        { role: "user", text: pergunta },
        { role: "assistant", text: "", loading: true },
      ]);
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
        setMessages((current) => {
          const copy = [...current];
          const last = copy[copy.length - 1];
          if (last?.loading) {
            copy[copy.length - 1] = { role: "assistant", text: reply };
          }
          return copy;
        });

        setHistory((current) => [
          ...current,
          { role: "user", content: pergunta },
          { role: "assistant", content: reply },
        ]);

        if (data.cartActions?.length) {
          applyCartActions(data.cartActions);
          const hasCheckout = data.cartActions.some(
            (action) =>
              action.acao === "checkout" ||
              action.acao === "finalizar" ||
              action.acao === "abrir_carrinho"
          );
          if (data.cartActions.some((action) => action.acao === "adicionar")) {
            showToast("Itens adicionados ao carrinho");
          }
          if (hasCheckout) {
            openCart();
            if (
              data.cartActions.some(
                (action) =>
                  action.acao === "checkout" || action.acao === "finalizar"
              )
            ) {
              setCheckoutOpen(true);
            }
          }
        }
      } catch (error) {
        const msg =
          error instanceof Error ? error.message : "Erro ao consultar a IA";
        setMessages((current) => {
          const copy = [...current];
          copy[copy.length - 1] = { role: "assistant", text: msg };
          return copy;
        });
      } finally {
        setLoading(false);
        scrollDown();
      }
    },
    [
      input,
      loading,
      history,
      conversationId,
      applyCartActions,
      openCart,
      setCheckoutOpen,
      scrollDown,
    ]
  );

  const value = useMemo<ChatContextValue>(
    () => ({
      open,
      setOpen,
      toggleOpen,
      input,
      setInput,
      loading,
      messages,
      submit,
      messagesRef,
    }),
    [open, toggleOpen, input, loading, messages, submit]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
}
