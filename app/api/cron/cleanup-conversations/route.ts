import { NextRequest, NextResponse } from "next/server";
import { cleanupOldMessages } from "@/lib/conversations";

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deleted = await cleanupOldMessages(90);
  return NextResponse.json({ deleted });
}
