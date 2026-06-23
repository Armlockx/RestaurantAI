import { ProfileClient } from "@/components/profile/ProfileClient";
import { getProfile } from "@/lib/auth";
import { hasAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types";

export default async function PerfilPage() {
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const demoAdmin = process.env.DEMO_ADMIN === "true" && !hasAdminClient();

  let email: string | null = null;
  let role: UserRole | null = null;
  let isStaff = demoAdmin;

  if (demoAdmin) {
    email = "demo@local";
    role = "admin";
  } else if (configured) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        email = user.email ?? null;
        const profile = await getProfile(user.id);
        role = profile?.role ?? "customer";
        isStaff = role === "staff" || role === "admin";
      }
    } catch {
      /* env or cookie issues — page still renders */
    }
  }

  return (
    <ProfileClient
      configured={configured}
      demoAdmin={demoAdmin}
      initialEmail={email}
      initialRole={role}
      isStaff={isStaff}
    />
  );
}
