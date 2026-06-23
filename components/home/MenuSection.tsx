import Link from "next/link";
import { MenuGrid } from "@/components/MenuGrid";
import type { MenuCategory, MenuItem } from "@/lib/types";

type MenuSectionProps = {
  category: MenuCategory;
  items: MenuItem[];
};

export function MenuSection({ category, items }: MenuSectionProps) {
  return (
    <section className="mb-8" aria-labelledby={`section-${category.id}`}>
      <div className="mb-3 flex items-end justify-between gap-3">
        <h2
          id={`section-${category.id}`}
          className="text-lg font-bold tracking-tight text-text"
        >
          {category.nome}
        </h2>
        <Link
          href={`/categorias/${category.id}`}
          className="shrink-0 text-sm font-semibold text-text-muted transition-colors hover:text-text"
        >
          Ver todos
        </Link>
      </div>
      <MenuGrid
        items={items}
        variant="carousel"
        aria-label={`Pratos de ${category.nome}`}
      />
    </section>
  );
}
