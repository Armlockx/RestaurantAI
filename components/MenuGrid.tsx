"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import type { MenuItem } from "@/lib/types";
import { formatPreco } from "@/lib/menu-data";
import { cn } from "@/lib/utils";
import { useCart } from "./CartProvider";
import { showToast } from "./ToastContainer";

type MenuGridVariant = "grid" | "carousel" | "list";

type MenuGridProps = {
  items: MenuItem[];
  variant?: MenuGridVariant;
  className?: string;
  "aria-label"?: string;
};

function useAddToCart() {
  const { addItem } = useCart();

  return (item: MenuItem) => {
    addItem(item, 1);
    showToast(`${item.nome} adicionado ao carrinho`);
  };
}

function MenuItemGridCard({ item }: { item: MenuItem }) {
  const addToCart = useAddToCart();

  return (
    <article className="overflow-hidden rounded-card border border-border bg-surface transition-all hover:-translate-y-1 hover:border-neutral-300 hover:shadow-lg">
      <div className="aspect-video overflow-hidden bg-surface-muted">
        <Image
          src={item.imagem_url}
          alt={item.nome}
          width={400}
          height={225}
          loading="lazy"
          className="size-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <div className="flex flex-col gap-1.5 p-4">
        <span className="text-[11px] font-bold uppercase tracking-wide text-text-muted">
          {item.menu_categories?.nome ?? item.category_id}
        </span>
        <h3 className="text-[17px] font-bold leading-tight text-text">
          {item.nome}
        </h3>
        <p className="line-clamp-2 text-sm leading-snug text-text-muted">
          {item.descricao}
        </p>
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="mt-2 flex items-center justify-between gap-2">
          {item.porcao ? (
            <span className="text-xs text-text-muted">{item.porcao}</span>
          ) : (
            <span />
          )}
          <strong className="text-base font-bold text-text">
            {formatPreco(item.preco_centavos)}
          </strong>
        </div>
        <button
          type="button"
          className="mt-1 w-full rounded-button bg-brand px-3 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-neutral-800"
          onClick={() => addToCart(item)}
        >
          Adicionar
        </button>
      </div>
    </article>
  );
}

function MenuItemCarouselCard({ item }: { item: MenuItem }) {
  const addToCart = useAddToCart();

  return (
    <article className="flex w-[240px] shrink-0 snap-start flex-col overflow-hidden rounded-card border border-border bg-surface shadow-sm md:w-auto">
      <div className="aspect-[4/3] overflow-hidden bg-surface-muted">
        <Image
          src={item.imagem_url}
          alt={item.nome}
          width={320}
          height={240}
          loading="lazy"
          className="size-full object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-text">
          {item.nome}
        </h3>
        <p className="line-clamp-2 text-xs leading-snug text-text-muted">
          {item.descricao}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <strong className="text-sm font-bold text-text">
            {formatPreco(item.preco_centavos)}
          </strong>
          <button
            type="button"
            className="rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-brand-foreground transition-colors hover:bg-neutral-800"
            onClick={() => addToCart(item)}
          >
            Adicionar
          </button>
        </div>
      </div>
    </article>
  );
}

function MenuItemListRow({ item }: { item: MenuItem }) {
  const addToCart = useAddToCart();

  return (
    <article className="flex items-center gap-3 rounded-card border border-border bg-surface p-2.5">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
        <Image
          src={item.imagem_url}
          alt={item.nome}
          width={64}
          height={64}
          loading="lazy"
          className="size-full object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-bold text-text">{item.nome}</h3>
        <p className="truncate text-xs text-text-muted">{item.descricao}</p>
        <strong className="mt-0.5 block text-sm font-bold text-text">
          {formatPreco(item.preco_centavos)}
        </strong>
      </div>
      <button
        type="button"
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand text-brand-foreground transition-colors hover:bg-neutral-800"
        onClick={() => addToCart(item)}
        aria-label={`Adicionar ${item.nome} ao carrinho`}
      >
        <Plus className="size-4" aria-hidden />
      </button>
    </article>
  );
}

export function MenuGrid({
  items,
  variant = "grid",
  className,
  "aria-label": ariaLabel = "Cardápio do restaurante",
}: MenuGridProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-text-muted">Nenhum item disponível nesta seção.</p>
    );
  }

  if (variant === "carousel") {
    return (
      <section aria-label={ariaLabel}>
        <div
          className={cn(
            "-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 snap-x snap-mandatory scroll-px-1",
            "md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:pb-0 lg:grid-cols-3",
            className
          )}
        >
          {items.map((item) => (
            <MenuItemCarouselCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    );
  }

  if (variant === "list") {
    return (
      <section
        className={cn("flex flex-col gap-2", className)}
        aria-label={ariaLabel}
      >
        {items.map((item) => (
          <MenuItemListRow key={item.id} item={item} />
        ))}
      </section>
    );
  }

  return (
    <section
      className={cn(
        "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
      aria-label={ariaLabel}
    >
      {items.map((item) => (
        <MenuItemGridCard key={item.id} item={item} />
      ))}
    </section>
  );
}
