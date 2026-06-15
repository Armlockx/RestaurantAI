"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LoginForm } from "@/components/LoginForm";
import { createClient } from "@/lib/supabase/client";
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

export function SiteHeaderClient({
  configured,
  demoAdmin,
  initialEmail,
  initialRole,
  isStaff: initialIsStaff,
}: SiteHeaderClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(initialEmail);
  const [role, setRole] = useState<UserRole | null>(initialRole);
  const [isStaff, setIsStaff] = useState(initialIsStaff);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [flash, setFlash] = useState("");

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

  const logout = async () => {
    if (!configured) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    setEmail(null);
    setRole(null);
    setIsStaff(false);
    setMenuOpen(false);
    setAuthOpen(false);
    window.location.href = "/";
  };

  const mergeGuest = async () => {
    await fetch("/api/guest/merge", { method: "POST" });
    setFlash("Histórico de convidado vinculado à sua conta.");
    setAuthOpen(false);
  };

  const navLink = (href: string, label: string) => {
    const active = pathname === href || pathname.startsWith(`${href}/`);
    return (
      <Link
        href={href}
        className={active ? "site-header__nav-link site-header__nav-link--active" : "site-header__nav-link"}
        onClick={() => setMenuOpen(false)}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <div className="site-header__brand-row">
          <Link href="/" className="site-header__brand" onClick={() => setMenuOpen(false)}>
            RestaurantAI
          </Link>
          <button
            type="button"
            className="site-header__menu-toggle"
            aria-expanded={menuOpen}
            aria-label="Menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            ☰
          </button>
        </div>

        <nav className={menuOpen ? "site-header__nav site-header__nav--open" : "site-header__nav"}>
          {navLink("/", "Cardápio")}
          {configured && !demoAdmin && navLink("/orders", "Meus pedidos")}
          {isStaff && (
            <>
              {navLink("/admin/orders", "Pedidos")}
              {navLink("/admin/conversations", "Conversas")}
              {navLink("/admin/menu", "Cardápio admin")}
            </>
          )}
        </nav>

        <div className="site-header__user">
          {!configured && (
            <span className="site-header__hint">Modo local (sem Supabase)</span>
          )}

          {configured && demoAdmin && (
            <span className="site-header__badge site-header__badge--admin">Demo admin</span>
          )}

          {configured && !demoAdmin && loggedIn && (
            <div className="site-header__session">
              <div className="site-header__session-info">
                <span className="site-header__email" title={email ?? undefined}>
                  {email}
                </span>
                {role && (
                  <span className={`site-header__badge site-header__badge--${role}`}>
                    {ROLE_LABELS[role]}
                  </span>
                )}
              </div>
              <div className="site-header__session-actions">
                <button type="button" className="site-header__btn site-header__btn--ghost" onClick={mergeGuest}>
                  Vincular convidado
                </button>
                <button type="button" className="site-header__btn" onClick={logout}>
                  Sair
                </button>
              </div>
            </div>
          )}

          {configured && !demoAdmin && !loggedIn && (
            <div className="site-header__auth">
              <button
                type="button"
                className="site-header__btn site-header__btn--primary"
                onClick={() => setAuthOpen((v) => !v)}
              >
                Entrar
              </button>
              {authOpen && (
                <div className="site-header__auth-panel">
                  <p className="site-header__auth-title">Entrar na conta</p>
                  <LoginForm compact onSuccess={() => setAuthOpen(false)} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {(flash || adminDenied) && (
        <div className={`site-header__flash ${adminDenied ? "site-header__flash--error" : ""}`}>
          {flash}
          <button type="button" className="site-header__flash-close" onClick={() => setFlash("")} aria-label="Fechar">
            ×
          </button>
        </div>
      )}
    </header>
  );
}
