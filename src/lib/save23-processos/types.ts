export interface EstagioProcesso {
  id: string;
  nome: string;
  ordem: number;
  created_at: string;
}

export interface ProcessoSave23 {
  id: string;
  cliente_id: string;
  estagio_id: string;
  responsavel: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}
