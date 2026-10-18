import type { Item } from "@/lib/tipos";
import { Pilula } from "./Pilula";

/**
 * Uma noticia na lista.
 *
 * O titulo e' o alvo de clique inteiro, com area de toque de 44px no celular.
 * Fonte e hora ficam abaixo, em cinza que passa 4.5:1 — sao contexto, nao
 * conteudo. Item repetido do dia anterior entra marcado e esmaecido: o analista
 * pediu pra ve-lo, mas pra poder pular.
 */
export function ItemNoticia({ item }: { item: Item }) {
  const variantes = item.variantes?.length ?? 0;
  return (
    <li
      className={`border-b border-borda py-3 last:border-0 ${
        item.repetido ? "opacity-60" : ""
      }`}
    >
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
        {item.quando ? <span aria-hidden>·</span> : null}
        {item.quando ? <span>{item.quando}</span> : null}
        <Pilula tag={item.tag} />
        {item.repetido ? (
          <span className="rounded-sm border border-dashed border-borda px-1.5 py-px">
            já publicado
          </span>
        ) : null}
        {variantes > 0 ? (
          <span title={item.variantes!.map((v) => v.fonte).join(", ")}>
            + {variantes} {variantes === 1 ? "veículo" : "veículos"}
          </span>
        ) : null}
      </div>
    </li>
  );
}
