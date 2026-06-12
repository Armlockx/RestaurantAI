"use client";

import { useState } from "react";

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
    <div className="admin-split">
      <ul className="admin-list">
        {conversations.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              className={selectedId === c.id ? "active" : ""}
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
      <div className="admin-messages">
        {messages.map((m, i) => (
          <div key={i} className={`admin-msg admin-msg-${m.role}`}>
            <strong>{m.role}</strong>
            <p>{m.content}</p>
            {m.cart_actions != null && (
              <pre>{JSON.stringify(m.cart_actions, null, 2)}</pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
