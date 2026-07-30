import type { ClienteSnapshot } from "@/lib/clientes/types";
import type { Imagem } from "@/components/features/shared/image-uploader";

export type LaudoTecnicoTipo = "alarme" | "iluminacao" | "gas";

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

export function novaMedicaoAlarme(): MedicaoAlarme {
  return { id: crypto.randomUUID(), local: "", nivelLocalDb: "", nivelAlarmeDb: "" };
}

export function novaMedicaoIluminacao(): MedicaoIluminacao {
  return { id: crypto.randomUUID(), pavimento: "", medicaoPlanoLux: "", medicaoDesnivelLux: "" };
}

export function novaMedicaoGas(): MedicaoGas {
  return { id: crypto.randomUUID(), redeTestada: "", estanque: "", data: "" };
}

/** Estado completo do wizard de Laudos Técnicos (Alarme/Iluminação/Gás), decorrentes da Inspeção de Regularidade (IN 04) — também é o que fica salvo em laudos.dados. */
export interface LaudoTecnicoWizardState {
  /** 0 tipo · 1 cliente · 2 identificação · 3 medições · 4 fotos/observações · 5 revisão. */
  step?: number;
  laudoId?: string;
  codigo?: string;
  tipo?: LaudoTecnicoTipo;

  cliente_id?: string;
  cliente?: ClienteSnapshot;

  rt_selecionado?: string;
  data_vistoria?: string;

  instrumento?: string;
  numeroSerie?: string;
  certificadoCalibracao?: string;
  artNumero?: string;

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
