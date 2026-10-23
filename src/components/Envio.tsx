"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { Edicao, Item } from "@/lib/tipos";
import { useSelecao, type Marcado } from "@/lib/selecao";
import { copiar, indexarEdicao, montarTexto, separarParaEnvio } from "@/lib/envio";

/**
 * Compositor de envio — a aba onde se revisa e reordena.
 *
 * A montagem do texto agora acontece tambem na BarraEnvio, fixa no rodape da
 * lista: o analista ve o envio crescer sem trocar de aba, como no HTML antigo.
 * Esta aba continua sendo onde se EDITA — titulo, ordem fina, remocao.
 *
 * A ordem: quem tem numero de prioridade vai primeiro; o arrasto reordena
 * quem nao tem. Decisao do analista em 23/10/2026.
 */
type Secao = "BR" | "GL";
type Linha = { marca: Marcado; item: Item };

export function Envio({ edicao }: { edicao: Edicao }) {
  const { marcados, editarTitulo, reordenar, alternar, limpar, total } =
    useSelecao();
  const [copiou, setCopiou] = useState(false);
  const [arrastando, setArrastando] = useState<string | null>(null);
  const arraste = useRef<{ secao: Secao; indice: number } | null>(null);
  const listas = useRef<Record<string, HTMLOListElement | null>>({});

  const porUrl = useMemo(() => indexarEdicao(edicao), [edicao]);

  const { brasil, global } = useMemo(
    () => separarParaEnvio(marcados, porUrl),
    [marcados, porUrl],
  );

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

  async function aoCopiar() {
    const texto = montarTexto(
      brasil.map((x) => ({ titulo: x.marca.tituloEditado, url: x.marca.url })),
      global.map((x) => ({ titulo: x.marca.tituloEditado, url: x.marca.url })),
    );
    await copiar(texto);
    setCopiou(true);
    setTimeout(() => setCopiou(false), 2000);
  }

  if (!total) {
    return (
      <div className="mt-8 rounded-sm border border-dashed border-borda-forte px-4 py-10 text-center">
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
        <span className="num text-[13px] text-tinta-3">
          Brasil <b className="text-tinta">{brasil.length}</b> · Global{" "}
          <b className="text-tinta">{global.length}</b> · Total{" "}
          <b className="text-tinta">{brasil.length + global.length}</b>
        </span>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={limpar}
            className="min-h-11 rounded-sm border border-borda-forte px-4 text-[13px] text-tinta-2 transition-colors hover:border-tinta hover:text-tinta"
          >
            limpar
          </button>
          <button
            type="button"
            onClick={aoCopiar}
            className="min-h-11 rounded-sm bg-laranja px-5 text-[13px] font-semibold text-white transition-colors hover:bg-laranja-700"
          >
            {copiou ? "copiado!" : "copiar para o WhatsApp"}
          </button>
        </div>
      </div>

      <p className="mt-4 text-[13px] text-tinta-3">
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
            <h3 className="rotulo mb-2.5">
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
                  className={`flex gap-2 rounded-sm border bg-papel-2 p-3.5 ${
                    arrastando === marca.url
                      ? "border-laranja shadow-sm"
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
                    <div className="mb-2 flex items-center gap-2 text-[12px] text-tinta-3">
                      <span className="num font-semibold text-tinta-2">{i + 1}</span>
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
                      className="w-full resize-y bg-transparent font-[family-name:var(--font-leitura)] text-[16px] font-medium leading-[1.35] text-tinta outline-none"
                    />
                    <div className="mt-1.5 break-all text-[11px] text-tinta-4">
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
