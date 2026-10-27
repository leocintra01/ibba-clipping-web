import Link from "next/link";
import { listarEdicoesComOrigem } from "@/lib/edicoes";
import { AvisoListagem } from "@/components/AvisoListagem";

function rotuloData(iso: string): string {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(a, m - 1, d).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function Historico() {
  const { edicoes, origem } = await listarEdicoesComOrigem();

  // Agrupa por dia: o pipeline roda 3x e cada run vira uma edicao.
  const porDia = new Map<string, typeof edicoes>();
  for (const e of edicoes) {
    const lista = porDia.get(e.data) ?? [];
    lista.push(e);
    porDia.set(e.data, lista);
  }

  return (
    <main className="mx-auto max-w-3xl bg-papel shadow-[0_0_0_1px_var(--color-borda)] sm:my-6">
      <AvisoListagem origem={origem} />
      <header className="border-b-[3px] border-laranja px-6 pb-5 pt-7 sm:px-8 sm:pb-6 sm:pt-9">
        <p className="rotulo">Itaú BBA · Research</p>
        <h1 className="mt-2 font-[family-name:var(--font-leitura)] text-[30px] font-bold leading-[1.1] tracking-[-0.015em] sm:text-[36px]">
          Edições anteriores
        </h1>
        <p className="num mt-3 text-[13px] text-tinta-3">
          {edicoes.length} {edicoes.length === 1 ? "edição" : "edições"} em{" "}
          {porDia.size} {porDia.size === 1 ? "dia" : "dias"}
        </p>
        <Link
          href="/"
          className="mt-3 inline-block text-[13px] text-tinta-3 underline-offset-4 hover:text-laranja-700 hover:underline"
        >
          Voltar para a edição de hoje
        </Link>
      </header>

      <div className="px-6 pb-16 sm:px-8">
        {porDia.size === 0 ? (
          <p className="mt-6 text-[15px] text-tinta-3">
            Nenhuma edição arquivada.
          </p>
        ) : (
          [...porDia.entries()].map(([dia, lista]) => (
            <section key={dia} className="mt-7 first:mt-6">
              <h2 className="border-b-2 border-tinta pb-1.5 font-[family-name:var(--font-leitura)] text-[18px] font-semibold first-letter:uppercase">
                {rotuloData(dia)}
              </h2>
              <ul>
                {lista.map((e) => (
                  <li key={e.id} className="border-b border-borda last:border-0">
                    <Link
                      href={`/edicao/${e.id}`}
                      className="toque flex min-h-12 items-baseline gap-3 py-3 hover:text-laranja-700"
                    >
                      <span className="num text-[15px] font-medium">
                        {e.gerado_em.slice(11, 16)}
                      </span>
                      <span className="num text-[12px] text-tinta-3">
                        {e.itens} notícias
                      </span>
                      <span className="ml-auto text-tinta-4" aria-hidden>
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </main>
  );
}
