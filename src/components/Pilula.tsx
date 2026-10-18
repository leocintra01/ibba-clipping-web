import type { Tag } from "@/lib/tipos";

/** Rotulo editorial. Cor so' nas tres que mudam decisao; o resto fica neutro,
 *  senao tudo vira destaque e nada e' destaque. */
const ESTILO: Record<string, string> = {
  "must-read": "bg-laranja-suave text-laranja-700 font-medium",
  "company-specific": "bg-[#e8f4e8] text-[#1f6b2e]",
  "sector-regulatory": "bg-[#e8eef8] text-[#1c4a86]",
  "competitor-read-through": "bg-[#f0ede8] text-tinta-2",
  "broad-tech": "bg-[#f0ede8] text-tinta-3",
};

const NOME: Record<string, string> = {
  "must-read": "destaque",
  "company-specific": "empresa",
  "sector-regulatory": "setor",
  "competitor-read-through": "peer",
  "broad-tech": "tech",
};

export function Pilula({ tag }: { tag: Tag }) {
  if (!tag) return null;
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
