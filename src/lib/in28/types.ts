import type { ClienteSnapshot } from "@/lib/clientes/types";
import type { ProfissionalSnapshot } from "@/lib/profissionais/types";

export interface Imagem {
  url: string;
  legenda?: string;
}

/** Estado do wizard do Plano de Implementação de Brigada de Incêndio (IN 28, Anexo C — PIBI). */
export interface PibiState {
  step?: number;
  laudoId?: string;
  codigo?: string;
  cliente_id?: string;
  cliente?: ClienteSnapshot;

  razao_social?: string;
  nome_fantasia?: string;
  cnpj?: string;
  re?: string;
  cidade?: string;
  bairro?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  ocupacao?: string;
  cep?: string;
  telefone?: string;
  area_construida?: string;
  pavimentos?: string;
  altura?: string;
  populacao_fixa?: string;
  lotacao_maxima?: string;

  responsavel_nome?: string;
  responsavel_cpf?: string;
  responsavel_identidade?: string;
  responsavel_endereco?: string;
  responsavel_numero?: string;
  responsavel_cidade_uf?: string;
  responsavel_telefone?: string;

  rt_id?: string;
  rt?: ProfissionalSnapshot;
  /** Atribuição/especialidade do profissional só neste laudo (não é um dado fixo da pessoa cadastrada). */
  rt_atribuicao?: string;
  /** @deprecated nome/CPF/registro digitados a mao — so aparecem em laudos salvos antes do RT virar um Profissional cadastrado. */
  rt_nome?: string;
  rt_cpf?: string;
  rt_registro?: string;

  coordenador_brigada?: string;
  brigadistas_particulares_qtd?: string;
  brigadistas_particulares_relacao?: string;
  brigadistas_organicos_qtd?: string;
  brigadistas_organicos_nivel?: string;
  brigadistas_organicos_distribuicao?: string;

  sistemas_protecao?: string;
  outros_recursos?: string;
  procedimentos_emergencia?: string;
  acoes_prevencao?: string;
  outras_informacoes?: string;

  planta_croqui?: Imagem[];

  local_data?: string;
  data_emissao?: string;
}

/** Estado do wizard do Relatório Anual de Empresas de Formação de Brigadistas (IN 28, Anexo E). */
export interface RelatorioFormacaoState {
  step?: number;
  laudoId?: string;
  codigo?: string;
  cliente_id?: string;
  cliente?: ClienteSnapshot;

  ano_referencia?: string;
  razao_social?: string;
  nome_fantasia?: string;
  cnpj?: string;
  num_credenciamento?: string;
  cidade?: string;
  bairro?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  cep?: string;
  telefones?: string;

  turmas_particulares_qtd?: string;
  brigadistas_particulares_qtd?: string;
  brigadistas_organicos_basico_qtd?: string;
  turmas_basico_qtd?: string;
  brigadistas_organicos_intermediario_qtd?: string;
  turmas_intermediario_qtd?: string;
  brigadistas_organicos_avancado_qtd?: string;
  turmas_avancado_qtd?: string;
  instrutores?: string;
  observacoes_sugestoes?: string;

  nome_responsavel_declaracao?: string;
  local_data?: string;
  data_emissao?: string;
}

/** Estado do wizard do Relatório Anual de Empresas de Prestação de Serviço de Brigadistas (IN 28, Anexo F). */
export interface RelatorioPrestacaoState {
  step?: number;
  laudoId?: string;
  codigo?: string;
  cliente_id?: string;
  cliente?: ClienteSnapshot;

  ano_referencia?: string;
  razao_social?: string;
  nome_fantasia?: string;
  cnpj?: string;
  num_credenciamento?: string;
  cidade?: string;
  bairro?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  cep?: string;
  telefones?: string;

  numero_eventos_concentracao?: string;
  possui_servico_terceirizado?: boolean;
  relacao_brigadistas?: string;
  observacoes_sugestoes?: string;

  nome_responsavel_declaracao?: string;
  local_data?: string;
  data_emissao?: string;
}
