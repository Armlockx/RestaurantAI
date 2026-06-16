"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  fetchMyOrders,
  notifyOrderStatusChange,
} from "@/lib/use-order-live";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Order, OrderStatus } from "@/lib/types";

const POLL_MS = 15_000;

type OrdersLiveContextValue = {
  orders: Order[];
  isLoggedIn: boolean;
  isReady: boolean;
  refreshOrders: () => Promise<void>;
  getOrderStatus: (orderId: string) => OrderStatus | null;
};

const OrdersLiveContext = createContext<OrdersLiveContextValue | null>(null);

export function OrdersLiveProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const ordersRef = useRef<Order[]>([]);
  const hydratedRef = useRef(false);

  const mergeList = useCallback((next: Order[]) => {
    const prev = ordersRef.current;
    if (hydratedRef.current) {
      const prevById = new Map(prev.map((o) => [o.id, o.status]));
      for (const o of next) {
        const oldStatus = prevById.get(o.id);
        if (oldStatus !== undefined && oldStatus !== o.status) {
          notifyOrderStatusChange(o.id, oldStatus, o.status);
        }
      }
    }
    ordersRef.current = next;
    setOrders(next);
    hydratedRef.current = true;
    setIsReady(true);
  }, []);

  const refreshOrders = useCallback(async () => {
    const list = await fetchMyOrders();
    mergeList(list);
  }, [mergeList]);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setIsReady(true);
      return;
    }

    const supabase = createClient();

    const syncSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsLoggedIn(Boolean(session?.user));
    };

    void syncSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session?.user));
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let cancelled = false;

    const refresh = async () => {
      if (cancelled) return;
      await refreshOrders();
    };

    void refresh();

    if (isLoggedIn) {
      const supabase = createClient();
      const channel = supabase
        .channel("global-orders-live")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "orders" },
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
  }, [isLoggedIn, refreshOrders]);

  const getOrderStatus = useCallback((orderId: string): OrderStatus | null => {
    const order = ordersRef.current.find((o) => o.id === orderId);
    return order?.status ?? null;
  }, []);

  const value = useMemo(
    () => ({
      orders,
      isLoggedIn,
      isReady,
      refreshOrders,
      getOrderStatus,
    }),
    [orders, isLoggedIn, isReady, refreshOrders, getOrderStatus]
  );

  return (
    <OrdersLiveContext.Provider value={value}>{children}</OrdersLiveContext.Provider>
  );
}

export function useOrdersLive(): OrdersLiveContextValue {
  const ctx = useContext(OrdersLiveContext);
  if (!ctx) {
    throw new Error("useOrdersLive must be used within OrdersLiveProvider");
  }
  return ctx;
}
