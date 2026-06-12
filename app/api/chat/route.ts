import { NextRequest, NextResponse } from "next/server";
import { parseCartBlocks } from "@/lib/cart-actions";
import {
  getOrCreateConversation,
  saveMessage,
} from "@/lib/conversations";
import { chatWithGroq } from "@/lib/groq";
import { logAudit } from "@/lib/orders";
import { GUEST_COOKIE, readGuestSessionId } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ChatMessage } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      message: string;
      history?: ChatMessage[];
      conversationId?: string | null;
    };

    const pergunta = body.message?.trim();
    if (!pergunta) {
      return NextResponse.json({ error: "Mensagem vazia" }, { status: 400 });
    }

    const guestSessionId =
      request.cookies.get(GUEST_COOKIE)?.value ??
      readGuestSessionId(request.headers.get("cookie"));

    let userId: string | null = null;
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id ?? null;
    } catch {
      /* supabase not configured */
    }

    const conversationId = await getOrCreateConversation(
      body.conversationId,
      userId,
      guestSessionId
    );

    await saveMessage(conversationId, "user", pergunta);

    const { content: rawContent, model, latencyMs } = await chatWithGroq(
      pergunta,
      body.history ?? []
    );

    const { text, actions } = parseCartBlocks(rawContent);

    await saveMessage(conversationId, "assistant", text || rawContent, {
      rawContent,
      cartActions: actions,
      model,
      latencyMs,
    });

    await logAudit(
      "chat_completed",
      "conversation",
      conversationId,
      { model, latencyMs },
      userId,
      guestSessionId
    );

    return NextResponse.json({
      reply: text || "Pronto! Atualizei seu carrinho.",
      cartActions: actions,
      conversationId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
