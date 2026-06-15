import { cookies } from "next/headers";
import Link from "next/link";
import { MyOrdersClient } from "@/components/MyOrdersClient";
import { GUEST_COOKIE } from "@/lib/auth";
import { getOrdersForUser } from "@/lib/orders";
import { createClient } from "@/lib/supabase/server";

export default async function MyOrdersPage() {
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

  const orders = await getOrdersForUser(userId, guestSessionId);

  return (
    <div className="my-orders-page">
      <h1>Meus pedidos</h1>
      <p className="hint">
        Acompanhe o status dos seus pedidos.{" "}
        {!userId && guestSessionId && (
          <>
            <Link href="/auth/login">Entre na sua conta</Link> para vincular pedidos de convidado.
          </>
        )}
      </p>
      <MyOrdersClient initialOrders={orders} />
    </div>
  );
}
