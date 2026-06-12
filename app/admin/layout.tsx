import Link from "next/link";
import { redirect } from "next/navigation";
import { isStaffOrAdmin } from "@/lib/auth";
import { hasAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const demoAdmin = process.env.DEMO_ADMIN === "true" && !hasAdminClient();

  if (demoAdmin) {
    return (
      <div className="admin-shell">
        <nav className="admin-nav">
          <Link href="/admin/orders">Pedidos</Link>
          <Link href="/admin/conversations">Conversas</Link>
          <Link href="/admin/menu">Cardápio</Link>
          <Link href="/">← Voltar ao site</Link>
        </nav>
        <p className="admin-demo-banner">Modo demo (sem Supabase)</p>
        <main className="admin-main">{children}</main>
      </div>
    );
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/auth/login");
    }

    const allowed = await isStaffOrAdmin(user.id);
    if (!allowed) {
      redirect("/?error=admin");
    }
  } catch {
    redirect("/");
  }

  return (
    <div className="admin-shell">
      <nav className="admin-nav">
        <Link href="/admin/orders">Pedidos</Link>
        <Link href="/admin/conversations">Conversas</Link>
        <Link href="/admin/menu">Cardápio</Link>
        <Link href="/">← Voltar ao site</Link>
      </nav>
      <main className="admin-main">{children}</main>
    </div>
  );
}
