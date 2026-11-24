import type { Metadata } from "next";
import type { Edicao } from "./tipos";

/**
 * O que aparece quando alguem cola o link no WhatsApp.
 *
 * O Pages resolveu isso em outubro e este site nao herdou: colado no
 * WhatsApp, o link do Pages dizia "IBBA - TMT Daily News · 24/11/2026" e
 * "70 noticias"; o daqui dizia so' "TMT Daily News · Itaú BBA" e uma frase
 * generica, igual todo dia. Quem recebe nao sabia de que dia era o clipping
 * antes de abrir — e e' este o link que vai para cliente.
 *
 * O WhatsApp esta na lista de robos "HTML-limited" do Next 16
 * (`html-bots.js`), entao estas tags saem no <head> da resposta para ele, e
 * nao no fim do <body> como no streaming de metadata.
 *
 * A data e' a da EDICAO, nao a de hoje: a pagina de uma edicao antiga,
 * colada, tem que dizer o dia dela.
 */
function dataCurta(iso: string): string {
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

export function metadadosDaEdicao(edicao: Edicao): Metadata {
  const dia = dataCurta(edicao.data);
  const hora = edicao.gerado_em.slice(11, 16);
  const n = edicao.totais?.na_edicao ?? 0;
  const titulo = `TMT Daily News · ${dia}`;
  const descricao =
    `Clipping TMT de ${dia}, edição das ${hora} — ${n} notícias de ` +
    `telecom, mídia e tecnologia selecionadas para o Itaú BBA.`;
  return {
    description: descricao,
    openGraph: {
      type: "article",
      title: titulo,
      description: descricao,
      locale: "pt_BR",
      siteName: "Itaú BBA · TMT Daily News",
    },
    twitter: {
      card: "summary",
      title: titulo,
      description: descricao,
    },
  };
}
