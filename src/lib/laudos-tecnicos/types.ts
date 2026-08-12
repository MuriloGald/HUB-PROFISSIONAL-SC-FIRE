import type { ClienteSnapshot } from "@/lib/clientes/types";
import type { ProfissionalSnapshot } from "@/lib/profissionais/types";
import type { Imagem } from "@/components/features/shared/image-uploader";

export type LaudoTecnicoTipo = "extintor" | "shp" | "iluminacao" | "alarme" | "gas";

export type ResultadoMedicao = "aprovado" | "reprovado" | "";

export interface MedicaoAlarme {
  id: string;
  local: string;
  nivelLocalDb: string;
  nivelAlarmeDb: string;
}

export interface MedicaoIluminacao {
  id: string;
  pavimento: string;
  medicaoPlanoLux: string;
  medicaoDesnivelLux: string;
}

export interface MedicaoGas {
  id: string;
  redeTestada: string;
  estanque: "sim" | "nao" | "";
  data: string;
}

/** Manutenção/recarga de extintor — o critério de aprovação (faixa do manômetro, peso do CO2, prazos) é heterogêneo por tipo de agente, por isso o resultado é lançado manualmente, e não calculado. */
export interface MedicaoExtintor {
  id: string;
  identificacao: string;
  tipoCapacidade: string;
  validadeRecarga: string;
  validadeTesteHidrostatico: string;
  resultado: ResultadoMedicao;
}

/** Vazão/pressão de ponto de hidrante ou mangotinho do SHP — o mínimo exigido varia com a classificação de risco/altura da edificação (projeto aprovado), por isso o resultado é lançado manualmente. */
export interface MedicaoShp {
  id: string;
  identificacao: string;
  pressaoDinamica: string;
  vazaoLmin: string;
  resultado: ResultadoMedicao;
}

export function novaMedicaoAlarme(): MedicaoAlarme {
  return { id: crypto.randomUUID(), local: "", nivelLocalDb: "", nivelAlarmeDb: "" };
}

export function novaMedicaoIluminacao(): MedicaoIluminacao {
  return { id: crypto.randomUUID(), pavimento: "", medicaoPlanoLux: "", medicaoDesnivelLux: "" };
}

export function novaMedicaoGas(): MedicaoGas {
  return { id: crypto.randomUUID(), redeTestada: "", estanque: "", data: "" };
}

export function novaMedicaoExtintor(): MedicaoExtintor {
  return { id: crypto.randomUUID(), identificacao: "", tipoCapacidade: "", validadeRecarga: "", validadeTesteHidrostatico: "", resultado: "" };
}

export function novaMedicaoShp(): MedicaoShp {
  return { id: crypto.randomUUID(), identificacao: "", pressaoDinamica: "", vazaoLmin: "", resultado: "" };
}

/** Estado completo do wizard de Laudos Técnicos (Extintor/SHP/Iluminação/Alarme/Gás), decorrentes da Inspeção de Regularidade (IN 04) — também é o que fica salvo em laudos.dados. */
export interface LaudoTecnicoWizardState {
  /** 0 tipo · 1 cliente · 2 identificação · 3 medições · 4 fotos/observações · 5 revisão. */
  step?: number;
  laudoId?: string;
  codigo?: string;
  tipo?: LaudoTecnicoTipo;

  cliente_id?: string;
  cliente?: ClienteSnapshot;

  rt_id?: string;
  rt?: ProfissionalSnapshot;
  /** @deprecated chave fixa "rt1"/"rt2" — só aparece em laudos salvos antes do RT virar um Profissional cadastrado. */
  rt_selecionado?: string;
  data_vistoria?: string;

  instrumento?: string;
  numeroSerie?: string;
  certificadoCalibracao?: string;
  artNumero?: string;

  medicoesExtintor?: MedicaoExtintor[];
  medicoesShp?: MedicaoShp[];
  medicoesAlarme?: MedicaoAlarme[];
  medicoesIluminacao?: MedicaoIluminacao[];

  gasLocal?: string;
  gasPressaoInicialKgf?: string;
  gasPressaoFinalKgf?: string;
  gasHorarioInicio?: string;
  gasHorarioTermino?: string;
  medicoesGas?: MedicaoGas[];

  observacoes?: string;
  imagens?: Imagem[];

  data_emissao?: string;
}
