/**
 * Faixa de problema no pipeline.
 *
 * Existe porque em outubro o aviso "FONTE MORTA HA 3+ DIAS" ficou dezenove
 * dias no RODAPE do clipping sem ninguem ver. Alerta que nao e' lido nao e'
 * alerta: aqui ele vem antes de qualquer noticia.
 */
export function Alertas({ alertas }: { alertas: string[] }) {
  const criticos = alertas.filter((a) =>
    ["FONTE MORTA", "DECODER", "GOOGLE NEWS:", "ZERADAS", "FONTES COM ERRO"].some(
      (k) => a.toUpperCase().includes(k),
    ),
  );
  if (!criticos.length) return null;
  return (
    <div
      role="alert"
      className="bg-[#b03030] px-4 py-2.5 font-mono text-[12px] leading-relaxed text-white sm:px-5"
    >
      <strong className="font-medium">Pipeline com problema:</strong>{" "}
      {criticos.join(" · ")}
    </div>
  );
}
