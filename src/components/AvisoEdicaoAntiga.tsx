import Link from "next/link";
import { listarEdicoes } from "@/lib/edicoes";

/**
 * "Voce esta lendo uma edicao antiga" — com o caminho para a atual.
 *
 * Em 29/10/2026 ele escreveu: "quando eu clico no link, ele automaticamente
 * abre na versao do dia 28". Conferido na hora: a home servia a edicao das
 * 14:02 daquele mesmo dia e o Pages tambem. O que ele tinha aberto era uma
 * PAGINA DE EDICAO antiga — aba velha, historico do navegador ou o navegador
 * embutido do WhatsApp.
 *
 * E a pagina nao dizia nada. Uma edicao arquivada e' identica a' corrente:
 * mesmo cabecalho, mesma data em letra miuda, nenhuma marca de que o mundo
 * andou. Agora ela se denuncia, e o link para a atual fica a um toque.
 */
export async function AvisoEdicaoAntiga({
  id,
  geradoEm,
}: {
  id: string;
  geradoEm: string;
}) {
  const edicoes = await listarEdicoes();
  const atual = edicoes[0];
  // Compara o INSTANTE, nao o id. Se a listagem estiver atrasada — e ela tem
  // cache de 5 min — comparar ids faz a pagina acusar de velha uma edicao que
  // e' a mais nova que existe. Foi o que aconteceu no primeiro teste: a
  // edicao das 14:02 de 29/10 recebeu "a atual e' de 27 de outubro".
  //
  // Com o instante, listagem atrasada nao mente: ela so' deixa de avisar.
  if (!atual || atual.id === id || atual.gerado_em <= geradoEm) return null;

  const hora = atual.gerado_em.slice(11, 16);
  const [a, m, d] = atual.data.split("-").map(Number);
  const dia = new Date(a, m - 1, d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
  });

  return (
    <div
      role="alert"
      className="flex flex-wrap items-baseline gap-x-2 gap-y-1 border-l-[3px] border-laranja bg-laranja-suave px-6 py-3 text-[13px] leading-relaxed text-laranja-700 sm:px-8"
    >
      <strong className="font-semibold">Esta não é a edição mais recente.</strong>
      <span>
        A atual é de {dia}, às <span className="num">{hora}</span>.
      </span>
      <Link
        href="/"
        className="ml-auto shrink-0 font-semibold underline underline-offset-4"
      >
        Abrir a edição de agora
      </Link>
    </div>
  );
}
