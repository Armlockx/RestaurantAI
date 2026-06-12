import { NextRequest, NextResponse } from "next/server";
import { isStaffOrAdmin } from "@/lib/auth";
import { logAudit, updateOrderStatus } from "@/lib/orders";
import { hasAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/types";

const VALID_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "delivered",
  "cancelled",
];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { status: OrderStatus };

    if (!VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 });
    }

    const demoAdmin = process.env.DEMO_ADMIN === "true" && !hasAdminClient();
    let userId: string | null = null;

    if (!demoAdmin) {
      try {
        const supabase = await createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        userId = user?.id ?? null;
      } catch {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }

      if (!userId || !(await isStaffOrAdmin(userId))) {
        return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
      }
    }

    const order = await updateOrderStatus(id, body.status);

    await logAudit(
      "order_status_updated",
      "order",
      id,
      { status: body.status },
      userId
    );

    return NextResponse.json({ order });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
