export type StatusTurma = "agendada" | "em_andamento" | "concluida" | "cancelada";

export interface Turma {
  id: string;
  training_id: string;
  cliente_id: string | null;
  instrutor_nome: string | null;
  status: StatusTurma;
  qr_code_token: string;
  scheduled_at: string | null;
  started_at: string | null;
  finished_at: string | null;
}

export interface TurmaComDetalhes extends Turma {
  trainingName: string;
  clienteNome: string | null;
}

export interface Student {
  id: string;
  cpf: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  cliente_id: string | null;
}

export interface PresencaRegistrada {
  id: string;
  checked_in_at: string;
  student: { full_name: string; cpf: string } | null;
}
