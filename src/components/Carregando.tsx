/**
 * O que vai no retrato do build no lugar da edicao.
 *
 * A home e o historico montam a edicao no pedido (ver CACHE_EDICAO_CORRENTE
 * em lib/edicoes.ts), entao o que fica pronto de antemao e' so' esta moldura.
 * Ela chega na mesma resposta que a edicao, um instante antes; nunca e' uma
 * edicao velha com cara de atual.
 */
export function Carregando() {
  return (
    <main
      aria-busy="true"
      className="mx-auto min-h-[60vh] max-w-3xl bg-papel shadow-[0_0_0_1px_var(--color-borda)] sm:my-6"
    >
      <div className="border-b-[3px] border-laranja px-6 pb-5 pt-7 sm:px-8 sm:pb-6 sm:pt-9">
        <p className="rotulo">Itaú BBA · Research</p>
        <p className="mt-3 text-[13px] text-tinta-3">Carregando a edição…</p>
      </div>
    </main>
  );
}
