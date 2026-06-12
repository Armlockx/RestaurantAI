import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="auth-page">
      <h1>Entrar</h1>
      <p className="hint">Envie um magic link para o seu e-mail.</p>
      <LoginForm />
      <p className="hint" style={{ marginTop: 16 }}>
        Staff/admin: após o login, use o menu <strong>Pedidos</strong> no topo.
      </p>
      <Link href="/">← Voltar ao cardápio</Link>
    </div>
  );
}
