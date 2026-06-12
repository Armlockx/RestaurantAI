"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/client";

interface Props {
  orderId: string;
  onClose: () => void;
  labels: Record<string, string>;
}

export function OrderStatusTracker({ orderId, onClose, labels }: Props) {
  const [status, setStatus] = useState("pending");

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          const newStatus = (payload.new as { status?: string }).status;
          if (newStatus) setStatus(newStatus);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  if (!isSupabaseConfigured()) return null;

  return (
    <div className="order-tracker">
      <p>
        Pedido <strong>{orderId.slice(0, 8)}</strong> — Status:{" "}
        <strong>{labels[status] ?? status}</strong>
      </p>
      <button type="button" className="order-tracker-close" onClick={onClose}>
        Fechar
      </button>
    </div>
  );
}
