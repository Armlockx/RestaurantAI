import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-3 text-xl font-extrabold tracking-tight text-text">Entrar</h1>
      <p className="mb-6 text-sm leading-relaxed text-text-muted">
        Use <strong className="text-text">e-mail e senha</strong> ou o{" "}
        <strong className="text-text">código de 6 dígitos</strong> enviado por e-mail. O link mágico
        fica disponível como alternativa no final do formulário.
      </p>
      <LoginForm />
      <p className="mt-4 text-sm text-text-muted">
        Staff/admin: após o login, acesse ferramentas em{" "}
        <Link href="/perfil" className="font-semibold text-text hover:underline">
          Perfil
        </Link>
        .
      </p>
      <Link href="/" className="mt-4 inline-block text-sm font-semibold text-text hover:underline">
        ← Voltar ao cardápio
      </Link>
    </div>
  );
}
