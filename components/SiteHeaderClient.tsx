"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, User, X } from "lucide-react";
import { LoginForm } from "@/components/LoginForm";
import {
  getBrowserNotificationPermission,
  isBrowserNotificationSupported,
  requestBrowserNotificationPermission,
} from "@/lib/browser-notifications";
import { FAVICON_URL } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/types";

type SiteHeaderClientProps = {
  configured: boolean;
  demoAdmin: boolean;
  initialEmail: string | null;
  initialRole: UserRole | null;
  isStaff: boolean;
};

const ROLE_LABELS: Record<UserRole, string> = {
  customer: "Cliente",
  staff: "Staff",
  admin: "Admin",
};

function roleBadgeClass(role: UserRole) {
  switch (role) {
    case "admin":
      return "bg-red-900 text-red-200";
    case "staff":
      return "bg-blue-900 text-blue-200";
    default:
      return "bg-neutral-700 text-neutral-300";
  }
}

function HeaderNavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        "rounded-md px-3 py-2 text-sm font-semibold transition-colors",
        active
          ? "bg-white/12 text-white"
          : "text-neutral-300 hover:bg-white/8 hover:text-white"
      )}
      aria-current={active ? "page" : undefined}
    >
      {label}
    </Link>
  );
}

export function SiteHeaderClient({
  configured,
  demoAdmin,
  initialEmail,
  initialRole,
  isStaff: initialIsStaff,
}: SiteHeaderClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(initialEmail);
  const [role, setRole] = useState<UserRole | null>(initialRole);
  const [isStaff, setIsStaff] = useState(initialIsStaff);
  const [authOpen, setAuthOpen] = useState(false);
  const [flash, setFlash] = useState("");
  const [notifyPermission, setNotifyPermission] = useState<
    NotificationPermission | "unsupported"
  >("unsupported");
  const [notifyRequesting, setNotifyRequesting] = useState(false);

  const loggedIn = Boolean(email);
  const adminDenied = searchParams.get("error") === "admin";

  useEffect(() => {
    setEmail(initialEmail);
    setRole(initialRole);
    setIsStaff(initialIsStaff);
  }, [initialEmail, initialRole, initialIsStaff]);

  useEffect(() => {
    if (!configured || demoAdmin) return;

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const userEmail = session?.user.email ?? null;
      setEmail(userEmail);
      if (!userEmail) {
        setRole(null);
        setIsStaff(false);
      }
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [configured, demoAdmin, router]);

  useEffect(() => {
    if (adminDenied) {
      setFlash("Sem permissão para acessar o painel admin.");
    }
  }, [adminDenied]);

  useEffect(() => {
    setNotifyPermission(getBrowserNotificationPermission());
  }, []);

  const enableBrowserNotifications = async () => {
    setNotifyRequesting(true);
    try {
      const permission = await requestBrowserNotificationPermission();
      setNotifyPermission(permission);
      if (permission === "granted") {
        setFlash("Notificações do navegador ativadas.");
      } else if (permission === "denied") {
        setFlash(
          "Notificações bloqueadas. Libere nas configurações do navegador."
        );
      }
    } finally {
      setNotifyRequesting(false);
    }
  };

  const logout = async () => {
    if (!configured) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    setEmail(null);
    setRole(null);
    setIsStaff(false);
    setAuthOpen(false);
    window.location.href = "/";
  };

  const mergeGuest = async () => {
    await fetch("/api/guest/merge", { method: "POST" });
    setFlash("Histórico de convidado vinculado à sua conta.");
    setAuthOpen(false);
  };

  return (
    <header className="sticky top-0 z-[10000] border-b border-neutral-800 bg-brand text-brand-foreground shadow-md">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-6">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 text-white no-underline"
        >
          <Image
            src={FAVICON_URL}
            alt="RestaurantAI"
            width={36}
            height={36}
            className="size-9 shrink-0 rounded-full border-2 border-white/25 object-cover"
            unoptimized
            priority
          />
          <span className="truncate text-lg font-extrabold tracking-tight">
            RestaurantAI
          </span>
        </Link>

        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Navegação principal"
        >
          <HeaderNavLink href="/" label="Cardápio" />
          <HeaderNavLink href="/categorias" label="Categorias" />
          {configured && !demoAdmin && (
            <HeaderNavLink href="/orders" label="Meus pedidos" />
          )}
          {isStaff && (
            <>
              <HeaderNavLink href="/admin/orders" label="Pedidos admin" />
              <HeaderNavLink href="/admin/conversations" label="Conversas" />
              <HeaderNavLink href="/admin/menu" label="Cardápio admin" />
            </>
          )}
        </nav>

        <div className="ml-auto hidden items-center gap-3 md:flex">
          {!configured && (
            <span className="text-xs text-neutral-400">Modo local (sem Supabase)</span>
          )}

          {configured &&
            isBrowserNotificationSupported() &&
            notifyPermission === "default" && (
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-md border border-neutral-700 bg-transparent px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-neutral-800"
                onClick={() => void enableBrowserNotifications()}
                disabled={notifyRequesting}
                title="Receber alertas quando o pedido mudar de status"
              >
                <Bell className="size-3.5" aria-hidden />
                {notifyRequesting ? "…" : "Alertas"}
              </button>
            )}

          {configured && demoAdmin && (
            <span className="rounded-full bg-red-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-200">
              Demo admin
            </span>
          )}

          {configured && !demoAdmin && loggedIn && (
            <div className="flex items-center gap-3">
              <div className="flex max-w-[220px] flex-col items-end gap-1">
                <span
                  className="truncate text-xs text-neutral-300"
                  title={email ?? undefined}
                >
                  {email}
                </span>
                {role && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                      roleBadgeClass(role)
                    )}
                  >
                    {ROLE_LABELS[role]}
                  </span>
                )}
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  className="rounded-md border border-neutral-700 bg-transparent px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-neutral-800"
                  onClick={mergeGuest}
                >
                  Vincular convidado
                </button>
                <button
                  type="button"
                  className="rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-neutral-700"
                  onClick={logout}
                >
                  Sair
                </button>
              </div>
            </div>
          )}

          {configured && !demoAdmin && !loggedIn && (
            <div className="relative">
              <button
                type="button"
                className="rounded-md border border-white bg-white px-3 py-2 text-xs font-semibold text-brand transition-colors hover:bg-neutral-100"
                onClick={() => setAuthOpen((open) => !open)}
              >
                Entrar
              </button>
              {authOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-[10001] w-[min(340px,calc(100vw-32px))] rounded-[10px] bg-white p-3.5 text-text shadow-xl">
                  <p className="mb-2.5 text-[13px] font-bold">Entrar na conta</p>
                  <LoginForm compact onSuccess={() => setAuthOpen(false)} />
                </div>
              )}
            </div>
          )}

          <Link
            href="/perfil"
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-700 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-neutral-800"
          >
            <User className="size-3.5" aria-hidden />
            Perfil
          </Link>
        </div>

        <Link
          href="/perfil"
          className="ml-auto inline-flex size-9 items-center justify-center rounded-full border border-neutral-700 text-white transition-colors hover:bg-neutral-800 md:hidden"
          aria-label="Ir para perfil"
        >
          <User className="size-5" aria-hidden />
        </Link>
      </div>

      {(flash || adminDenied) && (
        <div
          className={cn(
            "flex items-center justify-center gap-3 border-t px-6 py-2 text-[13px]",
            adminDenied
              ? "border-red-200 bg-red-100 text-red-800"
              : "border-amber-200 bg-amber-100 text-amber-900"
          )}
        >
          {flash}
          <button
            type="button"
            className="bg-transparent text-inherit"
            onClick={() => setFlash("")}
            aria-label="Fechar aviso"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      )}
    </header>
  );
}
