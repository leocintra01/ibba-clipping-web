import type { Edicao } from "@/lib/tipos";
import { COMMIT_DO_SITE } from "@/lib/versao";

/**
 * Qual codigo esta no ar, e qual codigo gerou a edicao na tela.
 *
 * Sao dois artefatos independentes e os dois podem estar velhos sozinhos: o
 * push no GitHub nao publica este site (o `vercel git connect` nunca foi
 * concluido) e os DADOS chegam por conta propria, porque `edicoes.ts` busca as
 * edicoes em tempo de execucao. A tela pode estar velha com a edicao de hoje,
 * ou nova com uma edicao de anteontem, e nos dois casos nada parece quebrado —
 * foi o que fez dois consertos nao chegarem ao leitor em 25/10/2026
 * (editor, E3).
 *
 * Fica discreto no rodape de proposito: nao e' informacao de leitura, e' de
 * quem mantem. Mas tem que estar na TELA, nao so' num JSON, porque a pergunta
 * aparece quando ele esta olhando a tela.
 */

/** `edicao` opcional: o /historico nao tem uma edicao na tela, e mesmo assim
 *  precisa dizer qual site esta no ar — ele era a unica das tres paginas sem
 *  rodape nenhum (editor, E22). */
export function Carimbo({ edicao }: { edicao?: Edicao }) {
  const pipeline = edicao?.pipeline_commit;
  return (
    <footer className="border-t border-borda px-6 py-4 text-[11px] text-tinta-4 sm:px-8">
      <span className="num">
        site:{COMMIT_DO_SITE}
        {edicao ? ` · edição gerada por pipeline:${pipeline || "?"}` : null}
      </span>
    </footer>
  );
}
