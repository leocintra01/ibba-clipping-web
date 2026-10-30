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
 * Nao ha mais linha esmaecida. O item repetido era mostrado assim para ele
 * poder pular; em 27/10/2026 ele mandou tirar as "ja vistas" da tela, e quem
 * decide o que entra passou a ser `filtra` em Edicao.tsx. Nao ha estado
 * intermediario aqui: ou a noticia esta na lista, ou nao esta.
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
  // O robo prefixa o titulo de conteudo pago com "Conteúdo de marca (X) — ",
  // e faz isso no TITULO porque e' assim que o aviso alcanca as outras duas
  // telas de uma vez: o HTML de backup e o rascunho que ele cola no WhatsApp.
  // Aqui ha' selo proprio ao lado da fonte, entao o prefixo so' empurraria a
  // manchete para a segunda linha dizendo duas vezes a mesma coisa.
  const titulo = item.conteudo_de_marca
    ? item.titulo.replace(/^Conte[úu]do de marca \([^)]*\)\s*[—–-]\s*/, "")
    : item.titulo;

  return (
    <li className="flex gap-3.5 border-b border-borda py-4 last:border-0">
      <label className="flex min-h-11 shrink-0 cursor-pointer items-start pt-[3px]">
        <input
          type="checkbox"
          checked={escolhido}
          onChange={() => alternar(item)}
          aria-label={`Selecionar: ${titulo}`}
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
          {titulo}
        </a>
        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 text-[12px] text-tinta-3">
          <span>{item.fonte || item.dominio}</span>
          {item.conteudo_de_marca ? (
            // Publieditorial. Entra no clipping desde 30/10 quando quem pagou
            // e' empresa da cobertura, e tem que se anunciar: a linha fica
            // lado a lado com reportagem, e so' o dominio nao conta a
            // diferenca — valor.globo.com e' o mesmo nos dois casos.
            <span
              className="shrink-0 rounded-sm border border-borda-forte px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-tinta-3"
              title={`Conteúdo pago por ${item.conteudo_de_marca}, não é reportagem`}
            >
              conteúdo de marca
            </span>
          ) : null}
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
              aria-label={`Prioridade no envio: ${titulo}`}
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
