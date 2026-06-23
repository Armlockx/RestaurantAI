import Link from "next/link";
import type { MenuCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

type CategoryChipsProps = {
  categories: MenuCategory[];
  className?: string;
};

export function CategoryChips({ categories, className }: CategoryChipsProps) {
  if (categories.length === 0) return null;

  return (
    <nav aria-label="Categorias do cardápio" className={cn("mb-8", className)}>
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-text-muted">
        Categorias
      </h2>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 snap-x snap-mandatory scroll-px-1">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categorias/${category.id}`}
            className="inline-flex shrink-0 snap-start items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-text shadow-sm transition-colors hover:border-neutral-300 hover:bg-surface-muted"
          >
            {category.nome}
            <span className="text-xs font-medium text-text-muted">
              {category.count}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
