import { createAdminClient, hasAdminClient } from "./supabase/admin";
import { createClient } from "./supabase/server";
import type { Profile, UserRole } from "./types";
import { GUEST_COOKIE } from "./constants";

export { GUEST_COOKIE };

export async function getProfile(userId: string): Promise<Profile | null> {
  if (!hasAdminClient()) {
    return { id: userId, nome: null, telefone: null, role: "customer" };
  }

  const supabase = createAdminClient()!;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  return (data as Profile) ?? null;
}

export async function getCurrentUserProfile(): Promise<Profile | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    return getProfile(user.id);
  } catch {
    return null;
  }
}

export async function isStaffOrAdmin(userId: string): Promise<boolean> {
  const profile = await getProfile(userId);
  return profile?.role === "staff" || profile?.role === "admin";
}

export async function upsertProfile(
  userId: string,
  data: { nome?: string; telefone?: string; role?: UserRole }
): Promise<void> {
  if (!hasAdminClient()) return;

  const supabase = createAdminClient()!;
  await supabase.from("profiles").upsert({
    id: userId,
    ...data,
  });
}

export function readGuestSessionId(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${GUEST_COOKIE}=([^;]+)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}
