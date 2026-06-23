import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { MenuCategory } from "@/lib/types";
import { getCategoryIcon } from "@/lib/category-icons";

type CategoriesGridProps = {
  categories: MenuCategory[];
};

export function CategoriesGrid({ categories }: CategoriesGridProps) {
  if (categories.length === 0) {
    return (
      <p className="text-sm text-text-muted">
        Nenhuma categoria disponível no momento.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {categories.map((category) => {
        const Icon = getCategoryIcon(category.id);

        return (
          <Link
            key={category.id}
            href={`/categorias/${category.id}`}
            className="group flex flex-col items-center rounded-card border border-border bg-surface px-4 py-5 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md"
          >
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-surface-muted text-text transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
              <Icon className="size-5" aria-hidden />
            </div>
            <h2 className="text-sm font-bold text-text">{category.nome}</h2>
            <p className="mt-1 text-xs text-text-muted">
              {category.count} {category.count === 1 ? "item" : "itens"}
            </p>
          </Link>
        );
      })}
    </div>
  );
}

type CategoryBreadcrumbProps = {
  categoryName: string;
};

export function CategoryBreadcrumb({ categoryName }: CategoryBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-text-muted">
        <li>
          <Link
            href="/categorias"
            className="font-semibold transition-colors hover:text-text"
          >
            Categorias
          </Link>
        </li>
        <li aria-hidden className="text-text-muted">
          <ChevronRight className="size-3.5" />
        </li>
        <li className="font-semibold text-text" aria-current="page">
          {categoryName}
        </li>
      </ol>
    </nav>
  );
}
