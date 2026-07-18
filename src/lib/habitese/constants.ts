/**
 * Dados fixos do modulo Habite-se (Termo de Entrega do Imovel).
 * Reaproveita a lista de RTs e os dados institucionais ja definidos no modulo
 * de Eventos (IN 24) — mesma equipe tecnica da SC Fire, sem duplicar cadastro.
 */
export { RESPONSAVEIS_TECNICOS, EMPRESA } from "@/lib/laudos/constants";
export type { ResponsavelTecnico } from "@/lib/laudos/constants";

export const RISCOS = ["II", "III", "IV", "V"] as const;

/**
 * Lista fixa de sistemas/medidas de segurança contra incêndio e pânico do
 * Anexo H (Relatório de Conformidade referente a atestado para Habite-se).
 */
export const SISTEMAS_CONFORMIDADE: { chave: string; label: string }[] = [
  { chave: "acesso_viaturas", label: "Acesso de Viaturas" },
  { chave: "materiais_acabamento", label: "Materiais de acabamento e revestimento" },
  { chave: "deteccao_automatica", label: "Detecção automática de incêndio" },
  { chave: "gas_combustivel", label: "Gás combustível" },
  { chave: "iluminacao_emergencia", label: "Iluminação de Emergência" },
  { chave: "plano_emergencia", label: "Plano de emergência" },
  { chave: "protecao_estrutural", label: "Proteção estrutural contra incêndio" },
  { chave: "brigada_incendio", label: "Brigada de incêndio" },
  { chave: "alarme_deteccao", label: "Alarme e detecção de incêndio" },
  { chave: "extintores", label: "Extintores" },
  { chave: "hidraulico_preventivo", label: "Hidráulico preventivo" },
  { chave: "instalacoes_eletricas", label: "Instalações elétricas" },
  { chave: "sinalizacao_abandono", label: "Sinalização abandono de local" },
  { chave: "saidas_emergencia", label: "Saídas de emergência" },
  { chave: "outros", label: "Outros" },
];
