"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Item } from "./tipos";

/**
 * Selecao para envio.
 *
 * O fluxo real do analista e' marcar as noticias, ordenar as mais importantes,
 * ajustar o titulo e colar no WhatsApp. O HTML antigo fazia isso, e perder esse
 * fluxo na migracao seria um retrocesso — ele e' o produto.
 *
 * Uma melhora em relacao ao antigo: a selecao sobrevive a recarga da pagina.
 * No HTML antigo ela vivia so' em memoria, e um F5 no meio do trabalho jogava
 * fora tudo que tinha sido marcado.
 */

export interface Marcado {
  url: string;
  tituloEditado: string;
  prioridade: number | null;
  ordem: number;
}

interface Ctx {
  marcados: Record<string, Marcado>;
  marcado: (url: string) => boolean;
  alternar: (item: Item) => void;
  editarTitulo: (url: string, titulo: string) => void;
  definirPrioridade: (url: string, p: number | null) => void;
  /** Grava a ordem manual do envio: a posicao na lista passa a ser a ordem. */
  reordenar: (urlsEmOrdem: string[]) => void;
  limpar: () => void;
  total: number;
}

const SelecaoCtx = createContext<Ctx | null>(null);
const CHAVE = "ibba-clipping:selecao";

export function ProvedorSelecao({
  edicaoId,
  oficiais,
  children,
}: {
  edicaoId: string;
  /** Itens dos veiculos oficiais: abrem MARCADOS, como no HTML antigo.
   *  Quem monta a lista filtra os repetidos antes de passar: a tela abre
   *  escondendo o que ja saiu, e pre-marcar um item escondido faria o
   *  analista enviar o que nao viu. */
  oficiais?: Item[];
  children: React.ReactNode;
}) {
  const [marcados, setMarcados] = useState<Record<string, Marcado>>({});
  const [carregou, setCarregou] = useState(false);

  // Restaura, mas so' da MESMA edicao: selecao de ontem em cima do clipping de
  // hoje seria pior que selecao nenhuma.
  useEffect(() => {
    try {
      const cru = localStorage.getItem(CHAVE);
      if (cru) {
        const salvo = JSON.parse(cru) as {
          edicaoId: string;
          marcados: Record<string, Marcado>;
        };
        if (salvo.edicaoId === edicaoId && salvo.marcados) {
          setMarcados(salvo.marcados);
          setCarregou(true);
          return;
        }
      }
    } catch {
      /* storage bloqueado ou corrompido: comeca limpo, sem quebrar a pagina */
    }
    // Sem selecao salva desta edicao: comeca com as oficiais marcadas.
    // So' aqui — se havia selecao salva, a funcao ja retornou acima. Senao,
    // desmarcar uma oficial e recarregar a traria de volta.
    if (oficiais && oficiais.length) {
      const inicial: Record<string, Marcado> = {};
      oficiais.forEach((it, i) => {
        inicial[it.url] = {
          url: it.url,
          tituloEditado: it.titulo,
          prioridade: null,
          ordem: i,
        };
      });
      setMarcados(inicial);
    }
    setCarregou(true);
    // `oficiais` muda de identidade a cada render do servidor; o que determina
    // o efeito e' a edicao.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edicaoId]);

  useEffect(() => {
    if (!carregou) return;
    try {
      localStorage.setItem(CHAVE, JSON.stringify({ edicaoId, marcados }));
    } catch {
      /* sem storage: a selecao segue valendo em memoria */
    }
  }, [marcados, edicaoId, carregou]);

  // A ordem de quem entra sai do proprio mapa, e nao de um contador em paralelo:
  // depois de um arrasto o contador ficaria atras das ordens ja' gravadas e a
  // noticia nova cairia no meio da lista em vez de no fim.
  const alternar = useCallback((item: Item) => {
    setMarcados((atual) => {
      if (atual[item.url]) {
        const copia = { ...atual };
        delete copia[item.url];
        return copia;
      }
      const proxima =
        Math.max(-1, ...Object.values(atual).map((m) => m.ordem)) + 1;
      return {
        ...atual,
        [item.url]: {
          url: item.url,
          tituloEditado: item.titulo,
          prioridade: null,
          ordem: proxima,
        },
      };
    });
  }, []);

  const editarTitulo = useCallback((url: string, titulo: string) => {
    setMarcados((a) =>
      a[url] ? { ...a, [url]: { ...a[url], tituloEditado: titulo } } : a,
    );
  }, []);

  const definirPrioridade = useCallback((url: string, p: number | null) => {
    setMarcados((a) => (a[url] ? { ...a, [url]: { ...a[url], prioridade: p } } : a));
  }, []);

  // Arrastar reescreve a ORDEM, e so' ela. A prioridade numerada continua
  // mandando: e' a decisao do analista em 23/10/2026 — "o numero manda; o
  // arrasto reordena quem nao tem numero". Ate aqui o arrasto zerava as
  // prioridades, e era essa a briga entre os dois controles.
  const reordenar = useCallback((urlsEmOrdem: string[]) => {
    setMarcados((atual) => {
      const naLista = new Set(urlsEmOrdem);
      const sequencia = [
        ...urlsEmOrdem.filter((u) => atual[u]),
        // quem nao veio na lista (desmarcado no meio do arrasto) vai pro fim
        ...Object.keys(atual).filter((u) => !naLista.has(u)),
      ];
      const copia: Record<string, Marcado> = {};
      sequencia.forEach((url, i) => {
        copia[url] = { ...atual[url], ordem: i };
      });
      return copia;
    });
  }, []);

  const limpar = useCallback(() => setMarcados({}), []);

  const valor = useMemo<Ctx>(
    () => ({
      marcados,
      marcado: (url) => !!marcados[url],
      alternar,
      editarTitulo,
      definirPrioridade,
      reordenar,
      limpar,
      total: Object.keys(marcados).length,
    }),
    [marcados, alternar, editarTitulo, definirPrioridade, reordenar, limpar],
  );

  return <SelecaoCtx.Provider value={valor}>{children}</SelecaoCtx.Provider>;
}

export function useSelecao(): Ctx {
  const c = useContext(SelecaoCtx);
  if (!c) throw new Error("useSelecao precisa estar dentro de ProvedorSelecao");
  return c;
}

/** Prioridade primeiro (1, 2, 3...), depois a ordem em que foi marcada. */
export function ordenarParaEnvio(marcados: Marcado[]): Marcado[] {
  return [...marcados].sort((a, b) => {
    if (a.prioridade !== b.prioridade) {
      if (a.prioridade === null) return 1;
      if (b.prioridade === null) return -1;
      return a.prioridade - b.prioridade;
    }
    return a.ordem - b.ordem;
  });
}
