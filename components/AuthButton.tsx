"use client";

import { FormEvent, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function AuthButton() {
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const configured = isSupabaseConfigured();

  const login = async (e: FormEvent) => {
    e.preventDefault();
    if (!configured) {
      setMessage("Configure Supabase para usar login.");
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Link enviado! Verifique seu e-mail.");
    }
  };

  const logout = async () => {
    if (!configured) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.reload();
  };

  const mergeGuest = async () => {
    await fetch("/api/guest/merge", { method: "POST" });
    showMergeToast();
  };

  const showMergeToast = () => {
    setMessage("Histórico de convidado vinculado à sua conta.");
  };

  if (!configured) {
    return (
      <span className="auth-hint">Modo local (sem Supabase configurado)</span>
    );
  }

  return (
    <div className="auth-bar">
      <button type="button" className="auth-toggle" onClick={() => setOpen(!open)}>
        Entrar / Conta
      </button>
      {open && (
        <div className="auth-panel">
          <form onSubmit={login}>
            <label>
              E-mail (magic link)
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <button type="submit">Enviar link</button>
          </form>
          <button type="button" onClick={mergeGuest}>
            Vincular pedidos de convidado
          </button>
          <button type="button" onClick={logout}>
            Sair
          </button>
          {message && <p className="auth-message">{message}</p>}
        </div>
      )}
    </div>
  );
}
