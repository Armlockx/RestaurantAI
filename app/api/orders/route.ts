import { NextRequest, NextResponse } from "next/server";
import { GUEST_COOKIE } from "@/lib/auth";
import { getMenuItems } from "@/lib/menu";
import {
  createOrder,
  getAllOrders,
  getOrdersForUser,
  logAudit,
} from "@/lib/orders";
import { isStaffOrAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const all = request.nextUrl.searchParams.get("all") === "1";
    const guestSessionId = request.cookies.get(GUEST_COOKIE)?.value ?? null;
    let userId: string | null = null;

    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id ?? null;

      if (all && userId && (await isStaffOrAdmin(userId))) {
        const orders = await getAllOrders();
        return NextResponse.json({ orders });
      }
    } catch {
      if (all && process.env.DEMO_ADMIN === "true") {
        const orders = await getAllOrders();
        return NextResponse.json({ orders });
      }
    }

    const orders = await getOrdersForUser(userId, guestSessionId);
    return NextResponse.json({ orders });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      clienteNome: string;
      clienteTelefone: string;
      entregaTipo: string;
      endereco?: string;
      pagamento: string;
      observacoes?: string;
      items: {
        menuItemId: string;
        quantidade: number;
      }[];
    };

    if (!body.clienteNome?.trim() || !body.clienteTelefone?.trim()) {
      return NextResponse.json(
        { error: "Nome e telefone são obrigatórios" },
        { status: 400 }
      );
    }

    if (!body.items?.length) {
      return NextResponse.json({ error: "Carrinho vazio" }, { status: 400 });
    }

    const menu = await getMenuItems();
    const menuMap = new Map(menu.map((m) => [m.id, m]));

    const validatedItems = [];
    for (const item of body.items) {
      const menuItem = menuMap.get(item.menuItemId);
      if (!menuItem) {
        return NextResponse.json(
          { error: `Item inválido: ${item.menuItemId}` },
          { status: 400 }
        );
      }
      const qtd = Math.max(1, item.quantidade || 1);
      validatedItems.push({
        menuItemId: menuItem.id,
        nome: menuItem.nome,
        precoCentavos: menuItem.preco_centavos,
        quantidade: qtd,
      });
    }

    const guestSessionId = request.cookies.get(GUEST_COOKIE)?.value ?? null;
    let userId: string | null = null;

    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id ?? null;
    } catch {
      /* not configured */
    }

    const order = await createOrder({
      userId,
      guestSessionId,
      clienteNome: body.clienteNome.trim(),
      clienteTelefone: body.clienteTelefone.trim(),
      entregaTipo: body.entregaTipo,
      endereco: body.endereco ?? null,
      pagamento: body.pagamento,
      observacoes: body.observacoes ?? null,
      items: validatedItems,
    });

    await logAudit(
      "order_created",
      "order",
      order.id,
      { total: order.total_centavos },
      userId,
      guestSessionId
    );

    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
