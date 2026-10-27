"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Edicao as TEdicao, Item } from "@/lib/tipos";
import { ItemNoticia } from "./ItemNoticia";
import { Envio } from "./Envio";
import { useSelecao } from "@/lib/selecao";
import { primeiraDepoisDaParada } from "@/lib/janela";

type Visao = "tudo" | "brasil" | "global" | "ultimas" | "empresas" | "envio";

const ABAS: { id: Visao; rotulo: string }[] = [
  { id: "tudo", rotulo: "Tudo" },
  { id: "brasil", rotulo: "Brasil" },
  { id: "global", rotulo: "Global" },
  { id: "ultimas", rotulo: "Últimas 24h" },
  { id: "empresas", rotulo: "Empresas" },
  { id: "envio", rotulo: "Envio" },
];

/**
 * Corpo da edicao.
 *
 * Troquei as abas aninhadas do HTML antigo (duas principais + cinco sub, com a
 * ultima inalcancavel no celular) por UMA faixa de seis. "Oficial" e "Outras"
 * deixaram de ser navegacao: viram ordem dentro da lista, porque o analista
 * quer ler por relevancia, nao por bucket.
 *
 * As abas sao em caixa normal, nao em mono maiusculo. Caixa alta de ferramenta
 * era metade do que dava a pagina a cara de painel interno.
 */
export function Edicao({ edicao }: { edicao: TEdicao }) {
  const [visao, setVisao] = useState<Visao>("tudo");
  const barra = useRef<HTMLElement>(null);
  const { total } = useSelecao();
  // Decisao do analista em 22/10/2026: a tela abre so' com o que e' novo.
  // A janela da edicao das 06:30 cobre desde a tarde de ontem, entao tudo que
  // saiu nas edicoes das 14:00 e 20:00 cai dentro dela por construcao — hoje,
  // 18 de 69. Elas continuam NA EDICAO, so' nao ocupam a primeira tela.
  //
  // MENOS na primeira edicao depois de uma parada. Em 26/10, uma segunda, ele
  // abriu e viu SEIS linhas no bloco Brasil. A edicao tinha DEZESSEIS, e as
  // dez escondidas eram as melhores: a Brisanet fechando banda larga via
  // satelite (s=23), a assembleia da OPA da Unifique (19), a homologacao da
  // recuperacao judicial da Tahto (15), a Brasil TecPar subindo o valor da
  // Ligga (14), a possivel fusao Giga+/Sky (13).
  //
  // Sao dois mecanismos brigando. O pipeline ALARGA a janela na segunda — de
  // 21 para 69 horas — justamente para compensar o fim de semana em que nao
  // houve edicao. E a tela entao ESCONDE exatamente o que o alargamento
  // trouxe, porque aquilo saiu nas edicoes de sexta.
  //
  // Esconder so' faz sentido quando a edicao anterior foi ha' poucas horas.
  // Depois de uma parada nao existe "novo" por construcao: o que ha' e' o
  // acumulo do periodo sem edicao, e ele precisa ver.
  //
  // O corte e' 40h, e esse numero vem das janelas reais, nao de chute:
  //    06:30  09:30 de ontem -> 06:30        = 21h
  //    14:00  09:30 de ontem -> 14:00        = 28,5h
  //    20:00  09:30 de ontem -> 20:00        = 34,5h
  //    segunda 06:30  09:30 de SEXTA -> 06:30 = 69h
  // A primeira versao usava 30h e escondia errado na edicao das 20:02, que
  // tem 34,5h e e' uma edicao normal. Medido na de 23/10 antes de publicar.
  const janelaLonga = primeiraDepoisDaParada(edicao);
  // Em 27/10/2026 ele mandou tirar as "ja vistas" da tela: nao lhe
  // interessam. Entao nao ha mais filtro, nem contagem, nem linha esmaecida —
  // em dia normal a noticia repetida simplesmente nao aparece.
  //
  // A excecao abaixo FICA, e nao e' preferencia de tela: e' o unico caso em
  // que a repetida e' a noticia do periodo. Depois de uma parada ela entra
  // como item normal, sem marca nenhuma, porque chamar aquilo de "ja visto"
  // era o que escondia as dez melhores da segunda de 26/10.

  // A linha de filtro dizia, sem olhar a hora, "já saíram em edições
  // anteriores de hoje". Na edição das 06:30 não existe edição anterior de
  // hoje: aquelas notícias são do dia útil anterior. Medido nas 9 edições
  // publicadas (editor, T6): 25 de 66, 18 de 69 e 26 de 70 itens marcados
  // como repetidos nas três manhãs, 69 somados apresentados como repetição
  // "de hoje". O Pages já dizia a verdade ("de hoje ou do dia útil
  // anterior"); quem mentia era esta tela, que é a que ele lê.
  //
  // Com a hora na mão dá para ser mais exato que o Pages: antes do meio-dia
  // a edição é a primeira do dia, e toda repetição vem da véspera.
  const { brasil, global } = useMemo(() => {
    const c = edicao.clipping;
    return {
      brasil: [...c.br_off, ...c.br_oth],
      global: [...c.gl_off, ...c.gl_oth],
    };
  }, [edicao]);

  const filtra = (itens: Item[]) =>
    janelaLonga ? itens : itens.filter((i) => !i.repetido);

  // A faixa de abas rola no celular, e "Envio" fica fora da tela. Sem isto,
  // trocar de aba deixava o indicador invisivel: a pagina mudava e nada na
  // navegacao dizia por que.
  useEffect(() => {
    const ativa = barra.current?.querySelector('[aria-current="page"]');
    ativa?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [visao]);

  return (
    <>
      <nav
        aria-label="Seções"
        ref={barra}
        className="sem-barra sticky top-0 z-10 flex gap-6 overflow-x-auto border-b border-borda bg-papel/95 px-6 backdrop-blur sm:px-8"
      >
        {ABAS.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setVisao(a.id)}
            aria-current={visao === a.id ? "page" : undefined}
            className={`-mb-px min-h-12 shrink-0 border-b-2 text-[14px] transition-colors ${
              visao === a.id
                ? "border-laranja font-semibold text-tinta"
                : "border-transparent text-tinta-3 hover:text-tinta"
            }`}
          >
            {a.rotulo}
            {a.id === "envio" && total > 0 ? (
              <span className="num ml-1.5 rounded-full bg-laranja px-1.5 py-px text-[11px] font-medium text-white">
                {total}
              </span>
            ) : null}
          </button>
        ))}
      </nav>

      <div className="px-6 pb-16 sm:px-8">
        {visao === "envio" ? (
          <Envio edicao={edicao} />
        ) : visao === "ultimas" ? (
          <Ultimas edicao={edicao} filtra={filtra} />
        ) : visao === "empresas" ? (
          <PorEmpresa edicao={edicao} />
        ) : (
          <>
            {visao !== "global" ? (
              <Secao titulo="Brasil" itens={filtra(brasil)} />
            ) : null}
            {visao !== "brasil" ? (
              <Secao titulo="Global" itens={filtra(global)} />
            ) : null}
          </>
        )}
      </div>

      {/* Na aba Envio o editor ja mostra tudo; a barra viraria repeticao. */}
      {/* A barra fixa de envio saiu em 26/10, a pedido dele: ficava
          colada no rodape em toda tela e tapava a leitura. O caminho do
          envio continua inteiro na aba "Envio", que mostra o numero de
          selecionadas no proprio rotulo — entao nada se perdeu, so' a
          faixa permanente. */}
    </>
  );
}

function Secao({ titulo, itens }: { titulo: string; itens: Item[] }) {
  return (
    <section className="mt-7 first:mt-6">
      <h2 className="flex items-baseline gap-2 border-b-2 border-tinta pb-1.5">
        <span className="rotulo !text-tinta">{titulo}</span>
        <span className="num ml-auto text-[12px] text-tinta-3">
          {itens.length}
        </span>
      </h2>
      {itens.length ? (
        <ul>
          {itens.map((i) => (
            <ItemNoticia key={i.url} item={i} />
          ))}
        </ul>
      ) : (
        <p className="py-4 text-[14px] text-tinta-3">
          Nada nesta seção nesta edição.
        </p>
      )}
    </section>
  );
}

function PorEmpresa({ edicao }: { edicao: TEdicao }) {
  if (!edicao.empresas.length) {
    return (
      <p className="mt-6 text-[14px] text-tinta-3">
        Nenhuma empresa de cobertura citada no título nesta edição.
      </p>
    );
  }
  return (
    <div className="mt-6 flex flex-col gap-8">
      {edicao.empresas.map((b) => (
        <section key={b.empresa}>
          <h2 className="flex items-baseline gap-2 border-b-2 border-tinta pb-1.5 font-[family-name:var(--font-leitura)] text-[18px] font-semibold">
            {b.empresa}
            <span className="num ml-auto text-[12px] font-normal text-tinta-3">
              {b.itens.length}
            </span>
          </h2>
          <ul>
            {b.itens.map((i) => (
              <ItemNoticia key={i.url} item={i} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function Ultimas({
  edicao,
  filtra,
}: {
  edicao: TEdicao;
  filtra: (i: Item[]) => Item[];
}) {
  const vazio =
    !edicao.last_news.brazil.length && !edicao.last_news.global.length;
  if (vazio) {
    return (
      <p className="mt-6 text-[14px] text-tinta-3">
        Sem notícias nas últimas 24 horas nesta edição.
      </p>
    );
  }
  return (
    <>
      <Secao titulo="Brasil · 24h" itens={filtra(edicao.last_news.brazil)} />
      <Secao titulo="Global · 24h" itens={filtra(edicao.last_news.global)} />
    </>
  );
}
