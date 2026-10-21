/**
 * Faixa de aviso acima de qualquer noticia.
 *
 * Existe porque em outubro o aviso "FONTE MORTA HA 3+ DIAS" ficou dezenove
 * dias no RODAPE do clipping sem ninguem ver. Alerta que nao e' lido nao e'
 * alerta: aqui ele vem antes de qualquer noticia.
 *
 * Dois estados, de proposito: edicao enxuta e' dia de pouca noticia, nao
 * defeito, e chamar isso de "pipeline com problema" seria mentir sobre o
 * estado do pipeline — o oposto do que esta faixa existe pra fazer.
 */
const QUEBRA = ["FONTE MORTA", "DECODER", "GOOGLE NEWS:", "ZERADAS", "FONTES COM ERRO"];
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
      className={`px-4 py-2.5 font-mono text-[12px] leading-relaxed text-white sm:px-5 ${
        grave ? "bg-[#b03030]" : "bg-[#aa6622]"
      }`}
    >
      <strong className="font-medium">
        {grave ? "Pipeline com problema:" : "Dia de pouca notícia:"}
      </strong>{" "}
      {mostrar.join(" · ")}
    </div>
  );
}
