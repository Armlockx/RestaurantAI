import { NextRequest, NextResponse } from "next/server";
import { isStaffOrAdmin } from "@/lib/auth";
import { getConversationMessages } from "@/lib/conversations";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !(await isStaffOrAdmin(user.id))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const messages = await getConversationMessages(id);
    return NextResponse.json({ messages });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
