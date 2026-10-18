"use client";

import { useMemo, useState } from "react";
import type { Edicao as TEdicao, Item } from "@/lib/tipos";
import { ItemNoticia } from "./ItemNoticia";

type Visao = "tudo" | "brasil" | "global" | "empresas";

const ABAS: { id: Visao; rotulo: string }[] = [
  { id: "tudo", rotulo: "Tudo" },
  { id: "brasil", rotulo: "Brasil" },
  { id: "global", rotulo: "Global" },
  { id: "empresas", rotulo: "Empresas" },
];

/**
 * Corpo da edicao.
 *
 * Troquei as abas aninhadas do HTML antigo (duas principais + cinco sub, com a
 * ultima inalcancavel no celular) por UMA faixa de quatro. "Oficial" e "Outras"
 * deixaram de ser navegacao: viram ordem dentro da lista, porque o analista
 * quer ler por relevancia, nao por bucket.
 */
export function Edicao({ edicao }: { edicao: TEdicao }) {
  const [visao, setVisao] = useState<Visao>("tudo");
  const [soNovas, setSoNovas] = useState(false);

  const { brasil, global } = useMemo(() => {
    const c = edicao.clipping;
    return {
      brasil: [...c.br_off, ...c.br_oth],
      global: [...c.gl_off, ...c.gl_oth],
    };
  }, [edicao]);

  const filtra = (itens: Item[]) =>
    soNovas ? itens.filter((i) => !i.repetido) : itens;

  const repetidas = [...brasil, ...global].filter((i) => i.repetido).length;

  return (
    <>
      <nav
        aria-label="Seções"
        className="sticky top-0 z-10 flex gap-1 overflow-x-auto border-b border-borda bg-papel-2/95 px-2 backdrop-blur [scrollbar-width:none] sm:px-3"
      >
        {ABAS.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setVisao(a.id)}
            aria-current={visao === a.id ? "page" : undefined}
            className={`min-h-11 shrink-0 border-b-2 px-3 font-mono text-[12px] uppercase tracking-wide transition-colors ${
              visao === a.id
                ? "border-laranja text-laranja-700"
                : "border-transparent text-tinta-3 hover:text-tinta"
            }`}
          >
            {a.rotulo}
          </button>
        ))}
      </nav>

      {repetidas > 0 && visao !== "empresas" ? (
        <div className="flex items-center justify-end px-4 pt-3 sm:px-5">
          <label className="flex cursor-pointer items-center gap-2 font-mono text-[12px] text-tinta-3">
            <input
              type="checkbox"
              checked={soNovas}
              onChange={(e) => setSoNovas(e.target.checked)}
              className="size-4 accent-laranja"
            />
            esconder as {repetidas} já publicadas
          </label>
        </div>
      ) : null}

      <div className="px-4 pb-12 sm:px-5">
        {visao === "empresas" ? (
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
    </>
  );
}

function Secao({ titulo, itens }: { titulo: string; itens: Item[] }) {
  return (
    <section className="mt-5">
      <h2 className="mb-1 flex items-baseline gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-tinta-3">
        {titulo}
        <span className="tabular-nums">{itens.length}</span>
      </h2>
      {itens.length ? (
        <ul>
          {itens.map((i) => (
            <ItemNoticia key={i.url} item={i} />
          ))}
        </ul>
      ) : (
        <p className="py-3 text-[14px] text-tinta-3">
          Nada nesta seção nesta edição.
        </p>
      )}
    </section>
  );
}

function PorEmpresa({ edicao }: { edicao: TEdicao }) {
  if (!edicao.empresas.length) {
    return (
      <p className="mt-5 text-[14px] text-tinta-3">
        Nenhuma empresa de cobertura citada no título nesta edição.
      </p>
    );
  }
  return (
    <div className="mt-5 flex flex-col gap-6">
      {edicao.empresas.map((b) => (
        <section key={b.empresa}>
          <h2 className="mb-1 flex items-baseline gap-2 border-b border-borda pb-1.5 text-[15px] font-semibold">
            {b.empresa}
            <span className="font-mono text-[12px] font-normal text-tinta-3 tabular-nums">
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
