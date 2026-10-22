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
 * Duas coisas FICARAM DE FORA depois de medir, e e' o que mantem a faixa
 * funcionando como faixa:
 *   "ZERADAS" — 19 de 19 edicoes tem ao menos uma fonte prioritaria zerada.
 *   "Fontes com erro" generico — portal individual falha em 61% das edicoes,
 *   e o proprio workflow trata isso como degradacao aceitavel.
 * As duas seguem no rodape do HTML e no campo "alertas" do JSON. O que elas
 * nao fazem mais e' gritar.
 */
const QUEBRA = [
  "FONTE MORTA",
  "DECODER",
  "GOOGLE NEWS:",
  // Sentinela: um BLOCO inteiro de coleta caiu. Foi o apagao de agosto.
  "BLOCO DE FONTES CAIU",
];
const ENXUTA = "EDICAO ENXUTA";

export function Alertas({ alertas }: { alertas: string[] }) {
  const quebra = alertas.filter((a) =>
    QUEBRA.some((k) => a.toUpperCase().includes(k)),
  );
  const enxuta = alertas.filter((a) => a.toUpperCase().includes(ENXUTA));
  if (!quebra.length && !enxuta.length) return null;

  const grave = quebra.length > 0;
  const mostrar = grave ? quebra : enxuta;
  return (
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
  );
}
