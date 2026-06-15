import { createAdminClient, hasAdminClient } from "./supabase/admin";
import type { Order, OrderItem, OrderStatus } from "./types";
import { randomUUID } from "crypto";

/** In-memory fallback when Supabase is not configured (local dev). */
const memoryOrders = new Map<string, Order>();
const memoryOrderItems = new Map<string, OrderItem[]>();

export interface CreateOrderInput {
  userId?: string | null;
  guestSessionId?: string | null;
  clienteNome: string;
  clienteTelefone: string;
  entregaTipo: string;
  endereco?: string | null;
  pagamento: string;
  observacoes?: string | null;
  items: {
    menuItemId: string;
    nome: string;
    precoCentavos: number;
    quantidade: number;
  }[];
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const total = input.items.reduce(
    (acc, i) => acc + i.precoCentavos * i.quantidade,
    0
  );

  if (!hasAdminClient()) {
    const id = randomUUID();
    const order: Order = {
      id,
      user_id: input.userId ?? null,
      guest_session_id: input.guestSessionId ?? null,
      status: "pending",
      cliente_nome: input.clienteNome,
      cliente_telefone: input.clienteTelefone,
      entrega_tipo: input.entregaTipo,
      endereco: input.endereco ?? null,
      pagamento: input.pagamento,
      observacoes: input.observacoes ?? null,
      total_centavos: total,
      created_at: new Date().toISOString(),
    };
    const items: OrderItem[] = input.items.map((i) => ({
      id: randomUUID(),
      order_id: id,
      menu_item_id: i.menuItemId,
      nome_snapshot: i.nome,
      preco_snapshot_centavos: i.precoCentavos,
      quantidade: i.quantidade,
    }));
    memoryOrders.set(id, order);
    memoryOrderItems.set(id, items);
    return { ...order, order_items: items };
  }

  const supabase = createAdminClient()!;
  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      user_id: input.userId ?? null,
      guest_session_id: input.guestSessionId ?? null,
      status: "pending",
      cliente_nome: input.clienteNome,
      cliente_telefone: input.clienteTelefone,
      entrega_tipo: input.entregaTipo,
      endereco: input.endereco ?? null,
      pagamento: input.pagamento,
      observacoes: input.observacoes ?? null,
      total_centavos: total,
    })
    .select()
    .single();

  if (error || !order) throw new Error(error?.message ?? "Erro ao criar pedido");

  const orderItems = input.items.map((i) => ({
    order_id: order.id,
    menu_item_id: i.menuItemId,
    nome_snapshot: i.nome,
    preco_snapshot_centavos: i.precoCentavos,
    quantidade: i.quantidade,
  }));

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems)
    .select();

  if (itemsError) throw new Error(itemsError.message);

  return { ...(order as Order), order_items: items as OrderItem[] };
}

export async function getOrdersForUser(
  userId: string | null,
  guestSessionId: string | null
): Promise<Order[]> {
  if (!hasAdminClient()) {
    return Array.from(memoryOrders.values())
      .filter(
        (o) =>
          (userId && o.user_id === userId) ||
          (guestSessionId && o.guest_session_id === guestSessionId)
      )
      .map((o) => ({ ...o, order_items: memoryOrderItems.get(o.id) ?? [] }))
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }

  const supabase = createAdminClient()!;
  let query = supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  if (userId) {
    query = query.eq("user_id", userId);
  } else if (guestSessionId) {
    query = query.eq("guest_session_id", guestSessionId);
  } else {
    return [];
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Order[];
}

export async function getOrderForRequester(
  orderId: string,
  userId: string | null,
  guestSessionId: string | null
): Promise<Order | null> {
  if (!userId && !guestSessionId) return null;

  if (!hasAdminClient()) {
    const order = memoryOrders.get(orderId);
    if (!order) return null;
    const items = memoryOrderItems.get(orderId) ?? [];
    const allowed =
      (userId && order.user_id === userId) ||
      (guestSessionId && order.guest_session_id === guestSessionId);
    return allowed ? { ...order, order_items: items } : null;
  }

  const supabase = createAdminClient()!;
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !data) return null;

  const order = data as Order;
  const allowed =
    (userId && order.user_id === userId) ||
    (guestSessionId && order.guest_session_id === guestSessionId);

  return allowed ? order : null;
}

export async function getAllOrders(): Promise<Order[]> {
  if (!hasAdminClient()) {
    return Array.from(memoryOrders.values())
      .map((o) => ({ ...o, order_items: memoryOrderItems.get(o.id) ?? [] }))
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }

  const supabase = createAdminClient()!;
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Order[];
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<Order> {
  if (!hasAdminClient()) {
    const order = memoryOrders.get(orderId);
    if (!order) throw new Error("Pedido não encontrado");
    order.status = status;
    memoryOrders.set(orderId, order);
    return { ...order, order_items: memoryOrderItems.get(orderId) ?? [] };
  }

  const supabase = createAdminClient()!;
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .select("*, order_items(*)")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Erro ao atualizar");
  return data as Order;
}

export async function mergeGuestToUser(
  guestSessionId: string,
  userId: string
): Promise<void> {
  if (!hasAdminClient()) {
    for (const [id, order] of memoryOrders) {
      if (order.guest_session_id === guestSessionId) {
        memoryOrders.set(id, { ...order, user_id: userId, guest_session_id: null });
      }
    }
    return;
  }

  const supabase = createAdminClient()!;
  await supabase
    .from("orders")
    .update({ user_id: userId, guest_session_id: null })
    .eq("guest_session_id", guestSessionId);

  await supabase
    .from("conversations")
    .update({ user_id: userId, guest_session_id: null })
    .eq("guest_session_id", guestSessionId);
}

export async function logAudit(
  action: string,
  entityType: string,
  entityId: string | null,
  metadata: Record<string, unknown>,
  actorUserId?: string | null,
  guestSessionId?: string | null
): Promise<void> {
  if (!hasAdminClient()) return;

  const supabase = createAdminClient()!;
  await supabase.from("audit_logs").insert({
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata,
    actor_user_id: actorUserId ?? null,
    guest_session_id: guestSessionId ?? null,
  });
}
