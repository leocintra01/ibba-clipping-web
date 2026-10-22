import type { Item } from "@/lib/tipos";
import { quandoDoItem } from "@/lib/quando";

/**
 * O que o analista precisa ver mesmo que leia mais nada.
 *
 * Fica ACIMA de qualquer filtro, sempre visivel. No HTML antigo o must-read
 * era so' mais uma pilula no meio de 70 linhas; aqui ele tem lugar proprio.
 *
 * O numeral em laranja e' o unico ornamento do bloco. Nao ha caixa, nao ha
 * fundo colorido: a hierarquia vem do corpo do texto e do espaco.
 */
export function Destaque({ itens }: { itens: Item[] }) {
  if (!itens.length) return null;
  return (
    <section
      aria-labelledby="h-destaque"
      className="border-b border-borda bg-papel-2 px-6 py-6 sm:px-8"
    >
      <h2 id="h-destaque" className="rotulo">
        Destaques do dia
      </h2>
      <ol className="mt-4 flex flex-col gap-5">
        {itens.map((it, i) => {
          const quando = quandoDoItem(it);
          return (
            <li key={it.url} className="flex gap-4">
              <span
                aria-hidden
                className="num mt-[3px] w-5 shrink-0 font-[family-name:var(--font-leitura)] text-[20px] font-bold leading-none text-laranja"
              >
                {i + 1}
              </span>
              <div className="min-w-0">
                <a
                  href={it.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="toque block font-[family-name:var(--font-leitura)] text-[18px] font-semibold leading-[1.3] text-tinta decoration-laranja/40 underline-offset-[3px] hover:underline sm:text-[19px]"
                >
                  {it.titulo}
                </a>
                <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 text-[12px] text-tinta-3">
                  <span>{it.fonte || it.dominio}</span>
                  {quando ? <span className="num text-tinta-4">{quando}</span> : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
