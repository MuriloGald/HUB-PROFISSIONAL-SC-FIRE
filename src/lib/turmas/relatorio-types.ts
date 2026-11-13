export interface RelatorioTurmaIdentificacao {
  trainingName: string;
  totalHours: number | null;
  clienteNome: string | null;
  instrutorNome: string | null;
  scheduledAt: string | null;
  finishedAt: string | null;
}

export interface RelatorioTurmaAvaliacaoFase {
  totalRespostas: number;
  mediaAcertosPercent: number;
}

export interface RelatorioTurmaAvaliacao {
  totalPresentes: number;
  incendio: RelatorioTurmaAvaliacaoFase;
  socorros: RelatorioTurmaAvaliacaoFase;
  mediaGeralPercent: number;
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
  /** Observações livres do instrutor (só existe via edição manual). */
  observacoes?: string;
  /** true quando há edição manual salva aplicada sobre os dados calculados. */
  editado?: boolean;
}

/**
 * Edição manual do relatório, salva em classes.relatorio_edicao. Cada campo
 * ausente = usa o valor calculado; presente = sobrescreve. Só os campos que
 * diferem do calculado são gravados, então respostas que chegarem depois
 * continuam aparecendo nos campos que ninguém editou.
 */
export interface RelatorioTurmaEdicao {
  trainingName?: string;
  totalHours?: number | null;
  clienteNome?: string | null;
  instrutorNome?: string | null;
  /** "yyyy-mm-dd" */
  dataTreinamento?: string | null;
  totalPresentes?: number;
  incendioPercent?: number;
  socorrosPercent?: number;
  mediaGeralPercent?: number;
  comentarios?: string[];
  observacoes?: string;
}
