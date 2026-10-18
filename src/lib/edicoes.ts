import fs from "node:fs/promises";
import path from "node:path";
import type { Edicao, ResumoEdicao } from "./tipos";

/**
 * CAMADA DE DADOS — ponto unico de leitura das edicoes.
 *
 * Hoje le arquivos JSON de /data, gravados pelo robo (gerar_clipping.py) e
 * versionados no repositorio: o Vercel publica a cada push, mesmo padrao do
 * Dashboard. Decisao do analista em 18/10/2026: "JSON agora, Supabase depois".
 *
 * Trocar para Supabase e' mudar ESTE arquivo e mais nenhum. Todo o resto do
 * app consome `listarEdicoes` e `lerEdicao` sem saber de onde vem. E' por isso
 * que as duas funcoes sao assincronas mesmo lendo disco — assim a assinatura
 * nao muda quando a origem virar rede.
 */

const DIR_DADOS = path.join(process.cwd(), "data");
const RE_ARQUIVO = /^edicao-(\d{4}-\d{2}-\d{2}(?:-\d{4})?)\.json$/;

/** Id da edicao = o sufixo do arquivo. "2026-10-15" ou "2026-10-15-1402". */
function idDoArquivo(nome: string): string | null {
  const m = nome.match(RE_ARQUIVO);
  return m ? m[1] : null;
}

function arquivoDoId(id: string): string {
  return path.join(DIR_DADOS, `edicao-${id}.json`);
}

async function lerJson(caminho: string): Promise<Edicao | null> {
  try {
    const txt = await fs.readFile(caminho, "utf-8");
    return JSON.parse(txt) as Edicao;
  } catch {
    return null;
  }
}

/** Edicoes disponiveis, da mais recente para a mais antiga. */
export async function listarEdicoes(): Promise<ResumoEdicao[]> {
  "use cache";
  let nomes: string[];
  try {
    nomes = await fs.readdir(DIR_DADOS);
  } catch {
    return [];
  }
  const ids = nomes.map(idDoArquivo).filter((x): x is string => !!x);
  const resumos = await Promise.all(
    ids.map(async (id) => {
      const e = await lerJson(arquivoDoId(id));
      if (!e) return null;
      return {
        id,
        data: e.data,
        gerado_em: e.gerado_em,
        itens: e.totais?.na_edicao ?? 0,
      } satisfies ResumoEdicao;
    }),
  );
  return resumos
    .filter((x): x is ResumoEdicao => !!x)
    .sort((a, b) => (a.gerado_em < b.gerado_em ? 1 : -1));
}

/** Uma edicao pelo id. `null` quando nao existe. */
export async function lerEdicao(id: string): Promise<Edicao | null> {
  "use cache";
  if (!/^[\d-]{10,15}$/.test(id)) return null; // nunca montar caminho com entrada crua
  return lerJson(arquivoDoId(id));
}

/** A edicao mais recente. */
export async function edicaoAtual(): Promise<Edicao | null> {
  "use cache";
  const [maisNova] = await listarEdicoes();
  return maisNova ? lerEdicao(maisNova.id) : null;
}
