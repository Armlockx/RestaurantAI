import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="auth-page">
      <h1>Entrar</h1>
      <p className="hint">
        Use <strong>e-mail e senha</strong> ou o <strong>código de 6 dígitos</strong> enviado por
        e-mail. O link mágico fica disponível como alternativa no final do formulário.
      </p>
      <LoginForm />
      <p className="hint" style={{ marginTop: 16 }}>
        Staff/admin: após o login, o menu <strong>Pedidos</strong> aparece no topo.
      </p>
      <Link href="/">← Voltar ao cardápio</Link>
    </div>
  );
}
