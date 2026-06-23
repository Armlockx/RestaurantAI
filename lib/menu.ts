import { cache } from "react";
import { FALLBACK_MENU, MENU_CATEGORIES } from "./menu-data";
import { createAdminClient, hasAdminClient } from "./supabase/admin";
import type { MenuCategory, MenuItem } from "./types";

const CATEGORY_ORDER = new Map(
  MENU_CATEGORIES.map((category) => [category.id, category.ordem])
);
const CATEGORY_NAMES = new Map(
  MENU_CATEGORIES.map((category) => [category.id, category.nome])
);

export const getMenuItems = cache(async (): Promise<MenuItem[]> => {
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
});

export function getMenuCategories(items: MenuItem[]): MenuCategory[] {
  const map = new Map<string, MenuCategory>();

  for (const item of items) {
    const existing = map.get(item.category_id);
    if (existing) {
      existing.count += 1;
      continue;
    }
    map.set(item.category_id, {
      id: item.category_id,
      nome:
        item.menu_categories?.nome ??
        CATEGORY_NAMES.get(item.category_id) ??
        item.category_id,
      ordem:
        CATEGORY_ORDER.get(item.category_id) ??
        item.menu_categories?.ordem ??
        999,
      count: 1,
    });
  }

  return Array.from(map.values()).sort(
    (a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome, "pt-BR")
  );
}

export function groupMenuItemsByCategory(
  items: MenuItem[]
): Map<string, MenuItem[]> {
  const grouped = new Map<string, MenuItem[]>();

  for (const item of items) {
    const list = grouped.get(item.category_id);
    if (list) {
      list.push(item);
    } else {
      grouped.set(item.category_id, [item]);
    }
  }

  return grouped;
}

export function getMenuCategoryBySlug(
  items: MenuItem[],
  slug: string
): MenuCategory | null {
  return getMenuCategories(items).find((category) => category.id === slug) ?? null;
}

export function getMenuItemsByCategory(
  items: MenuItem[],
  categoryId: string
): MenuItem[] {
  return items.filter((item) => item.category_id === categoryId);
}

export async function getMenuItemBySlug(slug: string): Promise<MenuItem | null> {
  const items = await getMenuItems();
  return items.find((i) => i.slug === slug || i.id === slug) ?? null;
}
