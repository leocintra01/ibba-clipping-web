import type { Item } from "@/lib/tipos";

/**
 * O que o analista precisa ver mesmo que leia mais nada.
 *
 * Fica ACIMA de qualquer filtro, sempre visivel. No HTML antigo o must-read
 * era so' mais uma pilula no meio de 70 linhas; aqui ele tem lugar proprio.
 */
export function Destaque({ itens }: { itens: Item[] }) {
  if (!itens.length) return null;
  return (
    <section
      aria-labelledby="h-destaque"
      className="border-l-2 border-laranja bg-papel px-4 py-3 sm:px-5"
    >
      <h2
        id="h-destaque"
        className="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-laranja-700"
      >
        Destaques do dia
      </h2>
      <ol className="flex flex-col gap-2.5">
        {itens.map((it, i) => (
          <li key={it.url} className="flex gap-2.5">
            <span className="mt-px font-mono text-[13px] tabular-nums text-laranja-700">
              {i + 1}
            </span>
            <div className="min-w-0">
              <a
                href={it.url}
                target="_blank"
                rel="noopener noreferrer"
                className="toque block text-[15px] font-medium leading-snug hover:text-laranja-700 hover:underline"
              >
                {it.titulo}
              </a>
              <div className="mt-0.5 font-mono text-[12px] text-tinta-3">
                {it.fonte || it.dominio}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
