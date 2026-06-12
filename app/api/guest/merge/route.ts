import { NextRequest, NextResponse } from "next/server";
import { GUEST_COOKIE } from "@/lib/auth";
import { mergeGuestToUser, logAudit } from "@/lib/orders";
import { hasAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    if (!hasAdminClient()) {
      return NextResponse.json({ merged: false, mode: "local" });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const guestSessionId = request.cookies.get(GUEST_COOKIE)?.value;
    if (!guestSessionId) {
      return NextResponse.json({ merged: false });
    }

    await mergeGuestToUser(guestSessionId, user.id);

    await logAudit(
      "guest_merged",
      "user",
      user.id,
      { guestSessionId },
      user.id
    );

    const response = NextResponse.json({ merged: true });
    response.cookies.set(GUEST_COOKIE, "", { maxAge: 0, path: "/" });
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
