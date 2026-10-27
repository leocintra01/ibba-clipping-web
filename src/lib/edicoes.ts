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
 * E A LISTAGEM NAO PASSA MAIS PELA API DO GITHUB. Media em 27/10/2026: a API
 * sem credencial da 60 chamadas por HORA e o limite e' por IP; no Vercel o IP
 * de saida e' compartilhado com outros clientes, entao ela vive esgotada.
 * Quando ela devolvia 403 o codigo caia no disco SEM DIZER NADA, e o disco e'
 * o retrato do ultimo deploy. Foi o defeito das 6h30 de 27/10: o analista
 * abriu o site e recebeu os 8 arquivos gravados no build de 26/10 as 15:13,
 * com cara de pagina normal e sem a edicao das 06:32 que estava no repo desde
 * as 06:33. A pagina oscilava entre atual e congelada conforme a API
 * respondia.
 *
 * Agora a listagem vem de UM arquivo, `data/index.json`, que o robo escreve
 * junto com a edicao e que o raw.githubusercontent serve por CDN, sem limite
 * de chamada. Ele ja traz data, horario e contagem de cada edicao, entao a
 * listagem e' UMA requisicao em vez de uma por edicao — e deixa de perder
 * edicao em silencio quando uma leitura falha.
 *
 * O disco continua como PLANO B, e agora ele AVISA. Se a listagem cair nele,
 * `origem` volta "disco" e a pagina diz ao leitor que pode estar atrasada:
 * uma superficie que erra calada e' pior que uma que erra falando, e a regra
 * 2 do CLAUDE.md manda avisar.
 *
 * Trocar para Supabase continua sendo mudar ESTE arquivo e mais nenhum.
 */

const REPO = "leocintra01/ibba-clipping-web";
const API_DIR = `https://api.github.com/repos/${REPO}/contents/data`;
const RAW = `https://raw.githubusercontent.com/${REPO}/master/data`;
/** Listagem pronta, escrita pelo robo a cada run. Ver scripts/gerar_index_site.py. */
const MANIFESTO = `${RAW}/index.json`;

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

/** De onde a listagem veio. "disco" e' o retrato do ultimo deploy: avisar. */
export type OrigemListagem = "manifesto" | "api" | "disco";

export interface Listagem {
  edicoes: ResumoEdicao[];
  origem: OrigemListagem;
}

interface LinhaManifesto {
  id: string;
  data: string;
  gerado_em: string;
  itens: number;
}

/**
 * A listagem em uma requisicao, por CDN, sem a API que esgota.
 *
 * Valida id por id: o manifesto e' um arquivo do repositorio, e id entra em
 * caminho e em URL mais adiante. `null` quando nao da' para confiar no que
 * voltou, e ai' quem chama tenta o caminho seguinte — nunca mostra lista
 * vazia por causa de um arquivo malformado.
 */
async function lerManifesto(): Promise<ResumoEdicao[] | null> {
  try {
    const r = await fetch(MANIFESTO, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) throw new Error(String(r.status));
    const bruto = (await r.json()) as { edicoes?: LinhaManifesto[] };
    const linhas = (bruto.edicoes ?? []).filter(
      (l) =>
        !!l &&
        typeof l.id === "string" &&
        idValido(l.id) &&
        typeof l.gerado_em === "string" &&
        !!l.gerado_em,
    );
    if (!linhas.length) return null;
    return linhas.map((l) => ({
      id: l.id,
      data: typeof l.data === "string" && l.data ? l.data : l.id.slice(0, 10),
      gerado_em: l.gerado_em,
      itens: Number(l.itens) || 0,
    }));
  } catch {
    return null;
  }
}

/** Resumo de cada id, descartando o que nao abre. */
async function resumosDeIds(
  ids: string[],
  ler: (id: string) => Promise<Edicao | null>,
): Promise<ResumoEdicao[]> {
  const resumos = await Promise.all(
    ids.map(async (id) => {
      const e = await ler(id);
      if (!e) return null;
      return {
        id,
        data: e.data,
        gerado_em: e.gerado_em,
        itens: e.totais?.na_edicao ?? 0,
      } satisfies ResumoEdicao;
    }),
  );
  return resumos.filter((x): x is ResumoEdicao => !!x);
}

/**
 * Ids pela API do GitHub. `null` quando ela nao responde — e ela nao responde
 * com frequencia: 60 chamadas por hora, por IP, e o IP do Vercel e' dividido
 * com outros clientes. Segundo caminho, nao o primeiro.
 */
async function idsDaApi(): Promise<string[] | null> {
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
    return ids.length ? ids : null;
  } catch {
    return null;
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

/**
 * Perfil de cache das listagens e da edicao corrente.
 *
 * `cacheLife("minutes")` parecia conservador e nao era: ele deixa a entrada
 * EXPIRAR so' depois de uma hora, e dentro dessa hora o primeiro visitante
 * recebe a copia velha enquanto a nova e' buscada atras dele. Em 26/10 foi
 * exatamente isso — o analista abriu o link as 15h e viu a edicao das 06:30,
 * publicada ha' nove horas, porque ninguem tinha visitado no intervalo.
 *
 * O que importa aqui e' o `expire`: passado ele, a requisicao BLOQUEIA e vai
 * buscar. Dois minutos e' tempo de sobra para nao bater no GitHub a cada
 * recarga e curto o bastante para que a edicao que acabou de sair apareca.
 */
const CACHE_EDICAO_CORRENTE = {
  stale: 60,
  revalidate: 60,
  expire: 300,
} as const;

export async function listarEdicoesComOrigem(): Promise<Listagem> {
  "use cache";
  cacheLife(CACHE_EDICAO_CORRENTE);
  const ordenar = (l: ResumoEdicao[]) =>
    [...l].sort((a, b) => (a.gerado_em < b.gerado_em ? 1 : -1));

  // 1. O manifesto: uma requisicao, por CDN, sem limite de chamada.
  const manifesto = await lerManifesto();
  if (manifesto) return { edicoes: ordenar(manifesto), origem: "manifesto" };

  // 2. A API, para edicao publicada antes do manifesto existir.
  const ids = await idsDaApi();
  if (ids) {
    const edicoes = await resumosDeIds(ids, lerUma);
    if (edicoes.length) return { edicoes: ordenar(edicoes), origem: "api" };
  }

  // 3. O disco: o retrato do ultimo deploy. Serve a pagina e AVISA.
  const edicoes = await resumosDeIds(await listarDoDisco(), lerDoDisco);
  return { edicoes: ordenar(edicoes), origem: "disco" };
}

/** Edicoes disponiveis, da mais recente para a mais antiga. */
export async function listarEdicoes(): Promise<ResumoEdicao[]> {
  return (await listarEdicoesComOrigem()).edicoes;
}

/** Uma edicao pelo id. `null` quando nao existe. */
export async function lerEdicao(id: string): Promise<Edicao | null> {
  "use cache";
  // Uma edicao PASSADA nao muda: desde o conserto do nome com -HHMM, cada run
  // escreve um arquivo proprio. Entao aqui o cache longo esta certo, e e' so'
  // a listagem e a edicao CORRENTE que precisam expirar rapido.
  cacheLife("minutes");
  return lerUma(id);
}

/**
 * A edicao mais recente, e de onde a listagem veio.
 *
 * A origem sobe junto porque quem decide "qual e' a mais recente" e' a
 * listagem: se ela veio do disco, a edicao de cima pode ser a de ontem com
 * cara de ser a de hoje. Quem mostra a pagina precisa poder dizer isso.
 */
export async function edicaoAtualComOrigem(): Promise<{
  edicao: Edicao | null;
  origem: OrigemListagem;
}> {
  "use cache";
  cacheLife(CACHE_EDICAO_CORRENTE);
  const { edicoes, origem } = await listarEdicoesComOrigem();
  const [maisNova] = edicoes;
  const edicao = maisNova
    ? origem === "disco"
      ? await lerDoDisco(maisNova.id)
      : await lerUma(maisNova.id)
    : null;
  return { edicao, origem };
}

/** A edicao mais recente. */
export async function edicaoAtual(): Promise<Edicao | null> {
  return (await edicaoAtualComOrigem()).edicao;
}
