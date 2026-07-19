import type { SubtemaPlano } from "./types";

export interface DiaAgrupado {
  dia: number;
  itens: SubtemaPlano[];
  cargaDia: number;
  data?: string;
}

/** Agrupa o conteudo programatico por dia (itens sem `dia` caem no Dia 1) — usado no PDF, na revisao do wizard e na listagem. */
export function agruparPorDia(conteudo: SubtemaPlano[], datasDias?: Record<number, string>): DiaAgrupado[] {
  const dias = [...new Set(conteudo.map((l) => l.dia ?? 1))].sort((a, b) => a - b);
  return dias.map((dia) => {
    const itens = conteudo.filter((l) => (l.dia ?? 1) === dia);
    return { dia, itens, cargaDia: itens.reduce((sum, l) => sum + (l.horas || 0), 0), data: datasDias?.[dia] };
  });
}

/** Converte "AAAA-MM-DD" (formato do <input type="date">) para "DD/MM/AAAA" — evita o fuso horário deslocar o dia se fosse parseado com `new Date()`. */
export function formatarDataDia(dataIso: string): string {
  const [ano, mes, dia] = dataIso.split("-");
  if (!ano || !mes || !dia) return dataIso;
  return `${dia}/${mes}/${ano}`;
}

/** Rótulo completo do dia, com a data quando cadastrada — "Dia 1" ou "Dia 1 - 15/03/2026". */
export function rotuloDia(dia: number, dataIso?: string): string {
  return dataIso ? `Dia ${dia} - ${formatarDataDia(dataIso)}` : `Dia ${dia}`;
}
