/**
 * Snapshot do cliente embutido em qualquer documento (laudos.dados) no momento
 * da geracao — preserva os dados exibidos no PDF mesmo que o cadastro do cliente
 * mude depois. Superset dos snapshots que antes existiam um por modulo
 * (ClienteEventoSnapshot, ClienteImovelSnapshot, ClienteSave23Snapshot) — todos
 * os modulos de documento agora consultam a mesma base de clientes.
 */
export interface ClienteSnapshot {
  id: string;
  razao_social: string;
  cnpj?: string;
  cpf?: string;
  nome_responsavel?: string;
  email?: string;
  telefone?: string;
  ramal?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  complemento?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  re?: string;
  preexistente?: boolean;
  area_construida?: string;
  pavimentos?: string;
  altura?: string;
  validade_atestado?: string;
}
