export interface EstagioProcesso {
  id: string;
  nome: string;
  ordem: number;
  created_at: string;
}

export interface ProcessoSave23 {
  id: string;
  cliente_id: string;
  estagio_id: string;
  responsavel: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export type ProcessoInteractionType = "ligacao" | "email" | "reuniao" | "nota" | "proposta" | "whatsapp";

export interface ProcessoInteracao {
  id: string;
  processo_id: string;
  interaction_type: ProcessoInteractionType;
  content: string;
  created_at: string;
}
