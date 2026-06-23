"use client";

export default function OfflinePage() {
  return (
    <section className="mx-auto max-w-md px-6 py-12 text-center">
      <h1 className="mb-3 text-xl font-extrabold text-text">Sem conexão</h1>
      <p className="mb-3 text-sm leading-relaxed text-text-muted">
        Não foi possível carregar esta página. Verifique sua internet e tente novamente.
      </p>
      <p className="mb-6 text-sm text-text-muted">
        Seu carrinho foi salvo neste dispositivo.
      </p>
      <button
        type="button"
        className="rounded-button border border-brand bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-neutral-800"
        onClick={() => window.location.reload()}
      >
        Tentar novamente
      </button>
    </section>
  );
}
