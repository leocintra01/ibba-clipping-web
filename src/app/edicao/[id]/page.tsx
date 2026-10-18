import Link from "next/link";
import { notFound } from "next/navigation";
import { lerEdicao, listarEdicoes } from "@/lib/edicoes";
import { Alertas } from "@/components/Alertas";
import { Destaque } from "@/components/Destaque";
import { Edicao } from "@/components/Edicao";
import { ProvedorSelecao } from "@/lib/selecao";

export async function generateStaticParams() {
  const edicoes = await listarEdicoes();
  return edicoes.map((e) => ({ id: e.id }));
}

function dataPorExtenso(iso: string): string {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(a, m - 1, d).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

export default async function PaginaEdicao({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const edicao = await lerEdicao(id);
  if (!edicao) notFound();

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
    <main className="mx-auto max-w-3xl">
      <Alertas alertas={edicao.alertas} />
      <header className="bg-tinta px-4 py-4 text-white sm:px-5">
        <Link href="/historico" className="font-mono text-[12px] text-[#a9a39c] hover:text-white">
          ← histórico
        </Link>
        <h1 className="mt-1 text-[17px] font-semibold tracking-tight">
          IBBA <span className="text-laranja">·</span> TMT Daily News
        </h1>
        <p className="mt-0.5 font-mono text-[12px] text-[#a9a39c]">
          <span className="first-letter:uppercase">{dataPorExtenso(edicao.data)}</span>
          {" · "}
          {edicao.gerado_em.slice(11, 16)}
          {" · "}
          <span className="tabular-nums">{edicao.totais.na_edicao}</span> notícias
        </p>
      </header>
      <Destaque itens={destaques} />
      <ProvedorSelecao edicaoId={edicao.gerado_em}>
        <Edicao edicao={edicao} />
      </ProvedorSelecao>
    </main>
  );
}
