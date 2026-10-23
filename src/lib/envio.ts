import type { Edicao, Item } from "./tipos";
import { ordenarParaEnvio, type Marcado } from "./selecao";

/**
 * O texto que vai para o WhatsApp.
 *
 * Formato IDENTICO ao do HTML antigo, e isso nao e' detalhe: e' o que os
 * clientes recebem ha meses. Mudar aqui muda o produto deles, nao o nosso.
 *
 *   *IBBA TMT Daily News*
 *   > Brazil
 *   - *titulo*
 *   url
 */
export function montarTexto(
  brasil: { titulo: string; url: string }[],
  global: { titulo: string; url: string }[],
): string {
  const l: string[] = ["*IBBA TMT Daily News*"];
  const secao = (rotulo: string, itens: { titulo: string; url: string }[]) => {
    if (!itens.length) return;
    l.push("", `> ${rotulo}`, "");
    for (const i of itens) {
      l.push(`- *${i.titulo}*`, i.url, "");
    }
  };
  secao("Brazil", brasil);
  secao("Global", global);
  return l.join("\n").trim();
}

export type Linha = { marca: Marcado; item: Item };

/** Mapa url -> item, cobrindo todos os blocos da edicao. */
export function indexarEdicao(edicao: Edicao): Map<string, Item> {
  const m = new Map<string, Item>();
  for (const grupo of [
    edicao.clipping.br_off,
    edicao.clipping.br_oth,
    edicao.clipping.gl_off,
    edicao.clipping.gl_oth,
    edicao.last_news.brazil,
    edicao.last_news.global,
  ]) {
    for (const i of grupo) if (!m.has(i.url)) m.set(i.url, i);
  }
  return m;
}

/**
 * Separa o que esta marcado em Brasil e Global, ja na ordem do envio.
 *
 * A ordem vem de `ordenarParaEnvio`: quem tem numero de prioridade vai
 * primeiro, na ordem do numero; o resto segue a ordem manual (arrasto) ou a
 * ordem em que foi marcado.
 */
export function separarParaEnvio(
  marcados: Record<string, Marcado>,
  porUrl: Map<string, Item>,
): { brasil: Linha[]; global: Linha[] } {
  const br: Linha[] = [];
  const gl: Linha[] = [];
  for (const m of ordenarParaEnvio(Object.values(marcados))) {
    const item = porUrl.get(m.url);
    if (!item) continue;
    (item.bucket.startsWith("BR") ? br : gl).push({ marca: m, item });
  }
  return { brasil: br, global: gl };
}

/** Copia para a area de transferencia, com fallback para contexto sem permissao. */
export async function copiar(texto: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(texto);
    return;
  } catch {
    // Contexto sem permissao: cai pro seletor, que deixa copiar com Ctrl+C
    // sem perder o trabalho.
  }
  const ta = document.createElement("textarea");
  ta.value = texto;
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
  } catch {
    /* ignora */
  }
  ta.remove();
}
