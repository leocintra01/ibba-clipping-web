import Link from "next/link";
import { listarEdicoes } from "@/lib/edicoes";

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
  const edicoes = await listarEdicoes();

  // Agrupa por dia: o pipeline roda 3x e cada run vira uma edicao.
  const porDia = new Map<string, typeof edicoes>();
  for (const e of edicoes) {
    const lista = porDia.get(e.data) ?? [];
    lista.push(e);
    porDia.set(e.data, lista);
  }

  return (
    <main className="mx-auto max-w-3xl">
      <header className="bg-tinta px-4 py-4 text-white sm:px-5">
        <Link href="/" className="font-mono text-[12px] text-[#a9a39c] hover:text-white">
          ← edição de hoje
        </Link>
        <h1 className="mt-1 text-[17px] font-semibold tracking-tight">Histórico</h1>
        <p className="mt-0.5 font-mono text-[12px] text-[#a9a39c]">
          <span className="tabular-nums">{edicoes.length}</span>{" "}
          {edicoes.length === 1 ? "edição" : "edições"} ·{" "}
          <span className="tabular-nums">{porDia.size}</span>{" "}
          {porDia.size === 1 ? "dia" : "dias"}
        </p>
      </header>

      <div className="px-4 pb-12 sm:px-5">
        {porDia.size === 0 ? (
          <p className="mt-6 text-[15px] text-tinta-3">Nenhuma edição arquivada.</p>
        ) : (
          [...porDia.entries()].map(([dia, lista]) => (
            <section key={dia} className="mt-5">
              <h2 className="mb-1 border-b border-borda pb-1.5 text-[15px] font-semibold first-letter:uppercase">
                {rotuloData(dia)}
              </h2>
              <ul>
                {lista.map((e) => (
                  <li key={e.id} className="border-b border-borda last:border-0">
                    <Link
                      href={`/edicao/${e.id}`}
                      className="toque flex min-h-11 items-center gap-3 py-2.5 hover:text-laranja-700"
                    >
                      <span className="font-mono text-[13px] tabular-nums">
                        {e.gerado_em.slice(11, 16)}
                      </span>
                      <span className="font-mono text-[12px] text-tinta-3 tabular-nums">
                        {e.itens} notícias
                      </span>
                      <span className="ml-auto text-tinta-3" aria-hidden>→</span>
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
