/**
 * Dados fixos do modulo SAVE 23 (Vistoria + Laudo Tecnico, IN 23/CBMSC).
 * Porta de Vistoria.gs/Laudo.gs/Index.html do app legado "App Vistoria e Laudo".
 *
 * RESPONSAVEIS_TECNICOS e EMPRESA sao os mesmos profissionais/endereco ja usados
 * pelo modulo de Laudos de Eventos — reaproveitados em vez de duplicados.
 */

export { RESPONSAVEIS_TECNICOS, EMPRESA } from "@/lib/laudos/constants";

export const OCUPACOES_ART6_OPCOES = [
  { value: "A-1", label: "A-1 — Habitação unifamiliar" },
  { value: "A-2", label: "A-2 — Habitação multifamiliar" },
  { value: "C-1", label: "C-1 — Comércio com pequena carga de incêndio" },
  { value: "C-2", label: "C-2 — Comércio com média/grande carga de incêndio" },
  { value: "D", label: "D — Serviços profissionais" },
  { value: "H-4", label: "H-4 — Serviços de saúde e institucionais" },
];

export const SIM_NAO_FINANCEIRO_OPCOES = [
  { value: "sim", label: "Sim" },
  { value: "nao", label: "Não" },
  { value: "financeiro", label: "Inviável financeiramente" },
];

/**
 * Rotulos dos criterios do setor que podem virar item do "Plano de Adequações"
 * quando o setor nao se enquadra em nenhuma hipotese de dispensa. Espelha o
 * catalogo implicito de ALT_ORDEM no Index.html do app legado.
 */
export const CRITERIOS_ADEQUACAO: { key: string; label: string }[] = [
  { key: "deteccao", label: "Detecção automática de incêndio (IN 12)" },
  { key: "extracao", label: "Extração mecânica de fumaça (IN 10)" },
  { key: "ventilacao", label: "Ventilação natural (Art. 6º, § 1º)" },
  { key: "sprinklerIN15", label: "Chuveiros automáticos (IN 15)" },
  { key: "compartRotas", label: "Compartimentação em relação às rotas de fuga" },
  { key: "compartSaidas", label: "Compartimentação em relação às saídas de emergência" },
];

export const PERGUNTAS_SETOR: Record<string, string> = {
  externo: "Local externo e descoberto ou com cobertura leve (inciso I)?",
  deteccao: "Detecção automática de incêndio, conforme IN 12?",
  extracao: "Extração mecânica de fumaça, conforme IN 10?",
  ventDoisLados: "Aberturas permanentes para o exterior em pelo menos 2 lados?",
  sprinklerIN15: "Chuveiros automáticos, conforme IN 15?",
  hidChaveFluxo: "§ 2º — chave de fluxo interligada à central de alarme?",
  hidDreno: "§ 2º — ponto de dreno e teste, acessível e sinalizado?",
  hidManometro: "§ 2º — manômetro instalado de forma visível?",
  compartRotas: "Compartimentação do local em relação às demais rotas de fuga?",
  compartSaidas: "Compartimentação em relação às saídas de emergência?",
  compartEntreSave: "Compartimentação entre ambientes com SAVE, TRF ≥ 1h (§ 5º)?",
};
