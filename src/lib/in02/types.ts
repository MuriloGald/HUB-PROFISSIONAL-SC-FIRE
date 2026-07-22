import type { ClienteSnapshot } from "@/lib/clientes/types";

/** Estado do wizard do Formulário de Recurso (IN 02, Anexo J) — recurso contra Auto de Infração. */
export interface RecursoWizardState {
  step?: number;
  laudoId?: string;
  codigo?: string;
  cliente_id?: string;
  cliente?: ClienteSnapshot;

  auto_infracao_numero?: string;
  auto_infracao_recebido_em?: string;

  autuado_nome?: string;
  autuado_cpf_cnpj?: string;
  autuado_email?: string;
  autuado_telefone?: string;
  autuado_logradouro?: string;
  autuado_numero?: string;
  autuado_complemento?: string;
  autuado_bairro?: string;
  autuado_cidade?: string;
  autuado_cep?: string;

  imovel_re?: string;
  imovel_cnpj?: string;
  imovel_logradouro?: string;
  imovel_numero?: string;
  imovel_complemento?: string;
  imovel_bairro?: string;
  imovel_cidade?: string;
  imovel_cep?: string;
  imovel_detalhes?: string;

  argumentacao?: string;

  responsavel_nome?: string;
  responsavel_cpf?: string;

  data_emissao?: string;
}

export type TipoRessarcimento = "pf" | "pj";

/** Estado do wizard do Requerimento de Ressarcimento de Multa (IN 02, Anexo K/L) — PF e PJ compartilham o mesmo texto-modelo. */
export interface RessarcimentoWizardState {
  step?: number;
  laudoId?: string;
  codigo?: string;
  cliente_id?: string;
  cliente?: ClienteSnapshot;

  tipo?: TipoRessarcimento;
  ssci_municipio?: string;

  requerente_nome?: string;
  requerente_cpf?: string;
  empresa_razao_social?: string;
  empresa_cnpj?: string;

  multa_numero?: string;
  multa_valor?: string;
  multa_valor_extenso?: string;

  imovel_logradouro?: string;
  imovel_numero?: string;
  imovel_bairro?: string;
  imovel_municipio?: string;
  imovel_re?: string;

  motivos?: string[];

  local_data_municipio?: string;

  data_emissao?: string;
}
