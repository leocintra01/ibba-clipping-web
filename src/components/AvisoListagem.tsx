/**
 * "O que voce esta vendo pode estar atrasado."
 *
 * Existe por causa das 6h30 de 27/10/2026. A listagem do site vinha da API do
 * GitHub, que da' 60 chamadas por hora por IP e no Vercel vive esgotada;
 * quando ela falhava o site caia nos arquivos gravados no ultimo deploy e
 * mostrava a pagina COMO SE ESTIVESSE EM DIA. O analista abriu as 6h40 e
 * recebeu o retrato de 26/10 as 15:13, sem a edicao das 06:32 — sem um
 * caractere dizendo que faltava alguma coisa.
 *
 * A listagem por manifesto tornou isso raro. Esta faixa existe para o dia em
 * que acontecer mesmo assim: superficie que erra calada e' pior que
 * superficie que erra falando.
 */
export function AvisoListagem({ origem }: { origem: string }) {
  if (origem !== "disco") return null;
  return (
    <div
      role="alert"
      className="border-l-[3px] border-[#9b2c2c] bg-[#fdf2f2] px-6 py-3 text-[13px] leading-relaxed text-[#7a2222] sm:px-8"
    >
      <strong className="font-semibold">Listagem desatualizada.</strong> Não
      consegui ler a lista de edições do repositório; esta página está
      mostrando a última cópia publicada e pode não ter a edição mais recente.
      O arquivo completo continua em{" "}
      <a
        className="underline underline-offset-2"
        href="https://leocintra01.github.io/clipping/"
        target="_blank"
        rel="noopener noreferrer"
      >
        leocintra01.github.io/clipping
      </a>
      .
    </div>
  );
}
