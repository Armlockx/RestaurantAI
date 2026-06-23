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
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-xl font-extrabold tracking-tight text-text">Meus pedidos</h1>
      <p className="mb-6 text-sm text-text-muted">
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
