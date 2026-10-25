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
  /** Veio de veiculo oficial, INDEPENDENTE do bloco em que o item acabou.
   *  O pipeline manda item de fonte oficial para o bloco "outras" quando o
   *  bloco oficial enche (overflow) ou quando o piso desvia por teto de
   *  entidade. Pre-marcar o envio por BLOCO tirava esses itens do rascunho
   *  sem aviso — 5 numa edicao medida. Opcional porque edicao publicada
   *  antes de 25/10/2026 nao traz o campo. */
  oficial?: boolean;
  origem: string;
  data?: string;
  tem_hora?: boolean;
  /** Confianca do pipeline na data: "alta" | "media" | "none". Fora de "alta",
   *  o HTML antigo escreve "data nao confirmada" e o site precisa dizer o
   *  mesmo — duas telas do mesmo produto nao podem discordar sobre o item. */
  confidence?: string;
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
