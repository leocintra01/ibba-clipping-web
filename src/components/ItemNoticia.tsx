"use client";

import type { Item } from "@/lib/tipos";
import { useSelecao } from "@/lib/selecao";

/**
 * Uma noticia na lista.
 *
 * O titulo e' o alvo de clique inteiro, com area de toque de 44px no celular.
 * Fonte e hora ficam abaixo, em cinza que passa 4.5:1 — sao contexto, nao
 * conteudo. Item repetido do dia anterior entra esmaecido: o analista pediu pra
 * ve-lo, mas pra poder pular. O esmaecido e' a unica marca — etiqueta escrita
 * em cada linha sujava a lista.
 *
 * A caixa de selecao alimenta o compositor de envio. Fica a esquerda, com alvo
 * grande, porque marcar dezenas de itens e' o que o analista mais faz aqui.
 */
export function ItemNoticia({ item }: { item: Item }) {
  const { marcado, alternar } = useSelecao();
  const escolhido = marcado(item.url);

  return (
    <li
      className={`flex gap-3 border-b border-borda py-3 last:border-0 ${
        item.repetido ? "opacity-60" : ""
      }`}
    >
      <label className="flex min-h-11 shrink-0 cursor-pointer items-start pt-0.5">
        <input
          type="checkbox"
          checked={escolhido}
          onChange={() => alternar(item)}
          aria-label={`Selecionar: ${item.titulo}`}
          className="size-[18px] accent-laranja"
        />
      </label>
      <div className="min-w-0 flex-1">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="toque block text-[15px] font-medium leading-snug text-tinta hover:text-laranja-700 hover:underline"
        >
          {item.titulo}
        </a>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[12px] text-tinta-3">
          <span>{item.fonte || item.dominio}</span>
          {item.quando ? (
            // Data e hora sao o detalhe menos decisivo da linha: ficam em corpo
            // menor que a fonte, so' pra consultar quando interessa.
            <span className="text-[10px] leading-none">{item.quando}</span>
          ) : null}
        </div>
      </div>
    </li>
  );
}
