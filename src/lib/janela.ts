import type { Edicao } from "./tipos";

/**
 * Quantas horas a edicao cobre, e se ela e' a primeira depois de uma parada.
 *
 * Mora aqui, e nao dentro de um componente, porque DUAS telas precisam da
 * mesma resposta: o aviso no topo da pagina e o filtro que decide se a
 * noticia ja' publicada entra na lista. Enquanto a conta vivia so' dentro de
 * `Edicao.tsx`, o aviso nascia abaixo dos Destaques — e os Destaques sao
 * exatamente onde ele fotografou "23/10" sem explicacao nenhuma.
 */
export function horasDaJanela(edicao: Edicao): number {
  const ini = edicao.janela?.inicio;
  if (!ini) return 0;
  const ms = new Date(edicao.gerado_em).getTime() - new Date(ini).getTime();
  return Number.isFinite(ms) ? ms / 36e5 : 0;
}

/**
 * O corte e' 40h, e vem das janelas reais, nao de chute:
 *    06:30   09:30 de ontem -> 06:30        = 21h
 *    14:00   09:30 de ontem -> 14:00        = 28,5h
 *    20:00   09:30 de ontem -> 20:00        = 34,5h
 *    segunda 09:30 de SEXTA -> 06:30        = 69h
 * A primeira versao usava 30h e marcava a edicao das 20:02, que tem 34,5h e
 * e' uma edicao normal.
 */
export function primeiraDepoisDaParada(edicao: Edicao): boolean {
  return horasDaJanela(edicao) > 40;
}
