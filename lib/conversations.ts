import { createAdminClient, hasAdminClient } from "./supabase/admin";
import { randomUUID } from "crypto";

const memoryConversations = new Map<
  string,
  { id: string; user_id: string | null; guest_session_id: string | null }
>();
const memoryMessages: {
  conversation_id: string;
  role: string;
  content: string;
  raw_content?: string;
  cart_actions?: unknown;
  model?: string;
  latency_ms?: number;
}[] = [];

export async function getOrCreateConversation(
  conversationId: string | null | undefined,
  userId: string | null,
  guestSessionId: string | null
): Promise<string> {
  if (conversationId) return conversationId;

  if (!hasAdminClient()) {
    const id = randomUUID();
    memoryConversations.set(id, {
      id,
      user_id: userId,
      guest_session_id: guestSessionId,
    });
    return id;
  }

  const supabase = createAdminClient()!;
  const { data, error } = await supabase
    .from("conversations")
    .insert({
      user_id: userId,
      guest_session_id: guestSessionId,
    })
    .select("id")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Erro na conversa");
  return data.id as string;
}

export async function saveMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string,
  opts?: {
    rawContent?: string;
    cartActions?: unknown[];
    model?: string;
    latencyMs?: number;
  }
): Promise<void> {
  if (!hasAdminClient()) {
    memoryMessages.push({
      conversation_id: conversationId,
      role,
      content,
      raw_content: opts?.rawContent,
      cart_actions: opts?.cartActions,
      model: opts?.model,
      latency_ms: opts?.latencyMs,
    });
    return;
  }

  const supabase = createAdminClient()!;
  await supabase.from("conversation_messages").insert({
    conversation_id: conversationId,
    role,
    content,
    raw_content: opts?.rawContent ?? content,
    cart_actions: opts?.cartActions ?? null,
    model: opts?.model ?? null,
    latency_ms: opts?.latencyMs ?? null,
  });
}

export async function getAllConversations() {
  if (!hasAdminClient()) {
    return Array.from(memoryConversations.values()).map((c) => ({
      ...c,
      started_at: new Date().toISOString(),
    }));
  }

  const supabase = createAdminClient()!;
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(100);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getConversationMessages(conversationId: string) {
  if (!hasAdminClient()) {
    return memoryMessages.filter((m) => m.conversation_id === conversationId);
  }

  const supabase = createAdminClient()!;
  const { data, error } = await supabase
    .from("conversation_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function cleanupOldMessages(days = 90): Promise<number> {
  if (!hasAdminClient()) {
    const before = memoryMessages.length;
    const cutoff = Date.now() - days * 86400000;
    void cutoff;
    memoryMessages.length = 0;
    return before;
  }

  const supabase = createAdminClient()!;
  const cutoffDate = new Date(Date.now() - days * 86400000).toISOString();
  const { data, error } = await supabase
    .from("conversation_messages")
    .delete()
    .lt("created_at", cutoffDate)
    .select("id");

  if (error) throw new Error(error.message);
  return data?.length ?? 0;
}
