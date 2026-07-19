export interface OpcaoQuestao {
  texto: string;
  correta: boolean;
}

export interface QuestaoVerificacao {
  pergunta: string;
  opcoes: OpcaoQuestao[];
}

export interface BlocoEtapa {
  titulo: string;
  corpo_md: string;
}

export interface EtapaVerificacao {
  titulo: string;
  evidencia: string;
  questoes: QuestaoVerificacao[];
}

export interface EtapaFechamento {
  titulo: string;
  pontos_chave: string[];
  ponte: string;
}

/** Roteiro completo de uma aula (5 Etapas), migrado da vault "Hub do Treinador" para subthemes.conteudo. */
export interface ConteudoAula {
  duracao: string;
  norma: string;
  modulo: string;
  contexto: BlocoEtapa;
  explicacao: BlocoEtapa;
  recurso: BlocoEtapa;
  verificacao: EtapaVerificacao;
  fechamento: EtapaFechamento;
}

export interface CursoTreinador {
  id: string;
  name: string;
  description: string | null;
  total_hours: number;
}

export interface AulaResumo {
  id: string;
  name: string;
  category: string;
  hours: number;
  sort_order: number;
  temConteudo: boolean;
}
