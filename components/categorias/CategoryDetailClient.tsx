"use client";

import { MenuGrid } from "@/components/MenuGrid";
import { CategoryBreadcrumb } from "@/components/categorias/CategoriesGrid";
import { getCategoryIcon } from "@/lib/category-icons";
import type { MenuCategory, MenuItem } from "@/lib/types";

type CategoryDetailClientProps = {
  category: MenuCategory;
  items: MenuItem[];
};

export function CategoryDetailClient({
  category,
  items,
}: CategoryDetailClientProps) {
  const Icon = getCategoryIcon(category.id);

  return (
    <div>
      <CategoryBreadcrumb categoryName={category.nome} />

      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-full bg-brand text-brand-foreground">
          <Icon className="size-5" aria-hidden />
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-text">
            {category.nome}
          </h1>
          <p className="text-sm text-text-muted">
            {category.count} {category.count === 1 ? "item" : "itens"} nesta
            categoria
          </p>
        </div>
      </div>

      <div className="md:hidden">
        <MenuGrid
          items={items}
          variant="list"
          aria-label={`Itens de ${category.nome}`}
        />
      </div>

      <div className="hidden md:block">
        <MenuGrid
          items={items}
          variant="grid"
          aria-label={`Itens de ${category.nome}`}
        />
      </div>
    </div>
  );
}
