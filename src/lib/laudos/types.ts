import type { Porte } from "./classificador";
import type { ClienteSnapshot } from "@/lib/clientes/types";

export type Respostas = Record<string, string> & {
  /** Id do profissional selecionado (src/lib/profissionais) — os campos rt_* abaixo sao o snapshot achatado dele, pois Respostas so aceita valores string. */
  rt_selecionado?: string;
  rt_nome?: string;
  rt_cpf?: string;
  rt_telefone?: string;
  rt_email?: string;
  /** Já formatado como "CREA/SC ####" ou "CFT ####" — ver formatarRegistroProfissional. */
  rt_registro?: string;
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
  cliente?: ClienteSnapshot;

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
