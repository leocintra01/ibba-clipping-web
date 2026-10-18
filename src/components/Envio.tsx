"use client";

import { useMemo, useState } from "react";
import type { Edicao, Item } from "@/lib/tipos";
import { ordenarParaEnvio, useSelecao, type Marcado } from "@/lib/selecao";

/**
 * Compositor de envio.
 *
 * Reproduz o fluxo que o analista ja usava no HTML antigo — marcar, ordenar,
 * ajustar o titulo, copiar pro WhatsApp — e o formato do texto e' o MESMO, pra
 * nao mudar o que os clientes recebem:
 *
 *   *IBBA TMT Daily News*
 *   > Brazil
 *   - *titulo*
 *   url
 */
function montarTexto(
  brasil: { titulo: string; url: string }[],
  global: { titulo: string; url: string }[],
): string {
  const l: string[] = ["*IBBA TMT Daily News*"];
  const secao = (rotulo: string, itens: { titulo: string; url: string }[]) => {
    if (!itens.length) return;
    l.push("", `> ${rotulo}`, "");
    for (const i of itens) {
      l.push(`- *${i.titulo}*`, i.url, "");
    }
  };
  secao("Brazil", brasil);
  secao("Global", global);
  return l.join("\n").trim();
}

export function Envio({ edicao }: { edicao: Edicao }) {
  const { marcados, editarTitulo, definirPrioridade, alternar, limpar, total } =
    useSelecao();
  const [copiou, setCopiou] = useState(false);

  const porUrl = useMemo(() => {
    const m = new Map<string, Item>();
    for (const grupo of [
      edicao.clipping.br_off,
      edicao.clipping.br_oth,
      edicao.clipping.gl_off,
      edicao.clipping.gl_oth,
      edicao.last_news.brazil,
      edicao.last_news.global,
    ]) {
      for (const i of grupo) if (!m.has(i.url)) m.set(i.url, i);
    }
    return m;
  }, [edicao]);

  const { brasil, global } = useMemo(() => {
    const ordenados = ordenarParaEnvio(Object.values(marcados));
    type Linha = { marca: Marcado; item: Item };
    const br: Linha[] = [];
    const gl: Linha[] = [];
    for (const m of ordenados) {
      const item = porUrl.get(m.url);
      if (!item) continue;
      (item.bucket.startsWith("BR") ? br : gl).push({ marca: m, item });
    }
    return { brasil: br, global: gl };
  }, [marcados, porUrl]);

  async function copiar() {
    const texto = montarTexto(
      brasil.map((x) => ({ titulo: x.marca.tituloEditado, url: x.marca.url })),
      global.map((x) => ({ titulo: x.marca.tituloEditado, url: x.marca.url })),
    );
    try {
      await navigator.clipboard.writeText(texto);
    } catch {
      // Contexto sem permissao de area de transferencia: cai pro seletor, que
      // deixa o usuario copiar com Ctrl+C sem perder o trabalho.
      const ta = document.createElement("textarea");
      ta.value = texto;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch { /* ignora */ }
      ta.remove();
    }
    setCopiou(true);
    setTimeout(() => setCopiou(false), 2000);
  }

  if (!total) {
    return (
      <div className="mt-6 rounded border border-dashed border-borda px-4 py-8 text-center">
        <p className="text-[15px] text-tinta-2">Nenhuma notícia selecionada.</p>
        <p className="mt-1 text-[13px] text-tinta-3">
          Marque as caixas nas abas Brasil e Global para montar o envio.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-center gap-2 border-b border-borda pb-3">
        <span className="font-mono text-[12px] text-tinta-3">
          Brasil <b className="text-tinta">{brasil.length}</b> · Global{" "}
          <b className="text-tinta">{global.length}</b> · Total{" "}
          <b className="text-tinta">{brasil.length + global.length}</b>
        </span>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={limpar}
            className="min-h-11 rounded border border-borda px-3 font-mono text-[12px] text-tinta-2 hover:bg-papel"
          >
            limpar
          </button>
          <button
            type="button"
            onClick={copiar}
            className="min-h-11 rounded bg-laranja px-4 font-mono text-[12px] font-medium text-white hover:bg-laranja-700"
          >
            {copiou ? "copiado!" : "copiar para o WhatsApp"}
          </button>
        </div>
      </div>

      {[
        { rotulo: "Brasil", lista: brasil },
        { rotulo: "Global", lista: global },
      ].map(({ rotulo, lista }) =>
        lista.length ? (
          <section key={rotulo} className="mt-5">
            <h3 className="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-tinta-3">
              {rotulo}
            </h3>
            <ol className="flex flex-col gap-3">
              {lista.map(({ marca, item }, i) => (
                <li
                  key={marca.url}
                  className="rounded border border-borda bg-papel p-3"
                >
                  <div className="mb-1.5 flex items-center gap-2 font-mono text-[12px] text-tinta-3">
                    <span className="tabular-nums">#{i + 1}</span>
                    <span>{item.fonte || item.dominio}</span>
                    <select
                      value={marca.prioridade ?? ""}
                      onChange={(e) =>
                        definirPrioridade(
                          marca.url,
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                      aria-label="Prioridade no envio"
                      className="ml-auto min-h-11 rounded border border-borda bg-papel px-1.5 font-mono text-[12px]"
                    >
                      <option value="">—</option>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          top {n}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => alternar(item)}
                      aria-label="Tirar do envio"
                      className="min-h-11 px-1.5 text-tinta-3 hover:text-laranja-700"
                    >
                      remover
                    </button>
                  </div>
                  <textarea
                    value={marca.tituloEditado}
                    onChange={(e) => editarTitulo(marca.url, e.target.value)}
                    rows={2}
                    aria-label="Título que vai no envio"
                    className="w-full resize-y bg-transparent text-[15px] font-medium leading-snug text-tinta outline-none"
                  />
                  <div className="mt-1 break-all font-mono text-[11px] text-tinta-3">
                    {marca.url}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ) : null,
      )}
    </div>
  );
}
