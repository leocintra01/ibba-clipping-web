import type { Edicao } from "@/lib/tipos";
import { horasDaJanela, primeiraDepoisDaParada } from "@/lib/janela";

/**
 * "Esta edicao cobre varios dias" — antes de qualquer noticia.
 *
 * Em 27/10/2026 ele fotografou duas linhas de 23/10 e escreveu "tem noticia
 * antiga entrando no clipping, isso e' ultra grave". Media: a edicao que ele
 * tinha na tela era a de segunda as 14:03, cuja janela comeca na sexta —
 * aquelas linhas estavam certas, e sem elas ele teria perdido a sexta
 * inteira. O defeito era a tela nao dizer nada.
 *
 * Fica ACIMA dos Destaques de proposito. Os tres Destaques daquela edicao
 * eram todos de 23/10, e sao a primeira coisa que se le; um aviso embaixo
 * deles chegaria tarde.
 */
export function AvisoJanela({ edicao }: { edicao: Edicao }) {
  if (!primeiraDepoisDaParada(edicao)) return null;
  return (
    <p className="border-b border-borda bg-laranja-suave px-6 py-3 text-[13px] leading-relaxed text-laranja-700 sm:px-8">
      <strong className="font-semibold">
        Primeira edição desde a última parada.
      </strong>{" "}
      A janela cobre <span className="num">{Math.round(horasDaJanela(edicao))}</span>{" "}
      horas, então entram notícias de dias anteriores — é o acumulado do
      período, não notícia velha.
    </p>
  );
}
