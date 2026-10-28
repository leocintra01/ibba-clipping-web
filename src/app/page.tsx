import Link from "next/link";
import { edicaoAtualComOrigem } from "@/lib/edicoes";
import { Alertas } from "@/components/Alertas";
import { AvisoJanela } from "@/components/AvisoJanela";
import { AvisoListagem } from "@/components/AvisoListagem";
import { Cabecalho } from "@/components/Cabecalho";
import { Destaque } from "@/components/Destaque";
import { Edicao } from "@/components/Edicao";
import { ProvedorSelecao } from "@/lib/selecao";

export default async function Home() {
  const { edicao, origem } = await edicaoAtualComOrigem();

  if (!edicao) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="font-[family-name:var(--font-leitura)] text-2xl font-semibold">
          TMT Daily News
        </h1>
        <p className="mt-2 text-[15px] text-tinta-3">
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
    <main className="mx-auto max-w-3xl bg-papel shadow-[0_0_0_1px_var(--color-borda)] sm:my-6">
      {/* Qual codigo gerou ESTA edicao. Invisivel, pelo mesmo motivo
          do carimbo do site no layout: responde "o conserto chegou ou
          a edicao e' antiga?" sem aparecer para quem le. */}
      <meta name="x-pipeline-commit" content={edicao.pipeline_commit || "?"} />
      {/* De onde veio a listagem: "manifesto", "api" ou "disco".
          Invisivel, pelo mesmo motivo do x-pipeline-commit: responde
          "a pagina esta congelada?" sem aparecer para quem le. Em
          27/10 essa pergunta custou uma manha para ser respondida. */}
      <meta name="x-origem-listagem" content={origem} />
      <AvisoListagem origem={origem} />
      <meta
        name="x-itens-edicao"
        content={String(edicao.totais?.na_edicao ?? 0)}
      />
      <Alertas alertas={edicao.alertas} />
      <AvisoJanela edicao={edicao} />
      <Cabecalho edicao={edicao}>
        <Link
          href="/historico"
          className="text-[13px] text-tinta-3 underline-offset-4 hover:text-laranja-700 hover:underline"
        >
          Edições anteriores
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
