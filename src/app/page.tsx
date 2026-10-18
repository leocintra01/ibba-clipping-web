import Link from "next/link";
import { edicaoAtual } from "@/lib/edicoes";
import { Alertas } from "@/components/Alertas";
import { Destaque } from "@/components/Destaque";
import { Edicao } from "@/components/Edicao";
import { ProvedorSelecao } from "@/lib/selecao";

function dataPorExtenso(iso: string): string {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(a, m - 1, d).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

function hora(iso: string): string {
  return iso.slice(11, 16);
}

export default async function Home() {
  const edicao = await edicaoAtual();

  if (!edicao) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="text-xl font-semibold">IBBA · TMT Daily News</h1>
        <p className="mt-2 text-tinta-3">
          Nenhuma edição disponível ainda.
        </p>
      </main>
    );
  }

  const destaques = edicao.top3.length
    ? edicao.top3
    : [
        ...edicao.clipping.br_off,
        ...edicao.clipping.br_oth,
        ...edicao.clipping.gl_off,
        ...edicao.clipping.gl_oth,
      ]
        .filter((i) => i.tag === "must-read")
        .slice(0, 3);

  return (
    <main className="mx-auto max-w-3xl bg-papel-2">
      <Alertas alertas={edicao.alertas} />

      <header className="bg-tinta px-4 py-4 text-white sm:px-5">
        <h1 className="text-[17px] font-semibold tracking-tight">
          IBBA <span className="text-laranja">·</span> TMT Daily News
        </h1>
        <p className="mt-0.5 font-mono text-[12px] text-[#a9a39c]">
          <span className="first-letter:uppercase">
            {dataPorExtenso(edicao.data)}
          </span>
          {" · "}
          {hora(edicao.gerado_em)}
          {" · "}
          <span className="tabular-nums">{edicao.totais.na_edicao}</span> notícias
          de <span className="tabular-nums">{edicao.totais.coletados}</span>{" "}
          lidas
        </p>
        <Link
          href="/historico"
          className="mt-2 inline-block font-mono text-[12px] text-[#a9a39c] underline-offset-2 hover:text-white hover:underline"
        >
          ver edições anteriores →
        </Link>
      </header>

      <Destaque itens={destaques} />
      <ProvedorSelecao edicaoId={edicao.gerado_em}>
        <Edicao edicao={edicao} />
      </ProvedorSelecao>
    </main>
  );
}
