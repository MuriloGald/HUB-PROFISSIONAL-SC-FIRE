import type { SubtemaPlano } from "./types";

export interface DiaAgrupado {
  dia: number;
  itens: SubtemaPlano[];
  cargaDia: number;
}

/** Agrupa o conteudo programatico por dia (itens sem `dia` caem no Dia 1) — usado no PDF, na revisao do wizard e na listagem. */
export function agruparPorDia(conteudo: SubtemaPlano[]): DiaAgrupado[] {
  const dias = [...new Set(conteudo.map((l) => l.dia ?? 1))].sort((a, b) => a - b);
  return dias.map((dia) => {
    const itens = conteudo.filter((l) => (l.dia ?? 1) === dia);
    return { dia, itens, cargaDia: itens.reduce((sum, l) => sum + (l.horas || 0), 0) };
  });
}
