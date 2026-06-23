import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { OrderDetailClient } from "@/components/OrderDetailClient";
import { GUEST_COOKIE } from "@/lib/auth";
import { getOrderForRequester } from "@/lib/orders";
import { createClient } from "@/lib/supabase/server";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const guestSessionId = cookieStore.get(GUEST_COOKIE)?.value ?? null;
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

  const order = await getOrderForRequester(id, userId, guestSessionId);
  if (!order) notFound();

  return <OrderDetailClient order={order} />;
}
