"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  user_id: string | null;
  guest_session_id: string | null;
  started_at?: string;
}

interface Message {
  role: string;
  content: string;
  cart_actions?: unknown;
  created_at?: string;
}

export function AdminConversationsClient({
  conversations,
  initialConversationId,
  initialMessages,
}: {
  conversations: Conversation[];
  initialConversationId: string | null;
  initialMessages: Message[];
}) {
  const [selectedId, setSelectedId] = useState(initialConversationId);
  const [messages, setMessages] = useState(initialMessages);

  const loadMessages = async (id: string) => {
    setSelectedId(id);
    const res = await fetch(`/api/admin/conversations/${id}`);
    const data = (await res.json()) as { messages: Message[] };
    setMessages(data.messages ?? []);
  };

  return (
    <div className="grid gap-4 md:grid-cols-[280px_1fr]">
      <ul className="m-0 list-none p-0">
        {conversations.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              className={cn(
                "mb-1 w-full rounded-button border px-3 py-2 text-left text-sm transition-colors",
                selectedId === c.id
                  ? "border-brand bg-brand text-brand-foreground"
                  : "border-border bg-surface text-text hover:bg-surface-muted"
              )}
              onClick={() => loadMessages(c.id)}
            >
              {c.id.slice(0, 8)} —{" "}
              {c.started_at
                ? new Date(c.started_at).toLocaleString("pt-BR")
                : "—"}
            </button>
          </li>
        ))}
      </ul>
      <div className="max-h-[70vh] overflow-y-auto rounded-card border border-border p-3">
        {messages.length === 0 && (
          <p className="m-0 text-sm text-text-muted">Selecione uma conversa.</p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "mb-3 rounded-button p-2 text-sm",
              m.role === "user" ? "bg-surface-muted" : "bg-neutral-100"
            )}
          >
            <strong className="block text-xs uppercase tracking-wide text-text-muted">
              {m.role}
            </strong>
            <p className="m-0 mt-1 leading-relaxed text-text">{m.content}</p>
            {m.cart_actions != null && (
              <pre className="mt-2 overflow-x-auto rounded bg-surface p-2 text-[11px]">
                {JSON.stringify(m.cart_actions, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
