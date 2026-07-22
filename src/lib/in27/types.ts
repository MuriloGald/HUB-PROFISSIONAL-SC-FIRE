import type { ClienteSnapshot } from "@/lib/clientes/types";

export type TipoEventoPirotecnico = "indoor" | "outdoor";

/** Estado do wizard de Eventos Pirotécnicos (IN 27) — alimenta os 3 anexos: Requerimento (A), Plano de Segurança (B) e Croqui (C). */
export interface EventoPirotecnicoState {
  step?: number;
  laudoId?: string;
  codigo?: string;
  cliente_id?: string;
  cliente?: ClienteSnapshot;

  tipo_evento?: TipoEventoPirotecnico;
  data_evento?: string;
  horario_inicio?: string;
  evento_logradouro?: string;
  evento_numero?: string;
  evento_complemento?: string;
  evento_bairro?: string;
  evento_cidade?: string;
  evento_cep?: string;
  descricao_evento?: string;

  promotor_nome?: string;
  promotor_cpf_cnpj?: string;
  promotor_fone?: string;
  promotor_email?: string;
  promotor_logradouro?: string;
  promotor_numero?: string;
  promotor_complemento?: string;
  promotor_bairro?: string;
  promotor_cidade?: string;
  promotor_cep?: string;

  blaster_nome?: string;
  blaster_registro_exercito?: string;
  blaster_fone?: string;
  blaster_email?: string;
  blaster_logradouro?: string;
  blaster_numero?: string;
  blaster_complemento?: string;
  blaster_bairro?: string;
  blaster_cidade?: string;
  blaster_cep?: string;

  rt_e_blaster?: boolean;
  rt_nome?: string;
  rt_registro?: string;
  rt_fone?: string;
  rt_email?: string;
  rt_logradouro?: string;
  rt_numero?: string;
  rt_complemento?: string;
  rt_bairro?: string;
  rt_cidade?: string;
  rt_cep?: string;

  classes_fogos?: string;

  anexo_carteira_blaster?: boolean;
  anexo_croqui_projeto?: boolean;

  croqui_imagem?: { url: string; legenda?: string };
  croqui_observacoes?: string;

  data_emissao?: string;
}
