"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type LoginFormProps = {
  compact?: boolean;
  onSuccess?: () => void;
};

type LoginTab = "password" | "otp";
type OtpStep = "send" | "verify";
type MessageKind = "info" | "success" | "error";

const inputClass =
  "rounded-button border border-border px-3 py-2 text-sm outline-none focus:border-brand";
const labelClass = "flex flex-col gap-1.5 text-xs font-semibold text-text";

export function LoginForm({ compact, onSuccess }: LoginFormProps) {
  const router = useRouter();
  const [tab, setTab] = useState<LoginTab>("password");
  const [otpStep, setOtpStep] = useState<OtpStep>("send");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [magicLinkOpen, setMagicLinkOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageKind, setMessageKind] = useState<MessageKind>("info");

  const setFeedback = (text: string, kind: MessageKind = "info") => {
    setMessage(text);
    setMessageKind(kind);
  };

  const finishLogin = () => {
    setFeedback("Login realizado com sucesso!", "success");
    router.refresh();
    onSuccess?.();
  };

  const loginWithPassword = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setFeedback(error.message, "error");
      return;
    }
    finishLogin();
  };

  const sendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });

    setLoading(false);
    if (error) {
      setFeedback(error.message, "error");
      return;
    }

    setOtpStep("verify");
    setOtpCode("");
    setFeedback(
      "Código enviado! Digite os 6 dígitos recebidos no e-mail (válido por alguns minutos).",
      "success"
    );
  };

  const verifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const token = otpCode.replace(/\D/g, "");
    if (token.length !== 6) {
      setLoading(false);
      setFeedback("Informe o código de 6 dígitos.", "error");
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    setLoading(false);
    if (error) {
      setFeedback(error.message, "error");
      return;
    }
    finishLogin();
  };

  const sendMagicLink = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setFeedback("Informe seu e-mail antes de solicitar o link.", "error");
      return;
    }

    setLoading(true);
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);
    if (error) {
      setFeedback(error.message, "error");
      return;
    }

    setFeedback(
      "Link enviado! Abra o e-mail neste dispositivo e clique no link para concluir o login.",
      "success"
    );
  };

  const switchTab = (next: LoginTab) => {
    setTab(next);
    setOtpStep("send");
    setOtpCode("");
    setMessage("");
  };

  const tabClass = (active: boolean) =>
    cn(
      "rounded-md px-2 py-2 text-[11px] font-semibold leading-tight transition-colors",
      active ? "bg-surface text-text shadow-sm" : "text-text-muted"
    );

  return (
    <div className={cn("flex flex-col gap-2.5", compact && "gap-2")}>
      <div
        className="grid grid-cols-2 gap-1 rounded-button bg-surface-muted p-1"
        role="tablist"
        aria-label="Formas de login"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "password"}
          className={tabClass(tab === "password")}
          onClick={() => switchTab("password")}
        >
          E-mail e senha
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "otp"}
          className={tabClass(tab === "otp")}
          onClick={() => switchTab("otp")}
        >
          Código por e-mail
        </button>
      </div>

      {tab === "password" && (
        <form onSubmit={loginWithPassword} className="flex flex-col gap-2.5">
          <p className="m-0 text-[11px] leading-snug text-text-muted">
            Use o e-mail e a senha da sua conta. Ideal para acesso frequente ao painel admin.
          </p>
          <label className={labelClass}>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoComplete="email"
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Senha
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              minLength={6}
              className={inputClass}
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="rounded-button bg-brand px-3 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-neutral-800 disabled:opacity-60"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
      )}

      {tab === "otp" && otpStep === "send" && (
        <form onSubmit={sendOtp} className="flex flex-col gap-2.5">
          <p className="m-0 text-[11px] leading-snug text-text-muted">
            Enviaremos um <strong>código de 6 dígitos</strong> para o seu e-mail. Digite o código aqui
            no site — sem precisar clicar em link.
          </p>
          <label className={labelClass}>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoComplete="email"
              className={inputClass}
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="rounded-button bg-brand px-3 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-neutral-800 disabled:opacity-60"
          >
            {loading ? "Enviando…" : "Enviar código"}
          </button>
        </form>
      )}

      {tab === "otp" && otpStep === "verify" && (
        <form onSubmit={verifyOtp} className="flex flex-col gap-2.5">
          <p className="m-0 text-[11px] leading-snug text-text-muted">
            Código enviado para <strong>{email}</strong>. Confira também a pasta de spam.
          </p>
          <label className={labelClass}>
            Código de 6 dígitos
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              required
              maxLength={6}
              pattern="\d{6}"
              className={inputClass}
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="rounded-button bg-brand px-3 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-neutral-800 disabled:opacity-60"
          >
            {loading ? "Verificando…" : "Confirmar código"}
          </button>
          <button
            type="button"
            className="bg-transparent p-0 text-left text-[11px] text-text-muted underline"
            onClick={() => {
              setOtpStep("send");
              setOtpCode("");
              setMessage("");
            }}
          >
            Usar outro e-mail
          </button>
        </form>
      )}

      <div className="mt-1 border-t border-border pt-2.5">
        <button
          type="button"
          className="w-full bg-transparent p-0 text-left text-[11px] text-text-muted transition-colors hover:text-text"
          aria-expanded={magicLinkOpen}
          onClick={() => setMagicLinkOpen((v) => !v)}
        >
          {magicLinkOpen ? "▾" : "▸"} Entrar com link no e-mail (alternativa)
        </button>

        {magicLinkOpen && (
          <div className="mt-2 flex flex-col gap-2">
            <p className="m-0 text-[11px] leading-snug text-text-muted">
              Enviaremos um <strong>link único</strong> para o e-mail informado acima. Abra o link{" "}
              <strong>no mesmo navegador</strong> em que você está usando o site para concluir o
              login automaticamente.
            </p>
            <button
              type="button"
              disabled={loading || !email.trim()}
              onClick={sendMagicLink}
              className="rounded-button border border-border bg-surface-muted px-3 py-2 text-xs font-semibold text-text transition-colors hover:bg-surface disabled:opacity-50"
            >
              {loading ? "Enviando…" : "Enviar link de acesso"}
            </button>
          </div>
        )}
      </div>

      {message && (
        <p
          className={cn(
            "text-xs",
            compact && "m-0",
            messageKind === "error" && "text-red-800",
            messageKind === "success" && "text-emerald-800",
            messageKind === "info" && "text-text-muted"
          )}
        >
          {message}
        </p>
      )}
    </div>
  );
}
