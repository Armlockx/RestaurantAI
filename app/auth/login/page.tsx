import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="auth-page">
      <h1>Entrar</h1>
      <p>Use o botão &quot;Entrar / Conta&quot; na página inicial para magic link.</p>
      <p>Staff/admin: configure role em profiles no Supabase.</p>
      <Link href="/">← Voltar</Link>
    </div>
  );
}
