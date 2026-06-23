"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  Bell,
  BellOff,
  CheckCircle2,
  ClipboardList,
  LogOut,
  MessageSquare,
  Shield,
  User,
  UserPlus,
  UtensilsCrossed,
} from "lucide-react";
import { LoginForm } from "@/components/LoginForm";
import { ProfileInstallSection } from "@/components/profile/ProfileInstallSection";
import {
  getBrowserNotificationPermission,
  isBrowserNotificationSupported,
  requestBrowserNotificationPermission,
} from "@/lib/browser-notifications";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/types";

type ProfileClientProps = {
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
      return "bg-red-100 text-red-800";
    case "staff":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-neutral-100 text-neutral-700";
  }
}

function ProfileSection({
  title,
  description,
  children,
  icon: Icon,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  icon: typeof User;
}) {
  return (
    <section className="rounded-card border border-border bg-surface p-4 shadow-sm">
      <div className="mb-3 flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-muted text-text">
          <Icon className="size-4" aria-hidden />
        </div>
        <div>
          <h2 className="text-sm font-bold text-text">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-xs text-text-muted">{description}</p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}

export function ProfileClient({
  configured,
  demoAdmin,
  initialEmail,
  initialRole,
  isStaff: initialIsStaff,
}: ProfileClientProps) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [role, setRole] = useState<UserRole | null>(initialRole);
  const [isStaff, setIsStaff] = useState(initialIsStaff);
  const [flash, setFlash] = useState("");
  const [notifyPermission, setNotifyPermission] = useState<
    NotificationPermission | "unsupported"
  >("unsupported");
  const [notifyRequesting, setNotifyRequesting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loggedIn = Boolean(email);

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
    setActionLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setEmail(null);
      setRole(null);
      setIsStaff(false);
      window.location.href = "/";
    } finally {
      setActionLoading(false);
    }
  };

  const mergeGuest = async () => {
    setActionLoading(true);
    try {
      await fetch("/api/guest/merge", { method: "POST" });
      setFlash("Histórico de convidado vinculado à sua conta.");
      router.refresh();
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-4 pb-4">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-text">Perfil</h1>
        <p className="mt-1 text-sm text-text-muted">
          Conta, preferências e atalhos do app.
        </p>
      </div>

      {flash && (
        <div className="flex items-start justify-between gap-3 rounded-card border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <span>{flash}</span>
          <button
            type="button"
            className="shrink-0 text-amber-800 underline"
            onClick={() => setFlash("")}
          >
            Fechar
          </button>
        </div>
      )}

      {!configured && (
        <ProfileSection
          title="Modo local"
          description="Supabase não configurado neste ambiente."
          icon={User}
        >
          <p className="text-sm text-text-muted">
            Login e sincronização de conta não estão disponíveis no modo local.
          </p>
        </ProfileSection>
      )}

      {configured && demoAdmin && (
        <ProfileSection title="Conta demo" icon={Shield}>
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-brand text-brand-foreground">
              <User className="size-6" aria-hidden />
            </div>
            <div>
              <p className="font-semibold text-text">demo@local</p>
              <span className="mt-1 inline-flex rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-800">
                Demo admin
              </span>
            </div>
          </div>
        </ProfileSection>
      )}

      {configured && !demoAdmin && !loggedIn && (
        <ProfileSection
          title="Entrar na conta"
          description="Acesse pedidos, vincule histórico de convidado e receba alertas."
          icon={User}
        >
          <LoginForm onSuccess={() => router.refresh()} />
        </ProfileSection>
      )}

      {configured && !demoAdmin && loggedIn && (
        <ProfileSection title="Minha conta" icon={User}>
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-brand text-brand-foreground">
              <User className="size-6" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-text" title={email ?? undefined}>
                {email}
              </p>
              {role && (
                <span
                  className={cn(
                    "mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                    roleBadgeClass(role)
                  )}
                >
                  {ROLE_LABELS[role]}
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => void mergeGuest()}
              disabled={actionLoading}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-button border border-border bg-surface px-3 py-2.5 text-sm font-semibold text-text transition-colors hover:bg-surface-muted disabled:opacity-60"
            >
              <UserPlus className="size-4" aria-hidden />
              Vincular convidado
            </button>
            <button
              type="button"
              onClick={() => void logout()}
              disabled={actionLoading}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-button border border-border bg-surface px-3 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-60"
            >
              <LogOut className="size-4" aria-hidden />
              Sair
            </button>
          </div>
        </ProfileSection>
      )}

      <ProfileSection
        title="Atalhos"
        description="Acesso rápido às áreas principais."
        icon={ClipboardList}
      >
        <Link
          href="/orders"
          className="flex items-center justify-between rounded-button border border-border px-3 py-3 text-sm font-semibold text-text transition-colors hover:bg-surface-muted"
        >
          Meus pedidos
          <ClipboardList className="size-4 text-text-muted" aria-hidden />
        </Link>
      </ProfileSection>

      {configured && isBrowserNotificationSupported() && (
        <ProfileSection
          title="Notificações"
          description="Alertas quando o status do pedido mudar."
          icon={Bell}
        >
          {notifyPermission === "granted" && (
            <div className="flex items-center gap-2 rounded-button bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-800">
              <CheckCircle2 className="size-4 shrink-0" aria-hidden />
              Notificações ativadas neste navegador.
            </div>
          )}

          {notifyPermission === "denied" && (
            <div className="flex items-start gap-2 rounded-button bg-red-50 px-3 py-2.5 text-sm text-red-800">
              <BellOff className="mt-0.5 size-4 shrink-0" aria-hidden />
              Notificações bloqueadas. Libere nas configurações do navegador para
              receber alertas.
            </div>
          )}

          {notifyPermission === "default" && (
            <button
              type="button"
              onClick={() => void enableBrowserNotifications()}
              disabled={notifyRequesting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-button bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-neutral-800 disabled:opacity-60"
            >
              <Bell className="size-4" aria-hidden />
              {notifyRequesting ? "Aguardando…" : "Ativar notificações"}
            </button>
          )}
        </ProfileSection>
      )}

      {isStaff && (
        <ProfileSection
          title="Administração"
          description="Ferramentas para staff e administradores."
          icon={Shield}
        >
          <div className="flex flex-col gap-2">
            <Link
              href="/admin/orders"
              className="flex items-center justify-between rounded-button border border-border px-3 py-3 text-sm font-semibold text-text transition-colors hover:bg-surface-muted"
            >
              Pedidos admin
              <ClipboardList className="size-4 text-text-muted" aria-hidden />
            </Link>
            <Link
              href="/admin/conversations"
              className="flex items-center justify-between rounded-button border border-border px-3 py-3 text-sm font-semibold text-text transition-colors hover:bg-surface-muted"
            >
              Conversas
              <MessageSquare className="size-4 text-text-muted" aria-hidden />
            </Link>
            <Link
              href="/admin/menu"
              className="flex items-center justify-between rounded-button border border-border px-3 py-3 text-sm font-semibold text-text transition-colors hover:bg-surface-muted"
            >
              Cardápio admin
              <UtensilsCrossed className="size-4 text-text-muted" aria-hidden />
            </Link>
          </div>
        </ProfileSection>
      )}

      <ProfileInstallSection />
    </div>
  );
}
