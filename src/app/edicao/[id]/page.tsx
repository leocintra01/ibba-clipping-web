import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { idsParaPrerender, lerEdicao } from "@/lib/edicoes";
import { metadadosDaEdicao } from "@/lib/metadados";
import { Alertas } from "@/components/Alertas";
import { AvisoEdicaoAntiga } from "@/components/AvisoEdicaoAntiga";
import { AvisoJanela } from "@/components/AvisoJanela";
import { Cabecalho } from "@/components/Cabecalho";
import { Destaque } from "@/components/Destaque";
import { Edicao } from "@/components/Edicao";
import { ProvedorSelecao } from "@/lib/selecao";

export async function generateStaticParams() {
  const ids = await idsParaPrerender();
  return ids.map((id) => ({ id }));
}

/** Previa do link colado: o dia DESTA edicao, nao o de hoje. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const edicao = await lerEdicao(id);
  return edicao ? metadadosDaEdicao(edicao) : {};
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
    <main className="mx-auto max-w-3xl bg-papel shadow-[0_0_0_1px_var(--color-borda)] sm:my-6">
      {/* Qual codigo gerou ESTA edicao. Invisivel, pelo mesmo motivo
          do carimbo do site no layout: responde "o conserto chegou ou
          a edicao e' antiga?" sem aparecer para quem le. */}
      <meta name="x-pipeline-commit" content={edicao.pipeline_commit || "?"} />
      <meta
        name="x-itens-edicao"
        content={String(edicao.totais?.na_edicao ?? 0)}
      />
      {/* A listagem e' lida no pedido (CACHE_EDICAO_CORRENTE): sem isso,
          uma edicao que era a mais nova no deploy nunca se acusaria de
          velha. Enquanto ela chega, nao ha' aviso nenhum. */}
      <Suspense fallback={null}>
        <AvisoEdicaoAntiga id={id} geradoEm={edicao.gerado_em} />
      </Suspense>
      <Alertas alertas={edicao.alertas} />
      <AvisoJanela edicao={edicao} />
      <Cabecalho edicao={edicao}>
        <Link
          href="/historico"
          className="text-[13px] text-tinta-3 underline-offset-4 hover:text-laranja-700 hover:underline"
        >
          Voltar ao histórico
        </Link>
      </Cabecalho>
      <Destaque itens={destaques} />
      <ProvedorSelecao
        edicaoId={edicao.gerado_em}
        oficiais={[
          // Procedencia, nao bloco: o pipeline desvia item de fonte oficial
          // para o bloco "outras" (overflow, ou o piso por teto de entidade),
          // e ler so' br_off+gl_off tirava esses itens do rascunho sem aviso
          // — 5 numa edicao medida (editor, E2). `oficial` e' propriedade do
          // item; o `??` cobre edicao publicada antes do campo existir.
          ...edicao.clipping.br_off,
          ...edicao.clipping.gl_off,
          ...edicao.clipping.br_oth.filter((i) => i.oficial),
          ...edicao.clipping.gl_oth.filter((i) => i.oficial),
        ].filter((i) => !i.repetido)}
      >
        <Edicao edicao={edicao} />
      </ProvedorSelecao>
    </main>
  );
}
