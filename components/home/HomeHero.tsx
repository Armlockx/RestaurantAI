export function HomeHero() {
  return (
    <section className="mb-6 overflow-hidden rounded-card bg-gradient-to-br from-brand via-neutral-900 to-neutral-800 px-5 py-6 text-brand-foreground shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">
        RestaurantAI
      </p>
      <h1 className="mt-1 text-2xl font-extrabold tracking-tight md:text-3xl">
        Cardápio do Restaurante
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/75">
        Descubra pratos, monte seu pedido com o assistente IA e finalize em poucos
        toques.
      </p>
    </section>
  );
}
