import { FALLBACK_MENU } from "./menu-data";
import { createAdminClient, hasAdminClient } from "./supabase/admin";
import type { MenuItem } from "./types";

export async function getMenuItems(): Promise<MenuItem[]> {
  if (!hasAdminClient()) {
    return FALLBACK_MENU;
  }

  const supabase = createAdminClient()!;
  const { data, error } = await supabase
    .from("menu_items")
    .select("*, menu_categories(nome, ordem)")
    .eq("ativo", true)
    .order("nome");

  if (error || !data?.length) {
    return FALLBACK_MENU;
  }

  return data as MenuItem[];
}

export async function getMenuItemBySlug(slug: string): Promise<MenuItem | null> {
  const items = await getMenuItems();
  return items.find((i) => i.slug === slug || i.id === slug) ?? null;
}
