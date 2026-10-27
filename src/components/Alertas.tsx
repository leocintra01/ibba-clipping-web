/**
 * Faixa de aviso acima de qualquer notícia.
 *
 * Existe porque em outubro o aviso "FONTE MORTA HA 3+ DIAS" ficou dezenove
 * dias no RODAPE do clipping sem ninguem ver. Alerta que nao e' lido nao e'
 * alerta: aqui ele vem antes de qualquer noticia.
 *
 * Dois estados, de proposito: edicao enxuta e' dia de pouca noticia, nao
 * defeito, e chamar isso de "pipeline com problema" seria mentir sobre o
 * estado do pipeline — o oposto do que esta faixa existe pra fazer.
 *
 * Duas coisas ficaram FORA DA FAIXA depois de medir, e e' o que mantem a
 * faixa funcionando como faixa:
 *   "ZERADAS" — 19 de 19 edicoes tem ao menos uma fonte prioritaria zerada.
 *   "Fontes com erro" generico — portal individual falha em 61% das edicoes,
 *   e o proprio workflow trata isso como degradacao aceitavel.
 *
 * Mas "nao gritar" virou "nao dizer", e isso e' outra coisa. Em 26/10 o
 * TeleSintese deu timeout as 14:03 e duas brasileiras que estavam na edicao
 * das 06:33 sumiram da seguinte; o JSON registrava "Fontes com erro:
 * TeleSintese (direto)", o backup do Pages mostrava, e ESTA tela — a que ele
 * le — nao mostrava nada. A regra 2 do CLAUDE.md manda avisar.
 *
 * Entao sao tres niveis, nao dois: a faixa vermelha para quebra, a laranja
 * para edicao enxuta, e uma LINHA discreta para fonte que falhou. A linha nao
 * compete com noticia nenhuma e responde "faltou alguma coisa hoje?" sem
 * transformar degradacao rotineira em alarme.
 */
const QUEBRA = [
  "FONTE MORTA",
  "DECODER",
  "GOOGLE NEWS:",
  // Sentinela: um BLOCO inteiro de coleta caiu. Foi o apagao de agosto.
  "BLOCO DE FONTES CAIU",
];
const ENXUTA = "EDICAO ENXUTA";
/** Degradacao rotineira: nao e' alarme, mas o leitor tem que poder saber. */
const DISCRETO = ["FONTES COM ERRO", "ZERADAS"];

export function Alertas({ alertas }: { alertas: string[] }) {
  const quebra = alertas.filter((a) =>
    QUEBRA.some((k) => a.toUpperCase().includes(k)),
  );
  const enxuta = alertas.filter((a) => a.toUpperCase().includes(ENXUTA));
  const discretos = alertas.filter(
    (a) =>
      DISCRETO.some((k) => a.toUpperCase().includes(k)) &&
      !quebra.includes(a) &&
      !enxuta.includes(a),
  );
  if (!quebra.length && !enxuta.length && !discretos.length) return null;

  const grave = quebra.length > 0;
  const mostrar = grave ? quebra : enxuta;
  return (
    <>
      {quebra.length || enxuta.length ? (
        <div
          role="alert"
          className={`border-l-[3px] px-6 py-3 text-[13px] leading-relaxed sm:px-8 ${
            grave
              ? "border-[#9b2c2c] bg-[#fdf2f2] text-[#7a2222]"
              : "border-laranja bg-laranja-suave text-laranja-700"
          }`}
        >
          <strong className="font-semibold">
            {grave ? "Pipeline com problema." : "Dia de pouca notícia."}
          </strong>{" "}
          {mostrar.join(" · ")}
        </div>
      ) : null}
      {discretos.length ? (
        <p className="border-b border-borda bg-papel-2 px-6 py-2 text-[12px] leading-relaxed text-tinta-3 sm:px-8">
          {discretos.join(" · ")}
        </p>
      ) : null}
    </>
  );
}
