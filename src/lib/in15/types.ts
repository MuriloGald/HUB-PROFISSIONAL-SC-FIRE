import type { ClienteSnapshot } from "@/lib/clientes/types";

export type Fluxo15 = "comissionamento" | "inspecao";
export type RespostaSN = "sim" | "nao" | "";

/** Estado do wizard do Sistema de Chuveiros Automáticos (IN 15) — Anexo B (Comissionamento) ou Anexo C (Inspeção). */
export interface ChuveirosState {
  step?: number;
  laudoId?: string;
  codigo?: string;
  cliente_id?: string;
  cliente?: ClienteSnapshot;
  fluxo?: Fluxo15;

  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  municipio_uf?: string;
  re?: string;

  responsavel_imovel_nome?: string;
  responsavel_imovel_email?: string;
  responsavel_imovel_fone?: string;
  rt_nome?: string;
  rt_registro?: string;
  rt_email?: string;
  rt_fone?: string;

  ocupacao_in01?: string;
  ocupacoes_nbr10897?: string;
  vga_numero?: string;
  metodo_armazenagem?: string;
  altura_edificacao?: string;
  altura_armazenagem?: string;
  risco?: string;
  classe_armazenamento?: string;
  tipo_sistema?: string;

  // Anexo B — comissionamento (memorial de ensaios resumido)
  projeto_conformidade?: RespostaSN;
  equipamento_aprovado?: RespostaSN;
  divergencias?: string;
  instrucao_realizada?: RespostaSN;
  nome_responsavel_instruido?: string;
  chuveiros_marca?: string;
  chuveiros_modelo?: string;
  chuveiros_ano?: string;
  chuveiros_orificio?: string;
  chuveiros_qtd?: string;
  chuveiros_temperatura?: string;
  ensaio_hidrostatico_ok?: RespostaSN;
  equipamentos_funcionam?: RespostaSN;
  sem_aditivos_quimicos?: RespostaSN;
  valvulas_controle_abertas?: RespostaSN;
  conexoes_intercambiaveis?: RespostaSN;
  memorial_tecnico_complementar?: string;

  // Anexo C — inspeção (checklist)
  respostas?: Record<string, RespostaSN>;
  chuveiros_relacao?: string;
  justificativas?: string;

  conclusao?: RespostaSN;
  data_entrega_ou_inspecao?: string;
  nome_instalador?: string;
  informacoes_adicionais?: string;

  data_emissao?: string;
}
