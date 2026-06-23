"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CategoryChips } from "@/components/home/CategoryChips";
import { HomeHero } from "@/components/home/HomeHero";
import { MenuSection } from "@/components/home/MenuSection";
import { getMenuCategories, groupMenuItemsByCategory } from "@/lib/menu";
import type { MenuItem } from "@/lib/types";

const FEATURED_CATEGORY_IDS = ["entrada", "principal", "bebida"] as const;

export function HomeClient({ menuItems }: { menuItems: MenuItem[] }) {
  const categories = getMenuCategories(menuItems);
  const grouped = groupMenuItemsByCategory(menuItems);

  const featuredSections = FEATURED_CATEGORY_IDS.map((categoryId) => {
    const category = categories.find((entry) => entry.id === categoryId);
    const items = grouped.get(categoryId) ?? [];
    if (!category || items.length === 0) return null;
    return { category, items };
  }).filter(Boolean);

  return (
    <>
      <HomeHero />
      <CategoryChips categories={categories} />

      {featuredSections.map((section) =>
        section ? (
          <MenuSection
            key={section.category.id}
            category={section.category}
            items={section.items}
          />
        ) : null
      )}

      <div className="mb-6 flex justify-center">
        <Link
          href="/categorias"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-text shadow-sm transition-colors hover:bg-surface-muted"
        >
          Ver cardápio completo
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>

      <p className="mx-auto mb-6 max-w-3xl text-center text-xs text-text-muted">
        Valores, ingredientes e porções são fictícios para demonstração.
      </p>
    </>
  );
}
