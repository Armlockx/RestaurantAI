"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  Home,
  LayoutGrid,
  ShoppingCart,
  User,
} from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { cn } from "@/lib/utils";

type NavLink = {
  href: string;
  label: string;
  icon: typeof Home;
  isActive: (pathname: string) => boolean;
};

const NAV_LINKS: NavLink[] = [
  {
    href: "/",
    label: "Home",
    icon: Home,
    isActive: (pathname) => pathname === "/",
  },
  {
    href: "/categorias",
    label: "Categorias",
    icon: LayoutGrid,
    isActive: (pathname) => pathname.startsWith("/categorias"),
  },
  {
    href: "/orders",
    label: "Pedidos",
    icon: ClipboardList,
    isActive: (pathname) => pathname.startsWith("/orders"),
  },
  {
    href: "/perfil",
    label: "Perfil",
    icon: User,
    isActive: (pathname) => pathname === "/perfil",
  },
];

function NavItem({ link, pathname }: { link: NavLink; pathname: string }) {
  const active = link.isActive(pathname);
  const Icon = link.icon;

  return (
    <Link
      href={link.href}
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-1 text-[10px] font-medium transition-colors",
        active ? "text-brand" : "text-text-muted hover:text-text"
      )}
      aria-current={active ? "page" : undefined}
    >
      <Icon
        className={cn("size-5 shrink-0", active && "stroke-[2.5]")}
        aria-hidden
      />
      <span className="truncate">{link.label}</span>
    </Link>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const { setCartOpen, totalItems, cartOpen } = useCart();

  const [home, categorias, pedidos, perfil] = NAV_LINKS;

  return (
    <nav
      className="fixed inset-x-4 bottom-4 z-40 pb-safe-bottom md:hidden"
      aria-label="Navegação principal"
    >
      <div className="mx-auto flex max-w-lg items-end justify-between gap-1 rounded-nav border border-border bg-surface/95 px-2 py-2 shadow-lg backdrop-blur-md">
        <NavItem link={home} pathname={pathname} />
        <NavItem link={categorias} pathname={pathname} />

        <div className="flex flex-1 justify-center px-1">
          <button
            type="button"
            onClick={() => setCartOpen(!cartOpen)}
            className={cn(
              "relative -mt-6 flex size-14 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-lg transition-transform active:scale-95",
              cartOpen && "ring-2 ring-brand/30 ring-offset-2"
            )}
            aria-label={cartOpen ? "Fechar carrinho" : "Abrir carrinho"}
            aria-pressed={cartOpen}
          >
            <ShoppingCart className="size-6" aria-hidden />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold leading-5 text-white">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </button>
        </div>

        <NavItem link={pedidos} pathname={pathname} />
        <NavItem link={perfil} pathname={pathname} />
      </div>
    </nav>
  );
}
