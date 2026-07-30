import type { MedicaoAlarme, MedicaoIluminacao, MedicaoGas, ResultadoMedicao } from "./types";

/** Aprovado quando o nível em alarme fica ≥ 15 dB(A) acima do nível de ruído local (IN 12). */
export function resultadoAlarme(m: MedicaoAlarme): ResultadoMedicao {
  const local = parseFloat(m.nivelLocalDb.replace(",", "."));
  const alarme = parseFloat(m.nivelAlarmeDb.replace(",", "."));
  if (Number.isNaN(local) || Number.isNaN(alarme)) return "";
  return alarme - local >= 15 ? "aprovado" : "reprovado";
}

/** Aprovado quando o iluminamento atende ao mínimo de 3 lux (locais planos) e 5 lux (com desnível), IN 11/ABNT NBR 10898. */
export function resultadoIluminacao(m: MedicaoIluminacao): ResultadoMedicao {
  const plano = m.medicaoPlanoLux ? parseFloat(m.medicaoPlanoLux.replace(",", ".")) : undefined;
  const desnivel = m.medicaoDesnivelLux ? parseFloat(m.medicaoDesnivelLux.replace(",", ".")) : undefined;
  if (plano === undefined && desnivel === undefined) return "";
  const planoOk = plano === undefined || (!Number.isNaN(plano) && plano >= 3);
  const desnivelOk = desnivel === undefined || (!Number.isNaN(desnivel) && desnivel >= 5);
  return planoOk && desnivelOk ? "aprovado" : "reprovado";
}

export function resultadoGas(m: MedicaoGas): ResultadoMedicao {
  if (m.estanque === "sim") return "aprovado";
  if (m.estanque === "nao") return "reprovado";
  return "";
}
