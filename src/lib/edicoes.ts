import fs from "node:fs/promises";
import path from "node:path";
import { cacheLife } from "next/cache";
import type { Edicao, ResumoEdicao } from "./tipos";

/**
 * CAMADA DE DADOS — ponto unico de leitura das edicoes.
 *
 * Le direto do repositorio onde o robo grava, PELA REDE, e nao do disco do
 * build. A diferenca decide se o site atualiza sozinho:
 *
 *   antes  — os JSON eram lidos do disco no momento do build. O robo gravava
 *            a edicao das 06:30 no repo e o site continuava mostrando a de
 *            ontem ate alguem rodar um deploy a mao. Em 23/10/2026 o analista
 *            abriu o site as 12h e viu a edicao do dia anterior.
 *   agora  — busca a listagem e o JSON pela API do GitHub, com revalidacao de
 *            5 minutos. Edicao nova aparece sozinha; deploy so' e' preciso
 *            quando o CODIGO muda.
 *
 * O repositorio e' publico, entao nao ha credencial envolvida.
 *
 * O disco continua como PLANO B. Se a rede falhar ou a API limitar, o site
 * cai nos arquivos versionados em /data — pior que o ideal (pode estar um dia
 * atras) e muito melhor que uma pagina de erro as 6h30.
 *
 * Trocar para Supabase continua sendo mudar ESTE arquivo e mais nenhum.
 */

const REPO = "leocintra01/ibba-clipping-web";
const API_DIR = `https://api.github.com/repos/${REPO}/contents/data`;
const RAW = `https://raw.githubusercontent.com/${REPO}/master/data`;

const DIR_DADOS = path.join(process.cwd(), "data");
const RE_ARQUIVO = /^edicao-(\d{4}-\d{2}-\d{2}(?:-\d{4})?)\.json$/;

/** Id da edicao = o sufixo do arquivo. "2026-10-15" ou "2026-10-15-1402". */
function idDoArquivo(nome: string): string | null {
  const m = nome.match(RE_ARQUIVO);
  return m ? m[1] : null;
}

/** Id so' com digitos e hifen: nunca montar caminho nem URL com entrada crua. */
function idValido(id: string): boolean {
  return /^\d{4}-\d{2}-\d{2}(-\d{4})?$/.test(id);
}

async function lerDoDisco(id: string): Promise<Edicao | null> {
  try {
    const txt = await fs.readFile(
      path.join(DIR_DADOS, `edicao-${id}.json`),
      "utf-8",
    );
    return JSON.parse(txt) as Edicao;
  } catch {
    return null;
  }
}

async function listarDoDisco(): Promise<string[]> {
  try {
    return (await fs.readdir(DIR_DADOS))
      .map(idDoArquivo)
      .filter((x): x is string => !!x);
  } catch {
    return [];
  }
}

/** Ids das edicoes no repositorio; cai no disco se a rede falhar. */
async function listarIds(): Promise<string[]> {
  try {
    const r = await fetch(API_DIR, {
      headers: { Accept: "application/vnd.github+json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) throw new Error(String(r.status));
    const arquivos = (await r.json()) as { name: string }[];
    const ids = arquivos
      .map((a) => idDoArquivo(a.name))
      .filter((x): x is string => !!x);
    if (ids.length) return ids;
    throw new Error("listagem vazia");
  } catch {
    return listarDoDisco();
  }
}

async function lerUma(id: string): Promise<Edicao | null> {
  if (!idValido(id)) return null;
  try {
    const r = await fetch(`${RAW}/edicao-${id}.json`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) throw new Error(String(r.status));
    return (await r.json()) as Edicao;
  } catch {
    return lerDoDisco(id);
  }
}

/** Edicoes disponiveis, da mais recente para a mais antiga. */
export async function listarEdicoes(): Promise<ResumoEdicao[]> {
  "use cache";
  // Cinco minutos: o robo publica tres vezes ao dia, entao nao ha ganho em
  // bater no GitHub a cada visita — e ha perda em deixar a pagina velha.
  cacheLife("minutes");
  const ids = await listarIds();
  const resumos = await Promise.all(
    ids.map(async (id) => {
      const e = await lerUma(id);
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
  cacheLife("minutes");
  return lerUma(id);
}

/** A edicao mais recente. */
export async function edicaoAtual(): Promise<Edicao | null> {
  "use cache";
  cacheLife("minutes");
  const [maisNova] = await listarEdicoes();
  return maisNova ? lerUma(maisNova.id) : null;
}
