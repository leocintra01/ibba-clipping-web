// Formato da edicao emitida pelo robo (gerar_clipping.py, ARQ_EDICAO_JSON).
// Espelha o schema 1. Se o robo mudar o schema, bate aqui primeiro.

export type Tag =
  | "must-read"
  | "company-specific"
  | "sector-regulatory"
  | "competitor-read-through"
  | "broad-tech"
  | "";

export type Bucket = "BR Off" | "BR Oth" | "GL Off" | "GL Oth" | "";

export interface Variante {
  url: string;
  fonte: string;
}

export interface Item {
  titulo: string;
  url: string;
  dominio: string;
  fonte: string;
  tag: Tag;
  bucket: Bucket;
  score: number;
  repetido: boolean;
  origem: string;
  data?: string;
  tem_hora?: boolean;
  variantes?: Variante[];
  /** So' no Last News: "HH:MM", "ontem HH:MM" ou "DD/MM HH:MM". */
  quando?: string;
}

export interface BlocoEmpresa {
  empresa: string;
  itens: Item[];
}

export interface Edicao {
  schema: number;
  data: string;
  gerado_em: string;
  arquivo_html: string;
  janela: { inicio: string | null; fim: string | null };
  totais: { coletados: number; na_edicao: number };
  top3: Item[];
  clipping: {
    br_off: Item[];
    br_oth: Item[];
    gl_off: Item[];
    gl_oth: Item[];
  };
  last_news: { brazil: Item[]; global: Item[] };
  empresas: BlocoEmpresa[];
  alertas: string[];
}

/** Resumo para listagens (home, histórico) sem carregar a edição inteira. */
export interface ResumoEdicao {
  id: string;
  data: string;
  gerado_em: string;
  itens: number;
}
