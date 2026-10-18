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
  limpar: () => void;
  total: number;
}

const SelecaoCtx = createContext<Ctx | null>(null);
const CHAVE = "ibba-clipping:selecao";

export function ProvedorSelecao({
  edicaoId,
  children,
}: {
  edicaoId: string;
  children: React.ReactNode;
}) {
  const [marcados, setMarcados] = useState<Record<string, Marcado>>({});
  const [contador, setContador] = useState(0);
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
          setContador(
            Math.max(0, ...Object.values(salvo.marcados).map((m) => m.ordem)) + 1,
          );
        }
      }
    } catch {
      /* storage bloqueado ou corrompido: comeca limpo, sem quebrar a pagina */
    }
    setCarregou(true);
  }, [edicaoId]);

  useEffect(() => {
    if (!carregou) return;
    try {
      localStorage.setItem(CHAVE, JSON.stringify({ edicaoId, marcados }));
    } catch {
      /* sem storage: a selecao segue valendo em memoria */
    }
  }, [marcados, edicaoId, carregou]);

  const alternar = useCallback(
    (item: Item) => {
      setMarcados((atual) => {
        const copia = { ...atual };
        if (copia[item.url]) {
          delete copia[item.url];
          return copia;
        }
        copia[item.url] = {
          url: item.url,
          tituloEditado: item.titulo,
          prioridade: null,
          ordem: contador,
        };
        return copia;
      });
      setContador((c) => c + 1);
    },
    [contador],
  );

  const editarTitulo = useCallback((url: string, titulo: string) => {
    setMarcados((a) =>
      a[url] ? { ...a, [url]: { ...a[url], tituloEditado: titulo } } : a,
    );
  }, []);

  const definirPrioridade = useCallback((url: string, p: number | null) => {
    setMarcados((a) => (a[url] ? { ...a, [url]: { ...a[url], prioridade: p } } : a));
  }, []);

  const limpar = useCallback(() => setMarcados({}), []);

  const valor = useMemo<Ctx>(
    () => ({
      marcados,
      marcado: (url) => !!marcados[url],
      alternar,
      editarTitulo,
      definirPrioridade,
      limpar,
      total: Object.keys(marcados).length,
    }),
    [marcados, alternar, editarTitulo, definirPrioridade, limpar],
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
