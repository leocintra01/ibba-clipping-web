import type { Tag } from "@/lib/tipos";

/** Rotulo editorial. Cor so' nas que mudam decisao; o resto fica neutro,
 *  senao tudo vira destaque e nada e' destaque. */
const ESTILO: Record<string, string> = {
  "company-specific": "bg-[#e8f4e8] text-[#1f6b2e]",
  "sector-regulatory": "bg-[#e8eef8] text-[#1c4a86]",
  "competitor-read-through": "bg-[#f0ede8] text-tinta-2",
  "broad-tech": "bg-[#f0ede8] text-tinta-3",
};

const NOME: Record<string, string> = {
  "company-specific": "empresa",
  "sector-regulatory": "setor",
  "competitor-read-through": "peer",
  "broad-tech": "tech",
};

export function Pilula({ tag }: { tag: Tag }) {
  // "must-read" nao ganha etiqueta: ele ja' tem o bloco de destaques no topo da
  // pagina, e repetir a marca em cada linha so' suja a lista.
  if (!tag || tag === "must-read") return null;
  return (
    <span
      className={`inline-block shrink-0 rounded-sm px-1.5 py-px font-mono text-[11px] uppercase tracking-wide ${
        ESTILO[tag] ?? ESTILO["broad-tech"]
      }`}
    >
      {NOME[tag] ?? tag}
    </span>
  );
}
