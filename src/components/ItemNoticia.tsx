"use client";

import type { Item } from "@/lib/tipos";
import { useSelecao } from "@/lib/selecao";
import { dataConfirmada, quandoDoItem } from "@/lib/quando";

/**
 * Uma noticia na lista.
 *
 * Titulo em serifa, como texto para LER; fonte e hora em sans pequeno, como
 * dado de apoio. E' a divisao de uma publicacao, e e' o que separa esta lista
 * de um painel de ferramenta.
 *
 * Item repetido entra esmaecido: o analista pediu pra ve-lo, mas pra poder
 * pular. O esmaecido e' a unica marca — etiqueta escrita em cada linha sujava
 * a lista. A 0,55 o apoio da linha saia a 2,44:1 do papel e nao se lia; a 0,68
 * da 3,2:1 e a linha continua lendo como esmaecida.
 *
 * A caixa de selecao alimenta o compositor de envio. Fica a esquerda, com alvo
 * grande, porque marcar dezenas de itens e' o que o analista mais faz aqui.
 */
export function ItemNoticia({ item }: { item: Item }) {
  const { marcado, alternar, marcados, definirPrioridade } = useSelecao();
  const escolhido = marcado(item.url);
  const quando = quandoDoItem(item);
  const firme = dataConfirmada(item);
  const prioridade = marcados[item.url]?.prioridade ?? "";

  return (
    <li
      className={`flex gap-3.5 border-b border-borda py-4 last:border-0 ${
        item.repetido ? "opacity-[0.68]" : ""
      }`}
    >
      <label className="flex min-h-11 shrink-0 cursor-pointer items-start pt-[3px]">
        <input
          type="checkbox"
          checked={escolhido}
          onChange={() => alternar(item)}
          aria-label={`Selecionar: ${item.titulo}`}
          className="size-[17px] accent-laranja"
        />
      </label>
      <div className="min-w-0 flex-1">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="toque block font-[family-name:var(--font-leitura)] text-[17px] font-medium leading-[1.35] text-tinta decoration-laranja/40 underline-offset-[3px] hover:underline"
        >
          {item.titulo}
        </a>
        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 text-[12px] text-tinta-3">
          <span>{item.fonte || item.dominio}</span>
          {quando ? (
            // Data e hora sao o detalhe menos decisivo da linha: corpo menor
            // que a fonte, so' pra consultar quando interessa. Sem confirmacao
            // na materia, vem com ressalva — o HTML antigo diz "data nao
            // confirmada" e as duas telas tem que concordar sobre o item.
            <span
              className={`num text-[11px] text-tinta-3 ${
                firme ? "" : "border-b border-dotted border-tinta-4"
              }`}
              title={
                firme
                  ? undefined
                  : "Data deduzida da URL ou de uma listagem, não confirmada na matéria"
              }
            >
              {quando}
              {/* O "?" sozinho nao se explica em 375px, onde nao ha hover, e o
                  HTML antigo diz "data nao confirmada" para o MESMO item: as
                  duas telas tem que usar a mesma palavra (editor, E11). */}
              {firme ? null : " · data não confirmada"}
            </span>
          ) : null}
          {escolhido ? (
            // So' no item marcado: ranquear o que nao vai no envio nao diz
            // nada, e dezenas de selects numa lista de 70 linhas virariam
            // formulario no lugar de leitura.
            <select
              value={prioridade}
              onChange={(e) =>
                definirPrioridade(
                  item.url,
                  e.target.value ? Number(e.target.value) : null,
                )
              }
              aria-label={`Prioridade no envio: ${item.titulo}`}
              className={`ml-auto h-7 shrink-0 rounded-sm border px-1 text-[12px] ${
                prioridade
                  ? "border-laranja bg-laranja-suave font-semibold text-laranja-700"
                  : "border-borda-forte bg-papel text-tinta-3"
              }`}
            >
              <option value="">ordem —</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>
                  {n}º
                </option>
              ))}
            </select>
          ) : null}
        </div>
      </div>
    </li>
  );
}
