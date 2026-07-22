import type { ClienteSnapshot } from "@/lib/clientes/types";

export type RespostaChecklist = "sim" | "nao" | "";

/** Estado do wizard do Relatório de Comissionamento e de Inspeção Periódica do SHP (IN 07, Anexo C). */
export interface ComissionamentoSHPState {
  step?: number;
  laudoId?: string;
  codigo?: string;
  cliente_id?: string;
  cliente?: ClienteSnapshot;

  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  municipio_uf?: string;
  re?: string;

  proprietario_nome?: string;
  proprietario_email?: string;
  responsavel_uso_nome?: string;
  responsavel_uso_email?: string;
  rt_nome?: string;
  rt_registro?: string;
  rt_email?: string;

  ocupacao_tipo?: string;

  /** Chave do item (ex: "1.1") -> resposta. */
  respostas?: Record<string, RespostaChecklist>;

  vazao_medida?: string;

  justificativas?: string;

  data_emissao?: string;
}
