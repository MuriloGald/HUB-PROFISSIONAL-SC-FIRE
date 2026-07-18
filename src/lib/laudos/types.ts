import type { Porte } from "./classificador";

/**
 * Snapshot do cliente embutido no laudo no momento da geracao — preserva os
 * dados exibidos no PDF mesmo que o cadastro do cliente mude depois.
 */
export interface ClienteEventoSnapshot {
  id: string;
  razao_social: string;
  cnpj?: string;
  cpf?: string;
  nome_responsavel?: string;
  email?: string;
  telefone?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  complemento?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

export type Respostas = Record<string, string> & {
  rt_selecionado?: string;
  OBS?: string;
  locais?: string;
};

export interface LocalSaida {
  nome: string;
  boate: string;
  carac: string;
  publico: string;
  area: string;
  distancia: string;
  qtd: string;
  largura: string;
}

/** Estado completo do wizard de cadastro de evento — tambem e o que fica salvo em laudos.dados */
export interface EventoWizardState {
  step?: number;
  laudoId?: string;
  codigo?: string;
  cliente_id?: string;
  cliente?: ClienteEventoSnapshot;

  nome_evento?: string;
  descricao_evento?: string;
  data_inicio?: string;
  hora_inicio?: string;
  data_termino?: string;
  hora_termino?: string;

  cep_evento?: string;
  logradouro_evento?: string;
  numero_evento?: string;
  bairro_evento?: string;
  cidade_evento?: string;
  complemento_evento?: string;

  publico?: string;
  area_total?: string;
  area_permanente?: string;
  area_provisoria?: string;

  arLivreSemDelimitacao?: boolean;
  arLivreComDelimitacao?: boolean;
  publicoArLivre?: string;
  cobertoAberto?: boolean;
  publicoCobertoAberto?: string;
  cobertoFechado?: boolean;
  publicoCobertoFechado?: string;

  porteFinal?: Porte;

  respostas_pequeno?: Respostas;
  respostas_medio?: Respostas;
  respostas_grande?: Respostas;

  data_emissao?: string;
  arquivo?: string | string[];
}
