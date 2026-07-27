/**
 * Converte uma data ISO para o formato brasileiro "dd/mm/yyyy" — aceita tanto
 * "yyyy-mm-dd" puro (<input type="date">, coluna `date`) quanto um timestamp
 * ISO completo ("yyyy-mm-ddTHH:mm:ss+00:00", coluna `timestamptz`), usando só
 * os 10 primeiros caracteres. Split manual de string em vez de
 * `new Date(...).toLocaleDateString("pt-BR")` porque uma data/meia-noite UTC
 * pura, em fusos com offset negativo (ex: Brasil, UTC-3), volta como o dia
 * anterior ao converter para o horário local (mesmo bug que formatDateBR/
 * formatarDataDia já evitam nos módulos de laudos/plano-ensino).
 */
export function formatarDataBR(value: string | undefined | null): string {
  if (!value) return "";
  const [ano, mes, dia] = value.slice(0, 10).split("-");
  if (!ano || !mes || !dia || ano.length !== 4) return value;
  return `${dia}/${mes}/${ano}`;
}

/** Soma N meses a uma data "yyyy-mm-dd" e devolve o resultado já em "dd/mm/yyyy" — usado para calcular o próximo vencimento (DRT/validade) a partir da data do último teste/manutenção. */
export function somarMeses(dataISO: string, meses: number): string {
  const [ano, mes, dia] = dataISO.slice(0, 10).split("-").map(Number);
  if (!ano || !mes || !dia) return "";
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  data.setUTCMonth(data.getUTCMonth() + meses);
  const y = data.getUTCFullYear();
  const m = String(data.getUTCMonth() + 1).padStart(2, "0");
  const d = String(data.getUTCDate()).padStart(2, "0");
  return `${d}/${m}/${y}`;
}
