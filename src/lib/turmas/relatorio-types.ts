export interface RelatorioTurmaIdentificacao {
  trainingName: string;
  totalHours: number | null;
  clienteNome: string | null;
  instrutorNome: string | null;
  scheduledAt: string | null;
  finishedAt: string | null;
}

export interface RelatorioTurmaAvaliacao {
  totalRespostas: number;
  totalPresentes: number;
  mediaAcertosPercent: number;
}

export interface RelatorioPerguntaSatisfacao {
  pergunta: string;
  media: number;
  /** distribuicao[0] = quantidade de notas 1, ..., distribuicao[4] = quantidade de notas 5 */
  distribuicao: [number, number, number, number, number];
}

export interface RelatorioTurmaSatisfacao {
  totalRespostas: number;
  totalPresentes: number;
  mediaGeral: number;
  perguntas: RelatorioPerguntaSatisfacao[];
  comentarios: string[];
}

export interface RelatorioTurmaData {
  classId: string;
  identificacao: RelatorioTurmaIdentificacao;
  avaliacao: RelatorioTurmaAvaliacao;
  satisfacao: RelatorioTurmaSatisfacao;
}
