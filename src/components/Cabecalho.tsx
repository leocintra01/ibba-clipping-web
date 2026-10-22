import type { Edicao } from "@/lib/tipos";

/**
 * Cabecalho da edicao.
 *
 * A versao anterior era uma barra preta cheia, que dava a pagina a cara de
 * painel interno. Aqui o topo e' papel: assinatura pequena, titulo em serifa,
 * linha de data, e um fio laranja fino fechando o bloco. O laranja da marca
 * aparece como REGRA GRAFICA, nao como fundo — e' assim que ele funciona em
 * peca institucional.
 */
function dataPorExtenso(iso: string): string {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(a, m - 1, d).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function Cabecalho({
  edicao,
  children,
}: {
  edicao: Edicao;
  children?: React.ReactNode;
}) {
  return (
    <header className="border-b-[3px] border-laranja px-6 pb-5 pt-7 sm:px-8 sm:pb-6 sm:pt-9">
      <p className="rotulo">Itaú BBA · Research</p>
      <h1 className="mt-2 font-[family-name:var(--font-leitura)] text-[30px] font-bold leading-[1.1] tracking-[-0.015em] text-tinta sm:text-[36px]">
        TMT Daily News
      </h1>

      <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[13px] text-tinta-3">
        <span className="first-letter:uppercase">
          {dataPorExtenso(edicao.data)}
        </span>
        <span aria-hidden className="text-tinta-4">
          —
        </span>
        <span className="num">
          edição das {edicao.gerado_em.slice(11, 16)}
        </span>
        <span aria-hidden className="text-tinta-4">
          —
        </span>
        <span className="num">
          {edicao.totais.na_edicao} de {edicao.totais.coletados} notícias lidas
        </span>
      </div>

      {children ? <div className="mt-3">{children}</div> : null}
    </header>
  );
}
