import type { ClienteSnapshot } from "@/lib/clientes/types";

export type Fluxo10 = "comissionamento" | "inspecao";
export type RespostaSN = "sim" | "nao" | "";

/** Estado do wizard do Sistema de Controle de Fumaça (IN 10) — Anexo B (Comissionamento) ou Anexo C (Inspeção). */
export interface ControleFumacaState {
  step?: number;
  laudoId?: string;
  codigo?: string;
  cliente_id?: string;
  cliente?: ClienteSnapshot;
  fluxo?: Fluxo10;

  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  municipio_uf?: string;
  re?: string;
  ocupacao_tipo?: string;

  proprietario_nome?: string;
  proprietario_email?: string;
  proprietario_fone?: string;
  responsavel_uso_nome?: string;
  responsavel_uso_email?: string;
  rt_nome?: string;
  rt_registro?: string;
  rt_email?: string;
  rt_fone?: string;

  // Anexo B (comissionamento)
  projeto_conformidade?: RespostaSN;
  projeto_equipamentos?: RespostaSN;
  projeto_divergencias?: string;
  docs_deixados?: Record<string, RespostaSN>;
  docs_explicacao?: string;

  // Anexo C (inspecao)
  instrucao_realizada?: RespostaSN;
  instrucao_nome_responsavel?: string;
  instrucao_explicacao?: string;
  integridade?: Record<string, RespostaSN>;
  integridade_explicacao?: string;

  // clima (comum aos dois)
  vento_velocidade?: string;
  temp_externa?: string;
  vento_direcao?: string;
  pressao_atm?: string;

  // ensaios (comum aos dois)
  ensaios?: Record<string, RespostaSN>;
  tempo_ativacao_segundos?: string;
  ensaios_explicacao?: string;

  conclusao?: RespostaSN;
  data_entrega_funcionamento?: string;
  nome_instalador?: string;

  // Testemunhas (fl. 03/03, comum aos dois anexos)
  testemunha_proprietario_nome?: string;
  testemunha_proprietario_cargo?: string;
  testemunha_proprietario_data?: string;
  testemunha_instalador_nome?: string;
  testemunha_instalador_cargo?: string;
  testemunha_instalador_data?: string;

  informacoes_adicionais?: string;

  data_emissao?: string;
}
