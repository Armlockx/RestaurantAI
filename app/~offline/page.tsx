"use client";

export default function OfflinePage() {
  return (
    <section className="offline-page">
      <h1>Sem conexão</h1>
      <p>
        Não foi possível carregar esta página. Verifique sua internet e tente novamente.
      </p>
      <p className="hint">Seu carrinho foi salvo neste dispositivo.</p>
      <button type="button" className="offline-page__retry" onClick={() => window.location.reload()}>
        Tentar novamente
      </button>
    </section>
  );
}
