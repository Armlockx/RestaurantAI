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
      <div className="mx-auto max-w-5xl">
        <p className="mb-4 rounded-button bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Modo demo (sem Supabase)
        </p>
        {children}
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

  return <div className="mx-auto max-w-5xl">{children}</div>;
}
