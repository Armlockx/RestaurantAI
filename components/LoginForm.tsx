"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type LoginFormProps = {
  compact?: boolean;
  onSuccess?: () => void;
};

type LoginTab = "password" | "otp";
type OtpStep = "send" | "verify";
type MessageKind = "info" | "success" | "error";

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

  const formClass = compact ? "login-form login-form--compact" : "login-form";

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

  const messageClass =
    messageKind === "error"
      ? "auth-message auth-message--error"
      : messageKind === "success"
        ? "auth-message auth-message--success"
        : "auth-message";

  return (
    <div className={formClass}>
      <div className="login-tabs" role="tablist" aria-label="Formas de login">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "password"}
          className={tab === "password" ? "login-tab login-tab--active" : "login-tab"}
          onClick={() => switchTab("password")}
        >
          E-mail e senha
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "otp"}
          className={tab === "otp" ? "login-tab login-tab--active" : "login-tab"}
          onClick={() => switchTab("otp")}
        >
          Código por e-mail
        </button>
      </div>

      {tab === "password" && (
        <form onSubmit={loginWithPassword} className="login-panel">
          <p className="login-panel__hint">
            Use o e-mail e a senha da sua conta. Ideal para acesso frequente ao painel admin.
          </p>
          <label>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoComplete="email"
            />
          </label>
          <label>
            Senha
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              minLength={6}
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
      )}

      {tab === "otp" && otpStep === "send" && (
        <form onSubmit={sendOtp} className="login-panel">
          <p className="login-panel__hint">
            Enviaremos um <strong>código de 6 dígitos</strong> para o seu e-mail. Digite o código aqui
            no site — sem precisar clicar em link.
          </p>
          <label>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoComplete="email"
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? "Enviando…" : "Enviar código"}
          </button>
        </form>
      )}

      {tab === "otp" && otpStep === "verify" && (
        <form onSubmit={verifyOtp} className="login-panel">
          <p className="login-panel__hint">
            Código enviado para <strong>{email}</strong>. Confira também a pasta de spam.
          </p>
          <label>
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
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? "Verificando…" : "Confirmar código"}
          </button>
          <button
            type="button"
            className="login-link-btn"
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

      <div className="login-magic">
        <button
          type="button"
          className="login-magic__toggle"
          aria-expanded={magicLinkOpen}
          onClick={() => setMagicLinkOpen((v) => !v)}
        >
          {magicLinkOpen ? "▾" : "▸"} Entrar com link no e-mail (alternativa)
        </button>

        {magicLinkOpen && (
          <div className="login-magic__body">
            <p className="login-magic__hint">
              Enviaremos um <strong>link único</strong> para o e-mail informado acima. Abra o link{" "}
              <strong>no mesmo navegador</strong> em que você está usando o site para concluir o
              login automaticamente. Útil se você não tiver senha ou preferir não digitar o código.
            </p>
            <button
              type="button"
              className="login-magic__submit"
              disabled={loading || !email.trim()}
              onClick={sendMagicLink}
            >
              {loading ? "Enviando…" : "Enviar link de acesso"}
            </button>
          </div>
        )}
      </div>

      {message && <p className={messageClass}>{message}</p>}
    </div>
  );
}
