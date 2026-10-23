"use client";

import { useMemo, useState } from "react";
import type { Edicao } from "@/lib/tipos";
import { useSelecao } from "@/lib/selecao";
import { copiar, indexarEdicao, montarTexto, separarParaEnvio } from "@/lib/envio";

/**
 * O envio se montando na propria tela da lista.
 *
 * No HTML do GitHub o texto do WhatsApp crescia ao lado enquanto o analista
 * marcava. Na primeira versao deste site isso virou uma aba separada, e ele
 * perdeu de vista o que estava montando — foi uma das coisas que ele apontou
 * como pior que o antigo (23/10/2026).
 *
 * Aqui a barra fica fixa no rodape, sempre visivel enquanto houver selecao, e
 * abre para mostrar o texto EXATO que vai ser copiado. Em tela estreita nao ha
 * "ao lado"; ha "sem sair da lista", que e' o que importa.
 */
export function BarraEnvio({ edicao }: { edicao: Edicao }) {
  const { marcados, total, limpar } = useSelecao();
  const [aberta, setAberta] = useState(false);
  const [copiou, setCopiou] = useState(false);

  const porUrl = useMemo(() => indexarEdicao(edicao), [edicao]);
  const { brasil, global } = useMemo(
    () => separarParaEnvio(marcados, porUrl),
    [marcados, porUrl],
  );

  const texto = useMemo(
    () =>
      montarTexto(
        brasil.map((x) => ({ titulo: x.marca.tituloEditado, url: x.marca.url })),
        global.map((x) => ({ titulo: x.marca.tituloEditado, url: x.marca.url })),
      ),
    [brasil, global],
  );

  if (!total) return null;

  async function aoCopiar() {
    await copiar(texto);
    setCopiou(true);
    setTimeout(() => setCopiou(false), 2000);
  }

  return (
    <div className="sticky bottom-0 z-20 mx-auto max-w-3xl border-t border-borda-forte bg-papel shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
      {aberta ? (
        <div className="max-h-[45vh] overflow-y-auto border-b border-borda px-6 py-4 sm:px-8">
          <p className="rotulo mb-2">Texto que vai para o WhatsApp</p>
          <pre className="whitespace-pre-wrap break-words text-[13px] leading-relaxed text-tinta-2">
            {texto}
          </pre>
        </div>
      ) : null}

      <div className="flex items-center gap-3 px-6 py-3 sm:px-8">
        <button
          type="button"
          onClick={() => setAberta((a) => !a)}
          aria-expanded={aberta}
          className="min-h-11 text-left text-[13px] text-tinta-2 hover:text-tinta"
        >
          <span className="num font-semibold text-tinta">{total}</span>{" "}
          selecionadas
          <span className="num block text-[12px] text-tinta-3">
            Brasil {brasil.length} · Global {global.length} ·{" "}
            {aberta ? "ocultar texto" : "ver texto"}
          </span>
        </button>

        <div className="ml-auto flex shrink-0 gap-2">
          <button
            type="button"
            onClick={limpar}
            className="min-h-11 rounded-sm border border-borda-forte px-3 text-[13px] text-tinta-2 transition-colors hover:border-tinta hover:text-tinta"
          >
            limpar
          </button>
          <button
            type="button"
            onClick={aoCopiar}
            className="min-h-11 rounded-sm bg-laranja px-4 text-[13px] font-semibold text-white transition-colors hover:bg-laranja-700"
          >
            {copiou ? "copiado!" : "copiar"}
          </button>
        </div>
      </div>
    </div>
  );
}
