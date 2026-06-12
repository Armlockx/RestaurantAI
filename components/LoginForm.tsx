"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type LoginFormProps = {
  compact?: boolean;
  onSuccess?: () => void;
};

export function LoginForm({ compact, onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const login = async (e: FormEvent) => {
    e.preventDefault();
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
      onSuccess?.();
    }
  };

  return (
    <form className={compact ? "login-form login-form--compact" : "login-form"} onSubmit={login}>
      <label>
        E-mail (magic link)
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          required
          autoComplete="email"
        />
      </label>
      <button type="submit">Enviar link</button>
      {message && <p className="auth-message">{message}</p>}
    </form>
  );
}
