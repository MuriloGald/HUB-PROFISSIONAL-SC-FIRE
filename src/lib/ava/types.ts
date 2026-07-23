export interface TurmaAva {
  id: string;
  status: string;
  trainingId: string;
  trainingName: string;
  clienteNome: string | null;
}

/** Uma questão de avaliação, já achatada a partir de subthemes.conteudo.verificacao.questoes de todos os subtemas do curso. */
export interface QuestaoAvaliacao {
  subtemaNome: string;
  pergunta: string;
  opcoes: { texto: string; correta: boolean }[];
}

export interface AvaliacaoResultado {
  acertos: number;
  total: number;
  respostas: number[];
}

export const PERGUNTAS_PESQUISA_SATISFACAO = [
  "Como você avalia o conteúdo do curso?",
  "Como você avalia a didática do instrutor?",
  "Como você avalia o material/apostila?",
  "Como você avalia a estrutura do treinamento (local, equipamentos)?",
  "Você recomendaria este treinamento a um colega?",
] as const;
