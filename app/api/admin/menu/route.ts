import { NextRequest, NextResponse } from "next/server";
import { isStaffOrAdmin } from "@/lib/auth";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !(await isStaffOrAdmin(user.id))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json()) as {
      id: string;
      nome?: string;
      descricao?: string;
      preco_centavos?: number;
      ativo?: boolean;
    };

    if (!hasAdminClient()) {
      return NextResponse.json({ updated: true, mode: "local" });
    }

    const admin = createAdminClient()!;
    const { error } = await admin
      .from("menu_items")
      .update({
        nome: body.nome,
        descricao: body.descricao,
        preco_centavos: body.preco_centavos,
        ativo: body.ativo,
      })
      .eq("id", body.id);

    if (error) throw new Error(error.message);
    return NextResponse.json({ updated: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
