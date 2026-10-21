import type { Item } from "./tipos";

/**
 * Data e hora de uma noticia, no formato "DD/MM HH:MM".
 *
 * O robo manda `data` em ISO com fuso (quase sempre -03:00) e `tem_hora`
 * dizendo se a hora e' real ou chute. O campo `quando` que ele ja' calcula
 * existe so' no Last News e vem vazio quando nao ha' hora — por isso a conta
 * e' refeita aqui, com os dois campos que todo item tem.
 *
 * O fuso e' fixo em Sao Paulo de proposito: um item de fonte estrangeira pode
 * vir com outro offset, e a hora que interessa e' a de quem le'. Fixar tambem
 * garante que servidor e navegador produzam exatamente o mesmo texto — fuso do
 * visitante daria divergencia de hidratacao.
 */
const FORMATO = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function quandoDoItem(item: Pick<Item, "data" | "tem_hora">): string {
  const bruto = item.data?.trim();
  if (!bruto) return "";

  const soData = /^(\d{4})-(\d{2})-(\d{2})$/.exec(bruto);
  // Sem hora, a string e' um DIA, nao um instante: passar por Date() a leria
  // como meia-noite UTC e jogaria a noticia pro dia anterior.
  if (soData || item.tem_hora === false) {
    const dia = soData ?? /^(\d{4})-(\d{2})-(\d{2})/.exec(bruto);
    return dia ? `${dia[3]}/${dia[2]}` : "";
  }

  const d = new Date(bruto);
  if (Number.isNaN(d.getTime())) return "";
  const p: Record<string, string> = {};
  for (const parte of FORMATO.formatToParts(d)) p[parte.type] = parte.value;
  return `${p.day}/${p.month} ${p.hour}:${p.minute}`;
}
