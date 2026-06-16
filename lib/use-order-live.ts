"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { showToast } from "@/components/ToastContainer";
import { ORDER_STATUS_LABELS } from "@/lib/order-labels";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Order, OrderStatus } from "@/lib/types";

const POLL_MS = 15_000;

export function notifyOrderStatusChange(
  orderId: string,
  prev: OrderStatus,
  next: OrderStatus
) {
  if (prev === next) return;
  const label = ORDER_STATUS_LABELS[next] ?? next;
  showToast(`Pedido #${orderId.slice(0, 8)}: ${label}`);
}

export async function fetchOrderById(orderId: string): Promise<Order | null> {
  const res = await fetch(`/api/orders/${orderId}`);
  if (!res.ok) return null;
  const data = (await res.json()) as { order?: Order };
  return data.order ?? null;
}

export async function fetchMyOrders(): Promise<Order[]> {
  const res = await fetch("/api/orders");
  if (!res.ok) return [];
  const data = (await res.json()) as { orders?: Order[] };
  return data.orders ?? [];
}

/** Live status for a single order: Realtime when logged in, polling for guests. */
export function useOrderStatusLive(
  orderId: string,
  initialStatus: OrderStatus,
  isLoggedIn: boolean,
  options?: { notify?: boolean }
) {
  const notify = options?.notify !== false;
  const [status, setStatus] = useState<OrderStatus>(initialStatus);
  const hydratedRef = useRef(false);
  const statusRef = useRef<OrderStatus>(initialStatus);

  useEffect(() => {
    hydratedRef.current = false;
    statusRef.current = initialStatus;
    setStatus(initialStatus);
  }, [orderId, initialStatus]);

  const applyStatus = useCallback(
    (next: OrderStatus) => {
      const prev = statusRef.current;
      if (hydratedRef.current && notify && prev !== next) {
        notifyOrderStatusChange(orderId, prev, next);
      }
      statusRef.current = next;
      setStatus(next);
    },
    [orderId, notify]
  );

  useEffect(() => {
    if (!orderId || !isSupabaseConfigured()) return;

    let cancelled = false;

    const syncOnce = async () => {
      const order = await fetchOrderById(orderId);
      if (cancelled || !order) return;
      applyStatus(order.status);
      hydratedRef.current = true;
    };

    void syncOnce();

    if (isLoggedIn) {
      const supabase = createClient();
      const channel = supabase
        .channel(`order-status-${orderId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "orders",
            filter: `id=eq.${orderId}`,
          },
          (payload) => {
            const newStatus = (payload.new as { status?: OrderStatus }).status;
            if (newStatus) {
              hydratedRef.current = true;
              applyStatus(newStatus);
            }
          }
        )
        .subscribe();

      return () => {
        cancelled = true;
        supabase.removeChannel(channel);
      };
    }

    const interval = setInterval(() => {
      void syncOnce();
    }, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [orderId, isLoggedIn, applyStatus]);

  return status;
}

/** Keeps order list in sync; toasts when any order status changes. */
export function useOrdersListLive(initialOrders: Order[], isLoggedIn: boolean) {
  const [orders, setOrders] = useState(initialOrders);
  const ordersRef = useRef(initialOrders);

  useEffect(() => {
    ordersRef.current = initialOrders;
    setOrders(initialOrders);
  }, [initialOrders]);

  const mergeList = useCallback((next: Order[]) => {
    const prev = ordersRef.current;
    const prevById = new Map(prev.map((o) => [o.id, o.status]));
    for (const o of next) {
      const oldStatus = prevById.get(o.id);
      if (oldStatus !== undefined && oldStatus !== o.status) {
        notifyOrderStatusChange(o.id, oldStatus, o.status);
      }
    }
    ordersRef.current = next;
    setOrders(next);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let cancelled = false;

    const refresh = async () => {
      const list = await fetchMyOrders();
      if (!cancelled) mergeList(list);
    };

    if (isLoggedIn) {
      const supabase = createClient();
      const channel = supabase
        .channel("my-orders-list")
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "orders" },
          () => {
            void refresh();
          }
        )
        .subscribe();

      return () => {
        cancelled = true;
        supabase.removeChannel(channel);
      };
    }

    const interval = setInterval(() => {
      void refresh();
    }, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isLoggedIn, mergeList]);

  return orders;
}

/** Detect Supabase session on the client (e.g. checkout tracker). */
export function useIsLoggedIn(): boolean {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();

    const sync = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setLoggedIn(Boolean(session?.user));
    };

    void sync();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(Boolean(session?.user));
    });

    return () => subscription.unsubscribe();
  }, []);

  return loggedIn;
}
