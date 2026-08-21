import type { ClienteSnapshot } from "@/lib/clientes/types";
import type { ProfissionalSnapshot } from "@/lib/profissionais/types";

/** Mirror de Imagem (src/lib/save-in23/types.ts). */
export interface Imagem {
  url: string;
  legenda?: string;
}

/** @deprecated Formato antigo do RT (fixo rt1/rt2 ou "outro" digitado a mao) — mantido so pra ler rascunhos/termos salvos antes do RT virar um Cliente cadastrado. */
export interface ResponsavelTecnicoCustom {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  registro: string;
}

/** @deprecated ver ResponsavelTecnicoCustom. */
export interface ResponsavelTecnicoObra {
  chave: "rt1" | "rt2" | "outro";
  custom?: ResponsavelTecnicoCustom;
}

export type Risco = "II" | "III" | "IV" | "V";

export type ConformeStatus = "sim" | "nao" | "";

/** Uma linha da tabela de conformidade do Anexo I — um sistema/medida de segurança contra incêndio. */
export interface SistemaConformidade {
  chave: string;
  conformePpci: ConformeStatus;
  conformeNsci: ConformeStatus;
  justificativa: string;
}

/** Estado completo do wizard de emissao do Termo de Entrega do Imovel — tambem e o que fica salvo em laudos.dados. */
export interface HabiteseWizardState {
  step?: number;
  laudoId?: string;
  codigo?: string;
  cliente_id?: string;
  cliente?: ClienteSnapshot;

  /** RT selecionado no cadastro de Profissionais. `ResponsavelTecnicoObra` so aparece em termos salvos antes dessa mudanca. */
  rt_id?: string;
  rt?: ProfissionalSnapshot | ResponsavelTecnicoObra;

  imovel_re?: string;
  imovel_cnpj_cpf?: string;
  imovel_logradouro?: string;
  imovel_numero?: string;
  imovel_complemento?: string;
  imovel_bairro?: string;
  imovel_cidade?: string;
  imovel_cep?: string;
  imovel_detalhes?: string;
  nome_edificacao?: string;

  extintores_qtd?: string;
  iluminacao_qtd?: string;
  placa_qtd?: string;
  /** Placa de saída luminosa (com fonte de energia própria/central) — distinta da fotoluminescente (`placa_qtd`), IN 13. */
  placa_luminosa_qtd?: string;

  area_total?: string;
  protocolo?: string;
  area_alteracao?: string;
  ocupacao?: string;
  risco?: Risco;
  pavimentos_blocos?: string;
  observacoes?: string;

  imagens?: Imagem[];

  sistemas?: SistemaConformidade[];

  data_emissao?: string;
  arquivo?: string;
}
