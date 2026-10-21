"use client";

import { useCallback, useMemo, useRef, useState } from "react";
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
 *
 * A ordem e' manual: arrastar o bloco pelo apoio, ou as setas. O arrasto usa
 * Pointer Events (e nao o drag-and-drop nativo do HTML) porque o nativo nao
 * funciona em toque — e o celular e' onde esse clipping costuma ser montado.
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

type Secao = "BR" | "GL";
type Linha = { marca: Marcado; item: Item };

export function Envio({ edicao }: { edicao: Edicao }) {
  const { marcados, editarTitulo, reordenar, alternar, limpar, total } =
    useSelecao();
  const [copiou, setCopiou] = useState(false);
  const [arrastando, setArrastando] = useState<string | null>(null);
  const arraste = useRef<{ secao: Secao; indice: number } | null>(null);
  const listas = useRef<Record<string, HTMLOListElement | null>>({});

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
    const br: Linha[] = [];
    const gl: Linha[] = [];
    for (const m of ordenados) {
      const item = porUrl.get(m.url);
      if (!item) continue;
      (item.bucket.startsWith("BR") ? br : gl).push({ marca: m, item });
    }
    return { brasil: br, global: gl };
  }, [marcados, porUrl]);

  /**
   * Move um bloco dentro da sua secao. As duas secoes dividem a mesma escala de
   * ordem, entao a lista inteira (Brasil e depois Global) e' regravada junto.
   */
  const mover = useCallback(
    (secao: Secao, de: number, para: number) => {
      const lista = secao === "BR" ? brasil : global;
      if (de === para || para < 0 || para >= lista.length) return;
      const nova = [...lista];
      const [movido] = nova.splice(de, 1);
      nova.splice(para, 0, movido);
      const br = secao === "BR" ? nova : brasil;
      const gl = secao === "GL" ? nova : global;
      reordenar([...br, ...gl].map((l) => l.marca.url));
    },
    [brasil, global, reordenar],
  );

  function iniciarArraste(e: React.PointerEvent, secao: Secao, i: number, url: string) {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    arraste.current = { secao, indice: i };
    setArrastando(url);
  }

  function arrastar(e: React.PointerEvent) {
    const a = arraste.current;
    const ol = a && listas.current[a.secao];
    if (!a || !ol) return;
    const blocos = Array.from(ol.querySelectorAll<HTMLLIElement>("li[data-url]"));
    for (let k = 0; k < blocos.length; k++) {
      const r = blocos[k].getBoundingClientRect();
      if (e.clientY >= r.top && e.clientY <= r.bottom) {
        if (k !== a.indice) {
          mover(a.secao, a.indice, k);
          a.indice = k;
        }
        return;
      }
    }
  }

  function soltar(e: React.PointerEvent) {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    arraste.current = null;
    setArrastando(null);
  }

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

      <p className="mt-3 font-mono text-[11px] text-tinta-3">
        Arraste os blocos pelo apoio à esquerda — ou use as setas — para mudar a
        ordem do envio.
      </p>

      {(
        [
          { secao: "BR" as Secao, rotulo: "Brasil", lista: brasil },
          { secao: "GL" as Secao, rotulo: "Global", lista: global },
        ]
      ).map(({ secao, rotulo, lista }) =>
        lista.length ? (
          <section key={secao} className="mt-5">
            <h3 className="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-tinta-3">
              {rotulo}
            </h3>
            <ol
              ref={(el) => {
                listas.current[secao] = el;
              }}
              className="flex flex-col gap-3"
            >
              {lista.map(({ marca, item }, i) => (
                <li
                  key={marca.url}
                  data-url={marca.url}
                  className={`flex gap-2 rounded border bg-papel p-3 ${
                    arrastando === marca.url
                      ? "border-laranja shadow-md"
                      : "border-borda"
                  }`}
                >
                  <button
                    type="button"
                    aria-label={`Arrastar para mudar a posição de ${marca.tituloEditado}`}
                    onPointerDown={(e) => iniciarArraste(e, secao, i, marca.url)}
                    onPointerMove={arrastar}
                    onPointerUp={soltar}
                    onPointerCancel={soltar}
                    className="-m-1 flex w-7 shrink-0 cursor-grab touch-none items-start justify-center p-1 text-tinta-3 hover:text-tinta-2 active:cursor-grabbing"
                  >
                    <svg width="12" height="20" viewBox="0 0 12 20" aria-hidden="true">
                      {[5, 10, 15].map((y) =>
                        [3, 9].map((x) => (
                          <circle key={`${x}-${y}`} cx={x} cy={y} r="1.5" fill="currentColor" />
                        )),
                      )}
                    </svg>
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex items-center gap-2 font-mono text-[12px] text-tinta-3">
                      <span className="tabular-nums">#{i + 1}</span>
                      <span className="truncate">{item.fonte || item.dominio}</span>
                      <div className="ml-auto flex shrink-0 items-center">
                        <button
                          type="button"
                          onClick={() => mover(secao, i, i - 1)}
                          disabled={i === 0}
                          aria-label="Subir uma posição"
                          className="min-h-11 px-2 text-[14px] leading-none text-tinta-3 hover:text-tinta disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => mover(secao, i, i + 1)}
                          disabled={i === lista.length - 1}
                          aria-label="Descer uma posição"
                          className="min-h-11 px-2 text-[14px] leading-none text-tinta-3 hover:text-tinta disabled:opacity-30"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => alternar(item)}
                          aria-label="Tirar do envio"
                          className="min-h-11 px-1.5 text-tinta-3 hover:text-laranja-700"
                        >
                          remover
                        </button>
                      </div>
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
