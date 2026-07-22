import type { ClienteSnapshot } from "@/lib/clientes/types";

export type RespostaChecklist3 = "sim" | "nao" | "na" | "";

/** Estado do wizard do Relatório de Comissionamento do Elevador de Emergência (IN 09, Anexo E). */
export interface ComissionamentoElevadorState {
  step?: number;
  laudoId?: string;
  codigo?: string;
  cliente_id?: string;
  cliente?: ClienteSnapshot;

  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  municipio?: string;
  re?: string;

  responsavel_imovel_nome?: string;
  responsavel_imovel_email?: string;
  responsavel_imovel_fone?: string;
  rt_nome?: string;
  rt_registro?: string;
  rt_email?: string;
  rt_fone?: string;

  qtd_elevadores?: string;
  altura_edificacao?: string;

  respostas?: Record<string, RespostaChecklist3>;

  justificativas?: string;
  elevadores_info?: string;

  data_emissao?: string;
}
